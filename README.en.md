# Hidden Message Challenge - Concealment Cipher Challenge Tool

English · [日本語](README.md)

![GitHub Repo stars](https://img.shields.io/github/stars/ipusiron/hidden-message-challenge?style=social)
![GitHub forks](https://img.shields.io/github/forks/ipusiron/hidden-message-challenge?style=social)
![GitHub last commit](https://img.shields.io/github/last-commit/ipusiron/hidden-message-challenge)
![GitHub license](https://img.shields.io/github/license/ipusiron/hidden-message-challenge)
[![GitHub Pages](https://img.shields.io/badge/demo-GitHub%20Pages-blue?logo=github)](https://ipusiron.github.io/hidden-message-challenge/)

**Day036 - 100 Security Tools with Generative AI**

**Hidden Message Challenge** is a challenge-style web tool for learning how concealment ciphers work.

Text that looks ordinary can carry a hidden "real message". This tool trains you, step by step, to notice and read such messages.

Twenty puzzles cover **four methods**: acrostic, character removal, position rules and stencils.
Each puzzle has three levels of hints, and a correct answer shows the hidden text with an explanation.
There is also an English puzzle set (including historical examples such as a World War I cable and a Lewis Carroll poem) and a **maker** for building your own ciphers.

Progress is saved in your browser, and the Results tab shows a radar chart and a rank.
The sense of noticing that small something is off matters in modern cybersecurity too, and these classic techniques are a good way to build it.

---

## 🔗 Demo

👉 [https://ipusiron.github.io/hidden-message-challenge/](https://ipusiron.github.io/hidden-message-challenge/)

---

## 📸 Screenshots

> ![Position challenge in English: the kana reading of a classical poem, with the heads and tails of its parts highlighted](assets/en/screenshot.png)
>
> *Position challenge (English UI): a poem that hides words at the head and the tail of its parts (kutsukamuri)*

> ![Acrostic challenge in Japanese with hint 2 open: the first character of each line is highlighted](assets/screenshot.png)
>
> *Acrostic (Japanese UI): hint 2 highlights the head of each line*

> ![Stencil challenge in Japanese: the card turned 180 degrees shows five characters through its holes](assets/screenshot2.png)
>
> *Stencil (Japanese UI): turn and lay the card, and characters show through the holes*

> ![English puzzle set, position challenge: the letter said to have been sent to Sir John Trevanion, with the third letter after each punctuation mark highlighted](assets/en/screenshot2.png)
>
> *English puzzle set: the letter said to have been sent to Sir John Trevanion (third letter after each punctuation mark)*

> ![Maker in Japanese: a stencil generated to hide a message, with the holes highlighted](assets/screenshot3.png)
>
> *Maker (Japanese UI): build a stencil from a message and check that it reads back*

---

## 🎯 Features

- **Four concealment methods**, five puzzles each (twenty in total)
- **Three hints**: a clue for the puzzle, then the positions to read are highlighted (for stencils, the angle to turn), then the start of the answer
- **Explanation after solving**: the hidden text and how it was hidden
- **Stencil controls**: lay the card, move it up, down, left and right, turn it 90° at a time. The characters showing through are also given as text
- **Saved progress and puzzle selection**: select a progress dot to go to that puzzle. Reloading continues where you left off
- **Results**: radar chart, solved count, rank, sharing on X and saving the result as an image
- **Japanese and English UI** (switched separately from the puzzle set)
- **English puzzle set**: five puzzles for each method. Historical examples (Carroll, Poe, a World War I cable, the Trevanion letter) come with sources and caveats
- **Maker**: build your own acrostic, removal or stencil cipher, and check that it reads back and does not stand out

---

## 🧠 What is a concealment cipher?

A **concealment cipher** hides the message by placing other characters between its letters so the original cannot be seen.

The plaintext ends up scattered through a cover text. With care, the result does not look like ciphertext at all: it reads as a natural sentence, or as meaningless but harmless filler.
In that sense it is a kind of **steganography**, whose aim is to keep the message from being noticed.

---

## 🔎 Characteristics

- No mathematics and no complex keys
- Most methods follow **simple rules**
  - Meaningless characters (nulls) are inserted into the plaintext, so these ciphers are also called null ciphers
  - The receiver needs a rule for removing the nulls
- Works on books, diaries, pictures and any string of characters

---

## 🧩 Main types

| Type | Idea | Notes |
|------|------|------|
| **Position** | Read characters at given positions | Many historical examples |
| **Removal** | Removing given characters reveals the plaintext | A keyword or picture beside the text says what to remove |
| **Stencil (grille)** | Lay a card with holes and read what shows | Used in turning grilles and hourglass masks |

### 📍 Position

- Read the first character of each line
  - Also called an **acrostic**, used in many languages. The first characters join into another word
  - The poem "Akubi" by Tanikawa Shuntaro, which hides "aishitemasu" (I love you) in its line heads, is a famous example (acrostic puzzle 4 in this tool)
- Read the third character after each punctuation mark
- Read the first characters of the parts in order, then the last characters
  - Kutsukamuri is a form of oriku in Japanese poetry that places one sound of a phrase at the start and the end of each part

### 🧹 Removal

The picture word is a pun that names the characters to remove, for example "keshigomu" (eraser) read as "keshi" (erase) + go + mu, or "tentoumushi" (ladybird) read as te, n, to, u + "mushi" (ignore).

### 🎭 Stencil

- Lay a card with windows, write the message in the windows, and fill the rest with cover text
- A mask cut in the shape of an hourglass is known as Clinton's hourglass cipher

---

## 📜 History and examples

- During the English Civil War, a letter to the captured Royalist Sir John Trevanion is said to have hidden escape directions in the third letter after each punctuation mark. The story first appeared in an 1863 magazine article, and the real John Trevanion is recorded as killed in 1643, which does not fit a story set in 1648, so it is unlikely to be history (English position puzzle 5)
- In **World War I**, a cable disguised as a press report hid "PERSHING SAILS FROM NY JUNE I" in the first letters, and another in the second letters, of its words. David Kahn's The Codebreakers (1967) presents them as German messages, while H. C. Hoy (1932), who worked in British naval intelligence, describes them as his own side's messages that reached them from America, so accounts differ. According to Kahn, Pershing actually sailed on May 28 (English position puzzles 1 and 4)
- In poetry, Poe hid Elizabeth's name in the line heads of a poem written in his cousin's album, and Lewis Carroll hid Alice Pleasance Liddell's name in the closing poem of Through the Looking-Glass (English acrostic puzzles 4 and 5)
- Spies and **some wartime messages** also hid information inside ordinary text
- The **turning grille** uses a card with holes like a stencil, but structurally it is closer to a transposition cipher
- Today there are also social-steganography uses that hide messages in posts and image captions

---

## 🛡️ Not being noticed is the best defense

An enemy who finds an ordinary ciphertext knows at once that it is a ciphertext (whether or not they can break it).

Text that does not look like a ciphertext is safer.
One way to get there is to embed the message in unremarkable text.
For a concealment cipher, that means choosing the surrounding characters so the whole reads like a normal note or letter rather than using arbitrary nulls.
The acrostic and stencil methods work well for this.

The longer the plaintext, the harder it is to keep the whole text natural, and the more effort encryption takes.

### 🧪 Links to modern cryptography

Concealment ciphers are **weak** by modern standards, but they have educational and psychological value because they are built for **passing a message unnoticed**.

Techniques such as **chaffing and winnowing** can be seen as a modern descendant.

---

## 📖 Usage

1. Choose Japanese or English puzzles with "Puzzle set" (progress is saved for each set)
2. Choose a method with the tabs (acrostic, removal, position, stencil)
3. Read the text, type the answer and press "Check" (hiragana for Japanese puzzles, letters for English ones; katakana, width, letter case and spaces do not matter)
4. If you are stuck, press "Hint". Each press gives the next hint (three levels)
5. A correct answer shows the hidden text and an explanation. Go on with "Next puzzle" or a progress dot
6. The Results tab shows the result of the chosen puzzle set, and lets you share it on X, save it as an image or start over
7. Build your own ciphers in the Maker tab

The tool works when the file is opened directly (file://) and when served from a web server.

---

## 📌 Audience

- **Beginners and intermediate learners** interested in how ciphers work and their history
- People who want to learn about **steganography**
- Fans of **word puzzles** and **challenge-style problems**
- Educators looking for **teaching material** for schools, seminars and events

No technical knowledge is needed.

---

## 🎯 Scenarios

### 📚 Scenario 1: an information security class

**Setting**: a 50-minute high school lesson on information security

**Plan**:
- **Introduction, 10 minutes**: the history of concealment ciphers (spy messages, wartime ciphers)
- **Practice, 30 minutes**: groups of two or three work through the four challenges
- **Review, 10 minutes**: groups compare and present their radar charts

**Goal**: finding hidden information builds the habit of noticing, which also helps against phishing and social engineering

### 🏢 Scenario 2: company security training and team building

**Setting**: a two-hour afternoon session for new employees at an IT company

**Plan**:
- **Icebreaker**: teams compete, starting with the acrostics
- **Skill-up**: raise the difficulty step by step and encourage discussion within teams
- **Sharing**: share each team's rank and recognize the best team

**Goals**:
- Experience how easily things are overlooked in security
- Encourage communication within teams
- Learn, as a game, why small oddities matter

### 🎮 Scenario 3: self-study and hobby

**Setting**: a cipher and puzzle fan using spare moments

**Plan**:
- **Commute**: one or two puzzles a day on a smartphone
- **Weekend**: check the radar chart and review weak areas
- **Sharing**: share the result on X and connect with other enthusiasts

---

## 🔬 Specification and Known Answers

All four reading methods live in `js/hidden-core.js`; answer checking, hint highlighting and the tests use the same functions.
Rule texts are built from the structure of the puzzle data, so a rule and its answer cannot drift apart.

- **Answer comparison**: width, spaces, katakana versus hiragana, letter case and the long vowel mark are ignored. Voicing marks are not (other spellings, such as old kana readings, are listed in the puzzle data)
- **Acrostic**: the first letter of each line (leading quotes and other symbols are skipped). When a line starts with a kanji, the puzzle data gives the word reading
- **Removal**: what is left after removing every given character
- **Position**: the character a fixed number of places before or after each mark (such as a full stop or comma), or the first and last characters of the parts separated by wide spaces
- **Stencil**: turn the card clockwise 90° at a time and shift it; the characters under the holes are read row by row. For puzzles that need rearranging (anagrams), the tests check that the visible characters and the answer use the same letters
- **Position (English)**: a given letter of each word (first, second or last). Words are separated by spaces; words joined by an apostrophe or hyphen count as one. Puzzles that count after punctuation count letters only (not spaces or symbols)
- **Maker**: the random choices come from a seed made from the method, the message and the other inputs, so the same input gives the same result ("Make again" changes it). A made cipher is shown only after it has been read back to the message with the same functions the puzzles use

Errors in the previous version and their fixes:

- The second hint of the position challenge erased the text (the rule text had changed and no highlighting branch matched it)
- Reloading reset the progress shown on each challenge tab to zero (only the Results tab read the saved values, so the two disagreed)
- Puzzle data: removal puzzle 5 lacked one character; position puzzle 3 said "2 after" but the answer needs the third character; stencil puzzle 2 had one hole too many; the hint for stencil puzzle 3 said "read from the top" although it needs turning and rearranging

### Puzzles and known answers (Japanese set)

The twenty Japanese puzzles in `js/hidden-data.js` read with `js/hidden-core.js`. The tests check that the characters read give the first accepted answer (for anagrams, that they use the same letters).

| Puzzle | Method | How | Characters read | Accepted answers |
| --- | --- | --- | --- | --- |
| `h1` | Acrostic | Line heads | `たすけて` | `たすけて` |
| `h2` | Acrostic | Line heads (kanji by reading) | `さくらははかない` | `さくらははかない` |
| `h3` | Acrostic | Line heads | `かきつはた` | `かきつはた` / `かきつばた` |
| `h4` | Acrostic | Line heads | `あいしてます` | `あいしてます` |
| `h5` | Acrostic | Line heads | `えるしつているか` | `えるしつているか` / `えるしっているか` |
| `r1` | Removal | Remove `け` | `ありがとう` | `ありがとう` |
| `r2` | Removal | Remove `ご`, `む` | `こんにちはよろしい天気` | `こんにちはよろしい天気` / `こんにちはよろしいてんき` |
| `r3` | Removal | Remove `ひ` | `あすさんじにこうえんであおう` | `あすさんじにこうえんであおう` |
| `r4` | Removal | Remove `め`, `が`, `ね` | `おはようございます` | `おはようございます` |
| `r5` | Removal | Remove `て`, `ん`, `と`, `う` | `たのしいいちにちです` | `たのしいいちにちです` |
| `p1` | Position | Read the character just before each "。". | `たのしい` | `たのしい` |
| `p2` | Position | Read the character just after each "、". | `だいすき` | `だいすき` |
| `p3` | Position | Read the character 3 places after each "、" or "。". | `げんき` | `げんき` |
| `p4` | Position | For each part (split by wide spaces), read the first characters in order, then the last characters in order. Drop the voicing marks. | `あはせたきものすこし` | `あはせたきものすこし` |
| `p5` | Position | For each part (split by wide spaces), read the last character in order. | `とかなくてしす` | `とかなくてしす` / `とがなくてしす` |
| `s1` | Stencil | Lay without turning | `さかなつり` | `さかなつり` |
| `s2` | Stencil | Turn 180° and rearrange | `をわかよむ` | `わかをよむ` |
| `s3` | Stencil | Turn 270° and rearrange | `さむゆふい` | `さむいふゆ` |
| `s4` | Stencil | Turn 270° | `きょうあした` | `きょうあした` |
| `s5` | Stencil | Turn 180° and rearrange | `うけこすつと` | `すとけっこう` |

### Puzzles and known answers (English set)

The twenty English puzzles. Answers are letters; case and spaces do not matter.

| Puzzle | Method | How | Characters read | Accepted answers |
| --- | --- | --- | --- | --- |
| `ea1` | Acrostic | Line heads | `HIDE` | `hide` |
| `ea2` | Acrostic | Line heads | `RUNNOW` | `runnow` |
| `ea3` | Acrostic | Line heads | `NORTHGATE` | `northgate` |
| `ea4` | Acrostic | Line heads | `ELIZABETH` | `elizabeth` |
| `ea5` | Acrostic | Line heads | `ALICEPLEASANCELIDDELL` | `alicepleasanceliddell` |
| `er1` | Removal | Remove `B` | `MEETMEATNOON` | `meetmeatnoon` |
| `er2` | Removal | Remove `T` | `RUNHOMENOW` | `runhomenow` |
| `er3` | Removal | Remove `C` | `BRINGTHEMAP` | `bringthemap` |
| `er4` | Removal | Remove `I` | `THEPLANHASCHANGED` | `theplanhaschanged` |
| `er5` | Removal | Remove `B`, `T` | `COMEALONE` | `comealone` |
| `ep1` | Position | Read the first letter of each word. | `PershinGsailSfromnYjunei` | `pershingsailsfromnyjunei` |
| `ep2` | Position | Read the last letter of each word. | `late` | `late` |
| `ep3` | Position | Read the first letter after each "," or "." (spaces and symbols are not counted). | `sOoN` | `soon` |
| `ep4` | Position | Read letter 2 of each word. | `pershingsailsfromnyjunei` | `pershingsailsfromnyjunei` |
| `ep5` | Position | Read letter 3 after each "," or "." or ":" or "—", counting letters only. | `panelateastendofchapelslides` | `panelateastendofchapelslides` |
| `es1` | Stencil | Lay without turning | `SPY` | `spy` |
| `es2` | Stencil | Turn 90° | `CODE` | `code` |
| `es3` | Stencil | Turn 180° | `SECRET` | `secret` |
| `es4` | Stencil | Turn 180° and rearrange | `DNIHDE` | `hidden` |
| `es5` | Stencil | Turn 90° | `ATTACKATDAWN` | `attackatdawn` |

### Quoted works

Two acrostic puzzles quote the works below. The page shows the source under the puzzle text.

- Acrostic puzzle 4: Tanikawa Shuntaro, "Akubi"
- Acrostic puzzle 5: Tsugumi Ohba and Takeshi Obata, Death Note (Shueisha)

Five puzzles in the English set are historical texts. Their sources are also shown on the page.

- Acrostic puzzle 4: Edgar Allan Poe, untitled album poem (c. 1829); text as given by The Edgar Allan Poe Society of Baltimore
- Acrostic puzzle 5: Lewis Carroll, closing poem of Through the Looking-Glass (1871); text as in the 1872 Macmillan printing
- Position puzzles 1 and 4: World War I cables printed in H. C. Hoy, 40 O.B. or How the War Was Won (1932), p. 42; also quoted in David Kahn, The Codebreakers (1967)
- Position puzzle 5: S. Baring-Gould, Curiosities of Olden Times (rev. ed. 1896; first printed in Once a Week, 1863)

### Ranks

The rank depends on the overall solved rate (for each puzzle set, the share of its twenty puzzles solved).

| Rank | Solved rate | Title |
| --- | --- | --- |
| **S** | 95% or more | Master codebreaker |
| **A** | 80% or more | Advanced codebreaker |
| **B** | 60% or more | Apprentice codebreaker |
| **C** | 40% or more | Beginner |
| **D** | below 40% | Just getting started |

---

## 🔒 Security of This Tool

- No network access (CSP `default-src 'none'`). Answers are checked in the browser
- The CSP uses `script-src 'self'` and `style-src 'self'`; there are no inline scripts or styles
- The page is built with DOM `textContent` and nothing is interpreted as HTML
- localStorage holds only the progress, the display language and the chosen puzzle set (broken values are discarded, and the tool works when storage is unavailable)
- Text typed into the maker never leaves the browser and is not stored
- The answers are in the puzzle data in plain text. This is self-study material, so being able to see them in the developer tools is accepted

---

## 🧪 Tests

```bash
npm test
```

- Node.js 22 or later. No dependencies (`node --test`)
- GitHub Actions runs them on every push and pull request
- `test/core.test.js`: answer comparison, voicing marks, anagrams, the four reading methods (including the English word rules), turning and shifting the card, ranks, and the maker's generators and checks (reading back for 200 seeds)
- `test/data.test.js`: all 40 Japanese and English answers follow from their rules, and the fixed data errors stay fixed
- `test/progress.test.js`: the saved format, broken values, recording answers and the summary
- `test/html.test.js`: CSP, ARIA and forbidden patterns (innerHTML, inline handlers, ES modules and so on)
- `test/i18n.test.js`: matching Japanese and English keys, no Japanese left in English, hints and explanations for every puzzle
- `test/contrast.test.js`: color contrast ratios
- `test/format.test.js`: line lengths and file sizes
- `test/readme.test.js`: the tables, structure and images of this README and README.md

---

## 📁 Directory Structure

```
hidden-message-challenge/
├── .github/                 # GitHub settings
│   └── workflows/           # GitHub Actions workflows
│       └── test.yml         # Runs npm test on push and pull_request
├── assets/                  # Images
│   ├── en/                  # Screenshots of the English UI
│   │   ├── screenshot.png   # English position challenge (kutsukamuri)
│   │   └── screenshot2.png  # English puzzle (the Trevanion letter)
│   ├── screenshot.png       # Acrostic with hint 2
│   ├── screenshot2.png      # Stencil turned and laid
│   └── screenshot3.png      # Maker: a generated stencil
├── css/                     # Styles
│   └── style.css            # Page styles (colors in :root variables)
├── js/                      # Scripts (classic scripts)
│   ├── challenges.js        # The four challenge panels (shared flow, per-method drawing)
│   ├── hidden-core.js       # Reading methods, answer comparison, maker generators and checks (no DOM)
│   ├── hidden-data.js       # Japanese and English puzzles (20 each)
│   ├── i18n.js              # Japanese and English messages, hints, explanations, language switching
│   ├── main.js              # Saved progress, tabs, help, puzzle set and language switching
│   ├── maker.js             # Maker tab
│   ├── progress.js          # Progress format and summary (no DOM)
│   └── results.js           # Results tab (radar chart, sharing, image, reset)
├── test/                    # Automated tests (node --test)
│   ├── contrast.test.js     # Color contrast ratios
│   ├── core.test.js         # Reading methods, answer comparison and the maker
│   ├── data.test.js         # Every answer follows from its rule (40 puzzles)
│   ├── format.test.js       # Line lengths and file sizes
│   ├── html.test.js         # CSP, ARIA and forbidden patterns
│   ├── i18n.test.js         # Japanese and English messages
│   ├── progress.test.js     # Saved progress and summary
│   └── readme.test.js       # README tables, structure and images
├── .gitignore               # Files ignored by Git
├── .nojekyll                # Disables Jekyll on GitHub Pages
├── CLAUDE.md                # Notes for Claude Code (English)
├── LICENSE                  # MIT license
├── README.en.md             # English README
├── README.md                # Japanese README
├── TECHNICAL_NOTES.md       # Technical notes (Japanese)
├── index.html               # Page with six tabs
└── package.json             # npm test configuration (no dependencies)
```

---

## 🔗 Related

- [TECHNICAL_NOTES.md](TECHNICAL_NOTES.md) - notes on the reading functions, the stencil model and the saved progress format (Japanese)
- [Grille CipherLab](https://github.com/ipusiron/grille-cipherlab) - a visualizer for turning grille ciphers

---

## 💻 Requirements

- Recent Chrome, Edge, Firefox or Safari
- Works when opened directly (file://) and when served from a web server
- Usable from 320 px wide smartphones

---

## 📄 License

MIT License - see [LICENSE](LICENSE).

---

## 🛠 About This Tool

This tool is part of the "100 Security Tools with Generative AI" project, which builds and publishes security-related tools over 100 days with the help of AI.

For the project and the other tools, see:

🔗 [https://akademeia.info/?page_id=42163](https://akademeia.info/?page_id=42163)
