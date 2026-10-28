import { hasFinaleArt, drawFinaleArt } from './finale-art.js';
/* Sprite cache, drawing with facing/scale, and collision profiles measured from the sprite pixels. */
import { ctx, mk } from '../core/canvas.js';
import { HD, drawHD } from './hd.js';
import { hasBonusArt, drawBonusArt } from './bonus-art.js';
import { OX, OY, SH, SW, setTarget } from './primitives.js';

const SPR = new Map();
function sprite(ch, pose, f, a, alt, tint) {
  const k = ch.id + '|' + pose + '|' + f + '|' + a + '|' + (alt ? 1 : 0) + '|' + (tint || '');
  let c = SPR.get(k);
  if (c) return c;
  const bonus = ch.id !== 'parrot' && hasBonusArt(ch.id);
  const finale = hasFinaleArt(ch);
  const hd = !!HD[ch.id] || bonus || finale;
  c = mk(SW * (hd ? 2 : 1), SH * (hd ? 2 : 1));
  c.hd = hd;
  if (bonus && ['car', 'cyber', 'byd'].includes(ch.id) && !alt && !tint)
    c.bonus = { id: ch.id, frame: Number(pose.slice(1)) || 0 };
  c.own = hd && (pose === 'down' || pose === 'fall');
  const g = c.getContext('2d');
  if (tint) {
    g.drawImage(sprite(ch, pose, f, a, alt, ''), 0, 0);
    g.globalCompositeOperation = 'source-atop';
    g.fillStyle = tint === 'w' ? '#ffffff' : tint === 'p' ? 'rgba(170,60,255,.42)' : 'rgba(90,180,255,.55)';
    g.fillRect(0, 0, c.width, c.height);
  } else {
    if (finale) drawFinaleArt(g, ch, pose, f, a);
    else if (bonus) drawBonusArt(g, ch.id, Number(pose.slice(1)) || 0, OX * 2, OY * 2);
    else if (hd) drawHD(g, ch, pose, f, a);
    else {
      setTarget(g);
      try {
        ch.draw({ pose, f, a });
      } finally {
        setTarget(null);
      }
    }
    if (alt) {
      const id = g.getImageData(0, 0, c.width, c.height),
        d = id.data;
      for (let i = 0; i < d.length; i += 4) {
        if (!d[i + 3]) continue;
        const r = d[i],
          gg = d[i + 1],
          b = d[i + 2];
        d[i] = b;
        d[i + 1] = r;
        d[i + 2] = gg;
      }
      g.putImageData(id, 0, 0);
    }
  }
  SPR.set(k, c);
  return c;
}
function warmList(ch, alt) {
  const L = [];
  for (let f = 0; f < 8; f++) {
    L.push([ch, 'idle', f, 0, alt]);
    L.push([ch, 'walk', f, 0, alt]);
    L.push([ch, 'win', f, 0, alt]);
  }
  for (const po of ['crouch', 'cblock', 'block', 'jump', 'special', 'hit', 'down'])
    for (let f = 0; f < 2; f++) L.push([ch, po, f, 0, alt]);
  for (const po of ['punch', 'cpunch', 'kick', 'ckick', 'jpunch', 'jkick'])
    for (let f = 0; f < 2; f++) {
      L.push([ch, po, f, 0.5, alt]);
      L.push([ch, po, f, 1, alt]);
    }
  return L;
}
function drawSpr(img, x, y, dir, scale = 1, lying = false, alpha = 1) {
  const k = img.hd ? 0.5 : 1;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(Math.round(x), Math.round(y));
  if (dir < 0) ctx.scale(-1, 1);
  if (lying && !img.own) {
    ctx.translate(26, -12);
    ctx.rotate(-Math.PI / 2);
  }
  if (img.bonus) drawBonusArt(ctx, img.bonus.id, img.bonus.frame, 0, 0, scale * 0.5);
  else ctx.drawImage(img, -OX * scale, -OY * scale, img.width * k * scale, img.height * k * scale);
  ctx.restore();
}
/* ---- collision profiles measured from the sprites themselves ---- */
function sprBox(img, minX) {
  const k = img.hd ? 2 : 1,
    d = img.getContext('2d').getImageData(0, 0, img.width, img.height).data;
  let l = 1e9,
    r = -1e9,
    t = 1e9,
    b = -1e9;
  for (let y = 0; y < img.height; y++)
    for (let x = 0; x < img.width; x++) {
      if (d[(y * img.width + x) * 4 + 3] < 128) continue;
      const lx = x / k - OX,
        ly = y / k - OY;
      if (minX !== undefined && lx <= minX) continue;
      if (lx < l) l = lx;
      if (lx > r) r = lx;
      if (ly < t) t = ly;
      if (ly > b) b = ly;
    }
  return l > r ? null : { l, r, t, b };
}
function profile(ch) {
  if (ch._prof) return ch._prof;
  const st = sprBox(sprite(ch, 'idle', 0, 0, false, '')) || {
      l: -ch.hurt.w / 2,
      r: ch.hurt.w / 2,
      t: -ch.hurt.h,
      b: 0,
    },
    cr = sprBox(sprite(ch, 'crouch', 0, 0, false, '')) || { t: st.t * 0.62 };
  const w = st.r - st.l,
    P = { l: st.l + w * 0.12, r: st.r - w * 0.12, t: st.t + 2, ct: cr.t + 2 };
  const tune = (pose, key, lowY) => {
    const img = sprite(ch, pose, 0, 1, false, ''),
      fr = sprBox(img, P.r + 2);
    if (!fr || fr.r < P.r + 8) {
      P[key] = null;
      return;
    }
    const tip = sprBox(img, fr.r - 12);
    let y0 = tip.t - 5,
      y1 = tip.b + 5;
    if (lowY !== undefined) y0 = Math.max(y0, lowY);
    if (y1 - y0 < 12) {
      const m = (y0 + y1) / 2;
      y0 = m - 6;
      y1 = m + 6;
    }
    P[key] = { x0: P.r - 10, x1: fr.r + 3, y0, y1 };
  };
  tune('punch', 'p');
  tune('kick', 'k');
  tune('cpunch', 'cp', cr.t - 4);
  tune('ckick', 'ck', -18);
  tune('jpunch', 'jp');
  tune('jkick', 'jk');
  ch._prof = P;
  return P;
}
function portrait(ch, x, y, w, h) {
  const img = sprite(ch, 'idle', 0, 0, false, ''),
    k = img.hd ? 2 : 1;
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();
  ctx.drawImage(img, (OX - w / 2) * k, (OY - ch.hurt.h - 4) * k, w * k, h * k, x, y, w, h);
  ctx.restore();
}

export { drawSpr, portrait, profile, sprite, warmList };
