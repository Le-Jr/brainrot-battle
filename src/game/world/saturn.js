/* Saturnita map emblem: authored art with a procedural fallback. */
import { fe } from '../core/canvas.js';
import { artImage } from '../stages/art.js';

export function drawMapSaturn(g, x, y, t, image = artImage('map', 'saturn')) {
  if (image) {
    const bob = Math.round(Math.sin(t / 28) * 2 * 2) / 2;
    g.save();
    g.imageSmoothingEnabled = false;
    g.drawImage(image, x - 27, y - 24 + bob, 54, 40.5);
    // A moving glint makes the generated ring feel alive without deforming it.
    const angle = t / 24;
    const gx = x + Math.cos(angle) * 23,
      gy = y + Math.sin(angle) * 7 + bob;
    fe(g, Math.round(gx), Math.round(gy), 1, 1, '#fff4c8');
    g.restore();
    return;
  }
  fe(g, x, y, 8, 8, '#080e20');
  fe(g, x, y, 7, 7, '#e8b06a');
  for (let band = -5; band <= 5; band += 3) {
    g.fillStyle = '#c8904a';
    g.fillRect(x - 6, y + band, 12, 1);
  }
  for (let a = 0; a < 6.28; a += 0.08) {
    const rx = Math.round(x + Math.cos(a + t / 30) * 14),
      ry = Math.round(y + Math.sin(a + t / 30) * 4);
    if (Math.sin(a + t / 30) < 0 && Math.hypot(rx - x, ry - y) < 7) continue;
    g.fillStyle = '#ecdcb0';
    g.fillRect(rx, ry, 1, 1);
  }
  fe(g, x, y - 10, 4, 3, '#f4f0ea');
  g.fillStyle = '#2a2230';
  g.fillRect(x - 2, y - 11, 1, 1);
  g.fillRect(x + 2, y - 11, 1, 1);
  g.fillStyle = '#f0a0b4';
  g.fillRect(x - 1, y - 8, 3, 1);
  g.fillStyle = '#b060ff';
  if ((t >> 3) & 1) {
    g.fillRect(x - 2, y - 11, 1, 1);
    g.fillRect(x + 2, y - 11, 1, 1);
  }
}
