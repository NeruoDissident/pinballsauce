import {GY, PI, T, TAU, TY, defaultPaintGrave, hash} from '../../../engine/api.js';

/* Neon Descent: everything painted flat. The floor of each district (asphalt, road paint, the district's own motif),
   the plate between the districts, Flatline's floor, and the four wardens' billboards.
   Nothing here uses Math.random: art must not move the game's random numbers. */
export const ND_PAL = [
  // per tier: a, b floor gradient; acc, acc2 accents; glow; stone (the wall colour)
  {a: '#1b1832', b: '#0b0a18', acc: '#b9a0ff', acc2: '#e6dcff', glow: '#b9a0ff', stone: '#3b3658'}, // Helix Citadel
  {a: '#10242f', b: '#07121a', acc: '#43e7ed', acc2: '#d8fbff', glow: '#43e7ed', stone: '#2c4a58'}, // The Data Cathedral
  {a: '#2a1428', b: '#120915', acc: '#ff4c9a', acc2: '#ffd0e6', glow: '#ff4c9a', stone: '#4a2c44'}, // Kabuki Aftermarket
  {a: '#1c2431', b: '#0c1018', acc: '#f6c85f', acc2: '#ffe9b0', glow: '#f6c85f', stone: '#3c4656'}, // The Undercity
  {a: '#170a10', b: '#050306', acc: '#ff4c6a', acc2: '#ffd0d8', glow: '#ff4c6a', stone: '#3a2630'}
]; // Flatline
const PAINT = '203,190,147',
  FONT = 'Consolas,"Courier New",monospace';

// the plate the districts are cut out of: dark steel, seamed
export function floorBase(c) {
  c.strokeStyle = 'rgba(120,150,190,.10)';
  c.lineWidth = 1;
  for (let y = -390; y < 5200; y += 52) {
    c.beginPath();
    c.moveTo(-10, y);
    c.lineTo(660, y);
    c.stroke();
  }
  for (let x = -10; x < 660; x += 52) {
    c.beginPath();
    c.moveTo(x, -390);
    c.lineTo(x, 5200);
    c.stroke();
  }
}

function asphalt(c, y, seed) {
  for (let k = 0; k < 1500; k++) {
    const h1 = hash(k * 12.9898 + seed),
      h2 = hash(k * 78.233 + seed * 1.7),
      h3 = hash(k * 3.17 + seed * 0.3);
    c.fillStyle = 'rgba(' + (h3 > 0.45 ? '255,255,255' : '0,0,0') + ',' + (0.015 + h3 * 0.045) + ')';
    c.fillRect(20 + h1 * 600, y + h2 * 920, 1 + h3 * 2.2, 1 + h3 * 2.2);
  }
  c.strokeStyle = 'rgba(0,0,0,.26)';
  c.lineWidth = 1.2;
  for (let yy = y + 86; yy < y + 920; yy += 118) {
    c.beginPath();
    c.moveTo(20, yy);
    c.lineTo(620, yy);
    c.stroke();
  }
}
// lane dashes down the avenue, a crossing above the flippers, hazard paint and a stencil in the outlanes
function roadPaint(c, y, cx, xr, word) {
  c.strokeStyle = 'rgba(' + PAINT + ',.20)';
  c.lineWidth = 3;
  c.setLineDash([20, 28]);
  for (const dx of [-150, 150]) {
    c.beginPath();
    c.moveTo(cx + dx, y + 560);
    c.lineTo(cx + dx, y + 700);
    c.stroke();
  }
  c.beginPath();
  c.moveTo(cx, y + 700);
  c.lineTo(cx, y + 830);
  c.stroke();
  c.setLineDash([]);
  c.fillStyle = 'rgba(' + PAINT + ',.26)';
  for (let x = cx - 84; x < cx + 84; x += 21) c.fillRect(x, y + 838, 11, 30);
  for (const sd of [-1, 1]) {
    const x0 = sd < 0 ? 22 : xr - 40;
    c.save();
    c.beginPath();
    c.rect(x0, y + 640, 18, 150);
    c.clip();
    c.strokeStyle = 'rgba(255,76,106,.42)';
    c.lineWidth = 5;
    for (let k = -2; k < 16; k++) {
      c.beginPath();
      c.moveTo(x0 - 4, y + 640 + k * 14);
      c.lineTo(x0 + 22, y + 640 + k * 14 - 14);
      c.stroke();
    }
    c.restore();
    c.save();
    c.translate(sd < 0 ? 51 : xr - 51, y + 596);
    c.rotate(-PI / 2);
    c.font = '700 11px ' + FONT;
    c.textAlign = 'center';
    c.textBaseline = 'middle';
    c.fillStyle = 'rgba(255,113,140,.6)';
    c.fillText(word, 0, 0);
    c.restore();
  }
}
// the district's name, stencilled round the arch at the top of its field
function arcName(c, y, name, col) {
  c.save();
  c.font = '700 30px ' + FONT;
  c.textAlign = 'center';
  c.textBaseline = 'middle';
  c.fillStyle = col;
  const step = 0.105,
    a0 = -PI / 2 - (step * (name.length - 1)) / 2;
  for (let i = 0; i < name.length; i++) {
    const a = a0 + i * step;
    c.save();
    c.translate(320 + Math.cos(a) * 268, y + 300 + Math.sin(a) * 268);
    c.rotate(a + PI / 2);
    c.fillText(name[i], 0, 0);
    c.restore();
  }
  c.restore();
}
function chevrons(c, x, y, ang, n, col) {
  c.save();
  c.translate(x, y);
  c.rotate(ang + PI / 2);
  c.strokeStyle = col;
  c.lineWidth = 4;
  c.lineJoin = 'miter';
  for (let k = 0; k < n; k++) {
    c.beginPath();
    c.moveTo(-11, -k * 20 + 8);
    c.lineTo(0, -k * 20 - 4);
    c.lineTo(11, -k * 20 + 8);
    c.stroke();
  }
  c.restore();
}
function manhole(c, x, y, r) {
  c.fillStyle = 'rgba(0,0,0,.45)';
  c.beginPath();
  c.arc(x, y, r, 0, TAU);
  c.fill();
  c.strokeStyle = 'rgba(160,175,195,.35)';
  c.lineWidth = 1.5;
  c.stroke();
  c.lineWidth = 1;
  for (let k = -2; k <= 2; k++) {
    const w = Math.sqrt(r * r - ((k * r) / 3) * ((k * r) / 3));
    c.beginPath();
    c.moveTo(x - w, y + (k * r) / 3);
    c.lineTo(x + w, y + (k * r) / 3);
    c.stroke();
  }
}
const aL = Math.atan2(-0.925, -0.38),
  aR = Math.atan2(-0.925, 0.38);

export const ART = [
  // Helix Citadel: a double helix down the avenue, rings round the Godhead
  (c, y, p) => {
    asphalt(c, y, 11);
    roadPaint(c, y, 320, 620, 'DROP');
    arcName(c, y, 'HELIX CITADEL', 'rgba(185,160,255,.34)');
    c.lineWidth = 2;
    for (const ph of [0, PI]) {
      c.strokeStyle = 'rgba(185,160,255,' + (ph ? 0.22 : 0.34) + ')';
      c.beginPath();
      for (let yy = y + 560; yy <= y + 830; yy += 6) c.lineTo(320 + Math.sin((yy - y) * 0.045 + ph) * 34, yy);
      c.stroke();
    }
    c.strokeStyle = 'rgba(230,220,255,.16)';
    c.lineWidth = 1.5;
    for (let yy = y + 566; yy <= y + 830; yy += 18) {
      const s = Math.sin((yy - y) * 0.045) * 34;
      c.beginPath();
      c.moveTo(320 + s, yy);
      c.lineTo(320 - s, yy);
      c.stroke();
    }
    c.strokeStyle = 'rgba(185,160,255,.20)';
    c.lineWidth = 1.5;
    for (const r of [44, 66, 92]) {
      c.beginPath();
      c.arc(320, y + 205, r, 0, TAU);
      c.stroke();
    }
    for (let k = 0; k < 12; k++) {
      const a = (k * TAU) / 12;
      c.beginPath();
      c.moveTo(320 + Math.cos(a) * 48, y + 205 + Math.sin(a) * 48);
      c.lineTo(320 + Math.cos(a) * 90, y + 205 + Math.sin(a) * 90);
      c.stroke();
    }
  },
  // The Data Cathedral: board traces running out from the Vault, a rose window round the Altar
  (c, y, p) => {
    asphalt(c, y, 23);
    roadPaint(c, y, 320, 620, 'DROP');
    arcName(c, y, 'DATA CATHEDRAL', 'rgba(67,231,237,.32)');
    c.strokeStyle = 'rgba(67,231,237,.20)';
    c.lineWidth = 1.6;
    c.fillStyle = 'rgba(67,231,237,.30)';
    for (let k = 0; k < 14; k++) {
      const sd = k % 2 ? 1 : -1,
        x0 = 320 + sd * (30 + hash(k * 5.1) * 70),
        y0 = y + 420 + hash(k * 2.3) * 30,
        x1 = x0 + sd * (40 + hash(k * 9.7) * 130),
        y1 = y0 + 60 + hash(k * 1.3) * 200;
      c.beginPath();
      c.moveTo(x0, y0);
      c.lineTo(x0, y0 + (y1 - y0) * 0.4);
      c.lineTo(x1, y0 + (y1 - y0) * 0.4 + Math.abs(x1 - x0));
      c.lineTo(x1, y1 + Math.abs(x1 - x0));
      c.stroke();
      c.beginPath();
      c.arc(x1, y1 + Math.abs(x1 - x0), 3, 0, TAU);
      c.fill();
    }
    c.strokeStyle = 'rgba(216,251,255,.18)';
    c.lineWidth = 1.5;
    for (const r of [40, 62, 86]) {
      c.beginPath();
      c.arc(320, y + 178, r, 0, TAU);
      c.stroke();
    }
    for (let k = 0; k < 8; k++) {
      const a = (k * TAU) / 8 + PI / 8;
      c.beginPath();
      c.arc(320 + Math.cos(a) * 62, y + 178 + Math.sin(a) * 62, 22, 0, TAU);
      c.stroke();
    }
  },
  // Kabuki Aftermarket: a carpet up to the Stage Door, wave scallops under the lanterns
  (c, y, p) => {
    asphalt(c, y, 37);
    roadPaint(c, y, 320, 620, 'DROP');
    arcName(c, y, 'KABUKI AFTERMARKET', 'rgba(255,76,154,.34)');
    {
      const g = c.createLinearGradient(0, y + 400, 0, y + 560);
      g.addColorStop(0, 'rgba(255,76,154,.30)');
      g.addColorStop(1, 'rgba(255,76,154,0)');
      c.fillStyle = g;
      c.fillRect(302, y + 400, 36, 160);
    }
    c.strokeStyle = 'rgba(255,208,230,.15)';
    c.lineWidth = 1.4;
    for (let r = 0; r < 5; r++)
      for (let k = 0; k < 9; k++) {
        const x = 176 + k * 36 + (r % 2) * 18,
          yy = y + 120 + r * 18;
        for (const q of [16, 10]) {
          c.beginPath();
          c.arc(x, yy, q, PI, TAU);
          c.stroke();
        }
      }
    c.strokeStyle = 'rgba(255,76,154,.20)';
    c.lineWidth = 1.5;
    for (const r of [40, 60]) {
      c.beginPath();
      c.arc(320, y + 178, r, 0, TAU);
      c.stroke();
    }
  },
  // The Undercity: on-ramp chevrons, manholes, a hazard band under the grid
  (c, y, p) => {
    asphalt(c, y, 53);
    roadPaint(c, y, 303, 586, 'DRAIN');
    arcName(c, y, 'THE UNDERCITY', 'rgba(246,200,95,.32)');
    chevrons(c, 236, y + 616, aL, 3, 'rgba(246,200,95,.34)');
    chevrons(c, 374, y + 612, aR, 3, 'rgba(246,200,95,.34)');
    manhole(c, 150, y + 760, 13);
    manhole(c, 452, y + 742, 13);
    manhole(c, 330, y + 380, 11);
    c.save();
    c.beginPath();
    c.rect(232, y + 352, 176, 12);
    c.clip();
    c.fillStyle = 'rgba(246,200,95,.30)';
    c.fillRect(232, y + 352, 176, 12);
    c.strokeStyle = 'rgba(0,0,0,.6)';
    c.lineWidth = 6;
    for (let x = 220; x < 420; x += 18) {
      c.beginPath();
      c.moveTo(x, y + 366);
      c.lineTo(x + 14, y + 350);
      c.stroke();
    }
    c.restore();
  }
];

// Flatline's floor: the stock room, with the line that gives it its name
export function paintFlatline(c) {
  defaultPaintGrave(c);
  const y = GY + 430;
  c.save();
  c.strokeStyle = 'rgba(255,76,106,.5)';
  c.lineWidth = 2.5;
  c.lineJoin = 'round';
  c.shadowColor = '#ff4c6a';
  c.shadowBlur = 10;
  c.beginPath();
  c.moveTo(170, y);
  for (const q of [
    [250, 0],
    [262, -10],
    [274, 0],
    [290, 0],
    [300, 26],
    [312, -74],
    [326, 44],
    [338, 0],
    [366, 0],
    [380, -14],
    [396, 0],
    [470, 0]
  ])
    c.lineTo(q[0], y + q[1]);
  c.stroke();
  c.restore();
  c.font = '700 13px ' + FONT;
  c.textAlign = 'center';
  c.fillStyle = 'rgba(255,208,216,.45)';
  c.fillText('NO SIGNAL', 320, y + 60);
}

/* The wardens: billboards, drawn in a 160-unit square centred on 0,0. */
const ink = '#070a12';
export const BOSS_ART = {
  // TOLL REAPER: a hooded toll-keeper, its scythe a striped barrier arm
  reaper(c) {
    c.fillStyle = ink;
    c.beginPath();
    c.moveTo(0, -58);
    c.quadraticCurveTo(34, -44, 30, -8);
    c.lineTo(44, 52);
    c.lineTo(-44, 52);
    c.lineTo(-30, -8);
    c.quadraticCurveTo(-34, -44, 0, -58);
    c.fill();
    c.strokeStyle = '#f6c85f';
    c.lineWidth = 2.5;
    c.stroke();
    c.fillStyle = '#f6c85f';
    c.fillRect(-16, -30, 32, 5);
    c.fillStyle = '#fff3c8';
    c.fillRect(-9, -29, 18, 2.5);
    c.save();
    c.translate(36, 10);
    c.rotate(-0.5);
    c.fillStyle = '#e8e2d0';
    c.fillRect(-4, -62, 8, 100);
    c.fillStyle = '#ff4c6a';
    for (let k = 0; k < 5; k++) c.fillRect(-4, -58 + k * 20, 8, 9);
    c.strokeStyle = ink;
    c.lineWidth = 1.5;
    c.strokeRect(-4, -62, 8, 100);
    c.fillStyle = '#f6c85f';
    c.beginPath();
    c.moveTo(0, -62);
    c.quadraticCurveTo(-40, -66, -52, -36);
    c.quadraticCurveTo(-32, -52, 0, -52);
    c.fill();
    c.stroke();
    c.restore();
    c.fillStyle = 'rgba(246,200,95,.5)';
    c.fillRect(-20, 20, 40, 3);
    c.fillRect(-14, 30, 28, 3);
  },
  // MADAME STATIC: a white mask behind a fan, crossed with interference
  static(c) {
    c.fillStyle = ink;
    c.beginPath();
    c.moveTo(0, 30);
    for (let k = 0; k <= 12; k++) {
      const a = PI + (k * PI) / 12;
      c.lineTo(Math.cos(a) * 66, 30 + Math.sin(a) * 66);
    }
    c.closePath();
    c.fill();
    c.strokeStyle = '#ff4c9a';
    c.lineWidth = 2;
    c.stroke();
    for (let k = 1; k < 12; k++) {
      const a = PI + (k * PI) / 12;
      c.beginPath();
      c.moveTo(0, 30);
      c.lineTo(Math.cos(a) * 66, 30 + Math.sin(a) * 66);
      c.stroke();
    }
    c.fillStyle = '#f4eef2';
    c.beginPath();
    c.ellipse(0, 2, 26, 34, 0, 0, TAU);
    c.fill();
    c.strokeStyle = ink;
    c.lineWidth = 2;
    c.stroke();
    c.fillStyle = '#ff4c9a';
    for (const sx of [-1, 1]) {
      c.beginPath();
      c.moveTo(sx * 5, -6);
      c.quadraticCurveTo(sx * 14, -16, sx * 21, -8);
      c.quadraticCurveTo(sx * 13, -3, sx * 5, -6);
      c.fill();
    }
    c.fillStyle = '#c0283c';
    c.beginPath();
    c.ellipse(0, 18, 7, 3.5, 0, 0, TAU);
    c.fill();
    c.fillStyle = 'rgba(255,76,154,.55)';
    for (let k = 0; k < 9; k++) {
      const w = 10 + hash(k * 3.7) * 40;
      c.fillRect(-30 + hash(k * 1.9) * 30, -28 + k * 7, w, 2);
    }
  },
  // THE CHOIR: three singing masks under one halo
  choir(c) {
    c.strokeStyle = '#43e7ed';
    c.lineWidth = 3;
    c.beginPath();
    c.arc(0, -10, 58, PI * 1.08, PI * 1.92);
    c.stroke();
    c.lineWidth = 1.5;
    c.beginPath();
    c.arc(0, -10, 66, PI * 1.15, PI * 1.85);
    c.stroke();
    for (const q of [
      [-30, 14, 0.9],
      [30, 14, 0.9],
      [0, -16, 1.15]
    ]) {
      c.save();
      c.translate(q[0], q[1]);
      c.scale(q[2], q[2]);
      c.fillStyle = ink;
      c.beginPath();
      c.moveTo(-20, -26);
      c.lineTo(20, -26);
      c.lineTo(22, 8);
      c.quadraticCurveTo(0, 40, -22, 8);
      c.closePath();
      c.fill();
      c.strokeStyle = '#43e7ed';
      c.lineWidth = 2;
      c.stroke();
      c.fillStyle = '#d8fbff';
      for (const sx of [-1, 1]) {
        c.beginPath();
        c.arc(sx * 9, -10, 3, 0, TAU);
        c.fill();
      }
      c.fillStyle = '#43e7ed';
      c.beginPath();
      c.ellipse(0, 10, 6, 9, 0, 0, TAU);
      c.fill();
      c.restore();
    }
  },
  // HELIX / GOD-MACHINE: an eye in a diamond core, a strand either side
  helix(c) {
    c.lineWidth = 2.5;
    for (const sx of [-1, 1])
      for (const ph of [0, PI]) {
        c.strokeStyle = ph ? 'rgba(185,160,255,.55)' : '#b9a0ff';
        c.beginPath();
        for (let yy = -66; yy <= 66; yy += 4) c.lineTo(sx * 52 + Math.sin(yy * 0.09 + ph) * 13, yy);
        c.stroke();
      }
    c.fillStyle = ink;
    c.beginPath();
    c.moveTo(0, -64);
    c.lineTo(38, 0);
    c.lineTo(0, 64);
    c.lineTo(-38, 0);
    c.closePath();
    c.fill();
    c.strokeStyle = '#b9a0ff';
    c.lineWidth = 3;
    c.stroke();
    c.strokeStyle = 'rgba(230,220,255,.6)';
    c.lineWidth = 1.5;
    c.beginPath();
    c.moveTo(0, -46);
    c.lineTo(27, 0);
    c.lineTo(0, 46);
    c.lineTo(-27, 0);
    c.closePath();
    c.stroke();
    c.fillStyle = '#e6dcff';
    c.beginPath();
    c.moveTo(-20, 0);
    c.quadraticCurveTo(0, -17, 20, 0);
    c.quadraticCurveTo(0, 17, -20, 0);
    c.fill();
    c.fillStyle = '#b9a0ff';
    c.beginPath();
    c.arc(0, 0, 8, 0, TAU);
    c.fill();
    c.fillStyle = ink;
    c.beginPath();
    c.arc(0, 0, 3.5, 0, TAU);
    c.fill();
  }
};
