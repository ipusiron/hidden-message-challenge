# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Hidden Message Challenge is a web-based educational tool for learning about concealment ciphers (分置式暗号). The project is part of the "100 Security Tools with Generative AI" initiative.

## Running and Testing

This is a pure HTML/CSS/JavaScript application with no build process. To run:

```bash
# Simple HTTP server (Python 3)
python -m http.server 8000

# Or open index.html directly in a browser
```

Access at `http://localhost:8000` or by opening `index.html` directly.

## Project Architecture

### Core Structure
- `index.html` - Main HTML file with 5-tab UI (4 challenges + results)
- `css/style.css` - Common styles with responsive design
- `js/main.js` - Main application controller and tab management
- `js/data/challenges.json` - All challenge problem data (20 problems total)

### Module Organization
```
js/
├── main.js                    # Main app controller, tab switching, initialization
├── challenges/                # Individual challenge implementations
│   ├── headline.js           # 行頭読み (headline reading) - extract first character of each line
│   ├── removeChar.js         # 除去文字 (character removal) - remove specific characters
│   ├── position.js           # 位置抽出 (position extraction) - extract at specific positions
│   └── stencil.js            # ステンシル (stencil) - visual overlay method
├── common/                   # Shared utilities
│   ├── utils.js              # Common utility functions
│   ├── storage.js            # LocalStorage management for progress
│   └── dataLoader.js         # JSON data loading and caching
└── results/                  # Results and scoring system
    ├── score.js              # Progress tracking and score calculation
    ├── chart.js              # Radar chart visualization
    └── share.js              # Social sharing functionality
```

### Data Architecture
- **Challenge Data**: Located in `js/data/challenges.json` with 5 problems per cipher type
- **Progress Storage**: Uses LocalStorage to persist user progress across sessions
- **State Management**: Each challenge class manages its own state independently

### UI Architecture
- **Tab System**: 5 tabs (4 challenge types + results) with dynamic content loading
- **Progress Tracking**: Visual dots showing completion status (green=correct, red=incorrect, blue=current)
- **Hint System**: Multi-level hints available for each problem
- **Results Dashboard**: Radar chart, scoring, and social sharing features

## Implementation Details

### Challenge Types Implemented
1. **行頭読み (Headline)** - Read first character of each line
2. **除去文字 (Remove Char)** - Remove characters based on wordplay hints
3. **位置抽出 (Position)** - Extract characters at specific positions
4. **ステンシル (Stencil)** - Interactive visual overlay with drag/rotate functionality

### Key Classes
- `HiddenMessageChallenge` - Main application controller
- `HeadlineChallenge`, `RemoveCharChallenge`, `PositionChallenge`, `StencilChallenge` - Individual challenge implementations
- `Storage` - LocalStorage abstraction for progress persistence
- `ResultsManager` - Scoring and results calculation

### Security Focus
This is a defensive security educational tool. The concealment cipher challenges are designed to teach cryptographic concepts, not to enable malicious activities.