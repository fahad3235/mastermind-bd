# Mastermind BD — test results (factory run, 2026-10-29 17:00 slot)

## Unit tests — 24/24 pass (`node tests/test_logic.js`)

- Feedback: all-correct (4,0), all-misplaced (0,4), no-match (0,0),
  one-black (1,0), five-peg (3,2).
- Duplicate edge cases, hand-computed:
  - secret [R,R,G,G] vs guess [R,G,R,R] -> 1 black, 2 white
    (only the first R matches in place; the remaining R and one G match
    out of place; the extra guessed R earns nothing).
  - secret [1,1,2,2] vs guess [1,2,1,2] -> 2 black, 2 white.
  - secret with one R vs guess repeating R three times -> 0 black, 1 white.
- Seeded secret generation: 4 pegs, all in range, reproducible with the
  same seed.
- Scoring: first-guess win in a 10-guess game = 100, last-guess win = 10,
  mid-game (4 left) = 50.
- Validation: wrong length, out-of-range colour, and non-number guesses
  all rejected; a valid guess accepted.
- Bengali digits: 12345 -> ১২৩৪৫.
- Constants: 6 colours; difficulties easy/classic/hard with the
  peg/guess shapes documented in README.

## Headless-Chrome smoke — 15/15 pass (`node tests/smoke.js`)

Raw CDP against the cached headless_shell binary, file:// page load.
One test-side fix during the run: the "new game clears history" assertion
treated the correct value 0 as falsy; fixed to `rows === 0` and re-run
green. Zero app-logic repairs.

- Title/tagline render; 6-colour palette; 4 slots in Classic;
  guesses left starts at 10.
- Playing palette colours 0,1,2,3 then Submit: 4 slots filled, history
  gains 1 row, guesses left 10 -> 9, 4 feedback pegs rendered.
- Bangla toggle: tagline switches to Bengali, guesses left renders ৯.
- New game: history cleared, guesses restored (১০ in Bangla mode).
- 390 px mobile: document scrollWidth <= 390 (no horizontal overflow).
- Zero console errors / exceptions during the whole run.

## Publish verification

- Repo: https://github.com/fahad3235/mastermind-bd (PUBLIC, created empty
  via browser; snapshot push commit recorded in the ledger row).
- Remote files verified byte-identical to local after push.
- Pages: main branch, root — live site verified HTTP 200.
