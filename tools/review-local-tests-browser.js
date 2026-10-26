/** Real Chromium screenshots and keyboard navigation. Start the production app on localhost:3011 first. */
import fs from 'node:fs';
import { spawn } from 'node:child_process';
import { setTimeout as delay } from 'node:timers/promises';
const OUT = 'output/local-tests/browser';
fs.mkdirSync(OUT, { recursive: true });
const chrome = spawn(
  'chromium',
  [
    '--headless',
    '--no-sandbox',
    '--disable-gpu',
    '--disable-dev-shm-usage',
    '--no-first-run',
    '--no-proxy-server',
    '--host-resolver-rules=MAP remote.test 127.0.0.1',
    '--no-default-browser-check',
    '--remote-debugging-port=0',
    '--user-data-dir=/tmp/brainrot-ui-' + process.pid,
    'about:blank',
  ],
  { stdio: ['ignore', 'ignore', 'pipe'] },
);
let ws;
const errors = [];
try {
  const endpoint = await new Promise((resolve, reject) => {
    let log = '';
    const timeout = setTimeout(() => reject(new Error('Chromium startup timeout')), 20000);
    chrome.stderr.on('data', (chunk) => {
      log += chunk;
      const match = log.match(/DevTools listening on (ws:\/\/\S+)/);
      if (match) {
        clearTimeout(timeout);
        resolve(match[1]);
      }
    });
    chrome.once('error', reject);
    chrome.once('exit', (code) => {
      if (code) reject(new Error('Chromium exit ' + code + ': ' + log.slice(-800)));
    });
  });
  ws = new WebSocket(endpoint);
  await new Promise((resolve, reject) => {
    ws.onopen = resolve;
    ws.onerror = reject;
  });
  let id = 0;
  const pending = new Map();
  ws.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    if (msg.id && pending.has(msg.id)) {
      const { resolve, reject } = pending.get(msg.id);
      pending.delete(msg.id);
      if (msg.error) reject(new Error(msg.error.message));
      else resolve(msg.result);
    }
    if (msg.method === 'Runtime.exceptionThrown')
      errors.push(msg.params.exceptionDetails.exception?.description || msg.params.exceptionDetails.text);
  };
  function send(method, params = {}, sessionId) {
    return new Promise((resolve, reject) => {
      const call = ++id;
      pending.set(call, { resolve, reject });
      ws.send(JSON.stringify({ id: call, method, params, ...(sessionId ? { sessionId } : {}) }));
    });
  }
  const { targetId } = await send('Target.createTarget', { url: 'about:blank' });
  const { sessionId } = await send('Target.attachToTarget', { targetId, flatten: true });
  const page = (method, params = {}) => send(method, params, sessionId);
  await page('Page.enable');
  await page('Runtime.enable');
  const evaluate = async (expression) =>
    (await page('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true })).result.value;
  const key = async (code, key = code) => {
    await page('Input.dispatchKeyEvent', { type: 'keyDown', code, key });
    await page('Input.dispatchKeyEvent', { type: 'keyUp', code, key });
    await delay(140);
  };
  const capture = async (name) => {
    const png = await evaluate("document.querySelector('canvas').toDataURL('image/png').split(',')[1]");
    fs.writeFileSync(`${OUT}/${name}.png`, Buffer.from(png, 'base64'));
    return png;
  };
  await page('Emulation.setDeviceMetricsOverride', {
    width: 1440,
    height: 1000,
    deviceScaleFactor: 1,
    mobile: false,
  });
  await page('Page.navigate', { url: 'http://127.0.0.1:3011/' });
  for (let i = 0; i < 40; i++) {
    await delay(400);
    if (
      await evaluate("[...document.querySelectorAll('button')].some(b => b.textContent.includes('TESTES'))")
    )
      break;
  }
  const available = await evaluate(
    "[...document.querySelectorAll('button')].some(b => b.textContent.includes('TESTES'))",
  );
  if (!available) throw new Error('Local test button never appeared');
  const saved = await evaluate("localStorage.getItem('brf_xp_v1')");
  await evaluate(
    "[...document.querySelectorAll('button')].find(b => b.textContent.includes('TESTES')).click()",
  );
  await delay(250);
  const menu = await capture('destinations');
  await delay(500);
  if (menu !== (await capture('destinations-paused')))
    throw new Error('Test menu should be stable while the game is paused');
  await key('Enter');
  await delay(2200);
  await capture('final-fight-god');
  await key('F2');
  await key('Tab');
  await capture('settings');
  for (let i = 0; i < 5; i++) await key('ArrowDown');
  await key('Enter');
  await capture('god-disabled');
  await key('Tab');
  await capture('audio');
  await key('Enter');
  await delay(600);
  await key('F2');
  if (saved !== (await evaluate("localStorage.getItem('brf_xp_v1')")))
    throw new Error('Test session wrote persistent XP');
  await page('Emulation.setDeviceMetricsOverride', {
    width: 390,
    height: 844,
    deviceScaleFactor: 1,
    mobile: true,
  });
  await delay(600);
  const layout = await evaluate(
    "({overflow:document.documentElement.scrollWidth>innerWidth, canvas:(()=>{const r=document.querySelector('canvas').getBoundingClientRect();return {width:r.width,height:r.height}})()})",
  );
  if (layout.overflow || Math.abs(layout.canvas.width / layout.canvas.height - 16 / 9) > 0.01)
    throw new Error('Mobile local controls overflow');
  const { data } = await page('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true });
  fs.writeFileSync(`${OUT}/mobile.png`, Buffer.from(data, 'base64'));
  // Same local server through a non-loopback hostname: no inspector button or badge.
  await page('Page.navigate', { url: 'http://remote.test:3011/' });
  await delay(4500);
  const remote = await evaluate(
    "({buttons:[...document.querySelectorAll('button')].map(b=>b.textContent), canvas:!!document.querySelector('canvas')})",
  );
  if (!remote.canvas || remote.buttons.some((b) => b.includes('TESTES')))
    throw new Error('Inspector exposed on remote hostname');
  await capture('remote-no-tests');
  if (errors.length) throw new Error(errors.join('\n'));
  fs.writeFileSync(
    `${OUT}/report.json`,
    JSON.stringify({ localButton: available, mobile: layout, remote, errors }, null, 2) + '\n',
  );
  console.log(
    'Chromium OK: F2, direct final fight, God toggle, audio tab, isolated XP, mobile layout and remote guard',
  );
  await send('Browser.close').catch(() => {});
} finally {
  ws?.close();
  chrome.kill('SIGTERM');
}
