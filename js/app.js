// Mastermind BD — UI wiring. Depends on MMLogic and MMStrings.
(function () {
  'use strict';

  var L = window.MMLogic;
  var STR = window.MMStrings;
  var STORE_KEY = 'mm-bd-v1';

  var state = {
    lang: 'en',
    difficulty: 'classic',
    secret: [],
    guesses: [],
    current: [],
    over: false,
    won: false,
    score: 0,
    stats: { played: 0, won: 0, bestScore: 0, streak: 0 }
  };

  function $(id) { return document.getElementById(id); }

  function loadStore() {
    try {
      var raw = localStorage.getItem(STORE_KEY);
      if (!raw) return;
      var data = JSON.parse(raw);
      if (data.lang === 'en' || data.lang === 'bn') state.lang = data.lang;
      if (data.difficulty && L.DIFFICULTIES[data.difficulty]) state.difficulty = data.difficulty;
      if (data.stats && typeof data.stats === 'object') {
        ['played', 'won', 'bestScore', 'streak'].forEach(function (k) {
          if (typeof data.stats[k] === 'number') state.stats[k] = data.stats[k];
        });
      }
    } catch (e) { /* corrupt store: start fresh, never crash */ }
  }

  function saveStore() {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify({
        lang: state.lang, difficulty: state.difficulty, stats: state.stats
      }));
    } catch (e) { /* private mode: game still works, stats just do not persist */ }
  }

  function t(key) { return STR[state.lang][key]; }

  function fmt(n) {
    return state.lang === 'bn' ? L.toBnDigits(n) : String(n);
  }

  function diff() { return L.DIFFICULTIES[state.difficulty]; }

  function guessesLeft() { return diff().guesses - state.guesses.length; }

  function newGame() {
    state.secret = L.newSecret(diff().pegs, L.COLORS.length);
    state.guesses = [];
    state.current = [];
    for (var i = 0; i < diff().pegs; i++) state.current.push(null);
    state.over = false;
    state.won = false;
    state.score = 0;
    renderAll();
  }

  function finishGame(won, gaveUp) {
    state.over = true;
    state.won = won;
    state.stats.played++;
    if (won) {
      state.stats.won++;
      state.stats.streak++;
      state.score = L.scoreFor(guessesLeft());
      if (state.score > state.stats.bestScore) state.stats.bestScore = state.score;
    } else {
      state.stats.streak = 0;
      state.score = 0;
    }
    saveStore();
    renderBanner(gaveUp ? 'gaveUp' : (won ? 'win' : 'lose'));
    renderSecretReveal();
    renderStats();
    renderControls();
  }

  function submitGuess() {
    if (state.over) { showMessage(t('gameOver')); return; }
    if (state.current.indexOf(null) !== -1) { showMessage(t('fillAll')); return; }
    var guess = state.current.slice();
    if (!L.isValidGuess(guess, diff().pegs, L.COLORS.length)) {
      showMessage(t('invalidGuess')); return;
    }
    var fb = L.evaluateGuess(state.secret, guess);
    state.guesses.push({ guess: guess, fb: fb });
    clearMessage();
    if (fb.black === diff().pegs) {
      finishGame(true, false);
    } else if (state.guesses.length >= diff().guesses) {
      finishGame(false, false);
    } else {
      state.current = [];
      for (var i = 0; i < diff().pegs; i++) state.current.push(null);
    }
    renderAll();
  }

  function showMessage(msg) {
    var el = $('message');
    el.textContent = msg;
    el.classList.remove('hidden');
  }

  function clearMessage() {
    var el = $('message');
    el.textContent = '';
    el.classList.add('hidden');
  }

  function colorDot(colorIdx, cls) {
    var span = document.createElement('span');
    span.className = cls || 'peg';
    span.style.backgroundColor = L.COLORS[colorIdx].hex;
    span.title = state.lang === 'bn' ? L.COLORS[colorIdx].bn : L.COLORS[colorIdx].en;
    return span;
  }

  function renderPalette() {
    var wrap = $('palette');
    wrap.innerHTML = '';
    L.COLORS.forEach(function (c, idx) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'pal-btn';
      btn.dataset.color = String(idx);
      btn.setAttribute('aria-label', (state.lang === 'bn' ? c.bn : c.en));
      var dot = document.createElement('span');
      dot.className = 'peg pal-dot';
      dot.style.backgroundColor = c.hex;
      var label = document.createElement('span');
      label.className = 'pal-label';
      label.textContent = (state.lang === 'bn' ? c.bn : c.en) + ' (' + fmt(idx + 1) + ')';
      btn.appendChild(dot);
      btn.appendChild(label);
      btn.addEventListener('click', function () {
        if (state.over) { showMessage(t('gameOver')); return; }
        var slot = state.current.indexOf(null);
        if (slot === -1) return;
        state.current[slot] = idx;
        clearMessage();
        renderCurrent();
      });
      wrap.appendChild(btn);
    });
  }

  function renderCurrent() {
    var row = $('currentRow');
    row.innerHTML = '';
    state.current.forEach(function (val, i) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'slot' + (val === null ? ' empty' : '');
      btn.setAttribute('aria-label', 'Slot ' + (i + 1));
      if (val !== null) {
        btn.style.backgroundColor = L.COLORS[val].hex;
        btn.title = state.lang === 'bn' ? L.COLORS[val].bn : L.COLORS[val].en;
      }
      btn.addEventListener('click', function () {
        if (state.over) return;
        state.current[i] = null;
        clearMessage();
        renderCurrent();
      });
      row.appendChild(btn);
    });
    $('guessesLeft').textContent = fmt(guessesLeft());
  }

  function renderHistory() {
    var list = $('historyList');
    list.innerHTML = '';
    if (state.guesses.length === 0) {
      var p = document.createElement('p');
      p.className = 'muted';
      p.textContent = t('emptyHistory');
      list.appendChild(p);
      return;
    }
    state.guesses.slice().reverse().forEach(function (entry) {
      var row = document.createElement('div');
      row.className = 'hist-row';
      entry.guess.forEach(function (c) { row.appendChild(colorDot(c, 'peg small')); });
      var fb = document.createElement('span');
      fb.className = 'feedback';
      for (var b = 0; b < entry.fb.black; b++) {
        var blk = document.createElement('span');
        blk.className = 'fb-dot black';
        fb.appendChild(blk);
      }
      for (var w = 0; w < entry.fb.white; w++) {
        var wh = document.createElement('span');
        wh.className = 'fb-dot white';
        fb.appendChild(wh);
      }
      var label = document.createElement('span');
      label.className = 'fb-label';
      label.textContent = fmt(entry.fb.black) + ' ' + t('feedbackBlack') + ', ' +
        fmt(entry.fb.white) + ' ' + t('feedbackWhite');
      fb.appendChild(label);
      row.appendChild(fb);
      list.appendChild(row);
    });
  }

  function renderStats() {
    var s = state.stats;
    var rate = s.played === 0 ? 0 : Math.round((s.won / s.played) * 100);
    $('statPlayed').textContent = fmt(s.played);
    $('statWon').textContent = fmt(s.won);
    $('statRate').textContent = fmt(rate) + '%';
    $('statBest').textContent = fmt(s.bestScore);
    $('statStreak').textContent = fmt(s.streak);
  }

  function renderBanner(kind) {
    var banner = $('banner');
    if (!kind) { banner.classList.add('hidden'); banner.innerHTML = ''; return; }
    banner.classList.remove('hidden');
    banner.className = 'banner ' + (kind === 'win' ? 'win' : 'lose');
    var title = document.createElement('strong');
    title.textContent = kind === 'win' ? t('winTitle') :
      (kind === 'lose' ? t('loseTitle') : t('gaveUpTitle'));
    banner.appendChild(title);
    if (kind === 'win') {
      var score = document.createElement('span');
      score.textContent = ' ' + t('yourScore') + ': ' + fmt(state.score);
      banner.appendChild(score);
    }
  }

  function renderSecretReveal() {
    var wrap = $('secretReveal');
    wrap.innerHTML = '';
    if (!state.over) { wrap.classList.add('hidden'); return; }
    wrap.classList.remove('hidden');
    var label = document.createElement('span');
    label.textContent = t('secretWas') + ' ';
    wrap.appendChild(label);
    state.secret.forEach(function (c) { wrap.appendChild(colorDot(c, 'peg small')); });
  }

  function renderControls() {
    $('submitBtn').disabled = state.over;
    $('clearBtn').disabled = state.over;
    $('giveUpBtn').disabled = state.over;
  }

  function applyLang() {
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var key = el.getAttribute('data-i18n');
      if (STR[state.lang][key]) el.textContent = STR[state.lang][key];
    });
    document.documentElement.lang = state.lang === 'bn' ? 'bn' : 'en';
    $('langBtn').textContent = state.lang === 'en' ? 'বাংলা' : 'English';
    document.querySelectorAll('[data-diff]').forEach(function (opt) {
      var d = L.DIFFICULTIES[opt.getAttribute('data-diff')];
      opt.textContent = (state.lang === 'bn' ? d.bn : d.en) +
        ' (' + fmt(d.pegs) + ' ' + (state.lang === 'bn' ? 'পেগ' : 'pegs') +
        ', ' + fmt(d.guesses) + ' ' + (state.lang === 'bn' ? 'অনুমান' : 'guesses') + ')';
    });
    $('diffSelect').value = state.difficulty;
  }

  function renderAll() {
    applyLang();
    renderPalette();
    renderCurrent();
    renderHistory();
    renderStats();
    renderControls();
    if (!state.over) {
      renderBanner(null);
      renderSecretReveal();
    }
  }

  function init() {
    loadStore();
    $('langBtn').addEventListener('click', function () {
      state.lang = state.lang === 'en' ? 'bn' : 'en';
      saveStore();
      renderAll();
    });
    $('diffSelect').addEventListener('change', function () {
      state.difficulty = $('diffSelect').value;
      saveStore();
      newGame();
    });
    $('submitBtn').addEventListener('click', submitGuess);
    $('clearBtn').addEventListener('click', function () {
      if (state.over) return;
      state.current = state.current.map(function () { return null; });
      clearMessage();
      renderCurrent();
    });
    $('giveUpBtn').addEventListener('click', function () {
      if (state.over) return;
      finishGame(false, true);
      renderAll();
    });
    $('newGameBtn').addEventListener('click', newGame);
    document.addEventListener('keydown', function (e) {
      if (state.over) return;
      if (e.key >= '1' && e.key <= '6') {
        var idx = Number(e.key) - 1;
        var slot = state.current.indexOf(null);
        if (slot !== -1) { state.current[slot] = idx; clearMessage(); renderCurrent(); }
      } else if (e.key === 'Backspace') {
        var filled = [];
        state.current.forEach(function (v, i) { if (v !== null) filled.push(i); });
        if (filled.length) {
          state.current[filled[filled.length - 1]] = null;
          renderCurrent();
        }
        e.preventDefault();
      } else if (e.key === 'Enter') {
        submitGuess();
      }
    });
    newGame();
  }

  document.addEventListener('DOMContentLoaded', init);
})();
