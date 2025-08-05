# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Hidden Message Challenge is a web-based educational tool for learning about concealment ciphers (分置式暗号). The project is part of the "100 Security Tools with Generative AI" initiative.

## Project Structure

The planned structure includes:
- `index.html` - Main HTML file with 3-tab UI
- `style.css` - Common styles with dark mode support
- `js/` - JavaScript modules for different challenge types:
  - `main.js` - Tab switching and overall control
  - `challenge_headline.js` - First letter of each line challenge
  - `challenge_skipchar.js` - Character removal type challenge
- `assets/` - Images and visual materials

## Development Guidelines

### Security Focus
This is a defensive security educational tool. The concealment cipher challenges are designed to teach cryptographic concepts, not to enable malicious activities.

### UI/UX Considerations
- The tool uses a 3-tab interface
- Dark mode support should be maintained in styling
- Challenges should be interactive and educational
- Each cipher type should have clear rules and hints

### Cipher Types to Implement
1. **Headline Reading** (各行の頭文字) - Read first letter of each line
2. **Position Extraction** (特定位置抽出) - Extract characters at specific positions
3. **Character Removal** (除去文字型) - Remove specified characters to reveal message
4. **Pun Hint Type** (だじゃれヒント型) - Use wordplay hints to decode
5. **Stencil Method** (ステンシル型) - Visual overlay method

### Target Audience
- Cryptography beginners to intermediate learners
- Those interested in steganography
- Educators looking for teaching materials
- No technical knowledge required for users