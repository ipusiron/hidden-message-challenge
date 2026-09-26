const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const css = fs.readFileSync(path.join(__dirname, '..', 'css', 'style.css'), 'utf8');

function luminance(hex) {
  const h = hex.replace('#', '');
  const full = h.length === 3 ? h.split('').map(c => c + c).join('') : h;
  return [0, 2, 4].map(i => parseInt(full.slice(i, i + 2), 16) / 255)
    .map(c => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4))
    .reduce((sum, c, i) => sum + c * [0.2126, 0.7152, 0.0722][i], 0);
}
function ratio(a, b) {
  const [x, y] = [luminance(a), luminance(b)].sort((m, n) => n - m);
  return (x + 0.05) / (y + 0.05);
}
const vars = {};
for (const [, name, value] of /:root\s*\{([^}]*)\}/.exec(css)[1].matchAll(/--([a-z-]+):\s*(#[0-9a-fA-F]{3,6})/g)) vars[name] = value;

test('text colors meet 4.5:1 on their backgrounds', () => {
  assert.equal(Object.keys(vars).length, 8);
  const pairs = [
    ['#ffffff', vars.primary], ['#ffffff', vars['primary-dark']], ['#ffffff', vars.ok], ['#ffffff', vars.ng],
    [vars.text, '#ffffff'], [vars.text, '#f8fafc'], [vars.muted, '#ffffff'], [vars.muted, '#f8fafc'], [vars.muted, '#e2e8f0'],
    [vars.muted, '#eef2ff'], [vars['warn-text'], '#fef9c3'], [vars.primary, '#eef2ff'], [vars.ok, '#ffffff'], [vars.ng, '#ffffff'],
    [vars.text, '#fbbf24'], [vars.text, '#f59e0b'], [vars.text, '#fde68a'], ['#7f1d1d', '#fecaca'], ['#14532d', '#dcfce7'],
    ['#ffffff', '#166534'], ['#ffffff', '#991b1b'], ['#7f1d1d', '#fee2e2'], ['#ffffff', vars['warn-text']]
  ];
  for (const [fg, bg] of pairs) assert.ok(ratio(fg, bg) >= 4.5, `${fg} on ${bg}: ${ratio(fg, bg).toFixed(2)}`);
});

test('field borders meet 3:1 against white', () => {
  const borders = [...css.matchAll(/border: 2px solid (#[0-9a-f]{6});/g)].map(m => m[1]);
  assert.ok(borders.includes('#64748b'));
  assert.ok(!borders.includes('#94a3b8'), 'the old 2.56:1 border is gone');
  assert.ok(ratio('#64748b', '#ffffff') >= 3);
});

test('the pairs above are the ones the stylesheet uses', () => {
  for (const rule of ['.hint-button { background: #fbbf24; color: var(--text); }', '.check-button { background: var(--ok); color: #ffffff; }',
    'mark.removed { background: #fecaca; color: #7f1d1d;', '.explain { margin: 0; padding: 0.75rem 1rem; background: #dcfce7; color: #14532d;',
    '.maker-line-check .line-ng { background: #fee2e2; color: #7f1d1d; }', '.finding-level-warning { background: var(--warn-text); }']) {
    assert.ok(css.includes(rule), rule);
  }
});
