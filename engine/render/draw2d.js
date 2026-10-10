/* ================= 2D DRAWING HELPERS =================
   Used to paint the playfield texture: paths, glows, the flagstones, the boss circle. */
import {T} from '../core/state.js';
import {PI, TAU, hash, mkCanvas} from '../core/util.js';
import {BELOW, BT, FIELD_H, H, OX, TY} from '../table/layout.js';

/* ================= RENDER ================= */
export const R = {
  cv: null,
  c: null,
  scale: 1,
  ss: 1,
  floor: [],
  over: [],
  CH: 530,
  spr: {},
  glows: {},
  ready: false,
  fontD: '"Grenze Gotisch","Old English Text MT",Georgia,serif',
  fontL: 'Cinzel,"Trajan Pro",Georgia,serif'
};
export const LITC = {
  main: '#ffd24a',
  side: '#62d8ff',
  lock: '#7dffb0',
  gold: '#ffb020',
  soft: '#b79cff',
  danger: '#ff4050',
  spell: '#e8a8ff'
};
export function glow(col) {
  let g = R.glows[col];
  if (g) return g;
  g = mkCanvas(64, 64);
  const c = g.getContext('2d'),
    gr = c.createRadialGradient(32, 32, 0, 32, 32, 32);
  gr.addColorStop(0, col);
  gr.addColorStop(0.35, col + '88');
  gr.addColorStop(1, col + '00');
  c.fillStyle = gr;
  c.fillRect(0, 0, 64, 64);
  R.glows[col] = g;
  return g;
}
export function drawGlow(c, x, y, r, col, a) {
  c.globalAlpha = a;
  c.drawImage(glow(col), x - r, y - r, r * 2, r * 2);
  c.globalAlpha = 1;
}
export function path(c, pts, close) {
  c.beginPath();
  c.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) c.lineTo(pts[i][0], pts[i][1]);
  if (close) c.closePath();
}
// the outline of a field's floor: down to the chute, the apron or the drain throat, and up round the arch (or the lid)
export function fieldPath(c, i) {
  const ox = OX[i],
    yA = TY[i] + 300,
    yB = BELOW[i] >= 0 ? TY[i] + 913 : i === BT ? H + 60 : TY[i] + FIELD_H;
  c.beginPath();
  c.moveTo(ox + 20, yB);
  c.lineTo(ox + 20, yA);
  if (T.std[i].arch) c.arc(ox + 320, yA, 300, PI, TAU);
  else {
    c.lineTo(ox + 20, TY[i] + 20);
    c.lineTo(ox + 620, TY[i] + 20);
    c.lineTo(ox + 620, yA);
  }
  c.lineTo(ox + 620, yB);
  c.closePath();
}
export function starPath(c, x, y, r1, r2, n, rot) {
  c.beginPath();
  for (let i = 0; i < n * 2; i++) {
    const a = rot + (i * PI) / n,
      r = i % 2 ? r2 : r1;
    c.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r);
  }
  c.closePath();
}
export function polyStar(c, x, y, r, n, skip, rot) {
  c.beginPath();
  for (let i = 0; i <= n; i++) {
    const a = rot + (i * skip * TAU) / n;
    c.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r);
  }
}
export function runeBed(c, x, y) {
  c.save();
  c.strokeStyle = 'rgba(0,0,0,.5)';
  c.lineWidth = 22;
  c.beginPath();
  c.arc(x, y, 96, 0, TAU);
  c.stroke();
  c.strokeStyle = 'rgba(255,240,210,.14)';
  c.lineWidth = 1.4;
  for (const rr of [84.5, 107.5]) {
    c.beginPath();
    c.arc(x, y, rr, 0, TAU);
    c.stroke();
  }
  for (let k = 0; k < 12; k++) {
    const a = -PI / 2 + (k * TAU) / 12,
      px = x + Math.cos(a) * 96,
      py = y + Math.sin(a) * 96;
    c.fillStyle = 'rgba(0,0,0,.7)';
    c.beginPath();
    c.arc(px, py, 10.5, 0, TAU);
    c.fill();
    c.strokeStyle = 'rgba(255,236,200,.22)';
    c.lineWidth = 1.2;
    c.beginPath();
    c.arc(px, py, 10.5, 0, TAU);
    c.stroke();
  }
  c.restore();
}
export function sigil(c, x, y, r, col, kind) {
  c.save();
  c.strokeStyle = col;
  c.globalAlpha = 0.22;
  c.lineWidth = 2;
  c.beginPath();
  c.arc(x, y, r, 0, TAU);
  c.stroke();
  c.beginPath();
  c.arc(x, y, r * 0.86, 0, TAU);
  c.stroke();
  for (let k = 0; k < 24; k++) {
    const a = (k * TAU) / 24;
    c.beginPath();
    c.moveTo(x + Math.cos(a) * r * 0.86, y + Math.sin(a) * r * 0.86);
    c.lineTo(x + Math.cos(a) * r * (k % 3 ? 0.92 : 1), y + Math.sin(a) * r * (k % 3 ? 0.92 : 1));
    c.stroke();
  }
  if (kind === 0) {
    polyStar(c, x, y, r * 0.84, 7, 3, -PI / 2);
    c.stroke();
    c.beginPath();
    c.arc(x, y, r * 0.3, 0, TAU);
    c.stroke();
  } else if (kind === 1) {
    for (let k = 0; k < 3; k++) {
      c.beginPath();
      for (let t = 0; t <= 1.001; t += 0.05) {
        const a = (k * TAU) / 3 + t * 3.4,
          rr = r * 0.08 + t * r * 0.7;
        c.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr);
      }
      c.stroke();
    }
  } else {
    starPath(c, x, y, r * 0.82, r * 0.26, 4, -PI / 2);
    c.stroke();
    starPath(c, x, y, r * 0.56, r * 0.2, 4, -PI / 4);
    c.stroke();
    c.beginPath();
    c.arc(x, y, r * 0.14, 0, TAU);
    c.stroke();
  }
  c.restore();
}
export function flagstones(c, i) {
  const y0 = TY[i];
  c.lineWidth = 1.2;
  for (let r = 0; r < 17; r++) {
    const y = y0 + r * 58 + hash(i * 9 + r) * 10;
    c.strokeStyle = 'rgba(0,0,0,.34)';
    c.beginPath();
    c.moveTo(20, y);
    c.lineTo(620, y);
    c.stroke();
    c.strokeStyle = 'rgba(255,255,255,.035)';
    c.beginPath();
    c.moveTo(20, y + 1.4);
    c.lineTo(620, y + 1.4);
    c.stroke();
    let x = 20 + hash(r * 3.1 + i) * 60;
    while (x < 620) {
      c.strokeStyle = 'rgba(0,0,0,.3)';
      c.beginPath();
      c.moveTo(x, y);
      c.lineTo(x + (hash(x) - 0.5) * 6, y + 58);
      c.stroke();
      if (hash(x * 1.7 + r) > 0.72) {
        c.fillStyle = 'rgba(255,255,255,.022)';
        c.fillRect(x + 2, y + 2, 60, 54);
      }
      x += 64 + hash(x + r) * 52;
    }
  }
}
