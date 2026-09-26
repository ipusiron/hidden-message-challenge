const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const C = require('../js/hidden-core.js');
const D = require('../js/hidden-data.js');
const root = path.join(__dirname, '..');
const readme = { ja: fs.readFileSync(path.join(root, 'README.md'), 'utf8'), en: fs.readFileSync(path.join(root, 'README.en.md'), 'utf8') };
const cells = line => line.split('|').slice(1, -1).map(c => c.trim());
const unquote = s => s.replace(/^`|`$/g, '');

// Rows of the first table between `heading` and the next heading (header and separator removed)
function tableAfter(text, heading) {
  const start = text.indexOf(heading);
  assert.ok(start >= 0, heading);
  const lines = text.slice(start + heading.length).split('\n');
  const end = lines.findIndex(l => /^#{2,4} /.test(l));
  return lines.slice(0, end).filter(l => l.startsWith('|')).slice(2).map(cells);
}

test('puzzle table matches the core in both READMEs', () => {
  const puzzles = Object.entries(D.SETS).flatMap(([kind, list]) => list.map(p => ({ kind, p })));
  for (const [lang, heading] of [['ja', '### 問題と既知解答'], ['en', '### Puzzles and known answers']]) {
    const rows = tableAfter(readme[lang], heading);
    assert.equal(rows.length, 20, lang);
    rows.forEach((row, i) => {
      const { kind, p } = puzzles[i];
      const read = kind === 'headline' ? (p.heads ? p.heads.join('') : C.acrostic(p.text).map(h => h.char).join(''))
        : kind === 'removeChar' ? C.removeChars(p.cipher, p.remove).plain
          : kind === 'position' ? C.applyRule(p.reading || p.text, p.rule).plain
            : C.visible(p.grid, p.mask, p.solution).plain;
      assert.equal(unquote(row[0]), p.id, `${lang} row ${i}`);
      assert.equal(unquote(row[3]), read, `${lang} ${p.id}`);
      assert.deepEqual(row[4].split(' / ').map(unquote), p.answers, `${lang} ${p.id}`);
    });
  }
});

test('rank table matches the thresholds', () => {
  for (const [lang, heading] of [['ja', '### ランクの基準'], ['en', '### Ranks']]) {
    const rows = tableAfter(readme[lang], heading);
    assert.deepEqual(rows.map(r => r[0].replace(/\*/g, '')), ['S', 'A', 'B', 'C', 'D']);
    for (const [rank, range] of rows) {
      const min = Number((/\d+/.exec(range) || ['0'])[0]);
      if (/未満|below/.test(range)) assert.equal(C.rank(min - 1), rank.replace(/\*/g, ''));
      else assert.equal(C.rank(min), rank.replace(/\*/g, ''));
    }
  }
});

test('YAML metadata keeps its structure', () => {
  const yaml = /^<!--\n---\n([\s\S]*?)\n---\n-->/.exec(readme.ja);
  assert.ok(yaml, 'YAML block');
  for (const line of ['id: day036', 'slug: hidden-message-challenge', 'repo_url: "https://github.com/ipusiron/hidden-message-challenge"',
    'demo_url: "https://ipusiron.github.io/hidden-message-challenge/"', 'hub: true']) assert.ok(yaml[1].includes(line), line);
  for (const key of ['category_ja:', 'category_en:', 'tags:']) {
    const lines = yaml[1].split('\n');
    assert.match(lines[lines.indexOf(key) + 1], /^ {2}- /, key);
  }
  assert.ok(!readme.en.includes('id: day036'), 'YAML only in README.md');
});

test('both READMEs have the same section structure', () => {
  const headings = t => t.split('\n').filter(l => /^#{2,4} /.test(l)).map(l => l.match(/^#+/)[0].length);
  assert.deepEqual(headings(readme.ja), headings(readme.en));
  assert.ok(headings(readme.ja).length >= 28);
  assert.match(readme.ja, /\[English\]\(README\.en\.md\) · 日本語/);
  assert.match(readme.en, /English · \[日本語\]\(README\.md\)/);
});

test('bold markers render (CommonMark flanking rules with CJK punctuation)', () => {
  const PUNCT = /[\p{P}\p{S}]/u, SPACE = /\s/;
  for (const [lang, text] of Object.entries(readme)) {
    text.split('\n').forEach((line, n) => {
      let open = true;
      for (const m of line.matchAll(/\*\*/g)) {
        const before = line[m.index - 1] || ' ', after = line[m.index + 2] || ' ';
        const left = !SPACE.test(after) && (!PUNCT.test(after) || SPACE.test(before) || PUNCT.test(before));
        const right = !SPACE.test(before) && (!PUNCT.test(before) || SPACE.test(after) || PUNCT.test(after));
        assert.ok(open ? left : right, `${lang}:${n + 1}: ${line.slice(Math.max(0, m.index - 10), m.index + 12)}`);
        open = !open;
      }
    });
  }
});

test('images exist and assets holds only referenced PNGs', () => {
  const refs = new Set();
  for (const text of Object.values(readme)) for (const [, p] of text.matchAll(/!\[[^\]]*\]\((assets\/[^)]+)\)/g)) refs.add(p);
  for (const p of refs) assert.ok(fs.existsSync(path.join(root, p)), p);
  const pngs = execFileSync('git', ['ls-files', 'assets'], { cwd: root, encoding: 'utf8' }).split('\n').filter(f => f.endsWith('.png'));
  for (const f of pngs) assert.ok(refs.has(f), `unreferenced ${f}`);
});

test('the directory tree lists every tracked file with a description', () => {
  const tracked = execFileSync('git', ['ls-files'], { cwd: root, encoding: 'utf8' }).split('\n').filter(Boolean)
    .concat(['test/readme.test.js', 'README.en.md', 'assets/en/screenshot.png', 'assets/screenshot2.png']);
  for (const lang of ['ja', 'en']) {
    const block = readme[lang].slice(readme[lang].indexOf(lang === 'ja' ? '## 📁 ディレクトリー構造' : '## 📁 Directory Structure'));
    const tree = block.slice(block.indexOf('```') + 3, block.indexOf('```', block.indexOf('```') + 3));
    const lines = tree.split('\n').filter(l => l.trim() && !l.startsWith('hidden-message-challenge/'));
    for (const l of lines) assert.match(l, /# \S/, `${lang}: ${l}`);
    for (const f of new Set(tracked)) assert.ok(tree.includes(path.basename(f)), `${lang}: ${f}`);
  }
});

test('removed claims and quotations stay removed', () => {
  for (const bad of ['トレヴァニアンの小説', '別の置いて', '分置式暗号文は見つけた敵は', 'data/challenges.json',
    'URL共有', 'Twitter', 'ES6 Modules']) {
    assert.ok(!readme.ja.includes(bad), bad);
  }
  assert.ok(!readme.en.includes('Twitter'));
});

test('quoted works are listed with their sources', () => {
  const I18n = require('../js/i18n.js');
  for (const [lang, heading] of [['ja', '### 引用している作品'], ['en', '### Quoted works']]) {
    const section = readme[lang].slice(readme[lang].indexOf(heading), readme[lang].indexOf('###', readme[lang].indexOf(heading) + 4));
    for (const id of ['h4', 'h5']) assert.ok(section.includes(I18n[lang][`source.${id}`].replace(/^(出典|Source): /, '')), `${lang} ${id}`);
  }
});
