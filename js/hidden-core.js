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
  // Returns the first letter of each line with its position (line, column) for highlighting.
  // Leading quotes and other symbols are skipped ("Love not" counts as L).
  function acrostic(text) {
    return text.split('\n').map((line, row) => {
      const m = line.match(/\p{L}/u);                   // a whole code point, also outside the BMP
      return { row, col: m ? m.index : -1, char: m ? m[0] : '' };
    }).filter(p => p.char !== '');
  }

  // ---------- Character removal ----------
  // Matching ignores case, width and katakana/hiragana (b removes B; typing the letter as shown is not required).
  function removeChars(cipher, chars) {
    const set = new Set(chars.map(normalize).filter(Boolean));
    const letters = [...cipher];
    const hit = ch => set.has(normalize(ch));
    return {
      plain: letters.filter(ch => !hit(ch)).join(''),
      removed: letters.map((ch, i) => (hit(ch) ? i : -1)).filter(i => i >= 0)
    };
  }

  // ---------- Position rules ----------
  const isLetter = ch => /\p{L}/u.test(ch);

  // Index of the n-th letter after position i (spaces and punctuation are skipped), or -1
  function nthLetterAfter(letters, i, n) {
    let count = 0;
    for (let k = i + 1; k < letters.length; k++) {
      if (isLetter(letters[k]) && ++count === n) return k;
    }
    return -1;
  }

  // mark: the character `offset` places from each mark (-1 = just before, 3 = the third after);
  //   with lettersOnly, only letters are counted (the English "third letter after each punctuation mark").
  // segments: split by `separator`, read the first and/or last character of each part.
  // words: the letter at `index` of each word (-1 = last); words are separated by spaces and only letters count.
  // Combinations that have no wording in describeRule are rejected instead of being read one way and described another
  function checkRule(rule) {
    if (rule.kind === 'mark' && rule.lettersOnly && rule.offset < 1) throw new Error('lettersOnly needs a positive offset');
    if (rule.kind === 'mark' && rule.offset < -1) throw new Error('only -1 is supported before a mark');
    if (rule.kind === 'words' && rule.index < -1) throw new Error('only -1 is supported from the end of a word');
  }

  function applyRule(text, rule) {
    checkRule(rule);
    const letters = [...text];
    const picks = [];
    if (rule.kind === 'mark') {
      letters.forEach((ch, i) => {
        if (!rule.marks.includes(ch)) return;
        const j = rule.lettersOnly ? nthLetterAfter(letters, i, rule.offset) : i + rule.offset;
        picks.push({ index: j, char: j >= 0 && j < letters.length ? letters[j] : '' });
      });
    } else if (rule.kind === 'words') {
      let word = [];
      const flush = () => {
        if (word.length) {
          const j = word[rule.index < 0 ? word.length + rule.index : rule.index];
          picks.push({ index: j === undefined ? -1 : j, char: j === undefined ? '' : letters[j] });
        }
        word = [];
      };
      letters.forEach((ch, i) => {
        if (/\s/.test(ch)) flush();
        else if (isLetter(ch)) word.push(i);
      });
      flush();
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

  // Wording of a rule, built from the same object the reader uses; t(key, values) supplies the messages
  function describeRule(rule, t) {
    checkRule(rule);
    if (rule.kind === 'mark') {
      const marks = rule.marks.map(mark => t('rule.mark', { mark })).join(t('rule.or'));
      if (rule.offset === -1) return t('rule.before1', { marks });
      if (rule.lettersOnly) return t(rule.offset === 1 ? 'rule.after1Letter' : 'rule.afterNLetter', { marks, n: rule.offset });
      return t(rule.offset === 1 ? 'rule.after1' : 'rule.afterN', { marks, n: rule.offset });
    }
    if (rule.kind === 'words') {
      if (rule.index === 0) return t('rule.wordFirst');
      if (rule.index === -1) return t('rule.wordLast');
      return t('rule.wordN', { n: rule.index + 1 });
    }
    const text = t(rule.order === 'last' ? 'rule.last' : 'rule.firstLast');
    return rule.stripDakuten ? t('rule.withDakuten', { rule: text }) : text;
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

  // ---------- Maker ----------
  // Seeded generator (mulberry32) so that a made cipher can be reproduced and tested
  function rng(seed) {
    let a = seed >>> 0;
    return () => {
      a = (a + 0x6d2b79f5) >>> 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  // FNV-1a hash of a text, used as a seed
  function seedOf(text) {
    let h = 2166136261;
    for (const ch of String(text)) {
      h ^= ch.codePointAt(0);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }

  // NFC first, so that a letter typed as base + combining mark counts as one character
  const messageLetters = message => [...String(message || '').normalize('NFC')].filter(ch => !/\s/.test(ch));
  const code = ch => ch.charCodeAt(0);
  const isHiragana = ch => code(ch) >= 0x3041 && code(ch) <= 0x3096;
  const isKatakana = ch => code(ch) >= 0x30a1 && code(ch) <= 0x30fa;       // without the long vowel mark and the middle dot
  const sameChar = (a, b) => normalize(a) === normalize(b);
  // Line heads: small kana count as full size, as in the puzzles' readings
  const sameHead = (a, b) => [...normalize(a)].map(fullSize).join('') === [...normalize(b)].map(fullSize).join('');

  // Kind of a character. A hole whose kind never appears among the fillers gives the message away.
  function charClass(ch) {
    if (/[A-Z]/.test(ch)) return 'upper';
    if (/[a-z]/.test(ch)) return 'lower';
    if (isHiragana(ch) || isKatakana(ch)) {
      const kata = isKatakana(ch);
      const hira = kata ? String.fromCharCode(code(ch) - 0x60) : ch;       // katakana sit 0x60 above hiragana
      return (kata ? 'katakana' : 'hiragana') + (fullSize(hira) !== hira ? '-small' : '');
    }
    return /\p{N}/u.test(ch) ? 'digit' : 'other';
  }

  // Full-size kana from `from` to `to` without wi and we (rare in modern text)
  const kanaRange = (from, to) => Array.from({ length: to - from + 1 }, (_, i) => String.fromCharCode(from + i))
    .filter(ch => !/-small$/.test(charClass(ch)) && ![0x3090, 0x3091, 0x30f0, 0x30f1].includes(code(ch)));

  // Filler characters in the message's own script: hiragana, katakana (when katakana is the majority) or A-Z
  function fillerAlphabet(message) {
    const letters = messageLetters(message);
    const hira = letters.filter(isHiragana).length, kata = letters.filter(isKatakana).length;
    if (hira || kata) return kata > hira ? kanaRange(0x30a2, 0x30f3) : kanaRange(0x3042, 0x3093);
    return Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i));
  }

  // Inserts filler characters before each letter with probability `rate` (at least one filler overall)
  function makeRemoval(message, nulls, { rate, rand }) {
    const letters = messageLetters(message), fill = nulls.map(n => n.normalize('NFC')).filter(Boolean);
    if (!letters.length || !fill.length) return '';
    const pick = () => fill[Math.floor(rand() * fill.length)];
    let out = '', used = 0;
    for (const ch of letters) {
      if (rand() < rate) { out += pick(); used++; }
      out += ch;
    }
    if (used === 0 || rand() < rate) out += pick();
    return out;
  }

  function removalReport(message, nulls, cipher) {
    const letters = messageLetters(message), fill = nulls.map(n => n.normalize('NFC')).filter(Boolean), findings = [];
    const clash = [...new Set(fill.filter(n => letters.some(ch => sameChar(ch, n))))];
    if (clash.length) findings.push({ level: 'error', key: 'maker.removal.clash', values: { chars: clash.join(' ') } });
    if (!cipher) return findings;
    if (!clash.length && removeChars(cipher, fill).plain === letters.join('')) findings.push({ level: 'ok', key: 'maker.removal.roundTrip' });
    const chars = [...cipher];
    const percent = Math.round((chars.filter(ch => fill.some(n => sameChar(n, ch))).length / chars.length) * 100);
    findings.push(percent > 40 ? { level: 'warning', key: 'maker.removal.tooMany', values: { percent } }
      : { level: 'info', key: 'maker.removal.share', values: { percent } });
    return findings;
  }

  // Puts the message letters at random cells (read row by row) and fills the rest.
  // Latin letters are made uppercase to match the A-Z filler; otherwise lowercase holes would stand out.
  function makeStencil(message, { size = 5, rand }) {
    const letters = messageLetters(message).map(ch => (/[a-z]/.test(ch) ? ch.toUpperCase() : ch));
    if (!letters.length || letters.length > size * size) return null;
    const cells = Array.from({ length: size * size }, (_, i) => i);
    for (let i = cells.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      [cells[i], cells[j]] = [cells[j], cells[i]];
    }
    const alphabet = fillerAlphabet(message);
    const grid = Array.from({ length: size }, () => Array.from({ length: size }, () => alphabet[Math.floor(rand() * alphabet.length)]));
    const mask = Array.from({ length: size }, () => Array(size).fill(0));
    cells.slice(0, letters.length).sort((a, b) => a - b).forEach((cell, k) => {
      const y = Math.floor(cell / size), x = cell % size;
      grid[y][x] = letters[k];
      mask[y][x] = 1;
    });
    return { grid, mask };
  }

  function stencilReport(message, made, size = 5) {
    const letters = messageLetters(message), count = letters.length;
    if (count > size * size) return [{ level: 'error', key: 'maker.stencil.tooLong', values: { max: size * size } }];
    const findings = [];
    if (made && sameChar(visible(made.grid, made.mask).plain, letters.join(''))) findings.push({ level: 'ok', key: 'maker.stencil.roundTrip' });
    if (made) {
      const cells = made.grid.flatMap((row, y) => row.map((ch, x) => ({ ch, hole: made.mask[y][x] === 1 })));
      const fillerKinds = new Set(cells.filter(c => !c.hole).map(c => charClass(c.ch)));
      const revealing = [...new Set(cells.filter(c => c.hole && !fillerKinds.has(charClass(c.ch))).map(c => c.ch))];
      if (fillerKinds.size && revealing.length) findings.push({ level: 'warning', key: 'maker.stencil.standsOut', values: { chars: revealing.join(' ') } });
    }
    if (count > (size * size) / 2) findings.push({ level: 'warning', key: 'maker.stencil.manyHoles', values: { count } });
    return findings;
  }

  // Line-by-line check of an acrostic being written: which head is expected and whether it matches.
  // Digits and symbols in the message cannot start a line (heads skip them), so they are left out and reported.
  function acrosticReport(message, text) {
    const all = messageLetters(message), letters = all.filter(isLetter);
    const source = String(text).normalize('NFC'), heads = acrostic(source), rows = source.split('\n');
    const lines = heads.map((h, i) => ({ row: h.row, char: h.char, expected: letters[i] || '', ok: i < letters.length && sameHead(h.char, letters[i]) }));
    const findings = [];
    const skipped = [...new Set(all.filter(ch => !isLetter(ch)))];
    if (skipped.length) findings.push({ level: 'info', key: 'maker.acrostic.skipped', values: { chars: skipped.join(' ') } });
    if (heads.length !== letters.length) {
      findings.push({ level: 'warning', key: 'maker.acrostic.count', values: { lines: heads.length, letters: letters.length } });
    }
    const short = heads.filter(h => [...rows[h.row].trim()].length <= 2).length;
    if (short) findings.push({ level: 'info', key: 'maker.acrostic.short', values: { count: short } });
    if (letters.length && heads.length === letters.length && lines.every(l => l.ok)) findings.push({ level: 'ok', key: 'maker.acrostic.done' });
    return { lines, next: letters[heads.length] || '', findings };
  }

  return {
    normalize, isBlank, isCorrect, stripDakuten, fullSize, sameLetters, acrostic, removeChars, applyRule, describeRule, rotate, visible, rank,
    rng, seedOf, messageLetters, fillerAlphabet, makeRemoval, removalReport, makeStencil, stencilReport, acrosticReport
  };
})();

if (typeof module !== 'undefined' && module.exports) module.exports = HiddenCore;
