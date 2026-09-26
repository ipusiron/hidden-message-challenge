const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const jsFiles = fs.readdirSync(path.join(root, 'js')).map(f => [f, fs.readFileSync(path.join(root, 'js', f), 'utf8')]);

test('CSP, referrer and noscript', () => {
  const csp = /<meta http-equiv="Content-Security-Policy" content="([^"]+)">/.exec(html);
  assert.ok(csp, 'meta CSP');
  assert.match(csp[1], /default-src 'none'/);
  assert.match(csp[1], /script-src 'self'/);
  assert.match(csp[1], /style-src 'self'/);
  assert.doesNotMatch(csp[1], /unsafe-inline|unsafe-eval|frame-ancestors/);
  assert.match(html, /<meta name="referrer" content="no-referrer">/);
  assert.match(html, /<noscript>/);
});

test('no inline handlers, inline styles, inline scripts or modules', () => {
  assert.doesNotMatch(html, /\son[a-z]+="/i);
  assert.doesNotMatch(html, /\sstyle="/i);
  assert.doesNotMatch(html, /<script>(?!<\/script>)/);
  assert.doesNotMatch(html, /<style/);
  assert.doesNotMatch(html, /type="module"/, 'classic scripts so that file:// works');
});

test('tabs, dialogs, labels and links', () => {
  assert.match(html, /role="tablist"/);
  for (const id of ['headline', 'removeChar', 'position', 'stencil', 'results', 'maker']) {
    assert.match(html, new RegExp(`role="tab" id="tab-${id}" aria-controls="${id}" aria-selected="(true|false)"`));
    assert.match(html, new RegExp(`<section id="${id}" class="tab-panel[^"]*" role="tabpanel" aria-labelledby="tab-${id}"`));
  }
  for (const id of ['help-modal', 'reset-modal']) assert.match(html, new RegExp(`<dialog id="${id}"[^>]*aria-labelledby=`));
  for (const [, id] of html.matchAll(/<label for="([^"]+)"/g)) assert.match(html, new RegExp(`id="${id}"`), id);
  for (const [tag] of html.matchAll(/<button\b[^>]*>/g)) assert.match(tag, /type="button"|type="submit"/, tag);
  for (const [tag] of html.matchAll(/<a\b[^>]*target="_blank"[^>]*>/g)) assert.match(tag, /rel="noopener noreferrer"/);
  assert.match(html, /<canvas id="radar-chart"[^>]*role="img"/);
  for (const set of ['ja', 'en']) assert.match(html, new RegExp(`class="set-button" data-set="${set}" aria-pressed="(true|false)"`));
  assert.equal((html.match(/name="maker-method"/g) || []).length, 3);
  const maker = html.slice(html.indexOf('<section id="maker"'), html.indexOf('</section>', html.indexOf('<section id="maker"')));
  for (const [tag] of maker.matchAll(/<(input type="text"|textarea)\b[^>]*>/g)) assert.match(tag, /autocomplete="off"/, tag);
  assert.doesNotMatch(maker, /aria-live/, 'only the short status is announced');
  assert.match(maker, /id="maker-status" role="status"/);
  assert.match(maker, /id="maker-grid" aria-hidden="true"/);
});

test('scripts avoid innerHTML, style writes, dialogs from window and network access', () => {
  for (const [name, src] of jsFiles) {
    for (const bad of ['innerHTML', 'insertAdjacentHTML', 'outerHTML', '.style.', 'alert(', 'confirm(', 'onclick', 'eval(', 'fetch(',
      'XMLHttpRequest', 'window.open', 'import ', 'export ']) {
      assert.ok(!src.includes(bad), `${name} contains ${bad}`);
    }
  }
});

test('the core, data and progress do not use the DOM', () => {
  for (const name of ['hidden-core.js', 'hidden-data.js', 'progress.js']) {
    const src = jsFiles.find(([f]) => f === name)[1];
    assert.ok(!/document\.|window\.|localStorage/.test(src), name);
  }
});

test('script order: dictionary, core and store before the UI', () => {
  const order = [...html.matchAll(/<script src="js\/([^"]+)"/g)].map(m => m[1]);
  assert.deepEqual(order, ['i18n.js', 'hidden-core.js', 'hidden-data.js', 'progress.js', 'main.js', 'challenges.js', 'results.js', 'maker.js']);
  assert.deepEqual(jsFiles.map(([f]) => f).sort(), [...order].sort(), 'every script is loaded');
});
