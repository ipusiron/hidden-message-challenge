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
  for (const p of Object.values(D.SETS).flat()) {
    for (const prefix of ['hint', 'explain']) assert.ok(Object.hasOwn(I18n.ja, `${prefix}.${p.id}`), `${prefix}.${p.id}`);
  }
  const ids = new Set(Object.values(D.SETS).flat().map(p => p.id));
  for (const key of Object.keys(I18n.ja).filter(k => /^(hint|explain)\./.test(k))) assert.ok(ids.has(key.split('.')[1]), `unused ${key}`);
});

test('quoted puzzles name their source in both languages', () => {
  const quoted = new Set(Object.values(D.SETS).flat().filter(p => p.source).map(p => p.id));
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
