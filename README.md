# Mastermind BD

Offline bilingual (English / বাংলা) Mastermind code-breaking game. The computer
picks a secret row of coloured pegs; you crack it before your guesses run out.
No account, no network calls — the whole game runs in your browser.

Live site: https://fahad3235.github.io/mastermind-bd/

## The problem

Mastermind is a classic logic game, but most online versions are in English
only, full of ads, or require an account. Mastermind BD is a clean offline
version for Bangladeshi players: Bangla UI with Bengali digits, three
difficulties, and honest feedback math (including correct duplicate handling).

## Features

1. **Code-breaking gameplay** — guess the secret colour row; black peg = right
   colour in the right place, white peg = right colour in the wrong place.
2. **Three difficulties** — Easy (4 pegs, 12 guesses), Classic (4 pegs,
   10 guesses), Hard (5 pegs, 10 guesses). Changing difficulty starts a fresh game.
3. **Full input options** — tap the palette, tap a filled slot to clear it,
   or use the keyboard (keys 1–6, Backspace, Enter). Submit, Clear, Give up,
   and New game controls.
4. **Correct duplicate math** — each secret peg is counted at most once, so a
   colour the secret holds once can only ever earn one peg. Colours may repeat
   in the secret.
5. **Scoring + career stats** — a win scores (guesses left after the winning
   guess + 1) × 10 (100 for a first-guess win in Classic). Played / won /
   win rate / best score / win streak persist in localStorage.
6. **Bilingual UI** — EN / বাংলা toggle persisted, with Bengali digits in
   Bangla mode. Fully responsive, checked at 390 px mobile width.
7. **Zero network** — static HTML/CSS/JS only; no CDN, no fonts, no tracking.

## Stack

- Vanilla HTML, CSS, and JavaScript — no build step, no dependencies.
- Pure game logic in `js/logic.js` (runs unchanged in Node for tests).
- Strings in `js/i18n.js`; UI wiring in `js/app.js`.

## Prerequisites

Any modern browser. For tests: Node.js (any recent version).

## Install

No install step. Clone and open `index.html`, or serve the folder:

```bash
git clone https://github.com/fahad3235/mastermind-bd.git
cd mastermind-bd
python3 -m http.server 8000   # then open http://localhost:8000
```

## Dev commands

```bash
node tests/test_logic.js   # 24 unit tests for feedback, scoring, validation
node tests/smoke.js        # 15 headless-Chrome checks (raw CDP, cached headless_shell)
```

## Testing

- `tests/test_logic.js`: feedback cases including all-correct, all-misplaced,
  no-match, and three duplicate edge cases; seeded secret reproducibility;
  scoring boundaries (first-guess win = 100, last-guess win = 10); guess
  validation; Bengali-digit conversion. 24/24 pass.
- `tests/smoke.js`: real headless-Chrome run — title/tagline render, 6-colour
  palette, 4 slots in Classic, a full guess → history row + feedback pegs +
  guesses 10 → 9, Bangla toggle + Bengali digits (৯), new-game reset,
  390 px no-overflow, zero console errors. 15/15 pass.

## Deployment

GitHub Pages, main branch, root folder. Pushing is a static snapshot (see the
factory's snapshot-push procedure); no build step runs on Pages.

## Limitations

- The current game is **not** persisted across a page reload — reloading deals
  a fresh secret. Only language, difficulty, and career stats persist.
- The computer's secret is random, not chosen by a human opponent; there is no
  two-player or online mode.
- "Give up" counts as a played game and a loss, and reveals the secret.
- This is a casual game, not a tournament-rules implementation (house rule:
  colours may repeat; feedback pegs are shown sorted black-first, which is the
  standard Mastermind convention).

## Status

Complete MVP. Factory run #178 (17:00 slot, 2026-10-29) — see
`TEST_RESULTS.md` for the verified test record.
