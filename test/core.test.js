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

test('acrostic: first letter of each line with its position', () => {
  assert.deepEqual(C.acrostic('"Love not"\n  (a) b'), [{ row: 0, col: 1, char: 'L' }, { row: 1, col: 3, char: 'a' }], 'quotes are skipped');
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

test('position rules: letters of words and letters after marks', () => {
  assert.equal(C.applyRule('Big red dog.', { kind: 'words', index: 0 }).plain, 'Brd');
  assert.equal(C.applyRule("don't by-pass it", { kind: 'words', index: 1 }).plain, 'oyt', 'apostrophes and hyphens stay inside a word');
  assert.equal(C.applyRule('cat dog, a', { kind: 'words', index: -1 }).plain, 'tga');
  assert.deepEqual(C.applyRule('ab c', { kind: 'words', index: 2 }), { plain: '', indices: [-1, -1] }, 'short words give nothing');
  assert.equal(C.applyRule('1917 ok', { kind: 'words', index: 0 }).plain, 'o', 'a word without letters is skipped');
  const r = C.applyRule('Hi, the cat. Ok', { kind: 'mark', marks: [',', '.'], offset: 3, lettersOnly: true });
  assert.deepEqual(r, { plain: 'e', indices: [6, -1] }, 'spaces are not counted; nothing after the end');
  assert.equal(C.applyRule('a, b', { kind: 'mark', marks: [','], offset: 1 }).plain, ' ', 'without lettersOnly every character counts');
});

test('rule wording comes from the rule object', () => {
  const t = (key, values = {}) => key + JSON.stringify(values);
  assert.equal(C.describeRule({ kind: 'mark', marks: ['。'], offset: -1 }, t), 'rule.before1{"marks":"rule.mark{\\"mark\\":\\"。\\"}"}');
  assert.match(C.describeRule({ kind: 'mark', marks: [','], offset: 3, lettersOnly: true }, t), /^rule\.afterNLetter/);
  assert.match(C.describeRule({ kind: 'mark', marks: [','], offset: 1, lettersOnly: true }, t), /^rule\.after1Letter/);
  assert.equal(C.describeRule({ kind: 'words', index: 0 }, t), 'rule.wordFirst{}');
  assert.equal(C.describeRule({ kind: 'words', index: 1 }, t), 'rule.wordN{"n":2}');
  assert.equal(C.describeRule({ kind: 'words', index: -1 }, t), 'rule.wordLast{}');
  assert.match(C.describeRule({ kind: 'segments', separator: ' ', order: 'firstLast', stripDakuten: true }, t), /^rule\.withDakuten/);
});

test('maker: seeded generator and seeds', () => {
  const a = C.rng(42), b = C.rng(42);
  const xs = Array.from({ length: 5 }, a);
  assert.deepEqual(xs, Array.from({ length: 5 }, b));
  assert.ok(xs.every(x => x >= 0 && x < 1));
  assert.notEqual(C.seedOf('a'), C.seedOf('b'));
  assert.equal(C.seedOf('あ'), C.seedOf('あ'));
});

test('maker: removal ciphers always read back', () => {
  for (let seed = 1; seed <= 200; seed++) {
    for (const [msg, nulls] of [['meetatnoon', ['b']], ['あしたあおう', ['ん', 'ぬ']], ['ATTACK', ['Q', 'Z', 'X']]]) {
      const cipher = C.makeRemoval(msg, nulls, { rate: 0.4, rand: C.rng(seed) });
      assert.equal(C.removeChars(cipher, nulls).plain, msg, `${msg} ${seed}`);
      assert.ok([...cipher].some(ch => nulls.includes(ch)), 'at least one filler');
    }
  }
  assert.equal(C.makeRemoval('', ['b'], { rate: 0.5, rand: C.rng(1) }), '');
  assert.equal(C.makeRemoval('ab', [], { rate: 0.5, rand: C.rng(1) }), '');
  assert.equal(C.makeRemoval('a b', ['x'], { rate: 0, rand: C.rng(1) }), 'abx', 'spaces are dropped; one filler even at rate 0');
  // Latin fillers follow a one-case message, so capitals do not give them away
  for (let seed = 1; seed <= 50; seed++) {
    const lower = C.makeRemoval('meet at dawn', ['X', 'Q'], { rate: 0.4, rand: C.rng(seed) });
    assert.doesNotMatch(lower, /[A-Z]/, lower);
    assert.equal(C.removeChars(lower, ['X', 'Q']).plain, 'meetatdawn');
    assert.doesNotMatch(C.makeRemoval('MEET', ['x'], { rate: 0.4, rand: C.rng(seed) }), /[a-z]/);
  }
  assert.equal(C.makeRemoval('Ab', ['x'], { rate: 0, rand: C.rng(1) }), 'Abx', 'mixed case: the filler stays as typed');
  assert.equal(C.makeRemoval('あい', ['X'], { rate: 0, rand: C.rng(1) }), 'あいX', 'no Latin letters: the filler stays as typed');
});

test('maker: removal findings', () => {
  const keys = f => f.map(x => x.key.split('.').pop());
  assert.deepEqual(keys(C.removalReport('Bees', ['b'], '')), ['clash'], 'case-insensitive clash');
  assert.deepEqual(C.removalReport('abc', ['x'], 'xabc'), [{ level: 'ok', key: 'maker.removal.roundTrip' },
    { level: 'info', key: 'maker.removal.share', values: { percent: 25 } }]);
  assert.deepEqual(C.removalReport('abc', ['x'], 'xaxbxcxx').at(-1), { level: 'warning', key: 'maker.removal.tooMany', values: { percent: 63 } });
  assert.ok(!keys(C.removalReport('abc', ['x'], 'xaxbx')).includes('roundTrip'), 'a cipher that does not read back is not confirmed');
});

test('maker: stencils always read back and use matching fillers', () => {
  for (let seed = 1; seed <= 200; seed++) {
    for (const msg of ['SPY', 'あいしてる', 'attack at dawn', 'Meet me at noon', 'スパイ', 'ABCDEFGHIJKLMNOPQRSTUVWXY']) {
      const made = C.makeStencil(msg, { rand: C.rng(seed) });
      const letters = C.messageLetters(msg).join('');
      assert.ok(C.normalize(C.visible(made.grid, made.mask).plain) === C.normalize(letters), `${msg} ${seed}`);
      assert.equal(made.mask.flat().filter(Boolean).length, [...letters].length);
      assert.deepEqual(C.stencilReport(msg, made).filter(f => f.key.endsWith('standsOut')), [], `${msg} ${seed}: nothing stands out`);
    }
  }
  assert.equal(C.makeStencil('A'.repeat(26), { rand: C.rng(1) }), null);
  assert.equal(C.makeStencil('', { rand: C.rng(1) }), null);
  const hira = C.fillerAlphabet('あいう');
  assert.ok(hira.length > 60 && hira.every(ch => ch >= 'ぁ' && ch <= 'ん'));
  assert.ok(!hira.some(ch => C.fullSize(ch) !== ch), 'no small kana');
  assert.ok(C.fillerAlphabet('スパイ').every(ch => ch >= 'ァ' && ch <= 'ン'), 'katakana messages get katakana');
  assert.deepEqual([C.fillerAlphabet('abc')[0], C.fillerAlphabet('Abc')[0]], ['A', 'A'], 'Latin letters are uppercase');
  assert.ok(C.makeStencil('Meet me', { rand: C.rng(1) }).grid.flat().every(ch => /[A-Z]/.test(ch)), 'the message is uppercased too');
  const keys = f => f.map(x => x.key.split('.').pop());
  assert.deepEqual(keys(C.stencilReport('A'.repeat(26))), ['tooLong']);
  assert.deepEqual(keys(C.stencilReport('A'.repeat(13), C.makeStencil('A'.repeat(13), { rand: C.rng(3) }))), ['roundTrip', 'manyHoles']);
  assert.deepEqual(keys(C.stencilReport('SPY')), []);
  // characters of a kind the fillers never use give the message away
  for (const [msg, chars] of [['きって', 'っ'], ['ラーメン', 'ー'], ['meet at 5!', '5 !']]) {
    const report = C.stencilReport(msg, C.makeStencil(msg, { rand: C.rng(7) }));
    assert.deepEqual(report.find(f => f.key.endsWith('standsOut')).values, { chars }, msg);
  }
});

test('maker: acrostic report while writing', () => {
  const r = C.acrosticReport('abc', 'apple\n\nbanana\nx');
  assert.deepEqual(r.lines.map(l => [l.row, l.char, l.expected, l.ok]), [[0, 'a', 'a', true], [2, 'b', 'b', true], [3, 'x', 'c', false]]);
  assert.deepEqual(r.findings.map(f => f.key.split('.').pop()), ['short']);
  assert.equal(r.next, '');
  assert.equal(C.acrosticReport('abcd', 'Apple\nBanana').next, 'c');
  assert.deepEqual(C.acrosticReport('ab', 'Apple\nBanana').findings.map(f => f.key.split('.').pop()), ['done'], 'case-insensitive');
  assert.deepEqual(C.acrosticReport('ab', 'Apple').findings.map(f => f.key.split('.').pop()), ['count']);
  assert.equal(C.acrosticReport('ab', 'Apple').findings[0].level, 'info', 'fewer lines than letters: still writing');
  assert.equal(C.acrosticReport('a', ['Apple', 'Banana'].join('\n')).findings[0].level, 'warning', 'more lines than letters');
  assert.equal(C.acrosticReport('あい', 'アサ\nいぬ').findings.at(-1).key, 'maker.acrostic.done', 'katakana counts as hiragana');
  assert.equal(C.acrosticReport('きって', 'きのう\nつき\nてがみ').findings.at(-1).key, 'maker.acrostic.done', 'small kana count as full size');
  const withDigit = C.acrosticReport('meet at 5', ['Many', 'Every', 'Each', 'Time', 'All', 'Ten'].join('\n'));
  assert.deepEqual(withDigit.findings.map(f => f.key.split('.').pop()), ['skipped', 'done'], 'digits are left out, so the acrostic can be finished');
  assert.deepEqual(withDigit.findings[0].values, { chars: '5' });
  assert.equal(C.acrosticReport('éa', ['été', 'ami'].join('\n')).findings.at(-1).key, 'maker.acrostic.done', 'NFC');
});

test('units: marks, variation selectors and the long vowel mark', () => {
  const eye = '👁' + String.fromCharCode(0xfe0f);
  assert.deepEqual(C.units('a' + eye + 'b'), ['a', eye, 'b'], 'a variation selector stays on its emoji');
  assert.deepEqual(C.units('げ'.normalize('NFD')), ['げ'], 'NFD is composed first');
  assert.deepEqual(C.removeChars('すーし', ['ー']), { plain: 'すし', removed: [1] }, 'the long vowel mark can be removed');
  assert.equal(C.removeChars('すｰし', ['ｰ']).plain, 'すし');
  const cipher = C.makeRemoval('meet', [eye], { rate: 0.5, rand: C.rng(5) });
  assert.equal(C.removeChars(cipher, [eye]).plain, 'meet', 'an emoji filler is removed whole');
  for (const lone of [String.fromCharCode(0x3099), String.fromCharCode(0xfe0f)]) {
    assert.deepEqual(C.removalReport('meet', [lone], '').map(f => f.key), ['maker.removal.invisible']);
    assert.ok(![...C.makeRemoval('meet', ['x', lone], { rate: 1, rand: C.rng(1) })].includes(lone), 'never inserted');
  }
  // format characters and a trailing zero-width joiner are rejected as fillers
  const zwj = String.fromCharCode(0x200d);
  const fillers = [zwj, '👨' + zwj, String.fromCharCode(0x200b), String.fromCharCode(0x00ad), String.fromCodePoint(0xe0067),
    ' ' + String.fromCharCode(0x3099)];
  for (const filler of fillers) {
    assert.deepEqual(C.removalReport('meet', [filler], '').map(f => f.key), ['maker.removal.invisible'], JSON.stringify(filler));
    assert.equal(C.removeChars(C.makeRemoval('meet', ['x', filler], { rate: 1, rand: C.rng(3) }), ['x']).plain, 'meet', 'never inserted');
  }
  assert.equal(C.removeChars('すｰし', ['ー']).plain, 'すし', 'full and half width long vowel marks match');
  assert.deepEqual(C.removalReport('コーヒー', ['ｰ'], '').map(f => f.key), ['maker.removal.clash']);
  for (const [msg, chars] of [['ヵヶ', 'ヵ ヶ'], ['ゐ', 'ゐ'], ['a' + eye + 'b', eye]]) {
    const report = C.stencilReport(msg, C.makeStencil(msg, { rand: C.rng(2) }));
    assert.deepEqual(report.find(f => f.key.endsWith('standsOut')).values, { chars }, msg);
  }
});

test('surrogate pairs, case-insensitive removal and unsupported rules', () => {
  assert.deepEqual(C.acrostic('\u{1D400}bc'), [{ row: 0, col: 0, char: '\u{1D400}' }], 'a letter outside the BMP is one character');
  assert.deepEqual(C.removeChars('BMEBET', ['b']), { plain: 'MEET', removed: [0, 3] }, 'lowercase b removes B');
  assert.equal(C.removeChars('けあケ', ['ケ']).plain, 'あ', 'katakana removes hiragana too');
  const unsupported = [{ kind: 'words', index: -2 }, { kind: 'mark', marks: ['.'], offset: -1, lettersOnly: true },
    { kind: 'mark', marks: ['.'], offset: -2 }, { kind: 'mark', marks: ['.'], offset: 0 }, { kind: 'nope' }];
  for (const rule of unsupported) {
    assert.throws(() => C.applyRule('a. b', rule), JSON.stringify(rule));
    assert.throws(() => C.describeRule(rule, k => k), JSON.stringify(rule));
  }
});
