// Pure logic for the four concealment-cipher methods: acrostic, character removal, position rules and stencils.
// No DOM and no storage, so the same functions check the answers, draw the hints and run in the tests.
const HiddenCore = (() => {
  // Small hiragana (small a, i, u, e, o, tsu, ya, yu, yo, wa) sit one code point below their full-size forms
  const SMALL_KANA = Object.fromEntries([0x3041, 0x3043, 0x3045, 0x3047, 0x3049, 0x3063, 0x3083, 0x3085, 0x3087, 0x308e]
    .map(code => [String.fromCharCode(code), String.fromCharCode(code + 1)]));

  // ---------- Answers ----------
  // Width, spaces, katakana and letter case are ignored; so is the long vowel mark.
  function normalize(text) {
    return String(text || '').normalize('NFKC').replace(/\s+/g, '')
      .replace(/[\u30a1-\u30f6]/g, ch => String.fromCharCode(ch.charCodeAt(0) - 0x60))
      .toLowerCase().replace(/\u30fc/g, '');             // long vowel mark
  }

  const isBlank = text => normalize(text) === '';

  function isCorrect(input, answers) {
    const value = normalize(input);
    return value !== '' && answers.some(answer => normalize(answer) === value);
  }

  // か゛ → か, ぱ → は (used by rules that say "ignore voicing marks")
  function stripDakuten(ch) {
    return ch.normalize('NFD').replace(/[\u3099\u309a]/g, '').normalize('NFC');
  }

  const fullSize = ch => SMALL_KANA[ch] || ch;

  // Same letters in any order; small kana count as their full-size forms
  function sameLetters(a, b) {
    const key = s => [...normalize(s)].map(fullSize).sort().join('');
    return key(a) === key(b);
  }

  // ---------- Acrostic ----------
  // Returns the first character of each line with its position (line, column) for highlighting.
  function acrostic(text) {
    return text.split('\n').map((line, row) => {
      const col = line.search(/\S/);
      return { row, col, char: col >= 0 ? line[col] : '' };
    }).filter(p => p.char !== '');
  }

  // ---------- Character removal ----------
  function removeChars(cipher, chars) {
    const set = new Set(chars.filter(Boolean));
    const letters = [...cipher];
    return {
      plain: letters.filter(ch => !set.has(ch)).join(''),
      removed: letters.map((ch, i) => (set.has(ch) ? i : -1)).filter(i => i >= 0)
    };
  }

  // ---------- Position rules ----------
  // mark: the character `offset` places from each mark (-1 = just before, 3 = the third after).
  // segments: split by `separator`, read the first and/or last character of each part.
  function applyRule(text, rule) {
    const letters = [...text];
    const picks = [];
    if (rule.kind === 'mark') {
      letters.forEach((ch, i) => {
        if (!rule.marks.includes(ch)) return;
        const j = i + rule.offset;
        picks.push({ index: j, char: j >= 0 && j < letters.length ? letters[j] : '' });
      });
    } else if (rule.kind === 'segments') {
      const parts = [];
      let start = 0;
      letters.forEach((ch, i) => {
        if (ch === rule.separator) { parts.push([start, i - 1]); start = i + 1; }
      });
      parts.push([start, letters.length - 1]);
      const heads = parts.map(([s]) => ({ index: s, char: letters[s] }));
      const tails = parts.map(([, e]) => ({ index: e, char: letters[e] }));
      picks.push(...(rule.order === 'last' ? tails : [...heads, ...tails]));
      if (rule.stripDakuten) picks.forEach(p => { p.char = stripDakuten(p.char); });
    } else {
      throw new Error('Unknown rule: ' + rule.kind);
    }
    return { plain: picks.map(p => p.char).join(''), indices: picks.map(p => p.index) };
  }

  // ---------- Stencil ----------
  // Quarter turns clockwise
  function rotate(mask, quarterTurns) {
    let m = mask;
    for (let k = 0; k < ((quarterTurns % 4) + 4) % 4; k++) m = m[0].map((_, c) => m.map(row => row[c]).reverse());
    return m;
  }

  // Cells of the grid under the holes, read row by row, after rotating and then shifting the stencil
  function visible(grid, mask, { rotation = 0, dx = 0, dy = 0 } = {}) {
    const turned = rotate(mask, rotation);
    const cells = [];
    turned.forEach((row, r) => row.forEach((hole, c) => {
      const y = r + dy, x = c + dx;
      if (hole && y >= 0 && y < grid.length && x >= 0 && x < grid[y].length) cells.push({ y, x, char: grid[y][x] });
    }));
    cells.sort((a, b) => a.y - b.y || a.x - b.x);
    return { plain: cells.map(c => c.char).join(''), cells };
  }

  // ---------- Score ----------
  const RANKS = [[95, 'S'], [80, 'A'], [60, 'B'], [40, 'C'], [0, 'D']];
  const rank = percent => RANKS.find(([min]) => percent >= min)[1];

  return { normalize, isBlank, isCorrect, stripDakuten, fullSize, sameLetters, acrostic, removeChars, applyRule, rotate, visible, rank };
})();

if (typeof module !== 'undefined' && module.exports) module.exports = HiddenCore;
