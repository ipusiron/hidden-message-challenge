const test = require('node:test');
const assert = require('node:assert/strict');
const C = require('../js/hidden-core.js');
const D = require('../js/hidden-data.js');

// The first answer must follow from the rule. Other answers are only spellings of the same text:
// the same letters with voicing marks dropped or small kana written full size, or a kanji written in kana.
const KANJI_READINGS = { '天気': 'てんき' };
const sameSpelling = (a, b) => {
  const plain = s => [...C.normalize(Object.entries(KANJI_READINGS).reduce((t, [k, v]) => t.split(k).join(v), s))]
    .map(ch => C.fullSize(C.stripDakuten(ch))).join('');
  return plain(a) === plain(b);
};

function checkAnswers(p, derived, matches = (x, y) => C.normalize(x) === C.normalize(y)) {
  assert.ok(matches(derived, p.answers[0]), `${p.id}: ${derived} does not give ${p.answers[0]}`);
  for (const other of p.answers.slice(1)) assert.ok(sameSpelling(other, p.answers[0]), `${p.id}: ${other}`);
}

const SETS = Object.entries(D.BY_SET);

test('two sets, each with five puzzles for each of the four methods; ids are unique', () => {
  assert.deepEqual(Object.keys(D.BY_SET), ['ja', 'en']);
  assert.equal(D.SETS, D.BY_SET.ja);
  for (const [, set] of SETS) {
    assert.deepEqual(Object.keys(set), ['headline', 'removeChar', 'position', 'stencil']);
    for (const list of Object.values(set)) assert.equal(list.length, 5);
  }
  const ids = SETS.flatMap(([, set]) => Object.values(set).flat().map(p => p.id));
  assert.equal(new Set(ids).size, 40);
});

test('acrostics: the line heads give the answer', () => {
  for (const [name, set] of SETS) {
    for (const p of set.headline) {
      const derived = p.heads ? p.heads.join('') : C.acrostic(p.text).map(h => h.char).join('');
      checkAnswers(p, derived);
      if (p.heads) assert.equal(p.heads.length, p.text.split('\n').length, `${name} ${p.id}`);
    }
  }
});

test('removal: removing the listed characters gives the answer', () => {
  for (const [, set] of SETS) {
    for (const p of set.removeChar) {
      checkAnswers(p, C.removeChars(p.cipher, p.remove).plain);
      for (const ch of p.remove) assert.ok(p.cipher.includes(ch), `${p.id}: ${ch} is in the cipher`);
      assert.ok(p.remove.length <= 4, 'there are four input boxes');
      assert.ok(p.picture, `${p.id}: picture word`);
    }
  }
});

test('position: the rule gives the answer', () => {
  for (const [, set] of SETS) {
    for (const p of set.position) {
      checkAnswers(p, C.applyRule(p.reading || p.text, p.rule).plain);
      if (p.rule.kind === 'mark') assert.ok(p.rule.offset === -1 || p.rule.offset >= 1, `${p.id}: the UI words offsets -1 and 1 and up`);
      if (p.reading) assert.equal(p.reading.split('　').length, p.text.split('　').length, `${p.id}: same number of parts`);
    }
  }
});

test('stencil: the solution shows the answer (rearranged when marked as an anagram)', () => {
  for (const [, set] of SETS) {
    for (const p of set.stencil) {
      assert.equal(p.grid.length, 5);
      assert.equal(p.mask.length, 5);
      for (const row of [...p.grid, ...p.mask]) assert.equal(row.length, 5);
      const shown = C.visible(p.grid, p.mask, p.solution).plain;
      checkAnswers(p, shown, p.solution.anagram ? C.sameLetters : undefined);
      assert.equal([...shown].length, p.mask.flat().filter(Boolean).length, `${p.id}: every hole stays on the grid`);
      if (p.solution.anagram) assert.notEqual(C.normalize(shown), C.normalize(p.answers[0]), `${p.id}: an anagram puzzle is not readable as is`);
      if (p.solution.rotation > 0) {
        assert.notEqual(C.normalize(C.visible(p.grid, p.mask).plain), C.normalize(shown), `${p.id}: turning is needed`);
      }
    }
  }
});

test('English answers are letters only; Japanese answers are kana or kanji', () => {
  for (const p of Object.values(D.BY_SET.en).flat()) {
    for (const a of p.answers) assert.match(a, /^[a-z0-9]+$/, p.id);
  }
});

test('fixed data errors stay fixed', () => {
  const byId = Object.fromEntries(Object.values(D.SETS).flat().map(p => [p.id, p]));
  // r5 lacked an i; p3 said "2 after" but the answer needs the third; s2 had six holes for five letters
  assert.equal(C.removeChars(byId.r5.cipher, byId.r5.remove).plain, 'たのしいいちにちです');
  assert.equal(C.applyRule(byId.p3.text, { ...byId.p3.rule, offset: 2 }).plain, 'んかだ');
  assert.equal(byId.s2.mask.flat().filter(Boolean).length, 5);
  assert.ok(byId.p5.answers.includes('とかなくてしす'), 'the literal reading of the rule is accepted');
});

test('quoted and historical puzzles are marked so that the source is shown', () => {
  const quoted = SETS.flatMap(([, set]) => Object.values(set).flat().filter(p => p.source).map(p => p.id));
  assert.ok(quoted.includes('h4') && quoted.includes('h5'));
});
