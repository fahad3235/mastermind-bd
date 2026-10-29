// Mastermind BD — English / Bangla strings. Loaded after logic.js.
(function (root) {
  'use strict';

  var STRINGS = {
    en: {
      tagline: 'Crack the secret colour code!',
      howTo: 'How to play',
      how1: 'The computer picks a secret row of coloured pegs. Colours may repeat.',
      how2: 'Build your guess from the palette, then press Submit guess.',
      how3: '● black = right colour in the right place. ○ white = right colour, wrong place.',
      how4: 'Crack the code before you run out of guesses.',
      difficulty: 'Difficulty',
      guessesLeft: 'Guesses left',
      guessLabel: 'Your guess',
      paletteHint: 'Tap a colour to fill the next empty slot. Tap a filled slot to clear it. Keys 1–6, Backspace, Enter also work.',
      submit: 'Submit guess',
      clear: 'Clear',
      giveUp: 'Give up',
      newGame: 'New game',
      winTitle: 'You cracked it!',
      loseTitle: 'Out of guesses!',
      gaveUpTitle: 'You gave up',
      secretWas: 'The secret code was:',
      yourScore: 'Score',
      statsTitle: 'Career stats',
      played: 'Played',
      won: 'Won',
      winRate: 'Win rate',
      bestScore: 'Best score',
      streak: 'Win streak',
      historyTitle: 'Your guesses',
      feedbackBlack: 'black',
      feedbackWhite: 'white',
      fillAll: 'Fill every slot before submitting.',
      gameOver: 'This game is over. Start a new game.',
      invalidGuess: 'That guess is not valid.',
      emptyHistory: 'No guesses yet. Your first guess will appear here.',
      footer: 'Offline code-breaking game. No account, no network calls. Your stats stay in this browser only.',
      newGameNote: 'Changing difficulty starts a fresh game.'
    },
    bn: {
      tagline: 'গোপন রঙের কোডটি ভাঙুন!',
      howTo: 'কীভাবে খেলবেন',
      how1: 'কম্পিউটার গোপনে এক সারি রঙের পেগ বেছে নেয়। রঙ পুনরাবৃত্তি হতে পারে।',
      how2: 'প্যালেট থেকে আপনার অনুমান সাজান, তারপর "অনুমান জমা দিন" চাপুন।',
      how3: '● কালো = সঠিক রঙ সঠিক জায়গায়। ○ সাদা = সঠিক রঙ, ভুল জায়গায়।',
      how4: 'অনুমান শেষ হওয়ার আগেই কোডটি ভাঙুন।',
      difficulty: 'কঠিনতা',
      guessesLeft: 'বাকি অনুমান',
      guessLabel: 'আপনার অনুমান',
      paletteHint: 'পরের খালি ঘর ভরতে একটি রঙ চাপুন। ভরা ঘরে চাপলে মুছে যাবে। ১–৬, Backspace, Enter কী-ও কাজ করে।',
      submit: 'অনুমান জমা দিন',
      clear: 'মুছুন',
      giveUp: 'হার মানলাম',
      newGame: 'নতুন খেলা',
      winTitle: 'আপনি কোডটি ভেঙেছেন!',
      loseTitle: 'অনুমান শেষ!',
      gaveUpTitle: 'আপনি হার মেনেছেন',
      secretWas: 'গোপন কোডটি ছিল:',
      yourScore: 'স্কোর',
      statsTitle: 'সর্বমোট পরিসংখ্যান',
      played: 'খেলা',
      won: 'জয়',
      winRate: 'জয়ের হার',
      bestScore: 'সেরা স্কোর',
      streak: 'জয়ের ধারা',
      historyTitle: 'আপনার অনুমানগুলো',
      feedbackBlack: 'কালো',
      feedbackWhite: 'সাদা',
      fillAll: 'জমা দেওয়ার আগে সব ঘর ভরুন।',
      gameOver: 'এই খেলাটি শেষ। নতুন খেলা শুরু করুন।',
      invalidGuess: 'অনুমানটি সঠিক নয়।',
      emptyHistory: 'এখনো কোনো অনুমান নেই। আপনার প্রথম অনুমান এখানে দেখা যাবে।',
      footer: 'অফলাইন কোড-ভাঙা খেলা। কোনো অ্যাকাউন্ট নেই, কোনো নেটওয়ার্ক কল নেই। আপনার পরিসংখ্যান শুধু এই ব্রাউজারেই থাকে।',
      newGameNote: 'কঠিনতা বদলালে নতুন খেলা শুরু হবে।'
    }
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = STRINGS;
  } else {
    root.MMStrings = STRINGS;
  }
})(typeof window !== 'undefined' ? window : this);
