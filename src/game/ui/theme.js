/** One visual language for the 320×180 arcade UI. Values are logical pixels, scaled by the cabinet. */
import { H, REDUCED, W } from '../config.js';
import { ctx, txt, vgrad, wrap } from '../core/canvas.js';
export const UI = Object.freeze({
  ink: '#050812',
  bg: '#080e20',
  panel: '#111d36',
  raised: '#203455',
  line: '#536b91',
  gold: '#f8cd55',
  goldDark: '#94672a',
  white: '#fff3d6',
  muted: '#a6b7ce',
  p1: '#ef625c',
  p2: '#62c9ee',
  green: '#86e0aa',
  danger: '#f06060',
  gutter: 10,
  body: 6,
  label: 8,
  heading: 12,
  hero: 16,
});
export const motionTick = (t) => (REDUCED ? 0 : t);
export function fitLabel(
  text,
  x,
  y,
  width,
  size = UI.label,
  color = UI.white,
  align = 'left',
  shadow = UI.ink,
) {
  const n = Array.from(text).length;
  const chosen = n * size <= width ? size : UI.body;
  const capacity = Math.floor(width / chosen);
  const line =
    n > capacity
      ? Array.from(text)
          .slice(0, Math.max(0, capacity - 1))
          .join('') + '…'
      : text;
  txt(line, x, y, chosen, color, align, shadow);
}
export function paragraph(
  text,
  x,
  y,
  width,
  { color = UI.white, size = UI.body, lineHeight = 10, maxLines = 12, align = 'left' } = {},
) {
  const lines = wrap(text, Math.floor(width / size));
  lines.slice(0, maxLines).forEach((line, i) => txt(line, x, y + i * lineHeight, size, color, align, null));
  return lines.length * lineHeight;
}
export function panel(x, y, w, h, accent = UI.line, fill = UI.panel) {
  ctx.fillStyle = UI.ink;
  ctx.fillRect(x - 1, y - 1, w + 2, h + 3);
  ctx.fillStyle = accent;
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = fill;
  ctx.fillRect(x + 1, y + 1, w - 2, h - 2);
  ctx.fillStyle = UI.raised;
  ctx.fillRect(x + 2, y + 2, w - 4, 1);
  ctx.fillStyle = UI.ink;
  ctx.fillRect(x + 2, y + h - 3, w - 4, 1);
  ctx.fillStyle = accent;
  ctx.fillRect(x, y, 4, 2);
  ctx.fillRect(x + w - 4, y + h - 2, 4, 2);
}
export function screenBackdrop(t = 0) {
  ctx.fillStyle = vgrad(0, H, [UI.raised, UI.bg, UI.ink]);
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = 'rgba(110,157,220,.055)';
  const shift = Math.floor(motionTick(t) / 12) % 24;
  for (let x = -H; x < W + H; x += 24) {
    ctx.beginPath();
    ctx.moveTo(x + shift, 0);
    ctx.lineTo(x + shift + 2, 0);
    ctx.lineTo(x + H + shift + 2, H);
    ctx.lineTo(x + H + shift, H);
    ctx.fill();
  }
  ctx.fillStyle = 'rgba(0,0,0,.14)';
  for (let y = 30; y < H - 14; y += 4) ctx.fillRect(0, y, W, 1);
}
export function screenHeader(title, tag = 'BRAINROT BATTAGLIA') {
  ctx.fillStyle = UI.ink;
  ctx.fillRect(0, 0, W, 30);
  ctx.fillStyle = UI.gold;
  ctx.fillRect(10, 7, 3, 16);
  ctx.fillRect(10, 28, W - 20, 1);
  fitLabel(title, 20, 9, 196, UI.heading, UI.white);
  txt(tag, W - 10, 12, 6, UI.muted, 'right', null);
}
export function screenFooter(left = '↑↓ ESCOLHER', right = 'ENTER CONFIRMAR · ESC VOLTAR') {
  ctx.fillStyle = UI.ink;
  ctx.fillRect(0, H - 14, W, 14);
  ctx.fillStyle = UI.line;
  ctx.fillRect(UI.gutter, H - 14, W - UI.gutter * 2, 1);
  fitLabel(left, UI.gutter, H - 9, 130, UI.body, UI.muted);
  fitLabel(right, W - UI.gutter, H - 9, 174, UI.body, UI.white, 'right');
}
export function menuRow(text, x, y, w, selected, { value = '', height = 17, accent = UI.gold } = {}) {
  panel(x, y, w, height, selected ? accent : UI.line, selected ? UI.raised : UI.panel);
  if (selected) {
    ctx.fillStyle = accent;
    ctx.fillRect(x + 1, y + 1, 3, height - 2);
  }
  const available = value ? w * 0.54 : w - 22;
  fitLabel(text, x + 10, y + Math.floor((height - 7) / 2), available, 8, selected ? UI.white : UI.muted);
  if (value)
    fitLabel(
      value,
      x + w - 8,
      y + Math.floor((height - 7) / 2),
      w * 0.4,
      6,
      selected ? UI.gold : UI.white,
      'right',
    );
}
