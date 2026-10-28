/* Studio ident built from the original jungle/CRT artwork. */
import { H, REDUCED, W } from '../config.js';
import { ctx, txt } from '../core/canvas.js';

let artwork = null;
let loading = null;
const GREEN = '#a5ff66';
const clamp = (n) => Math.max(0, Math.min(1, n));

/** Shared promise: boot waits for the artwork; failed loads retain a readable card. */
function loadTupinicodeArt(base = '/brand') {
  if (loading) return loading;
  loading = new Promise((resolve) => {
    const image = new Image();
    image.onload = () => {
      artwork = image;
      resolve();
    };
    image.onerror = () => resolve();
    image.src = base + '/tupinicode-intro.png';
  });
  return loading;
}

function screenPath(x, y, width, height) {
  // Follow the photographed CRT perspective, rather than placing a flat UI over it.
  ctx.beginPath();
  ctx.moveTo(x + width * 0.45, y + height * 0.202);
  ctx.lineTo(x + width * 0.585, y + height * 0.252);
  ctx.lineTo(x + width * 0.586, y + height * 0.492);
  ctx.lineTo(x + width * 0.449, y + height * 0.467);
  ctx.closePath();
}

function drawTupinicode(t, { power = 1, reveal = 1 } = {}) {
  ctx.fillStyle = '#020a07';
  ctx.fillRect(0, 0, W, H);
  if (!artwork) {
    txt('TUPINICODE', W / 2, 76, 20, GREEN, 'center');
    return;
  }
  // Contain the entire wordmark: this panoramic image must never be stretched or cropped.
  const zoom = REDUCED ? 1 : 1 + 0.012 * (1 - clamp(t / 240));
  const width = W * zoom;
  const height = (width * artwork.height) / artwork.width;
  const x = (W - width) / 2,
    y = 14 + (128 - height) / 2;
  ctx.save();
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(artwork, x, y, width, height);
  // Start in darkness, then let the phosphor light reveal the forest.
  ctx.fillStyle = `rgba(0,8,4,${0.65 * (1 - power)})`;
  ctx.fillRect(0, 0, W, H);
  if (power < 1) {
    ctx.save();
    screenPath(x, y, width, height);
    ctx.clip();
    ctx.fillStyle = '#031209';
    ctx.fillRect(x, y, width, height);
    const opened = REDUCED ? power : clamp((power - 0.3) / 0.7);
    ctx.globalAlpha = power;
    ctx.fillStyle = '#b8ff8a';
    ctx.fillRect(
      x + width * 0.44,
      y + height * (0.35 - opened * 0.15),
      width * 0.16,
      Math.max(0.5, height * 0.3 * opened),
    );
    ctx.restore();
  }
  // The wordmark is already part of the supplied art. Reveal it, without redrawing its letters.
  if (reveal < 1) {
    const shade = ctx.createLinearGradient(0, y + height * 0.53, 0, y + height * 0.69);
    shade.addColorStop(0, 'rgba(0,8,4,0)');
    shade.addColorStop(1, `rgba(0,8,4,${0.94 * (1 - reveal)})`);
    ctx.fillStyle = shade;
    ctx.fillRect(0, y + height * 0.53, W, height * 0.47);
  }
  const edge = ctx.createLinearGradient(0, 0, 0, H);
  edge.addColorStop(0, '#020a07');
  edge.addColorStop(0.09, 'rgba(2,10,7,0)');
  edge.addColorStop(0.72, 'rgba(2,10,7,0)');
  edge.addColorStop(0.84, '#020a07');
  ctx.fillStyle = edge;
  ctx.fillRect(0, 0, W, H);
  ctx.restore();
  if (!REDUCED) {
    // Sparse ambient movement keeps the logo itself stable and legible.
    for (let i = 0; i < 9; i++) {
      const phase = t * 0.018 + i * 2.3;
      const fx = 22 + ((i * 73) % 278) + Math.sin(phase) * 4;
      const fy = 25 + ((i * 31) % 95) + Math.cos(phase * 0.7) * 3;
      ctx.fillStyle = `rgba(195,255,91,${(0.25 + 0.25 * Math.sin(phase)) * power})`;
      ctx.fillRect(Math.round(fx), Math.round(fy), 1, 1);
    }
  }
}

/** Restrained footer, separate from the illustrated logo. */
function studioCaption(label, detail, progress) {
  ctx.fillStyle = '#315637';
  ctx.fillRect(136, 146, 48, 0.5);
  txt(label, W / 2, 153, 6, GREEN, 'center', null);
  if (detail) txt(detail, W / 2, 166, 5, '#a2b7a5', 'center', null);
  if (progress !== undefined) {
    ctx.fillStyle = '#193321';
    ctx.fillRect(112, 141, 96, 1);
    ctx.fillStyle = GREEN;
    ctx.fillRect(112, 141, Math.round(96 * clamp(progress)), 1);
  }
}

export { loadTupinicodeArt, drawTupinicode, studioCaption };
