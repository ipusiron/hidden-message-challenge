# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Hidden Message Challenge is a web-based educational tool for learning about concealment ciphers (分置式暗号). The project is part of the "100 Security Tools with Generative AI" initiative (Day 036).

## Running the Application

Pure HTML/CSS/JavaScript with ES6 modules - no build process required.

```bash
# Start local server (required for ES6 modules)
python -m http.server 8000
```

Access at `http://localhost:8000`. Note: Opening `index.html` directly may fail due to CORS restrictions on ES6 module imports.

## Architecture Overview

### Entry Point Flow
1. `index.html` loads `js/main.js` as ES6 module
2. `HiddenMessageChallenge` class initializes on DOMContentLoaded
3. Challenge classes are instantiated but data is lazy-loaded on tab switch
4. Progress persists via LocalStorage with `hiddenMessage_` prefix

### Module Dependencies
```
main.js
├── challenges/*.js     → Each implements: loadChallenge(), checkAnswer(), showHint(), nextChallenge(), reset()
├── common/storage.js   → Storage class wraps LocalStorage with JSON serialization
├── common/dataLoader.js → Singleton pattern, caches challenges.json
└── results/score.js    → ResultsManager aggregates scores from all challenges
```

### Challenge Class Interface
All challenge classes share a common interface:
- `loadChallenge()` - Load current problem and render UI
- `checkAnswer()` - Validate user input against normalized answer
- `showHint()` - Display progressive hints
- `nextChallenge()` - Advance to next problem
- `setProgress(data)` / `reset()` - Progress state management

### Answer Normalization
User answers undergo normalization before comparison:
- Trim whitespace
- Convert to lowercase
- Remove long vowel marks (ー)
- Convert katakana to hiragana (Unicode offset: 0x60)

### Stencil Challenge Specifics
The stencil challenge uses a two-layer system:
- Base layer: 5x5 character grid (44px cells)
- Overlay layer: Draggable/rotatable stencil with `pointerEvents: 'none'`
- Transform: `translate(-50%, -50%) translate(x*44px, y*44px) rotate(deg)`

### Data Format (`js/data/challenges.json`)
```javascript
{
  "headline": [{ id, text, answer, hint }],           // Line-break separated text
  "removeChar": [{ id, cipher, hint, removeChars, answer }],
  "position": [{ id, text, rule, answer, hint }],
  "stencil": [{ id, grid[][], stencil[][], answer, hint }]  // grid: chars, stencil: 0/1 mask
}
```

## Key Implementation Notes

- **XSS Prevention**: Uses `textContent` instead of `innerHTML` for user-facing content
- **Event Delegation**: Global click handler on document for dynamic progress dots
- **Radar Chart**: Canvas-based, uses polar coordinate conversion with 12 o'clock as origin
- **LocalStorage Keys**: `hiddenMessage_{challengeName}_{dataType}`

## Related Documentation

- `TECHNICAL_NOTES.md` - Detailed algorithm explanations (stencil transforms, radar chart math, Unicode handling)