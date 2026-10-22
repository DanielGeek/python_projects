// Arcade Vault bridge: loaded by each game's index.html BEFORE its own scripts.
// - Reports { score, lives, level, over } to the host page via postMessage.
// - Lets the host pause/resume the game by freezing requestAnimationFrame and performance.now.
(function () {
  var gameId = document.currentScript && document.currentScript.dataset.game;

  // ---- pause support (works for any rAF-driven game) ----
  var nativeRaf = window.requestAnimationFrame.bind(window);
  var nativeNow = performance.now.bind(performance);
  var paused = false, pausedAt = 0, offset = 0, queued = [];
  performance.now = function () { return (paused ? pausedAt : nativeNow()) - offset; };
  window.requestAnimationFrame = function (cb) {
    return nativeRaf(function (t) {
      if (paused) { queued.push(cb); return; }
      cb(t - offset);
    });
  };
  function setPaused(next) {
    if (next === paused) return;
    if (next) { paused = true; pausedAt = nativeNow(); return; }
    offset += nativeNow() - pausedAt;
    paused = false;
    var run = queued; queued = [];
    run.forEach(function (cb) { window.requestAnimationFrame(cb); });
  }

  // ---- state readers: each game keeps its state in top-level globals ----
  /* global score, lives, level, state, gameOver, game */
  var readers = {
    rocks: function () { return { score: score || 0, lives: lives, level: level, over: state === 'gameover' }; },
    asteroids: function () { return { score: score || 0, lives: lives, level: level, over: state === 'gameover' }; },
    drop: function () { return { score: score || 0, lives: null, level: level, over: !!gameOver }; },
    "brick-buster": function () { return { score: game.score, lives: game.lives, level: game.level + 1, over: game.status === 'lost' || game.status === 'won' }; },
    snake: function () { return { score: score || 0, lives: null, level: level, over: state === 'gameover' }; },
    froggy: function () { return { score: score || 0, lives: lives, level: level, over: state === 'gameover' }; },
  };

  var last = '';
  function report() {
    var s;
    try { s = readers[gameId](); } catch (e) { return; }
    var key = JSON.stringify(s);
    if (key === last) return;
    last = key;
    window.parent.postMessage({ source: 'arcade-vault-game', type: 'state', game: gameId, state: s }, '*');
  }
  setInterval(report, 200);

  // ---- touch controls: the host sends keys, the bridge turns them into KeyboardEvents ----
  // Allowlist of KeyboardEvent.code -> KeyboardEvent.key. Any other code is ignored.
  var KEYS = {
    ArrowUp: 'ArrowUp', ArrowDown: 'ArrowDown', ArrowLeft: 'ArrowLeft', ArrowRight: 'ArrowRight',
    Space: ' ', Enter: 'Enter', KeyC: 'c', KeyE: 'e', KeyP: 'p',
    Digit1: '1', Digit2: '2', Digit3: '3',
  };
  function sendKey(code, down) {
    if (!Object.prototype.hasOwnProperty.call(KEYS, code)) return;
    document.dispatchEvent(new KeyboardEvent(down ? 'keydown' : 'keyup', {
      code: code, key: KEYS[code], bubbles: true, cancelable: true,
    }));
  }

  window.addEventListener('message', function (e) {
    if (e.source !== window.parent || !e.data || e.data.source !== 'arcade-vault-host') return;
    if (e.data.type === 'pause') setPaused(true);
    if (e.data.type === 'resume') setPaused(false);
    if (e.data.type === 'key') sendKey(e.data.code, e.data.down === true);
  });
})();
