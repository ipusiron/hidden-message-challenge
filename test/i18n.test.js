const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const I18n = require('../js/i18n.js');
const D = require('../js/hidden-data.js');
const root = path.join(__dirname, '..');

const JAPANESE = new RegExp('[' + String.fromCodePoint(0x3040) + '-' + String.fromCodePoint(0x30ff) +
  String.fromCodePoint(0x4e00) + '-' + String.fromCodePoint(0x9fff) + String.fromCodePoint(0xff01) + '-' + String.fromCodePoint(0xff60) + ']');

test('Japanese and English have the same non-empty keys and placeholders', () => {
  assert.deepEqual(Object.keys(I18n.ja).sort(), Object.keys(I18n.en).sort());
  for (const key of Object.keys(I18n.ja)) {
    for (const lang of ['ja', 'en']) assert.ok(I18n[lang][key].trim(), `${lang}.${key}`);
    assert.deepEqual((I18n.ja[key].match(/\{\w+\}/g) || []).sort(), (I18n.en[key].match(/\{\w+\}/g) || []).sort(), key);
  }
});

test('English messages contain no Japanese', () => {
  for (const [key, value] of Object.entries(I18n.en)) {
    if (key === 'app.langButton') continue;             // the button that switches back to Japanese
    assert.doesNotMatch(value, JAPANESE, key);
  }
});

test('every puzzle has a hint and an explanation', () => {
  for (const p of Object.values(D.BY_SET).flatMap(set => Object.values(set).flat())) {
    for (const prefix of ['hint', 'explain']) assert.ok(Object.hasOwn(I18n.ja, `${prefix}.${p.id}`), `${prefix}.${p.id}`);
  }
  const ids = new Set(Object.values(D.BY_SET).flatMap(set => Object.values(set).flat()).map(p => p.id));
  for (const key of Object.keys(I18n.ja).filter(k => /^(hint|explain)\./.test(k))) assert.ok(ids.has(key.split('.')[1]), `unused ${key}`);
});

test('quoted puzzles name their source in both languages', () => {
  const quoted = new Set(Object.values(D.BY_SET).flatMap(set => Object.values(set).flat()).filter(p => p.source).map(p => p.id));
  const keys = Object.keys(I18n.ja).filter(k => k.startsWith('source.'));
  assert.deepEqual(keys.map(k => k.slice(7)).sort(), [...quoted].sort());
  for (const key of keys) {
    assert.match(I18n.ja[key], /^出典: /, key);
    assert.match(I18n.en[key], /^Source: /, key);
  }
});

test('every key used by the markup and scripts exists', () => {
  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  const keys = [...html.matchAll(/data-i18n(?:-[a-z-]+)?="([^"]+)"/g)].map(m => m[1]);
  for (const file of fs.readdirSync(path.join(root, 'js'))) {
    const src = fs.readFileSync(path.join(root, 'js', file), 'utf8');
    keys.push(...[...src.matchAll(/I18n\.t\('([^'`$]+)'/g)].map(m => m[1]));
  }
  assert.ok(keys.length > 60, String(keys.length));
  for (const key of keys) assert.ok(Object.hasOwn(I18n.ja, key), key);
  // keys built from a prefix in the scripts
  for (const kind of ['headline', 'removeChar', 'position', 'stencil', 'results']) assert.ok(Object.hasOwn(I18n.ja, `tab.${kind}`), kind);
  for (const r of ['S', 'A', 'B', 'C', 'D']) assert.ok(Object.hasOwn(I18n.ja, `rank.${r}`), r);
  for (const s of ['Solved', 'Missed', 'Todo']) assert.ok(Object.hasOwn(I18n.ja, `common.dot${s}`), s);
});

test('keys built by the core and the maker exist', () => {
  const C = require('../js/hidden-core.js');
  const check = (key, values = {}) => {
    assert.ok(Object.hasOwn(I18n.ja, key) && Object.hasOwn(I18n.en, key), key);
    return key + JSON.stringify(values);
  };
  for (const list of Object.values(D.BY_SET)) {
    for (const p of list.position) C.describeRule(p.rule, check);
  }
  for (const rule of [{ kind: 'words', index: 0 }, { kind: 'words', index: 2 }, { kind: 'words', index: -1 },
    { kind: 'mark', marks: [','], offset: 1, lettersOnly: true }, { kind: 'mark', marks: [','], offset: 3, lettersOnly: true }]) C.describeRule(rule, check);
  const findings = [
    ...C.removalReport('Bees', ['b'], ''), ...C.removalReport('abc', ['x'], 'xabc'), ...C.removalReport('abc', ['x'], 'xaxbxcxx'),
    ...C.stencilReport('A'.repeat(26)), ...C.stencilReport('A'.repeat(13), C.makeStencil('A'.repeat(13), { rand: C.rng(3) })),
    ...C.acrosticReport('ab', 'Apple').findings, ...C.acrosticReport('ab', ['Apple', 'Banana'].join('\n')).findings,
    ...C.acrosticReport('a', ['x', 'y'].join('\n')).findings, ...C.acrosticReport('a5', 'apple').findings,
    ...C.stencilReport('きって', C.makeStencil('きって', { rand: C.rng(7) })),
    ...C.removalReport('meet', [String.fromCharCode(0x3099)], '')
  ];
  for (const f of findings) check(f.key, f.values);
  for (const level of ['error', 'warning', 'info', 'ok']) check(`finding.${level}`);
  for (const key of ['maker.line.ok', 'maker.line.ng', 'maker.line.extra', 'maker.removal.noNulls', 'maker.empty', 'maker.next']) check(key);
  for (const set of Object.keys(D.BY_SET)) check(`set.${set}`);
  const makerKeys = Object.keys(I18n.ja).filter(k => /^maker\.(removal|stencil|acrostic)\./.test(k));
  const produced = new Set([...findings.map(f => f.key), 'maker.removal.noNulls']);
  for (const key of makerKeys) assert.ok(produced.has(key), `unused ${key}`);
});

test('scripts other than the dictionary and the puzzle data contain no Japanese outside comments', () => {
  for (const file of fs.readdirSync(path.join(root, 'js'))) {
    if (file === 'i18n.js' || file === 'hidden-data.js') continue;
    const src = fs.readFileSync(path.join(root, 'js', file), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
    assert.doesNotMatch(src, JAPANESE, file);
  }
});

test('t() fills placeholders and rejects unknown keys', () => {
  assert.equal(I18n.t('common.current', { n: 3 }), I18n.ja['common.current'].replace('{n}', '3'));
  assert.throws(() => I18n.t('no.such.key'));
});
