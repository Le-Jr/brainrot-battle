/** Real Chromium screenshots and keyboard navigation. Start the production app on localhost:3011 first. */
import fs from 'node:fs';
import { spawn } from 'node:child_process';
import { setTimeout as delay } from 'node:timers/promises';
import { IMPORTED_MUSIC } from '../src/game/audio/imported-music.js';
const OUT = 'output/music/browser';
const origins = [];
for (const port of [3000, 3001, 3011, 3014]) {
  try {
    const base = 'http://127.0.0.1:' + port;
    const response = await fetch(base, { signal: AbortSignal.timeout(4000) });
    if (response.ok) origins.push(base);
  } catch {}
}
if (!origins.length) throw new Error('No running local server on 3000, 3001 or 3011');
console.log('Servers:', origins);
if (process.argv.includes('--probe')) {
  for (const origin of origins)
    for (const url of ['/audio/music/laststand.ogg', '/audio/music/index.html', '/']) {
      try {
        const r = await fetch(origin + url, { signal: AbortSignal.timeout(6000) });
        const b = await r.arrayBuffer();
        console.log(
          url,
          r.status,
          r.headers.get('content-type'),
          b.byteLength,
          url === '/' ? new TextDecoder().decode(b).includes('OUVIR TRILHA') : '',
        );
      } catch (e) {
        console.log(url, e.message);
      }
    }
  process.exit(0);
}

fs.mkdirSync(OUT, { recursive: true });
const chrome = spawn(
  'chromium',
  [
    '--headless',
    '--no-sandbox',
    '--disable-gpu',
    '--disable-dev-shm-usage',
    '--no-first-run',
    '--autoplay-policy=no-user-gesture-required',
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
  await page('Network.enable');
  await page('Page.bringToFront');
  await page('Emulation.setFocusEmulationEnabled', { enabled: true });
  await page('Emulation.setDeviceMetricsOverride', {
    width: 1440,
    height: 1000,
    deviceScaleFactor: 1,
    mobile: false,
  });
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

  const checks = [];
  const preferred =
    origins.find((o) => o.endsWith(':3014')) || origins.find((o) => o.endsWith(':3011')) || origins[0];
  for (const origin of [preferred]) {
    const files = [];
    const { MUSIC_FILES } = await import('../src/game/audio/music-files.js');
    for (const [name, url] of Object.entries(MUSIC_FILES)) {
      const response = await fetch(origin + url, { signal: AbortSignal.timeout(6000) });
      const bytes = new Uint8Array(await response.arrayBuffer());
      files.push({
        name,
        status: response.status,
        bytes: bytes.length,
        ogg: String.fromCharCode(...bytes.slice(0, 4)) === 'OggS',
      });
    }
    checks.push({ origin, files });
  }
  await page('Page.addScriptToEvaluateOnNewDocument', {
    source: `
    window.__musicAudit = { requests: [], starts: [] };
    const nativeFetch = window.fetch;
    window.fetch = async (...args) => {
      const response = await nativeFetch(...args);
      if (String(args[0]).includes('/audio/music/')) window.__musicAudit.requests.push({url: String(args[0]), status: response.status});
      return response;
    };
    window.__musicAudit.streams = [];
    const stream = AudioContext.prototype.createMediaElementSource;
    AudioContext.prototype.createMediaElementSource = function (audio) {
      const context = this;
      const record = {url:audio.src,events:[]}; window.__musicAudit.streams.push(record);
      for(const event of ['error','playing','stalled','abort','emptied']) audio.addEventListener(event,()=>record.events.push({event,code:audio.error?.code,message:audio.error?.message}));
      audio.addEventListener('loadeddata',()=>window.__musicAudit.requests.push({url:audio.src,status:200}));
      audio.addEventListener('playing',()=>window.__musicAudit.starts.push({duration:audio.duration,loop:audio.loop,time:context.currentTime,state:context.state}));
      return stream.call(this,audio);
    };
    const create = AudioContext.prototype.createBufferSource;
    AudioContext.prototype.createBufferSource = function (...args) {
      const source = create.apply(this, args), start = source.start;
      source.start = function (...args) {
        if (this.buffer && this.buffer.duration > 5) window.__musicAudit.starts.push({duration: this.buffer.duration, loop: this.loop, time: this.context.currentTime, state: this.context.state});
        return start.apply(this,args);
      };
      return source;
    };
  `,
  });
  const origin =
    origins.find((o) => o.endsWith(':3014')) || origins.find((o) => o.endsWith(':3011')) || origins[0];
  console.log('Assets checked; opening game');
  if (process.argv.includes('--playlist')) {
    await page('Page.navigate', { url: origin + '/audio/music/index.html' });
    await delay(600);
    await evaluate("document.querySelector('audio').play()");
    await delay(1800);
    const playlist = await evaluate(
      "({count:document.querySelectorAll('audio').length,src:document.querySelector('audio').currentSrc,time:document.querySelector('audio').currentTime,duration:document.querySelector('audio').duration,paused:document.querySelector('audio').paused,error:document.querySelector('audio').error})",
    );
    console.log('Playlist playback:', playlist);
    if (
      playlist.count !== Object.keys((await import('../src/game/audio/music-files.js')).MUSIC_FILES).length ||
      playlist.paused ||
      playlist.time < 1 ||
      playlist.error
    )
      throw new Error('Playlist playback failed');
    fs.writeFileSync(`${OUT}/playlist-report.json`, JSON.stringify(playlist, null, 2));
    await send('Browser.close').catch(() => {});
    process.exit(0);
  }
  await page('Page.navigate', { url: origin + '/' });
  if (process.argv.includes('--diagnose')) {
    await delay(15000);
    console.log(
      await evaluate(
        "({ready:document.readyState,body:document.body.innerText,resources:performance.getEntriesByType('resource').map(r=>({url:r.name,bytes:r.transferSize,status:r.responseStatus})),next:window.next})",
      ),
    );
    const { data } = await page('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(`${OUT}/page.png`, Buffer.from(data, 'base64'));
    await send('Browser.close').catch(() => {});
    process.exit(0);
  }
  for (let i = 0; i < 90; i++) {
    await delay(500);
    if (await evaluate("[...document.querySelectorAll('button')].some(b=>b.textContent.includes('TESTES'))"))
      break;
  }
  if (process.argv.includes('--menus')) {
    await delay(1000);
    await key('Enter');
    await delay(1000);
    await key('Escape');
    await delay(3500);
    await capture('opening-imported');
    const opening = await evaluate('window.__musicAudit');
    await key('Enter');
    await delay(3500);
    await capture('main-menu-imported');
    const menu = await evaluate('window.__musicAudit');
    for (const [id, snapshot] of [
      ['title', opening],
      ['select', menu],
    ]) {
      if (
        !snapshot.requests.some((r) => r.url.includes(IMPORTED_MUSIC[id].url)) ||
        !snapshot.starts.some(
          (r) => Math.abs(r.duration - IMPORTED_MUSIC[id].duration) < 0.02 && r.state === 'running',
        )
      )
        throw new Error('Imported menu cue not playing: ' + id + ' ' + JSON.stringify(snapshot));
    }
    fs.writeFileSync(`${OUT}/menu-report.json`, JSON.stringify({ opening, menu, errors }, null, 2));
    console.log(
      'Confirmed: Quarter In The Slot on opening; Last Token Remaining after Start; streaming playback running.',
    );
    await send('Browser.close').catch(() => {});
    process.exit(0);
  }
  await evaluate(
    "[...document.querySelectorAll('button')].find(b=>b.textContent.includes('TESTES')).click()",
  );
  console.log(
    'Game:',
    await evaluate(
      "({visibility:document.visibilityState,buttons:[...document.querySelectorAll('button')].map(b=>b.textContent),playlist:!!document.querySelector('a[href=\"/audio/music/index.html\"]')})",
    ),
  );
  await delay(500);
  await key('Tab');
  await key('Tab');
  // TRACKS order: title/select then the first stage, beach.
  await key('ArrowDown');
  await key('ArrowDown');
  await key('Enter');
  await delay(7000);
  await capture('beach-audio');
  const beach = await evaluate('window.__musicAudit');
  const { data: full } = await page('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(`${OUT}/page.png`, Buffer.from(full, 'base64'));
  // Enter a real final fight through the first inspector destination.
  await key('Tab');
  await key('Enter');
  await delay(3000);
  await capture('final-fight');
  const finale = await evaluate('window.__musicAudit');
  await key('Enter');
  await key('ArrowDown');
  await key('ArrowDown');
  await key('Enter');
  await key('ArrowLeft');
  await capture('pause-audio');
  await key('Escape');
  await key('Escape');

  const report = { checks, beach, finale, errors };
  fs.writeFileSync(`${OUT}/report.json`, JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify(report, null, 2));
  if (
    !beach.requests.some((r) => r.url.includes(IMPORTED_MUSIC.beach.url) && r.status === 200) ||
    !beach.starts.some((s) => s.loop && s.state === 'running')
  )
    throw new Error('Recorded beach playback was not confirmed');
  if (
    !finale.requests.some((r) => r.url.includes(IMPORTED_MUSIC.laststand.url) && r.status === 200) ||
    !finale.starts.some((s) => Math.abs(s.duration - IMPORTED_MUSIC.laststand.duration) < 0.02)
  )
    throw new Error('Recorded final-fight playback was not confirmed');
  if (checks.some((c) => c.files.some((f) => !f.ogg || f.status !== 200)))
    throw new Error('A server is missing music files');
  await send('Browser.close').catch(() => {});
} finally {
  ws?.close();
  chrome.kill('SIGTERM');
}
