/* ================= THE PLAYFIELD TEXTURE =================
   The floor is painted in 2D and laid flat: stone, the theme's art per field, inserts and their names, baked shadows. */
import {defaultPaintGrave} from './defaults.js';
import {G, T} from '../core/state.js';
import {PI, TAU, hash, lerp, mkCanvas} from '../core/util.js';
import {R, fieldPath, flagstones, path} from './draw2d.js';
import {PAL, THEME, USE} from '../table/content.js';
import {BT, CHAINS, FIELD_H, H, HW, NM, OX, TY, W, roofed} from '../table/layout.js';

/* ================= PLAYFIELD ART FOR 3D =================
   The playfield is the 2D game's own painted art, laid flat as a texture. Walls, blocks, slings, ramps and
   targets are real geometry now, so only what a real table would print is painted here: stone, scenery art,
   inserts and their names, plus soft contact shadows and light pools baked in. */
export const FLOOR_CH = 820;
export const FLOOR_Y0 = -60;
// paints the whole table; `ox` is the left edge of the strip being painted, which is where the base stone goes
export function drawFloor3D(c, ss, ox) {
  if (ox) c.translate(ox, 0);
  c.fillStyle = '#08080c';
  c.fillRect(-10, -400, W + 20, H + 800);
  if (THEME.floorBase) THEME.floorBase(c);
  else
    for (let r = -15; r < (H + 300) / 24; r++) {
      const y = r * 24,
        off = (r % 2) * 26;
      for (let k = -1; k < 13; k++) {
        const h = hash(r * 31.7 + k * 3.3);
        c.fillStyle =
          'rgba(' +
          ((52 + h * 34) | 0) +
          ',' +
          ((50 + h * 30) | 0) +
          ',' +
          ((70 + h * 36) | 0) +
          ',' +
          (0.16 + h * 0.16) +
          ')';
        c.fillRect(k * 52 + off + 1, y + 1, 50, 22);
      }
    }
  if (ox) c.translate(-ox, 0);
  for (let i = 0; i < NM; i++) {
    const p = PAL[i],
      y = TY[i];
    c.save();
    fieldPath(c, i);
    c.clip();
    if (OX[i]) c.translate(OX[i], 0); // a field's own art is painted in its own coordinates
    const g = c.createLinearGradient(0, y, 0, y + 920);
    g.addColorStop(0, p.a);
    g.addColorStop(1, p.b);
    c.fillStyle = g;
    c.fillRect(0, y - 10, W, 1200);
    if (THEME.flagstones !== false) flagstones(c, i);
    if (THEME.floorArt && THEME.floorArt[i]) THEME.floorArt[i](c, y, p);
    const v = c.createLinearGradient(20, 0, 620, 0);
    v.addColorStop(0, 'rgba(0,0,0,.42)');
    v.addColorStop(0.14, 'rgba(0,0,0,0)');
    v.addColorStop(0.86, 'rgba(0,0,0,0)');
    v.addColorStop(1, 'rgba(0,0,0,.42)');
    c.fillStyle = v;
    c.fillRect(0, y - 10, W, 1200);
    c.restore();
  }
  // chutes between levels and the shooter lane
  for (const ch of T.chans) {
    path(c, ch, 1);
    const g = c.createLinearGradient(0, ch[0][1], 0, ch[2][1]);
    g.addColorStop(0, '#0c0c14');
    g.addColorStop(1, '#1a1a28');
    c.fillStyle = g;
    c.fill();
    c.strokeStyle = 'rgba(120,200,255,.16)';
    c.lineWidth = 1.5;
    for (let k = 1; k < 7; k++) {
      const t = k / 7;
      c.beginPath();
      c.moveTo(lerp(ch[0][0], ch[3][0], t), lerp(ch[0][1], ch[3][1], t));
      c.lineTo(lerp(ch[1][0], ch[2][0], t), lerp(ch[1][1], ch[2][1], t));
      c.stroke();
    }
  }
  {
    const g = c.createLinearGradient(586, 0, 620, 0);
    g.addColorStop(0, '#0a0a10');
    g.addColorStop(0.5, '#1c1c2a');
    g.addColorStop(1, '#0a0a10');
    c.fillStyle = g;
    c.fillRect(587, TY[BT] + 336, 33, H);
    c.strokeStyle = 'rgba(255,210,120,.25)';
    c.lineWidth = 2;
    for (let y = TY[BT] + 420; y < T.shooter.y - 20; y += 46) {
      c.beginPath();
      c.moveTo(594, y + 9);
      c.lineTo(603, y);
      c.lineTo(612, y + 9);
      c.stroke();
    }
  }
  // faint underground tunnels
  c.setLineDash([3, 9]);
  c.lineWidth = 2;
  c.strokeStyle = 'rgba(140,220,255,.10)';
  for (const id in T.tunnels) {
    const t = T.tunnels[id];
    if (t.zone || id === 'rise') continue;
    c.beginPath();
    for (let k = 0; k < t.n; k += 2) c.lineTo(t.x[k], t.y[k]);
    c.stroke();
  }
  c.setLineDash([]);
  // baked contact shadows where geometry meets the floor
  c.save();
  c.lineCap = 'round';
  c.lineJoin = 'round';
  c.shadowColor = 'rgba(0,0,0,.75)';
  c.shadowBlur = 11 * ss;
  c.strokeStyle = 'rgba(0,0,0,.34)';
  for (const w of T.wallPaths) {
    if (w.style === 'gate') continue;
    path(c, w.pts);
    c.lineWidth = (w.w || 2) * 2 + 5;
    c.stroke();
  }
  for (const b of T.blocks) {
    path(c, b.pts, 1);
    c.lineWidth = 7;
    c.stroke();
  }
  for (const s of T.slings) {
    path(c, [s.A, s.B, s.C], 1);
    c.lineWidth = 7;
    c.stroke();
  }
  for (let i = 0; i < NM; i++) {
    fieldPath(c, i);
    c.lineWidth = 12;
    c.stroke();
  }
  c.fillStyle = 'rgba(0,0,0,.4)';
  for (const b of T.bumps) {
    if (b.tier >= NM) continue;
    c.beginPath();
    c.arc(b.x, b.y, b.r + 3, 0, TAU);
    c.fill();
  }
  for (const s of G.statues) {
    c.beginPath();
    c.arc(s.x, s.y, s.r + 3, 0, TAU);
    c.fill();
  }
  c.restore();
  // baked light pools
  c.save();
  c.globalCompositeOperation = 'lighter';
  for (const tr of T.torches) {
    if (tr.y > H) continue;
    const rr = tr.r * 1.5,
      g = c.createRadialGradient(tr.x, tr.y, 2, tr.x, tr.y, rr);
    g.addColorStop(0, tr.c + '55');
    g.addColorStop(0.4, tr.c + '22');
    g.addColorStop(1, tr.c + '00');
    c.fillStyle = g;
    c.fillRect(tr.x - rr, tr.y - rr, rr * 2, rr * 2);
  }
  for (const b of T.bumps) {
    if (b.tier >= NM) continue;
    const col = b.bell ? '#ffd070' : PAL[b.tier].glow,
      g = c.createRadialGradient(b.x, b.y, b.r, b.x, b.y, b.r + 52);
    g.addColorStop(0, col + '40');
    g.addColorStop(1, col + '00');
    c.fillStyle = g;
    c.fillRect(b.x - 90, b.y - 90, 180, 180);
  }
  c.restore();
  // inserts and their names
  c.textAlign = 'center';
  c.textBaseline = 'middle';
  for (const id in T.shots) {
    const s = T.shots[id];
    if (s.tier >= NM || s.id !== id) continue;
    c.save();
    c.translate(s.x, s.y);
    if (s.kind === 'dot') {
      c.fillStyle = 'rgba(0,0,0,.5)';
      c.beginPath();
      c.arc(0, 0, 9, 0, TAU);
      c.fill();
      c.strokeStyle = 'rgba(230,222,200,.45)';
      c.lineWidth = 1.3;
      c.stroke();
      c.font = '700 8.5px ' + R.fontL;
      c.fillStyle = 'rgba(235,225,200,.72)';
      c.fillText(s.name.toUpperCase(), 0, 18);
    } else {
      c.rotate(s.ang + PI / 2);
      c.fillStyle = 'rgba(0,0,0,.55)';
      c.beginPath();
      c.moveTo(0, -13);
      c.lineTo(10, 8);
      c.lineTo(-10, 8);
      c.closePath();
      c.fill();
      c.strokeStyle = 'rgba(230,222,200,.45)';
      c.lineWidth = 1.3;
      c.stroke();
      c.rotate(-PI / 2);
      c.font = '700 8.5px ' + R.fontL;
      c.fillStyle = 'rgba(235,225,200,.75)';
      if (Math.cos(s.ang) < -0.05) {
        c.rotate(PI);
        c.textAlign = 'left';
        c.fillText(s.name.toUpperCase(), 15, 0);
      } else {
        c.textAlign = 'right';
        c.fillText(s.name.toUpperCase(), -15, 0);
      }
    }
    c.restore();
  }
  // status lamps: the insert's ring and what it says
  for (const l of T.lamps) {
    c.fillStyle = 'rgba(0,0,0,.55)';
    c.beginPath();
    c.arc(l.x, l.y, l.r + 1.5, 0, TAU);
    c.fill();
    c.strokeStyle = 'rgba(230,222,200,.45)';
    c.lineWidth = 1.3;
    c.stroke();
    if (l.label) {
      c.textAlign = 'center';
      c.font = '700 8.5px ' + R.fontL;
      c.fillStyle = 'rgba(235,225,200,.75)';
      c.fillText(l.label.toUpperCase(), l.x, l.y + l.r + 9);
    }
  }
  for (const id in T.holes) {
    const h = T.holes[id];
    if (h.tier >= NM) continue;
    c.fillStyle = '#000';
    c.beginPath();
    c.arc(h.x, h.y, h.r + 1, 0, TAU);
    c.fill();
  }
}
// one strip of floor per run of joined fields, cut into chunks; then the Grave
export function paintFloorChunks(ss) {
  const out = [];
  for (const ch of CHAINS) {
    const top = ch[0],
      b = ch[ch.length - 1],
      ox = OX[top],
      ya = roofed(top) ? TY[top] - 10 : TY[top] + FLOOR_Y0 - 40, // under the cap behind the arch, where there is one
      yb = b === BT ? H + 40 : TY[b] + FIELD_H,
      end = b === BT ? H + 36 : yb; // where the floor itself stops (the last chunk is not always full)
    for (let k = 0; k < Math.ceil((yb - ya) / FLOOR_CH); k++) {
      const y0 = ya + k * FLOOR_CH,
        cv = mkCanvas(Math.round(W * ss), Math.round(FLOOR_CH * ss)),
        c = cv.getContext('2d');
      c.setTransform(ss, 0, 0, ss, -ox * ss, -y0 * ss);
      drawFloor3D(c, ss, ox);
      out.push({cv, y0, y1: y0 + FLOOR_CH, ox, top, end});
    }
  }
  if (USE.grave) {
    const cv = mkCanvas(Math.round(W * ss), Math.round((HW + 90 - (H + 10)) * ss)),
      c = cv.getContext('2d');
    c.setTransform(ss, 0, 0, ss, 0, -(H + 10) * ss);
    c.fillStyle = '#0a0806';
    c.fillRect(0, H + 10, W, HW + 90 - (H + 10));
    (THEME.paintGrave || defaultPaintGrave)(c);
    out.push({cv, y0: H + 10, y1: HW + 90, grave: true, ox: 0, top: BT});
  }
  return out;
}
