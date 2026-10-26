/** Real Chromium screenshots and keyboard navigation. Start the production app on localhost:3011 first. */
import fs from 'node:fs';
import { spawn } from 'node:child_process';
import { setTimeout as delay } from 'node:timers/promises';
const OUT = 'output/ui/browser';
fs.mkdirSync(OUT, { recursive: true });
const chrome = spawn(
  'chromium',
  [
    '--headless',
    '--no-sandbox',
    '--disable-gpu',
    '--disable-dev-shm-usage',
    '--no-first-run',
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
  const sizes = [
    [1440, 1080, false],
    [768, 1024, false],
    [390, 844, true],
    [844, 390, true],
  ];
  const checks = [];
  for (const [width, height, mobile] of sizes) {
    await page('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile });
    await page('Emulation.setTouchEmulationEnabled', { enabled: mobile });
    await page('Page.navigate', { url: 'http://127.0.0.1:3011/' });
    await delay(3500);
    const layout = await evaluate(
      `(() => {const canvas=document.querySelector('canvas');const r=canvas.getBoundingClientRect();return {width:innerWidth,overflow:document.documentElement.scrollWidth>innerWidth,canvas:{x:r.x,y:r.y,width:r.width,height:r.height},buttons:[...document.querySelectorAll('header button')].map(b=>({text:b.textContent,width:b.getBoundingClientRect().width,height:b.getBoundingClientRect().height})),coarse:matchMedia('(pointer:coarse)').matches};})()`,
    );
    checks.push({ viewport: [width, height], ...layout });
    if (layout.overflow || layout.width !== width)
      throw new Error('Horizontal overflow or viewport inflation at ' + width + ': ' + layout.width);
    if (Math.abs(layout.canvas.width / layout.canvas.height - 16 / 9) > 0.01)
      throw new Error('Canvas stretched at ' + width);
    const { data } = await page('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true });
    fs.writeFileSync(`${OUT}/${width}x${height}.png`, Buffer.from(data, 'base64'));
    if (mobile) {
      await evaluate(
        `(() => { const stage=document.querySelector('canvas').parentElement.parentElement.parentElement; ${width === 390 ? 'stage.requestFullscreen=undefined;' : ''} [...document.querySelectorAll('button')].find(b=>b.textContent.trim()==='TELA CHEIA').click(); })()`,
      );
      await delay(700);
      const fullscreen = await evaluate(
        `(() => {const c=document.querySelector('canvas');const s=c.parentElement.parentElement.parentElement;const r=c.getBoundingClientRect();const controls=[...s.querySelectorAll('button')].filter(b=>['SAIR','SOM','MUDO'].includes(b.textContent.trim()));const overlaps=controls.some(b=>{const k=b.getBoundingClientRect();return Math.max(k.left,r.left)<Math.min(k.right,r.right)&&Math.max(k.top,r.top)<Math.min(k.bottom,r.bottom);});return {classes:s.className,canvasRatio:c.offsetWidth/c.offsetHeight,controlsOverlapCanvas:overlaps,buttons:[...s.querySelectorAll('button')].map(b=>b.textContent.trim())};})()`,
      );
      if (!fullscreen.buttons.includes('SAIR')) throw new Error('Fullscreen controls missing at ' + width);
      if (Math.abs(fullscreen.canvasRatio - 16 / 9) > 0.01)
        throw new Error('Fullscreen canvas distorted at ' + width);
      if (fullscreen.controlsOverlapCanvas)
        throw new Error('Fullscreen toolbar covers the canvas at ' + width);
      checks.at(-1).fullscreen = fullscreen;
      const shot = await page('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
      fs.writeFileSync(`${OUT}/${width}x${height}-fullscreen.png`, Buffer.from(shot.data, 'base64'));
      await evaluate(
        `[...document.querySelectorAll('button')].find(b=>b.textContent.trim()==='SAIR').click()`,
      );
      await delay(300);
    }
  }
  // Use actual browser input to traverse the intro, open the menu, choose a fighter, and return.
  await page('Emulation.setDeviceMetricsOverride', {
    width: 1280,
    height: 900,
    deviceScaleFactor: 1,
    mobile: false,
  });
  await page('Emulation.setTouchEmulationEnabled', { enabled: false });
  await page('Page.navigate', { url: 'http://127.0.0.1:3011/' });
  await delay(3500);
  const key = async (code, key = code) => {
    await page('Input.dispatchKeyEvent', {
      type: 'keyDown',
      key,
      code,
      windowsVirtualKeyCode: key === 'Enter' ? 13 : key === 'Escape' ? 27 : 40,
    });
    await page('Input.dispatchKeyEvent', {
      type: 'keyUp',
      key,
      code,
      windowsVirtualKeyCode: key === 'Enter' ? 13 : key === 'Escape' ? 27 : 40,
    });
    await delay(600);
  };
  for (let i = 0; i < 6; i++) await key('Enter');
  const { data } = await page('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true });
  fs.writeFileSync(`${OUT}/keyboard-navigation.png`, Buffer.from(data, 'base64'));
  fs.writeFileSync(`${OUT}/checks.json`, JSON.stringify({ checks, errors }, null, 2) + '\n');
  if (errors.length) throw new Error(errors.join('\n'));
  console.log(
    'Chromium OK:',
    checks.map((c) => c.viewport.join('×')).join(', '),
    '— no overflow, correct canvas aspect, no runtime errors.',
  );
  await send('Browser.close').catch(() => {});
} finally {
  ws?.close();
  chrome.kill('SIGTERM');
}
