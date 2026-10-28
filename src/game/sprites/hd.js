/* HD character atlases: loading, pose mapping and rigid pose transforms. */
import { ATLAS_FRAMES } from '../data/atlas-frames.js';
import { ATLAS_ANIMATIONS } from '../data/atlas-animations.js';
import { OX, OY } from './primitives.js';

/* ---- HD sprites built from the reference sheets ---- */
const HD = {};
function hdPick(pose, f, a, animation) {
  f = ((f % 8) + 8) % 8;
  if (animation) {
    const frame = (name, extra = {}) => ({ i: animation[name], ...extra });
    const phase = a === 1 ? 'hit' : a === 0.25 ? 'recover' : 'windup';
    switch (pose) {
      case 'idle':
        return frame('idle', { dy: f >= 4 ? -1 : 0 });
      case 'walk':
        return frame(['walk-contact', 'walk-down', 'walk-pass', 'walk-up'][Math.floor(f / 2)]);
      case 'crouch':
        return frame('crouch');
      case 'cblock':
        return frame('crouch', { dx: -1 });
      case 'block':
        return frame('block');
      case 'punch':
        return frame('punch-' + phase);
      case 'kick':
        return frame('kick-' + phase);
      case 'cpunch':
        return frame('punch-' + phase, { lc: 0.58 });
      case 'ckick':
        return frame('kick-' + phase, { lc: 0.58, rot: 0.25, pvy: -0.25 });
      case 'jump':
        return frame('jump', { rot: [-0.08, 0, 0.08][f] || 0 });
      case 'jpunch':
        return frame('punch-' + phase, { rot: -0.08 });
      case 'jkick':
        return frame('kick-' + phase, { rot: 0.1 });
      case 'special':
        return frame(a === 1 ? 'special-release' : 'special-prep');
      case 'hit':
        return frame('hit', { dx: f & 1 ? 1 : -1 });
      case 'fall':
        return frame('hit', { rot: -0.2 - Math.min(f, 4) * 0.15, pvy: -0.5 });
      case 'down':
        return frame('down');
      case 'win':
        return frame('win', { dy: f >= 4 ? -2 : 0 });
      default:
        return frame('idle');
    }
  }
  const B = [0, 0, 1, 1, 2, 2, 1, 1];
  switch (pose) {
    case 'idle':
      return { i: 0, lc: 1 - B[f] * 0.025 };
    case 'walk':
      return { i: f < 4 ? 2 : 3, dy: -[0, 2, 3, 2][f % 4] };
    case 'crouch':
      return { i: 0, lc: f === 1 ? 0.78 : f === 2 ? 0.66 : 0.5 };
    case 'cblock':
      return { i: 8, lc: 0.5 };
    case 'block':
      return { i: 8 };
    case 'punch':
      return { i: a < 1 ? 5 : 6, dx: a === 0.25 ? -3 : 0 };
    case 'cpunch':
      return { i: a < 1 ? 5 : 6, lc: 0.5 };
    case 'kick':
      return a < 1 ? { i: 0, lc: 0.86, rot: -0.07 } : { i: 7 };
    case 'ckick':
      return a < 1 ? { i: 8, lc: 0.5 } : { i: 7, lc: 0.5, rot: 0.55, pvy: -0.35, dy: 6 };
    case 'jump':
      return { i: 4, rot: [-0.12, 0, 0.12][f] || 0 };
    case 'jpunch':
      return { i: 6, rot: 0.08 };
    case 'jkick':
      return { i: 7, rot: 0.14 };
    case 'special':
      return { i: 9 };
    case 'hit':
      return { i: 10, dx: f & 1 ? 2 : -2 };
    case 'fall':
      return { i: 10, rot: -0.25 - Math.min(f, 4) * 0.16, pvy: -0.5 };
    case 'down':
      return { i: 11 };
    case 'win':
      return f < 4 ? { i: 1 } : { i: 4, dy: -[10, 18, 18, 10][f - 4] };
  }
  return { i: 0 };
}
function drawHD(g, ch, pose, f, a) {
  const H = HD[ch.id],
    q = hdPick(pose, f, a, H.animation),
    [x, y, w, h, ax, ay] = H.f[q.i];
  g.imageSmoothingEnabled = false;
  g.save();
  g.translate(OX * 2 + (q.dx || 0), OY * 2 + (q.dy || 0));
  if (H.animation && (pose === 'crouch' || pose === 'cblock')) {
    // Authored crouch frames were packed smaller than idle. Restore body volume
    // uniformly around the foot pivot, rather than stretching either axis.
    g.scale(H.crouchScale, H.crouchScale);
  }
  if (q.rot) {
    const pv = (q.pv || 0) * w,
      py = (q.pvy || 0) * h;
    g.translate(pv, py);
    g.rotate(q.rot);
    g.translate(-pv, -py);
  }
  const lc = q.lc || 1;
  if (lc >= 0.999) g.drawImage(H.img, x, y, w, h, -ax, -ay - 1, w, h);
  else {
    // Workaround until low-attack frames are authored: lower the intact pose
    // behind the floor instead of squeezing its legs. Measure painted height,
    // since atlas cells contain transparent padding above the character.
    const height = H.heights[q.i];
    const lowered = Math.round(height * (1 - lc) * 0.45);
    g.beginPath();
    g.rect(-ax, -ay - 1, w, ay + 1);
    g.clip();
    g.drawImage(H.img, x, y, w, h, -ax, -ay - 1 + lowered, w, h);
  }
  g.restore();
}

/** Decode every character atlas from `base` (for example "/atlases"). A failed image keeps the procedural draw(p) fallback. */
function loadHD(base) {
  return Promise.all(
    Object.entries(ATLAS_FRAMES).map(
      ([id, f]) =>
        new Promise((res) => {
          const im = new Image();
          im.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = im.width;
            canvas.height = im.height;
            const context = canvas.getContext('2d');
            context.drawImage(im, 0, 0);
            const areas = [];
            const heights = f.map(([x, y, w, h]) => {
              const pixels = context.getImageData(x, y, w, h).data;
              let top = h,
                bottom = -1,
                area = 0;
              for (let row = 0; row < h; row++)
                for (let col = 0; col < w; col++)
                  if (pixels[(row * w + col) * 4 + 3] >= 128) {
                    area++;
                    top = Math.min(top, row);
                    bottom = Math.max(bottom, row);
                  }
              areas.push(area);
              return Math.max(0, bottom - top + 1);
            });
            const animation = ATLAS_ANIMATIONS[id];
            let crouchScale = 1;
            if (animation) {
              const idle = animation.idle,
                crouch = animation.crouch;
              // Painted area estimates body volume without treating bent knees as
              // a smaller character. Keep the pose clearly below standing height.
              const volumeScale = Math.sqrt(areas[idle] / Math.max(1, areas[crouch]));
              const heightLimit = (heights[idle] * 0.9) / Math.max(1, heights[crouch]);
              crouchScale = Math.max(1, Math.min(1.22, heightLimit, Math.max(1.1, volumeScale)));
            }
            HD[id] = { img: im, f, heights, animation, crouchScale };
            res();
          };
          im.onerror = () => res();
          im.src = base + '/' + id + '.png';
        }),
    ),
  );
}

export { HD, drawHD, loadHD };
