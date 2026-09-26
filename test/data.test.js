const test = require('node:test');
const assert = require('node:assert/strict');
const C = require('../js/hidden-core.js');
const D = require('../js/hidden-data.js');

// The first answer must follow from the rule. Other answers are only spellings of the same text:
// the same letters with voicing marks dropped, or a kanji written in kana.
const KANJI_READINGS = { '天気': 'てんき' };
const sameSpelling = (a, b) => {
  const plain = s => [...C.normalize(Object.entries(KANJI_READINGS).reduce((t, [k, v]) => t.split(k).join(v), s))].map(C.stripDakuten).join('');
  return plain(a) === plain(b);
};

function checkAnswers(p, derived, matches = (x, y) => C.normalize(x) === C.normalize(y)) {
  assert.ok(matches(derived, p.answers[0]), `${p.id}: ${derived} does not give ${p.answers[0]}`);
  for (const other of p.answers.slice(1)) assert.ok(sameSpelling(other, p.answers[0]), `${p.id}: ${other}`);
}

test('five puzzles in each of the four sets, unique ids', () => {
  assert.deepEqual(Object.keys(D.SETS), ['headline', 'removeChar', 'position', 'stencil']);
  for (const list of Object.values(D.SETS)) assert.equal(list.length, 5);
  const ids = Object.values(D.SETS).flat().map(p => p.id);
  assert.equal(new Set(ids).size, 20);
});

test('acrostics: the line heads give the answer', () => {
  for (const p of D.HEADLINE) {
    const derived = p.heads ? p.heads.join('') : C.acrostic(p.text).map(h => h.char).join('');
    checkAnswers(p, derived);
    if (p.heads) {
      assert.equal(p.heads.length, p.text.split('\n').length, p.id);
      p.heads.forEach((head, i) => assert.ok(!/^[぀-ゟ]/.test(p.text.split('\n')[i]) || p.text.split('\n')[i].startsWith(head), p.id));
    }
  }
});

test('removal: removing the listed characters gives the answer', () => {
  for (const p of D.REMOVE) {
    checkAnswers(p, C.removeChars(p.cipher, p.remove).plain);
    for (const ch of p.remove) assert.ok(p.cipher.includes(ch), `${p.id}: ${ch} is in the cipher`);
    assert.ok(p.remove.length <= 4, 'there are four input boxes');
  }
});

test('position: the rule gives the answer', () => {
  for (const p of D.POSITION) {
    checkAnswers(p, C.applyRule(p.reading || p.text, p.rule).plain);
    if (p.rule.kind === 'mark') assert.ok(p.rule.offset === -1 || p.rule.offset >= 1, `${p.id}: the UI words offsets -1 and 1 and up`);
    if (p.reading) assert.equal(p.reading.split('　').length, p.text.split('　').length, `${p.id}: same number of parts`);
  }
});

test('stencil: the solution shows the answer (rearranged when marked as an anagram)', () => {
  for (const p of D.STENCIL) {
    assert.equal(p.grid.length, 5);
    assert.equal(p.mask.length, 5);
    for (const row of [...p.grid, ...p.mask]) assert.equal(row.length, 5);
    const shown = C.visible(p.grid, p.mask, p.solution).plain;
    checkAnswers(p, shown, p.solution.anagram ? C.sameLetters : undefined);
    assert.equal([...shown].length, p.mask.flat().filter(Boolean).length, `${p.id}: every hole stays on the grid`);
    if (p.solution.anagram) assert.notEqual(shown, p.answers[0], `${p.id}: an anagram puzzle is not readable as is`);
  }
});

test('fixed data errors stay fixed', () => {
  const byId = Object.fromEntries(Object.values(D.SETS).flat().map(p => [p.id, p]));
  // r5 lacked an i; p3 said "2 after" but the answer needs the third; s2 had six holes for five letters
  assert.equal(C.removeChars(byId.r5.cipher, byId.r5.remove).plain, 'たのしいいちにちです');
  assert.equal(C.applyRule(byId.p3.text, { ...byId.p3.rule, offset: 2 }).plain, 'んかだ');
  assert.equal(byId.s2.mask.flat().filter(Boolean).length, 5);
  assert.ok(byId.p5.answers.includes('とかなくてしす'), 'the literal reading of the rule is accepted');
  // replaced texts that were quoted from copyrighted works
  for (const quoted of ['あくびがでるわ', 'キラ']) assert.ok(!JSON.stringify(D.HEADLINE).includes(quoted), quoted);
});
