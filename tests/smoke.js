// Headless-Chrome smoke test for Mastermind BD (raw CDP, no npm deps).
// Run: node tests/smoke.js
// Uses the Playwright-cached headless_shell binary.
const { spawn } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const BIN = path.join(os.homedir(), '.cache/ms-playwright/chromium_headless_shell-1187/chrome-linux/headless_shell');
const PAGE = 'file://' + path.resolve(__dirname, '..', 'index.html');

let n = 0;
const failures = [];
function check(name, cond, extra) {
  n++;
  if (cond) console.log('ok ' + n + ' - ' + name);
  else { console.log('FAIL ' + n + ' - ' + name + (extra !== undefined ? ' :: ' + extra : '')); failures.push(name); }
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function waitForPort(port, timeoutMs) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch('http://127.0.0.1:' + port + '/json/list');
      if (res.ok) return true;
    } catch (e) { /* not up yet */ }
    await sleep(300);
  }
  return false;
}

class CDP {
  constructor(url) {
    this.ws = new WebSocket(url);
    this.nextId = 1;
    this.pending = new Map();
    this.consoleErrors = [];
    this.ready = new Promise((resolve, reject) => {
      this.ws.onopen = resolve;
      this.ws.onerror = reject;
    });
    this.ws.onmessage = (msg) => {
      const data = JSON.parse(msg.data);
      if (data.id && this.pending.has(data.id)) {
        const { resolve, reject } = this.pending.get(data.id);
        this.pending.delete(data.id);
        if (data.error) reject(new Error(JSON.stringify(data.error)));
        else resolve(data.result);
      } else if (data.method === 'Runtime.consoleAPICalled') {
        if (data.params.type === 'error') {
          this.consoleErrors.push(data.params.args.map(a => a.value || a.description).join(' '));
        }
      } else if (data.method === 'Runtime.exceptionThrown') {
        this.consoleErrors.push('exception: ' + (data.params.exceptionDetails.exception.description || ''));
      }
    };
  }
  send(method, params) {
    const id = this.nextId++;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params: params || {} }));
    });
  }
  async eval(expression) {
    const res = await this.send('Runtime.evaluate', { expression, returnByValue: true });
    if (res.exceptionDetails) throw new Error('eval failed: ' + JSON.stringify(res.exceptionDetails));
    return res.result.value;
  }
  close() { try { this.ws.close(); } catch (e) {} }
}

(async () => {
  const port = 9200 + (process.pid % 500);
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'mm-smoke-'));
  const child = spawn(BIN, [
    '--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage',
    '--remote-debugging-port=' + port, '--user-data-dir=' + profile, 'about:blank'
  ], { stdio: 'ignore' });
  try {
    if (!await waitForPort(port, 20000)) throw new Error('headless_shell did not start on port ' + port);
    // Create a target: this headless_shell build requires PUT (not GET) on /json/new.
    let target;
    const putRes = await fetch('http://127.0.0.1:' + port + '/json/new?' + encodeURIComponent(PAGE), { method: 'PUT' });
    if (putRes.ok) target = await putRes.json();
    else {
      const getRes = await fetch('http://127.0.0.1:' + port + '/json/new?' + encodeURIComponent(PAGE));
      target = await getRes.json();
    }
    const cdp = new CDP(target.webSocketDebuggerUrl);
    await cdp.ready;
    await cdp.send('Runtime.enable');
    await cdp.send('Page.enable');
    await sleep(1500);

    check('page title renders', await cdp.eval("document.querySelector('h1').textContent"), 'Mastermind BD');
    check('tagline renders', await cdp.eval("document.querySelector('.tagline').textContent.includes('Crack')"), true);
    check('palette has 6 colours', await cdp.eval("document.querySelectorAll('#palette button').length"), 6);
    check('classic game has 4 slots', await cdp.eval("document.querySelectorAll('#currentRow .slot').length"), 4);
    check('guesses left starts at 10', await cdp.eval("document.getElementById('guessesLeft').textContent"), '10');

    // Play one guess: palette colours 0,1,2,3 then submit.
    const played = await cdp.eval(`(() => {
      const pal = document.querySelectorAll('#palette button');
      pal[0].click(); pal[1].click(); pal[2].click(); pal[3].click();
      const filled = document.querySelectorAll('#currentRow .slot:not(.empty)').length;
      document.getElementById('submitBtn').click();
      return {
        filled,
        rows: document.querySelectorAll('#historyList .hist-row').length,
        left: document.getElementById('guessesLeft').textContent,
        fbDots: document.querySelectorAll('#historyList .fb-dot').length
      };
    })()`);
    check('4 slots filled before submit', played.filled, 4);
    check('history gains 1 row after submit', played.rows, 1);
    check('guesses left drops to 9', played.left, '9');
    check('feedback pegs rendered (4 total)', played.fbDots, 4);

    // Language toggle to Bangla: tagline + Bengali digits.
    const bn = await cdp.eval(`(() => {
      document.getElementById('langBtn').click();
      return {
        tagline: document.querySelector('.tagline').textContent,
        left: document.getElementById('guessesLeft').textContent
      };
    })()`);
    check('BN toggle changes tagline', bn.tagline.includes('গোপন'), bn.tagline);
    check('BN digits render (9 -> ৯)', bn.left, '৯');

    // New game resets history and guesses.
    const reset = await cdp.eval(`(() => {
      document.getElementById('newGameBtn').click();
      return {
        rows: document.querySelectorAll('#historyList .hist-row').length,
        left: document.getElementById('guessesLeft').textContent
      };
    })()`);
    check('new game clears history', reset.rows === 0, 'rows=' + reset.rows);
    check('new game restores 10 guesses (BN ১০)', reset.left, '১০');

    // Mobile 390px: no horizontal overflow.
    await cdp.send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });
    await sleep(500);
    const overflow = await cdp.eval('document.documentElement.scrollWidth');
    check('390px no horizontal overflow', overflow <= 390, 'scrollWidth=' + overflow);
    await cdp.send('Emulation.clearDeviceMetricsOverride');

    check('no console errors', cdp.consoleErrors.length === 0, cdp.consoleErrors.join(' | '));
    cdp.close();
  } finally {
    try { child.kill('SIGKILL'); } catch (e) {}
    try { fs.rmSync(profile, { recursive: true, force: true }); } catch (e) {}
  }
  if (failures.length) { console.log('SMOKE FAILED: ' + failures.join(', ')); process.exit(1); }
  console.log('ALL ' + n + ' SMOKE CHECKS PASSED');
})().catch((e) => { console.error('SMOKE HARNESS ERROR: ' + (e && e.stack || e)); process.exit(2); });
