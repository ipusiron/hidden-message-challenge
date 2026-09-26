# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Hidden Message Challenge is an educational web app for concealment ciphers (分置式暗号): acrostics, character removal, position rules and stencils, five puzzles each, in a Japanese set and an English set, plus a maker for building your own. It is part of "100 Security Tools with Generative AI" (Day 036). It makes no network requests.

## Commands

- `npm test` runs `node --test` (Node.js 22+, no dependencies). GitHub Actions runs it on push and pull_request.
- Open `index.html` directly (file://) or serve the folder with any static server. There is no build step.

## Architecture

Classic scripts (no ES modules, so file:// works). Load order in `index.html`:

1. `js/i18n.js` - `I18n` with `ja` and `en` dictionaries (UI text, hints `hint.<id>`, explanations `explain.<id>`), `t(key, values)`, `apply()` for `data-i18n*` attributes, language choice (`?lang=` → localStorage → `navigator.language`)
2. `js/hidden-core.js` - `HiddenCore`: `normalize`/`isCorrect`, `units`, `acrostic`, `removeChars`, `applyRule` and `describeRule` (structured rules, including English `words` and `lettersOnly`), `rotate`/`visible` (stencil), `rank`, and the maker's generators and checks (`rng`, `seedOf`, `makeRemoval`, `removalReport`, `makeStencil`, `stencilReport`, `acrosticReport`). Each reader returns the positions it read, used for highlighting. Pure, no DOM
3. `js/hidden-data.js` - `HiddenData`: `BY_SET.ja` and `BY_SET.en`, twenty puzzles each. `answers[0]` must follow from the rule; later entries are other spellings only (voicing marks dropped, small and full-size kana, a kanji in kana, or a final Roman numeral I written as 1). Historical English texts were checked against page images of their sources
4. `js/progress.js` - `Progress`: stored format `{ kind: { current, solved[], missed[] } }`, validation, recording, summary. Pure
5. `js/main.js` - `Store` (progress per puzzle set and the chosen set, safe when storage is blocked; the set is chosen from the display language on the first visit and then kept), set buttons, tabs, help `<dialog>`, language button
6. `js/challenges.js` - one shared flow for the four panels (three hints, check, next, progress dots) plus per-method drawing
7. `js/results.js` - radar chart (canvas with `aria-label`), totals, rank, share link, image download, reset `<dialog>` (current set only)
8. `js/maker.js` - maker tab: acrostic line check as you type, removal and stencil generation; announces a short summary through a `role="status"` element

## Rules

- Reading logic belongs in `js/hidden-core.js`. UI scripts must not re-implement it; rule texts are generated from the rule objects.
- Never edit an answer to make a test pass: fix the puzzle text, rule or mask instead. `test/data.test.js` checks every puzzle.
- Quoted puzzles (h4, h5, and the historical English texts ea4, ea5, ep1, ep4, ep5) carry `source: true` and keep the original text unchanged; the source line (`source.<id>` in both languages) is shown under the text and listed in the README.
- CSP forbids inline scripts and styles: no inline event handlers, no `style=` attributes, no `.style.` writes, no `innerHTML`, no `alert`/`confirm`/`window.open`.
- UI text lives in `js/i18n.js` (both languages, same keys). Other scripts, except the puzzle data, contain no Japanese outside comments. Use `\u` escapes in code (the Write tool may turn them into literal characters; check after writing).
- Text colors are the variables in `:root` of `css/style.css` plus the literal pairs listed in `test/contrast.test.js`, which checks them all.
- README tables must match the core. There is no generator in this repository, so keep them in sync by hand; `test/readme.test.js` recomputes the ids, the characters read, the answers and the position rule wording, and checks that `**bold**` next to CJK punctuation still renders.

## Tests

- `test/core.test.js` - normalization, voicing marks, anagrams, the four readers (including English word rules), stencil rotation and shifting, ranks, and the maker's generators and checks (200 seeds read back)
- `test/data.test.js` - every answer follows from its rule; other spellings are only the allowed variants; fixed data errors stay fixed
- `test/progress.test.js` - stored format, broken values, recording, summary
- `test/html.test.js` - CSP, ARIA, forbidden patterns, script order, share link
- `test/i18n.test.js` - dictionary keys, no Japanese in English, hints and explanations for every puzzle, markup fallback text
- `test/contrast.test.js` - palette contrast ratios
- `test/format.test.js` - line lengths and minimum file sizes
- `test/readme.test.js` - README tables, YAML, heading parity, bold rendering, images, directory tree
