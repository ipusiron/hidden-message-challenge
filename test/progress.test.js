const test = require('node:test');
const assert = require('node:assert/strict');
const P = require('../js/progress.js');
const C = require('../js/hidden-core.js');

const sizes = { headline: 5, removeChar: 5, position: 5, stencil: 5 };

test('broken or odd stored values fall back safely', () => {
  assert.deepEqual(P.parse('not json', sizes), P.empty());
  assert.deepEqual(P.parse('null', sizes), P.empty());
  assert.deepEqual(P.parse('[1,2]', sizes).headline, { current: 0, solved: [], missed: [] });
  const state = P.parse(JSON.stringify({ headline: { current: 9, solved: [4, 4, 1, -1, 7, 'x', 2.5], missed: [1, 3] } }), sizes);
  assert.deepEqual(state.headline, { current: 0, solved: [1, 4], missed: [3] });
  assert.deepEqual(P.parse(JSON.stringify({ stencil: { current: 2 } }), sizes).stencil.current, 2);
});

test('recording answers', () => {
  let s = P.empty();
  s = P.record(s, 'headline', 2, false);
  assert.deepEqual(s.headline.missed, [2]);
  s = P.record(s, 'headline', 2, true);
  assert.deepEqual([s.headline.solved, s.headline.missed], [[2], []], 'a correct answer clears the miss');
  s = P.record(s, 'headline', 2, false);
  assert.deepEqual([s.headline.solved, s.headline.missed], [[2], []], 'a later wrong answer changes nothing');
  s = P.record(s, 'headline', 0, true);
  assert.deepEqual(s.headline.solved, [0, 2]);
  assert.deepEqual([P.dotState(s, 'headline', 0), P.dotState(s, 'headline', 1)], ['solved', 'todo']);
  const before = JSON.stringify(s);
  P.select(s, 'headline', 3);
  assert.equal(JSON.stringify(s), before, 'the state is not changed in place');
});

test('summary and rank', () => {
  let s = P.empty();
  for (const kind of P.KINDS) for (let i = 0; i < 4; i++) s = P.record(s, kind, i, true);
  const sum = P.summary(s, sizes, C.rank);
  assert.deepEqual([sum.solved, sum.total, sum.percent, sum.rank], [16, 20, 80, 'A']);
  assert.deepEqual(sum.perKind.stencil, { solved: 4, total: 5, percent: 80 });
  assert.equal(P.summary(P.empty(), sizes, C.rank).rank, 'D');
});
