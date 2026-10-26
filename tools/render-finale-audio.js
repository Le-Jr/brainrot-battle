/** Render the actual Web Audio score in Chromium OfflineAudioContext, without speakers. */
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { spawn } from 'node:child_process';
const root = process.cwd();
const out = path.join(root, 'output/finale/audio');
fs.mkdirSync(out, { recursive: true });
const server = http.createServer((req, res) => {
  const pathname = new URL(req.url, 'http://localhost').pathname;
  if (req.method === 'POST' && /^\/save\/(ascension|laststand)$/.test(pathname)) {
    const chunks = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end', () => {
      fs.writeFileSync(path.join(out, pathname.split('/').at(-1) + '.wav'), Buffer.concat(chunks));
      res.end('ok');
    });
    return;
  }
  if (pathname === '/') {
    res.setHeader('Content-Type', 'text/html');
    res.end('<!doctype html><title>Finale audio renderer</title>');
    return;
  }
  const file = path.resolve(root, '.' + pathname);
  if (!file.startsWith(root + '/src/game/') || !file.endsWith('.js') || !fs.existsSync(file)) {
    res.writeHead(404);
    res.end();
    return;
  }
  res.setHeader('Content-Type', 'text/javascript');
  fs.createReadStream(file).pipe(res);
});
await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const port = server.address().port;
const chrome = spawn(
  'chromium',
  [
    '--headless',
    '--no-sandbox',
    '--disable-gpu',
    '--disable-dev-shm-usage',
    '--remote-debugging-port=0',
    '--user-data-dir=/tmp/brainrot-finale-audio-' + process.pid,
    'about:blank',
  ],
  { stdio: ['ignore', 'ignore', 'pipe'] },
);
let ws;
try {
  const endpoint = await new Promise((resolve, reject) => {
    let log = '';
    const timer = setTimeout(() => reject(new Error('Chromium startup timeout')), 20000);
    chrome.stderr.on('data', (c) => {
      log += c;
      const m = log.match(/DevTools listening on (ws:\/\/\S+)/);
      if (m) {
        clearTimeout(timer);
        resolve(m[1]);
      }
    });
    chrome.once('error', reject);
  });
  ws = new WebSocket(endpoint);
  await new Promise((resolve, reject) => {
    ws.onopen = resolve;
    ws.onerror = reject;
  });
  let id = 0;
  const pending = new Map();
  ws.onmessage = (e) => {
    const m = JSON.parse(e.data);
    const p = pending.get(m.id);
    if (p) {
      pending.delete(m.id);
      m.error ? p.reject(new Error(m.error.message)) : p.resolve(m.result);
    }
  };
  const send = (method, params = {}, sessionId) =>
    new Promise((resolve, reject) => {
      const call = ++id;
      pending.set(call, { resolve, reject });
      ws.send(JSON.stringify({ id: call, method, params, ...(sessionId ? { sessionId } : {}) }));
    });
  const { targetId } = await send('Target.createTarget', { url: `http://127.0.0.1:${port}/` });
  const { sessionId } = await send('Target.attachToTarget', { targetId, flatten: true });
  await new Promise((resolve) => setTimeout(resolve, 500));
  const result = await send(
    'Runtime.evaluate',
    {
      awaitPromise: true,
      returnByValue: true,
      expression: `(async () => {
    const { AU } = await import('/src/game/audio/synth.js');
    const { TRACKS } = await import('/src/game/audio/tracks.js');
    const NativeOffline = window.OfflineAudioContext;
    const results = [];
    for (const name of ['ascension', 'laststand']) {
      const rate = 44100, duration = name === 'ascension' ? 36 : 45;
      const offline = new NativeOffline(2, rate * (duration + 2), rate);
      window.AudioContext = function () { return offline; };
      AU.ctx = null; AU.pending = null; AU.track = null; AU.init();
      const tr = TRACKS[name], d = 60 / tr.bpm / 4, total = tr.lead.length * 16;
      for (let s = 0; s * d < duration; s++) AU.stepAt(tr, s % total, s * d, d);
      const buffer = await offline.startRendering();
      const pcm = new ArrayBuffer(44 + buffer.length * 4), view = new DataView(pcm);
      const str = (at, s) => { for (let i = 0; i < s.length; i++) view.setUint8(at + i, s.charCodeAt(i)); };
      str(0, 'RIFF'); view.setUint32(4, pcm.byteLength - 8, true); str(8, 'WAVE'); str(12, 'fmt ');
      view.setUint32(16, 16, true); view.setUint16(20, 1, true); view.setUint16(22, 2, true);
      view.setUint32(24, rate, true); view.setUint32(28, rate * 4, true); view.setUint16(32, 4, true); view.setUint16(34, 16, true);
      str(36, 'data'); view.setUint32(40, pcm.byteLength - 44, true);
      let peak = 0, energy = 0, finite = true;
      for (let i = 0; i < buffer.length; i++) for (let ch = 0; ch < 2; ch++) {
        const value = buffer.getChannelData(ch)[i]; finite &&= Number.isFinite(value);
        peak = Math.max(peak, Math.abs(value)); energy += value * value;
        view.setInt16(44 + (i * 2 + ch) * 2, Math.max(-1, Math.min(1, value)) * 32767, true);
      }
      await fetch('/save/' + name, { method: 'POST', body: pcm });
      results.push({ name, peak, rms: Math.sqrt(energy / (buffer.length * 2)), finite, duration: buffer.duration });
    }
    return results;
  })()`,
    },
    sessionId,
  );
  if (result.exceptionDetails) throw new Error(JSON.stringify(result.exceptionDetails));
  const report = result.result.value;
  for (const track of report)
    if (!track.finite || track.peak < 0.01 || track.peak > 1)
      throw new Error('Audio invalid or clipping: ' + JSON.stringify(track));
  fs.writeFileSync(path.join(out, 'report.json'), JSON.stringify(report, null, 2) + '\n');
  console.log(report);
} finally {
  ws?.close();
  chrome.kill('SIGTERM');
  server.close();
}
