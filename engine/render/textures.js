/* ================= PROCEDURAL TEXTURES ================= */
import {PI, TAU, hash, mkCanvas} from '../core/util.js';

/* ---------- procedural material textures ---------- */
export function texStone() {
  const S = 256,
    cv = mkCanvas(S, S),
    c = cv.getContext('2d');
  c.fillStyle = '#8d8a98';
  c.fillRect(0, 0, S, S);
  const rows = 8,
    rh = S / rows;
  for (let r = 0; r < rows; r++) {
    const off = (r % 2) * 32 + hash(r * 3.3) * 12;
    let x = -off;
    let k = 0;
    while (x < S) {
      const w = 44 + hash(r * 17.1 + k * 5.7) * 40,
        h = hash(r * 9.7 + k * 2.3),
        v = (118 + h * 56) | 0;
      c.fillStyle = 'rgb(' + v + ',' + (v - 2) + ',' + (v + 10) + ')';
      c.fillRect(x + 1.5, r * rh + 1.5, w - 3, rh - 3);
      c.fillStyle = 'rgba(255,255,255,.07)';
      c.fillRect(x + 1.5, r * rh + 1.5, w - 3, 2);
      c.fillStyle = 'rgba(0,0,0,.16)';
      c.fillRect(x + 1.5, r * rh + rh - 4, w - 3, 2.5);
      x += w;
      k++;
    }
  }
  for (let i = 0; i < 2600; i++) {
    const x = hash(i * 1.31) * S,
      y = hash(i * 2.77) * S,
      d = hash(i * 5.1);
    c.fillStyle = d > 0.5 ? 'rgba(255,255,255,.05)' : 'rgba(0,0,0,.09)';
    c.fillRect(x, y, 1 + d * 2, 1 + d * 2);
  }
  for (let i = 0; i < 14; i++) {
    c.strokeStyle = 'rgba(0,0,0,.2)';
    c.lineWidth = 0.8;
    c.beginPath();
    let x = hash(i * 7.7) * S,
      y = hash(i * 3.9) * S;
    c.moveTo(x, y);
    for (let k = 0; k < 5; k++) {
      x += (hash(i + k * 1.7) - 0.5) * 26;
      y += hash(i * 2 + k) * 12;
      c.lineTo(x, y);
    }
    c.stroke();
  }
  return cv;
}
export function texWood() {
  const S = 256,
    cv = mkCanvas(S, S),
    c = cv.getContext('2d');
  c.fillStyle = '#6b4a2c';
  c.fillRect(0, 0, S, S);
  for (let p = 0; p < 4; p++) {
    const y = p * 64,
      v = hash(p * 3.1);
    c.fillStyle = 'rgba(' + ((120 + v * 40) | 0) + ',' + ((82 + v * 26) | 0) + ',' + ((48 + v * 16) | 0) + ',1)';
    c.fillRect(0, y + 1, S, 62);
    for (let k = 0; k < 26; k++) {
      c.strokeStyle = 'rgba(40,22,8,' + (0.12 + hash(p * 11 + k) * 0.2) + ')';
      c.lineWidth = 0.6 + hash(k + p) * 1.2;
      c.beginPath();
      const yy = y + 3 + hash(p * 5 + k * 1.9) * 58;
      c.moveTo(0, yy);
      c.bezierCurveTo(80, yy + (hash(k) - 0.5) * 8, 170, yy + (hash(k + 3) - 0.5) * 8, S, yy);
      c.stroke();
    }
    c.fillStyle = 'rgba(0,0,0,.5)';
    c.fillRect(0, y, S, 2);
  }
  return cv;
}
export function texGround() {
  const S = 256,
    cv = mkCanvas(S, S),
    c = cv.getContext('2d');
  c.fillStyle = '#3c4038';
  c.fillRect(0, 0, S, S);
  for (let i = 0; i < 5200; i++) {
    const x = hash(i * 1.13) * S,
      y = hash(i * 3.71) * S,
      d = hash(i * 7.3);
    c.fillStyle = d > 0.55 ? 'rgba(120,140,110,.10)' : 'rgba(0,0,0,.14)';
    c.fillRect(x, y, 1 + d * 3, 1 + d * 3);
  }
  for (let i = 0; i < 60; i++) {
    const x = hash(i * 9.1) * S,
      y = hash(i * 4.3) * S;
    c.fillStyle = 'rgba(0,0,0,.12)';
    c.beginPath();
    c.ellipse(x, y, 8 + hash(i) * 16, 5 + hash(i + 2) * 10, hash(i) * 3, 0, TAU);
    c.fill();
  }
  return cv;
}
export function texRampBed(col) {
  const cv = mkCanvas(64, 128),
    c = cv.getContext('2d');
  c.fillStyle = '#161824';
  c.fillRect(0, 0, 64, 128);
  c.fillStyle = '#232638';
  c.fillRect(3, 0, 58, 128);
  c.strokeStyle = 'rgba(0,0,0,.6)';
  c.lineWidth = 2;
  for (let y = 0; y < 128; y += 32) {
    c.beginPath();
    c.moveTo(0, y);
    c.lineTo(64, y);
    c.stroke();
  }
  c.strokeStyle = col;
  c.lineWidth = 5;
  c.lineJoin = 'miter';
  c.globalAlpha = 0.9;
  for (let y = 20; y < 160; y += 64) {
    c.beginPath();
    c.moveTo(14, y + 14);
    c.lineTo(32, y - 6);
    c.lineTo(50, y + 14);
    c.stroke();
  }
  return cv;
}
export function texRampGlow(col) {
  const cv = mkCanvas(64, 128),
    c = cv.getContext('2d');
  c.fillStyle = '#000';
  c.fillRect(0, 0, 64, 128);
  c.strokeStyle = col;
  c.lineWidth = 5;
  for (let y = 20; y < 160; y += 64) {
    c.beginPath();
    c.moveTo(14, y + 14);
    c.lineTo(32, y - 6);
    c.lineTo(50, y + 14);
    c.stroke();
  }
  return cv;
}
export function texGlow() {
  const cv = mkCanvas(64, 64),
    c = cv.getContext('2d'),
    g = c.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(0.25, 'rgba(255,255,255,.55)');
  g.addColorStop(0.6, 'rgba(255,255,255,.13)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  c.fillStyle = g;
  c.fillRect(0, 0, 64, 64);
  return cv;
}
/* The sprite every particle is drawn with. A table's theme picks one (fx.particle): a soft dot (the default), a
   heart, a star or a spark, or its own painter (c, size), which draws in white: particles are tinted as they fly. */
export function texParticle(kind) {
  if (!kind || kind === 'dot') return texGlow();
  const S = 64,
    cv = mkCanvas(S, S),
    c = cv.getContext('2d');
  c.fillStyle = '#fff';
  c.strokeStyle = '#fff';
  c.shadowColor = 'rgba(255,255,255,.7)';
  c.shadowBlur = 6;
  if (typeof kind === 'function') kind(c, S);
  else if (kind === 'heart') {
    c.beginPath();
    c.moveTo(32, 54);
    c.bezierCurveTo(4, 34, 8, 10, 22, 10);
    c.bezierCurveTo(28, 10, 32, 15, 32, 20);
    c.bezierCurveTo(32, 15, 36, 10, 42, 10);
    c.bezierCurveTo(56, 10, 60, 34, 32, 54);
    c.fill();
  } else if (kind === 'star') {
    c.beginPath();
    for (let i = 0; i < 10; i++) {
      const a = -Math.PI / 2 + (i * Math.PI) / 5,
        r = i % 2 ? 11 : 26;
      c.lineTo(32 + Math.cos(a) * r, 33 + Math.sin(a) * r);
    }
    c.closePath();
    c.fill();
  } else if (kind === 'spark') {
    c.lineWidth = 5;
    c.lineCap = 'round';
    c.beginPath();
    c.moveTo(32, 6);
    c.lineTo(32, 58);
    c.moveTo(6, 32);
    c.lineTo(58, 32);
    c.stroke();
  } else throw new Error('theme: fx.particle is dot, heart, star, spark or a function, not "' + kind + '"');
  return cv;
}
export function texFlame() {
  const cv = mkCanvas(64, 96),
    c = cv.getContext('2d');
  const g = c.createRadialGradient(32, 66, 2, 32, 60, 30);
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(0.3, 'rgba(255,255,255,.7)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  c.fillStyle = g;
  c.beginPath();
  c.moveTo(32, 2);
  c.bezierCurveTo(46, 30, 60, 48, 54, 70);
  c.bezierCurveTo(50, 90, 14, 90, 10, 70);
  c.bezierCurveTo(4, 48, 22, 32, 32, 2);
  c.fill();
  return cv;
}
export function texSky() {
  // tiny equirect environment for reflections: night sky, a moon, warm torchlight low down
  const cv = mkCanvas(512, 256),
    c = cv.getContext('2d');
  let g = c.createLinearGradient(0, 0, 0, 256);
  g.addColorStop(0, '#27365e');
  g.addColorStop(0.42, '#141a30');
  g.addColorStop(0.5, '#0c0d16');
  g.addColorStop(1, '#050506');
  c.fillStyle = g;
  c.fillRect(0, 0, 512, 256);
  const blob = (x, y, r, col) => {
    const q = c.createRadialGradient(x, y, 0, x, y, r);
    q.addColorStop(0, col);
    q.addColorStop(1, 'rgba(0,0,0,0)');
    c.fillStyle = q;
    c.fillRect(x - r, y - r, r * 2, r * 2);
  };
  c.globalCompositeOperation = 'lighter';
  blob(150, 48, 58, 'rgba(235,245,255,1)');
  blob(150, 48, 120, 'rgba(120,150,220,.5)');
  blob(60, 118, 50, 'rgba(255,150,60,.9)');
  blob(330, 122, 44, 'rgba(255,120,50,.8)');
  blob(450, 112, 56, 'rgba(255,170,80,.7)');
  blob(256, 20, 90, 'rgba(80,110,190,.5)');
  blob(400, 60, 40, 'rgba(150,255,210,.35)');
  return cv;
}
export function texBall() {
  // faint engraved bands so the roll reads on a mirror ball
  const cv = mkCanvas(256, 128),
    c = cv.getContext('2d');
  c.fillStyle = '#fff';
  c.fillRect(0, 0, 256, 128);
  c.fillStyle = '#b9b9b9';
  c.fillRect(0, 58, 256, 3);
  c.fillRect(0, 67, 256, 3);
  c.fillStyle = '#9a9a9a';
  for (let k = 0; k < 8; k++) {
    c.save();
    c.translate(16 + k * 32, 64);
    c.rotate(PI / 4);
    c.fillRect(-2.6, -2.6, 5.2, 5.2);
    c.restore();
  }
  for (let k = 0; k < 6; k++) {
    c.fillStyle = '#c4c4c4';
    c.beginPath();
    c.arc(21 + k * 42.6, 22, 5, 0, TAU);
    c.fill();
    c.beginPath();
    c.arc(42 + k * 42.6, 106, 5, 0, TAU);
    c.fill();
  }
  return cv;
}
