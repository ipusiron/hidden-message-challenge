const test = require('node:test');
const assert = require('node:assert/strict');
const C = require('../js/hidden-core.js');

test('answers ignore width, spaces, katakana, case and the long vowel mark', () => {
  assert.equal(C.normalize(' タスケテ '), 'たすけて');
  assert.equal(C.normalize('ｱｲｼﾃﾏｽ'), 'あいしてます');
  assert.equal(C.normalize('こんにちは　よろしい'), 'こんにちはよろしい');
  assert.equal(C.normalize('ABC'), 'abc');
  assert.equal(C.normalize('スーパー'), 'すぱ');
  assert.ok(C.isCorrect('タスケテ', ['たすけて']));
  assert.ok(!C.isCorrect('', ['']), 'a blank answer is never correct');
  assert.ok(C.isBlank('  　'));
  assert.ok(!C.isCorrect('たすけ', ['たすけて']));
  assert.ok(!C.isCorrect('とかなくてしす', ['とがなくてしす']), 'voicing marks are not ignored unless listed');
});

test('voicing marks and letter order', () => {
  assert.equal([...'がぱずでば'].map(C.stripDakuten).join(''), 'かはすては');
  assert.equal(C.stripDakuten('ゐ'), 'ゐ');
  assert.ok(C.sameLetters('をわかよむ', 'わかをよむ'));
  assert.ok(C.sameLetters('うけこすつと', 'すとけっこう'), 'small tsu counts as tsu');
  assert.ok(!C.sameLetters('をわかよなむ', 'わかをよむ'), 'an extra letter does not match');
});

test('acrostic: first non-space character of each line with its position', () => {
  assert.deepEqual(C.acrostic('あいう\n  かき\n\nさ'), [{ row: 0, col: 0, char: 'あ' }, { row: 1, col: 2, char: 'か' }, { row: 3, col: 0, char: 'さ' }]);
});

test('character removal keeps the order and reports removed indices', () => {
  assert.deepEqual(C.removeChars('けあけりがけとけうけ', ['け']), { plain: 'ありがとう', removed: [0, 2, 5, 7, 9] });
  assert.deepEqual(C.removeChars('abc', []), { plain: 'abc', removed: [] });
  assert.deepEqual(C.removeChars('abc', ['', 'b']), { plain: 'ac', removed: [1] });
});

test('position rules: offsets from marks', () => {
  assert.deepEqual(C.applyRule('あい。うえ。', { kind: 'mark', marks: ['。'], offset: -1 }), { plain: 'いえ', indices: [1, 4] });
  assert.deepEqual(C.applyRule('あ、いう', { kind: 'mark', marks: ['、'], offset: 1 }).plain, 'い');
  assert.deepEqual(C.applyRule('あ、いうえ', { kind: 'mark', marks: ['、'], offset: 3 }), { plain: 'え', indices: [4] });
  assert.equal(C.applyRule('あ、い', { kind: 'mark', marks: ['、'], offset: 3 }).plain, '', 'past the end gives nothing');
});

test('position rules: heads and tails of parts', () => {
  const text = 'あいう　かきく　さしす';
  assert.deepEqual(C.applyRule(text, { kind: 'segments', separator: '　', order: 'firstLast' }), { plain: 'あかさうくす', indices: [0, 4, 8, 2, 6, 10] });
  assert.equal(C.applyRule(text, { kind: 'segments', separator: '　', order: 'last' }).plain, 'うくす');
  assert.equal(C.applyRule('がぎ　ぐげ', { kind: 'segments', separator: '　', order: 'firstLast', stripDakuten: true }).plain, 'かくきけ');
  assert.throws(() => C.applyRule('x', { kind: 'nope' }));
});

test('stencil: rotation is clockwise and shifting moves the holes', () => {
  const mask = [[1, 0], [0, 0]];
  assert.deepEqual(C.rotate(mask, 1), [[0, 1], [0, 0]]);
  assert.deepEqual(C.rotate(mask, 2), [[0, 0], [0, 1]]);
  assert.deepEqual(C.rotate(mask, 3), [[0, 0], [1, 0]]);
  assert.deepEqual(C.rotate(mask, 4), mask);
  assert.deepEqual(C.rotate(mask, -1), C.rotate(mask, 3));
  const grid = [['あ', 'い'], ['う', 'え']];
  assert.equal(C.visible(grid, [[1, 0], [0, 1]]).plain, 'あえ');
  assert.equal(C.visible(grid, [[1, 0], [0, 1]], { rotation: 1 }).plain, 'いう');
  assert.equal(C.visible(grid, [[1, 0], [0, 1]], { dx: 1 }).plain, 'い', 'holes moved off the grid show nothing');
  assert.equal(C.visible(grid, [[1, 0], [0, 1]], { dx: 1, dy: -1 }).plain, '');
  assert.deepEqual(C.visible(grid, [[0, 1], [1, 0]]).cells.map(c => [c.y, c.x]), [[0, 1], [1, 0]], 'read row by row');
});

test('rank thresholds', () => {
  assert.deepEqual([100, 95, 94, 80, 79, 60, 59, 40, 39, 0].map(C.rank), ['S', 'S', 'A', 'A', 'B', 'B', 'C', 'C', 'D', 'D']);
});
