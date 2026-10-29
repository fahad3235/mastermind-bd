// Mastermind BD — pure game logic. No DOM, no storage. Runs unchanged in Node and the browser.
(function (root) {
  'use strict';

  var COLORS = [
    { id: 'red',    hex: '#e53935', en: 'Red',    bn: 'লাল' },
    { id: 'blue',   hex: '#1e88e5', en: 'Blue',   bn: 'নীল' },
    { id: 'green',  hex: '#43a047', en: 'Green',  bn: 'সবুজ' },
    { id: 'yellow', hex: '#fdd835', en: 'Yellow', bn: 'হলুদ' },
    { id: 'purple', hex: '#8e24aa', en: 'Purple', bn: 'বেগুনি' },
    { id: 'orange', hex: '#fb8c00', en: 'Orange', bn: 'কমলা' }
  ];

  var DIFFICULTIES = {
    easy:    { pegs: 4, guesses: 12, en: 'Easy',    bn: 'সহজ' },
    classic: { pegs: 4, guesses: 10, en: 'Classic', bn: 'ক্লাসিক' },
    hard:    { pegs: 5, guesses: 10, en: 'Hard',    bn: 'কঠিন' }
  };

  // Standard Mastermind feedback. Black = right colour, right place.
  // White = right colour, wrong place. Duplicates handled by counting:
  // each secret peg is used at most once.
  function evaluateGuess(secret, guess) {
    var black = 0;
    var secretLeft = {};
    var guessLeft = {};
    var i;
    for (i = 0; i < secret.length; i++) {
      if (secret[i] === guess[i]) {
        black++;
      } else {
        secretLeft[secret[i]] = (secretLeft[secret[i]] || 0) + 1;
        guessLeft[guess[i]] = (guessLeft[guess[i]] || 0) + 1;
      }
    }
    var white = 0;
    Object.keys(guessLeft).forEach(function (c) {
      if (secretLeft[c]) white += Math.min(secretLeft[c], guessLeft[c]);
    });
    return { black: black, white: white };
  }

  // rng: function returning [0,1). Defaults to Math.random. Duplicates allowed.
  function newSecret(pegs, colorCount, rng) {
    var r = rng || Math.random;
    var out = [];
    var i;
    for (i = 0; i < pegs; i++) {
      out.push(Math.floor(r() * colorCount));
    }
    return out;
  }

  // Win score: more guesses left = higher score. A win on the last guess scores 10.
  function scoreFor(guessesLeft) {
    return (guessesLeft + 1) * 10;
  }

  function isValidGuess(guess, pegs, colorCount) {
    if (!Array.isArray(guess) || guess.length !== pegs) return false;
    for (var i = 0; i < guess.length; i++) {
      if (typeof guess[i] !== 'number' || guess[i] < 0 || guess[i] >= colorCount) return false;
    }
    return true;
  }

  var BN_DIGITS = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  function toBnDigits(value) {
    return String(value).replace(/[0-9]/g, function (d) { return BN_DIGITS[Number(d)]; });
  }

  var api = {
    COLORS: COLORS,
    DIFFICULTIES: DIFFICULTIES,
    evaluateGuess: evaluateGuess,
    newSecret: newSecret,
    scoreFor: scoreFor,
    isValidGuess: isValidGuess,
    toBnDigits: toBnDigits
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  } else {
    root.MMLogic = api;
  }
})(typeof window !== 'undefined' ? window : this);
