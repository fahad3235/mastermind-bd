// Node unit tests for js/logic.js — run: node tests/test_logic.js
const assert = require('assert');
const L = require('../js/logic.js');

let n = 0;
function check(name, actual, expected) {
  n++;
  assert.deepStrictEqual(actual, expected, name);
  console.log('ok ' + n + ' - ' + name);
}

// Exact match
check('all correct', L.evaluateGuess([0, 1, 2, 3], [0, 1, 2, 3]), { black: 4, white: 0 });
// All colours right, all misplaced
check('all misplaced', L.evaluateGuess([0, 1, 2, 3], [3, 2, 1, 0]), { black: 0, white: 4 });
// Nothing in common
check('no match', L.evaluateGuess([0, 1, 2, 3], [4, 4, 5, 5]), { black: 0, white: 0 });
// One black, rest wrong
check('one black', L.evaluateGuess([0, 1, 2, 3], [0, 4, 5, 4]), { black: 1, white: 0 });
// Duplicate handling: secret R,R,G,G vs guess R,G,R,R -> 1 black, 2 white
check('duplicates not double-counted', L.evaluateGuess([0, 0, 1, 1], [0, 1, 0, 0]), { black: 1, white: 2 });
// Classic duplicate case: [1,1,2,2] vs [1,2,1,2] -> 2 black, 2 white
check('duplicate swap', L.evaluateGuess([1, 1, 2, 2], [1, 2, 1, 2]), { black: 2, white: 2 });
// Guess repeats a colour the secret has once: only one white
check('single secret colour, repeated guess', L.evaluateGuess([0, 1, 2, 3], [4, 0, 0, 0]), { black: 0, white: 1 });
// 5-peg hard game
check('five pegs', L.evaluateGuess([0, 1, 2, 3, 4], [0, 1, 2, 4, 3]), { black: 3, white: 2 });
// Secret generation: length, range, seeded determinism
const seeded = (() => { let s = 42; return () => { s = (s * 1103515245 + 12345) % 2147483648; return s / 2147483648; }; })();
const secret = L.newSecret(4, 6, seeded);
check('seeded secret length', secret.length, 4);
check('seeded secret in range', secret.every(v => v >= 0 && v < 6), true);
const seeded2 = (() => { let s = 42; return () => { s = (s * 1103515245 + 12345) % 2147483648; return s / 2147483648; }; })();
check('seeded secret reproducible', L.newSecret(4, 6, seeded2), secret);
// Scoring
check('win first guess of 10 scores 100', L.scoreFor(9), 100);
check('win on last guess scores 10', L.scoreFor(0), 10);
check('win mid-game', L.scoreFor(4), 50);
// Validation
check('valid guess', L.isValidGuess([0, 1, 2, 3], 4, 6), true);
check('wrong length', L.isValidGuess([0, 1, 2], 4, 6), false);
check('out of range colour', L.isValidGuess([0, 1, 2, 6], 4, 6), false);
check('non-number', L.isValidGuess([0, 1, 2, '3'], 4, 6), false);
// Bengali digits
check('bangla digits', L.toBnDigits(12345), '১২৩৪৫');
check('bangla digits mixed', L.toBnDigits('10 guesses'), '১০ guesses');
// Constants
check('six colours', L.COLORS.length, 6);
check('difficulties', Object.keys(L.DIFFICULTIES).sort(), ['classic', 'easy', 'hard']);
check('classic shape', L.DIFFICULTIES.classic, { pegs: 4, guesses: 10, en: 'Classic', bn: 'ক্লাসিক' });
check('hard shape', L.DIFFICULTIES.hard.pegs, 5);

console.log('ALL ' + n + ' UNIT TESTS PASSED');
