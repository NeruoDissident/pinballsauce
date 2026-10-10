import {GY, H, HW, PAL, PI, R, T, TAU, TY, W, hash, lerp, path, runeBed, sigil, starPath} from '../../../engine/api.js';

export const GB_PAL = [
  {a: '#1d1124', b: '#110a17', acc: '#c0283c', acc2: '#d9a441', glow: '#ff4a5a', stone: '#3a2c44'},
  {a: '#10201b', b: '#0a1411', acc: '#58b89a', acc2: '#cfeef2', glow: '#8fe8d0', stone: '#2c4038'},
  {a: '#16203a', b: '#0c121f', acc: '#e0a040', acc2: '#9cc0ea', glow: '#ffc060', stone: '#2f3a52'},
  {a: '#1b1710', b: '#080705', acc: '#7dffb0', acc2: '#cfe8c0', glow: '#7dffb0', stone: '#3a3222'},
  {a: '#1c1e12', b: '#090a06', acc: '#c8e060', acc2: '#e6e0c4', glow: '#d8f070', stone: '#3a3e2a'},
  {a: '#141a26', b: '#070a12', acc: '#8fb0d8', acc2: '#dfe8f2', glow: '#cfe6ff', stone: '#3a4252'},
  {a: '#24140a', b: '#0d0704', acc: '#ff8a4a', acc2: '#ffd24a', glow: '#ffb050', stone: '#4a3222'}
];
/* ---------- static art ---------- */
export function tree(c, x, y, h, seed, col) {
  c.strokeStyle = col;
  c.lineCap = 'round';
  const br = (x, y, a, l, w, d) => {
    const x2 = x + Math.cos(a) * l,
      y2 = y + Math.sin(a) * l;
    c.lineWidth = w;
    c.beginPath();
    c.moveTo(x, y);
    c.lineTo(x2, y2);
    c.stroke();
    if (d > 0) {
      const k = hash(seed + d * 7.3 + l);
      br(x2, y2, a - 0.35 - k * 0.4, l * 0.68, w * 0.62, d - 1);
      br(x2, y2, a + 0.3 + k * 0.45, l * 0.7, w * 0.62, d - 1);
    }
  };
  br(x, y, -PI / 2 + (hash(seed) - 0.5) * 0.3, h * 0.42, h * 0.07, 4);
}
export function pine(c, x, y, h, col) {
  c.fillStyle = col;
  for (let k = 0; k < 4; k++) {
    const w = h * (0.42 - k * 0.08),
      yy = y - h * (0.12 + k * 0.2);
    c.beginPath();
    c.moveTo(x, yy - h * 0.3);
    c.lineTo(x + w, yy);
    c.lineTo(x - w, yy);
    c.closePath();
    c.fill();
  }
  c.fillRect(x - h * 0.035, y - h * 0.14, h * 0.07, h * 0.14);
}
export function tomb(c, x, y, s, kind, col) {
  c.fillStyle = 'rgba(0,0,0,.4)';
  c.beginPath();
  c.ellipse(x + 2, y + 2, s * 0.75, s * 0.2, 0, 0, TAU);
  c.fill();
  c.fillStyle = col;
  c.beginPath();
  if (kind === 0) {
    c.moveTo(x - s * 0.5, y);
    c.lineTo(x - s * 0.5, y - s * 0.7);
    c.arc(x, y - s * 0.7, s * 0.5, PI, 0);
    c.lineTo(x + s * 0.5, y);
  } else if (kind === 1) {
    c.rect(x - s * 0.14, y - s * 1.3, s * 0.28, s * 1.3);
    c.rect(x - s * 0.45, y - s * 0.95, s * 0.9, s * 0.24);
  } else {
    c.moveTo(x - s * 0.45, y);
    c.lineTo(x - s * 0.45, y - s * 0.8);
    c.lineTo(x, y - s * 1.15);
    c.lineTo(x + s * 0.45, y - s * 0.8);
    c.lineTo(x + s * 0.45, y);
  }
  c.closePath();
  c.fill();
  c.strokeStyle = 'rgba(200,215,250,.3)';
  c.lineWidth = 1;
  c.stroke();
}
export function rose(c, x, y, r, cols) {
  c.save();
  c.translate(x, y);
  c.fillStyle = '#07070b';
  c.beginPath();
  c.arc(0, 0, r + 5, 0, TAU);
  c.fill();
  for (let k = 0; k < 12; k++) {
    const a = (k * TAU) / 12;
    c.fillStyle = cols[k % cols.length];
    c.globalAlpha = 0.55;
    c.beginPath();
    c.moveTo(Math.cos(a) * r * 0.34, Math.sin(a) * r * 0.34);
    c.arc(0, 0, r, a - 0.2, a + 0.2);
    c.closePath();
    c.fill();
    c.beginPath();
    c.arc(Math.cos(a + PI / 12) * r * 0.78, Math.sin(a + PI / 12) * r * 0.78, r * 0.1, 0, TAU);
    c.globalAlpha = 0.7;
    c.fill();
  }
  c.globalAlpha = 0.8;
  c.fillStyle = cols[0];
  c.beginPath();
  c.arc(0, 0, r * 0.26, 0, TAU);
  c.fill();
  c.globalAlpha = 1;
  c.strokeStyle = '#07070b';
  c.lineWidth = 2.4;
  for (let k = 0; k < 12; k++) {
    const a = (k * TAU) / 12 + PI / 12;
    c.beginPath();
    c.moveTo(Math.cos(a) * r * 0.26, Math.sin(a) * r * 0.26);
    c.lineTo(Math.cos(a) * r, Math.sin(a) * r);
    c.stroke();
  }
  c.beginPath();
  c.arc(0, 0, r * 0.62, 0, TAU);
  c.stroke();
  c.lineWidth = 4;
  c.strokeStyle = '#2a2a36';
  c.beginPath();
  c.arc(0, 0, r + 2, 0, TAU);
  c.stroke();
  c.restore();
}
export function lancet(c, x, y, w, h, rot, cols) {
  c.save();
  c.translate(x, y);
  c.rotate(rot);
  const p = () => {
    c.beginPath();
    c.moveTo(-w / 2, h / 2);
    c.lineTo(-w / 2, -h * 0.2);
    c.quadraticCurveTo(-w / 2, -h * 0.45, 0, -h / 2);
    c.quadraticCurveTo(w / 2, -h * 0.45, w / 2, -h * 0.2);
    c.lineTo(w / 2, h / 2);
    c.closePath();
  };
  p();
  c.fillStyle = '#07070b';
  c.fill();
  c.save();
  p();
  c.clip();
  for (let k = 0; k < 7; k++) {
    c.fillStyle = cols[k % cols.length];
    c.globalAlpha = 0.5 + 0.2 * hash(k + x);
    c.fillRect(-w / 2, -h / 2 + (k * h) / 7, w, h / 7 - 1.5);
  }
  c.globalAlpha = 1;
  c.strokeStyle = '#07070b';
  c.lineWidth = 1.6;
  c.beginPath();
  c.moveTo(0, -h / 2);
  c.lineTo(0, h / 2);
  c.stroke();
  c.restore();
  p();
  c.strokeStyle = '#3a3344';
  c.lineWidth = 3;
  c.stroke();
  c.restore();
}
export function voussoirs(c, i) {
  const yA = TY[i] + 300;
  c.save();
  c.beginPath();
  c.arc(320, yA, 334, PI, TAU);
  c.arc(320, yA, 301, TAU, PI, true);
  c.closePath();
  const g = c.createLinearGradient(0, yA - 334, 0, yA);
  g.addColorStop(0, '#2b2a3c');
  g.addColorStop(1, '#15141f');
  c.fillStyle = g;
  c.fill();
  c.clip();
  c.strokeStyle = '#05050a';
  c.lineWidth = 2;
  for (let k = 0; k <= 30; k++) {
    const a = PI + (k * PI) / 30;
    c.beginPath();
    c.moveTo(320 + Math.cos(a) * 300, yA + Math.sin(a) * 300);
    c.lineTo(320 + Math.cos(a) * 336, yA + Math.sin(a) * 336);
    c.stroke();
  }
  c.strokeStyle = 'rgba(200,210,245,.14)';
  c.lineWidth = 1;
  for (let k = 0; k < 30; k++) {
    const a = PI + ((k + 0.08) * PI) / 30;
    c.beginPath();
    c.moveTo(320 + Math.cos(a) * 302, yA + Math.sin(a) * 302);
    c.lineTo(320 + Math.cos(a) * 333, yA + Math.sin(a) * 333);
    c.stroke();
  }
  c.restore();
  c.strokeStyle = '#05050a';
  c.lineWidth = 3;
  c.beginPath();
  c.arc(320, yA, 334, PI, TAU);
  c.stroke();
  // keystone
  const p = PAL[i];
  c.fillStyle = '#34334a';
  path(
    c,
    [
      [304, yA - 338],
      [336, yA - 338],
      [331, yA - 300],
      [309, yA - 300]
    ],
    1
  );
  c.fill();
  c.strokeStyle = '#05050a';
  c.lineWidth = 2;
  c.stroke();
  c.fillStyle = p.acc;
  c.globalAlpha = 0.8;
  starPath(c, 320, yA - 319, 8, 3.2, 4, -PI / 2);
  c.fill();
  c.globalAlpha = 1;
}
export function chapel(c, x, y) {
  c.fillStyle = '#0c1424';
  path(
    c,
    [
      [x - 46, y + 70],
      [x - 46, y - 10],
      [x - 30, y - 30],
      [x - 30, y - 64],
      [x - 22, y - 92],
      [x - 14, y - 64],
      [x - 14, y - 34],
      [x, y - 58],
      [x + 14, y - 34],
      [x + 14, y - 64],
      [x + 22, y - 92],
      [x + 30, y - 64],
      [x + 30, y - 30],
      [x + 46, y - 10],
      [x + 46, y + 70]
    ],
    1
  );
  c.fill();
  c.strokeStyle = 'rgba(150,180,230,.25)';
  c.lineWidth = 1.2;
  c.stroke();
}
export function lantern(c, x, y, col) {
  const g = c.createRadialGradient(x, y, 1, x, y, 26);
  g.addColorStop(0, col + 'cc');
  g.addColorStop(0.3, col + '44');
  g.addColorStop(1, col + '00');
  c.fillStyle = g;
  c.fillRect(x - 26, y - 26, 52, 52);
  c.fillStyle = '#fff3d0';
  c.beginPath();
  c.arc(x, y, 2.2, 0, TAU);
  c.fill();
  c.strokeStyle = '#05050a';
  c.lineWidth = 1.4;
  c.strokeRect(x - 3.5, y - 4.5, 7, 9);
}
export function fence(c, x0, y0, x1, y1, col) {
  const n = Math.round(Math.hypot(x1 - x0, y1 - y0) / 9);
  c.strokeStyle = col;
  c.lineWidth = 1.3;
  c.beginPath();
  c.moveTo(x0, y0 - 4);
  c.lineTo(x1, y1 - 4);
  c.moveTo(x0, y0 - 11);
  c.lineTo(x1, y1 - 11);
  c.stroke();
  for (let k = 0; k <= n; k++) {
    const x = lerp(x0, x1, k / n),
      y = lerp(y0, y1, k / n);
    c.beginPath();
    c.moveTo(x, y);
    c.lineTo(x, y - 16);
    c.lineTo(x - 1.6, y - 13);
    c.moveTo(x, y - 16);
    c.lineTo(x + 1.6, y - 13);
    c.stroke();
  }
}
export function rays(c, x, y, ang, len, w, col) {
  c.save();
  c.translate(x, y);
  c.rotate(ang);
  const g = c.createLinearGradient(0, 0, 0, len);
  g.addColorStop(0, col + '40');
  g.addColorStop(1, col + '00');
  c.fillStyle = g;
  c.beginPath();
  c.moveTo(-w / 2, 0);
  c.lineTo(w / 2, 0);
  c.lineTo(w * 1.6, len);
  c.lineTo(-w * 1.6, len);
  c.closePath();
  c.fill();
  c.restore();
}
export const ART = [
  function keep(c, y, p) {
    // checkered hall, carpet, dais, windows
    c.save();
    c.beginPath();
    c.rect(110, y + 330, 420, 600);
    c.clip();
    for (let r = -2; r < 22; r++)
      for (let k = -1; k < 16; k++) {
        if ((r + k) % 2) continue;
        const x = 110 + k * 38 + (r % 2) * 0,
          yy = y + 330 + r * 38;
        c.fillStyle = 'rgba(150,30,50,.075)';
        c.beginPath();
        c.moveTo(x, yy - 19);
        c.lineTo(x + 19, yy);
        c.lineTo(x, yy + 19);
        c.lineTo(x - 19, yy);
        c.closePath();
        c.fill();
      }
    c.restore();
    let g = c.createLinearGradient(0, y + 230, 0, y + 910);
    g.addColorStop(0, 'rgba(150,24,44,.5)');
    g.addColorStop(1, 'rgba(110,16,34,.16)');
    c.fillStyle = g;
    path(
      c,
      [
        [300, y + 240],
        [340, y + 240],
        [366, y + 910],
        [274, y + 910]
      ],
      1
    );
    c.fill();
    c.strokeStyle = 'rgba(217,164,65,.35)';
    c.lineWidth = 2;
    path(c, [
      [304, y + 240],
      [280, y + 910]
    ]);
    c.stroke();
    path(c, [
      [336, y + 240],
      [360, y + 910]
    ]);
    c.stroke();
    for (let k = 0; k < 3; k++) {
      c.fillStyle = ['#2a1c30', '#33223a', '#3d2a46'][k];
      c.beginPath();
      c.arc(320, y + 212, 84 - k * 16, 0, TAU);
      c.fill();
      c.strokeStyle = 'rgba(217,164,65,.3)';
      c.lineWidth = 1.5;
      c.stroke();
    }
    const cols = ['#c0283c', '#d9a441', '#3a5fb0', '#7a2a8a'];
    lancet(c, 112, y + 212, 30, 84, -0.5, cols);
    lancet(c, 164, y + 128, 30, 84, -0.9, cols);
    lancet(c, 528, y + 212, 30, 84, 0.5, cols);
    lancet(c, 476, y + 128, 30, 84, 0.9, cols);
    rays(c, 112, y + 212, -0.5, 330, 30, '#c0283c');
    rays(c, 164, y + 128, -0.9, 300, 30, '#d9a441');
    rays(c, 528, y + 212, 0.5, 330, 30, '#3a5fb0');
    rays(c, 476, y + 128, 0.9, 300, 30, '#d9a441');
    // throne
    c.fillStyle = '#120b18';
    path(
      c,
      [
        [296, y + 236],
        [296, y + 176],
        [304, y + 150],
        [312, y + 170],
        [320, y + 140],
        [328, y + 170],
        [336, y + 150],
        [344, y + 176],
        [344, y + 236]
      ],
      1
    );
    c.fill();
    c.strokeStyle = 'rgba(217,164,65,.55)';
    c.lineWidth = 1.5;
    c.stroke();
    // colonnade
    for (const x of [92, 548])
      for (let k = 0; k < 4; k++) {
        const yy = y + 330 + k * 58;
        const g2 = c.createLinearGradient(x - 9, 0, x + 9, 0);
        g2.addColorStop(0, '#1a1220');
        g2.addColorStop(0.5, '#4a3a58');
        g2.addColorStop(1, '#1a1220');
        c.fillStyle = g2;
        c.beginPath();
        c.arc(x, yy, 9, 0, TAU);
        c.fill();
        c.strokeStyle = 'rgba(217,164,65,.35)';
        c.lineWidth = 1;
        c.stroke();
      }
    for (const q of [
      [236, 372],
      [404, 372],
      [150, 470],
      [490, 470],
      [214, 742],
      [426, 742]
    ])
      lantern(c, q[0], y + q[1], '#ff5a3c');
    c.strokeStyle = 'rgba(217,164,65,.22)';
    c.lineWidth = 1.2;
    for (let k = 0; k < 2; k++) {
      c.beginPath();
      c.arc(320, y + 650, 104 + k * 8, 0, TAU);
      c.stroke();
    }
    sigil(c, 320, y + 650, 82, p.acc, 0);
    runeBed(c, 320, y + 650);
    c.fillStyle = 'rgba(0,0,0,.4)';
    for (const x of [150, 490])
      for (let k = 0; k < 3; k++) {
        c.fillRect(x - 7, y + 560 + k * 70, 14, 40);
      }
    for (const x of [150, 490])
      for (let k = 0; k < 3; k++) {
        c.fillStyle = 'rgba(192,40,60,.22)';
        path(
          c,
          [
            [x - 9, y + 556 + k * 70],
            [x + 9, y + 556 + k * 70],
            [x + 9, y + 598 + k * 70],
            [x, y + 590 + k * 70],
            [x - 9, y + 598 + k * 70]
          ],
          1
        );
        c.fill();
      }
  },
  function wilds(c, y, p) {
    // moon, ruined gate, forest
    let g = c.createRadialGradient(320, y + 178, 10, 320, y + 178, 230);
    g.addColorStop(0, 'rgba(190,235,240,.28)');
    g.addColorStop(1, 'rgba(190,235,240,0)');
    c.fillStyle = g;
    c.fillRect(20, y, 600, 460);
    g = c.createRadialGradient(300, y + 160, 6, 320, y + 178, 80);
    g.addColorStop(0, '#f2fbfb');
    g.addColorStop(1, '#93b9bf');
    c.fillStyle = g;
    c.beginPath();
    c.arc(320, y + 178, 78, 0, TAU);
    c.fill();
    c.fillStyle = 'rgba(60,95,105,.3)';
    [
      [296, 150, 15],
      [346, 206, 20],
      [330, 138, 8],
      [286, 208, 10],
      [362, 160, 7]
    ].forEach(q => {
      c.beginPath();
      c.arc(q[0], y + q[1], q[2], 0, TAU);
      c.fill();
    });
    c.fillStyle = '#0b1512';
    c.strokeStyle = '#0b1512';
    [
      [226, 96, 150],
      [414, 96, 150]
    ].forEach(q => {
      c.fillRect(q[0] - 13, y + q[1], 26, q[2]);
      c.fillRect(q[0] - 18, y + q[1] + q[2] - 10, 36, 12);
      c.fillRect(q[0] - 17, y + q[1] - 8, 34, 10);
    });
    c.lineWidth = 16;
    c.beginPath();
    c.arc(320, y + 100, 94, PI, PI + 1.15);
    c.stroke();
    c.beginPath();
    c.arc(320, y + 100, 94, TAU - 0.8, TAU);
    c.stroke();
    const dk = '#07100d',
      md = '#0c1a15';
    [
      [92, 150, 70],
      [132, 100, 56],
      [548, 150, 70],
      [508, 100, 56],
      [92, 640, 80],
      [128, 585, 60],
      [548, 640, 80],
      [512, 585, 60],
      [96, 800, 64],
      [544, 800, 64],
      [180, 208, 50],
      [460, 208, 50]
    ].forEach((q, k) => pine(c, q[0], y + q[1], q[2], k % 2 ? dk : md));
    tree(c, 170, y + 560, 70, 3, '#0a1512');
    tree(c, 470, y + 560, 70, 8, '#0a1512');
    // moonlit stream
    c.lineCap = 'round';
    c.strokeStyle = 'rgba(90,200,200,.10)';
    c.lineWidth = 30;
    c.beginPath();
    c.moveTo(20, y + 520);
    c.bezierCurveTo(160, y + 600, 220, y + 740, 330, y + 760);
    c.bezierCurveTo(440, y + 780, 520, y + 700, 620, y + 730);
    c.stroke();
    c.strokeStyle = 'rgba(190,245,245,.16)';
    c.lineWidth = 1.4;
    c.setLineDash([14, 22]);
    for (let k = -1; k < 2; k++) {
      c.beginPath();
      c.moveTo(20, y + 520 + k * 8);
      c.bezierCurveTo(160, y + 600 + k * 8, 220, y + 740 + k * 8, 330, y + 760 + k * 8);
      c.bezierCurveTo(440, y + 780 + k * 8, 520, y + 700 + k * 8, 620, y + 730 + k * 8);
      c.stroke();
    }
    c.setLineDash([]);
    // mushroom ring and standing stones
    for (let k = 0; k < 14; k++) {
      const a = (k * TAU) / 14,
        x = 320 + Math.cos(a) * 124,
        yy = y + 650 + Math.sin(a) * 124;
      c.fillStyle = 'rgba(230,90,90,.45)';
      c.beginPath();
      c.arc(x, yy, 4.2, PI, TAU);
      c.fill();
      c.fillStyle = 'rgba(240,230,210,.4)';
      c.fillRect(x - 1.2, yy, 2.4, 4);
    }
    for (const q of [
      [206, 236, 26],
      [434, 236, 26],
      [262, 330, 18],
      [378, 330, 18],
      [320, 396, 16]
    ]) {
      c.fillStyle = '#1b2e28';
      path(
        c,
        [
          [q[0] - q[2] * 0.4, y + q[1]],
          [q[0] - q[2] * 0.3, y + q[1] - q[2]],
          [q[0] + q[2] * 0.2, y + q[1] - q[2] * 1.15],
          [q[0] + q[2] * 0.42, y + q[1]]
        ],
        1
      );
      c.fill();
      c.strokeStyle = 'rgba(140,232,208,.5)';
      c.lineWidth = 1.1;
      c.beginPath();
      c.moveTo(q[0] - 3, y + q[1] - q[2] * 0.3);
      c.lineTo(q[0] + 1, y + q[1] - q[2] * 0.8);
      c.lineTo(q[0] + 4, y + q[1] - q[2] * 0.45);
      c.stroke();
    }
    for (const q of [
      [170, 470],
      [470, 470],
      [110, 720],
      [530, 720],
      [228, 570],
      [406, 560]
    ])
      lantern(c, q[0], y + q[1], '#7fe0c0');
    sigil(c, 320, y + 650, 82, p.acc, 1);
    runeBed(c, 320, y + 650);
    c.fillStyle = 'rgba(200,235,240,.08)';
    for (let k = 0; k < 9; k++) {
      const t = k / 8,
        x = lerp(210, 430, t),
        yy = y + 560 + Math.sin(t * PI) * -30;
      c.beginPath();
      c.ellipse(x, yy, 5, 7, 0, 0, TAU);
      c.fill();
      for (let j = -1; j < 2; j++) {
        c.beginPath();
        c.arc(x + j * 5, yy - 10, 2.2, 0, TAU);
        c.fill();
      }
    }
    c.fillStyle = '#0b1512';
    [
      [206, 300, 20, 2],
      [434, 300, 20, 2],
      [282, 390, 14, 0],
      [358, 390, 14, 0]
    ].forEach(q => tomb(c, q[0], y + q[1], q[2], q[3], '#132420'));
    c.fillStyle = 'rgba(8,34,38,.5)';
    c.beginPath();
    c.arc(320, y + 178, 80, 0, TAU);
    c.fill(); // the painted moon would bloom out the stones standing on it
  },
  function hollow(c, y, p) {
    // graveyard, road, chapel window
    c.strokeStyle = 'rgba(180,160,120,.07)';
    c.lineWidth = 74;
    c.lineCap = 'round';
    c.beginPath();
    c.moveTo(303, y + 920);
    c.bezierCurveTo(250, y + 760, 360, y + 640, 303, y + 520);
    c.stroke();
    c.strokeStyle = 'rgba(0,0,0,.2)';
    c.lineWidth = 1.5;
    c.setLineDash([9, 7]);
    c.beginPath();
    c.moveTo(303, y + 920);
    c.bezierCurveTo(250, y + 760, 360, y + 640, 303, y + 520);
    c.stroke();
    c.setLineDash([]);
    let g = c.createRadialGradient(320, y + 250, 10, 320, y + 250, 200);
    g.addColorStop(0, 'rgba(150,190,240,.14)');
    g.addColorStop(1, 'rgba(150,190,240,0)');
    c.fillStyle = g;
    c.fillRect(20, y, 600, 500);
    chapel(c, 478, y + 286);
    // tavern roof and windows
    c.fillStyle = '#161019';
    path(
      c,
      [
        [258, y + 410],
        [303, y + 372],
        [348, y + 410],
        [340, y + 410],
        [340, y + 400],
        [266, y + 400],
        [266, y + 410]
      ],
      1
    );
    c.fill();
    c.strokeStyle = 'rgba(255,190,110,.4)';
    c.lineWidth = 1.2;
    c.stroke();
    fence(c, 150, y + 212, 238, y + 196, 'rgba(150,175,220,.32)');
    fence(c, 402, y + 196, 490, y + 212, 'rgba(150,175,220,.32)');
    fence(c, 176, y + 404, 236, y + 418, 'rgba(150,175,220,.28)');
    for (const q of [
      [186, 772],
      [420, 772],
      [214, 470],
      [392, 470],
      [120, 560],
      [486, 560]
    ])
      lantern(c, q[0], y + q[1], '#ffb050');
    const tc = '#3a4a6c';
    [
      [188, 262, 22, 0],
      [214, 344, 18, 1],
      [452, 262, 22, 2],
      [428, 344, 18, 1],
      [250, 392, 16, 0],
      [392, 392, 16, 2],
      [150, 318, 18, 2],
      [492, 318, 18, 0],
      [320, 372, 14, 1],
      [122, 236, 16, 1],
      [520, 236, 16, 0]
    ].forEach(q => tomb(c, q[0], y + q[1], q[2], q[3], tc));
    tree(c, 118, y + 640, 84, 5, '#0b1220');
    tree(c, 488, y + 640, 84, 11, '#0b1220');
    tree(c, 150, y + 190, 60, 2, '#0b1220');
    tree(c, 492, y + 190, 60, 6, '#0b1220');
    rose(c, 474, y + 352, 34, ['#e0a040', '#c0283c', '#3a6fc0', '#7a3a9a']);
    [
      [104, 340, 46],
      [138, 372, 38],
      [86, 372, 34]
    ].forEach((q, k) => pine(c, q[0], y + q[1], q[2], k % 2 ? '#0a1220' : '#0e182a'));
    sigil(c, 303, y + 650, 82, p.acc2, 2);
    runeBed(c, 303, y + 650);
    g = c.createRadialGradient(303, y + 450, 4, 303, y + 450, 90);
    g.addColorStop(0, 'rgba(255,170,70,.22)');
    g.addColorStop(1, 'rgba(255,170,70,0)');
    c.fillStyle = g;
    c.fillRect(203, y + 360, 200, 190);
  }
];
export function drawGrave(c) {
  const y = GY,
    p = PAL[3],
    shape = T.coffin.concat([
      [420, y + 663],
      [366, HW + 70],
      [274, HW + 70],
      [220, y + 663]
    ]);
  // the earth between the Hollow and the coffin
  c.save();
  c.beginPath();
  c.rect(0, H + 6, W, HW - H + 200);
  c.clip();
  let g = c.createLinearGradient(0, H, 0, HW);
  g.addColorStop(0, '#17110b');
  g.addColorStop(0.25, '#0d0a07');
  g.addColorStop(1, '#040404');
  c.fillStyle = g;
  c.fillRect(0, H, W, HW - H + 200);
  for (let k = 0; k < 220; k++) {
    const x = hash(k * 3.1) * W,
      yy = H + 14 + hash(k * 7.7) * (HW - H + 40),
      r = 2 + hash(k * 1.3) * 8;
    c.fillStyle =
      'rgba(' +
      ((70 + hash(k) * 40) | 0) +
      ',' +
      ((58 + hash(k + 1) * 30) | 0) +
      ',' +
      ((44 + hash(k + 2) * 20) | 0) +
      ',' +
      (0.18 + hash(k + 3) * 0.3) +
      ')';
    c.beginPath();
    c.ellipse(x, yy, r * 1.4, r, hash(k) * 3, 0, TAU);
    c.fill();
  }
  c.lineCap = 'round';
  for (let k = 0; k < 11; k++) {
    let x = 30 + k * 58 + hash(k) * 30,
      yy = H + 6;
    const len = 90 + hash(k * 2.2) * 230;
    c.strokeStyle = 'rgba(96,72,44,.55)';
    for (let q = 0; q < len; q += 12) {
      const nx = x + Math.sin(q * 0.07 + k) * 9 + (hash(k + q) - 0.5) * 8;
      c.lineWidth = Math.max(0.8, 5 * (1 - q / len));
      c.beginPath();
      c.moveTo(x, yy + q);
      c.lineTo(nx, yy + q + 12);
      c.stroke();
      x = nx;
    }
  }
  c.strokeStyle = 'rgba(214,206,180,.4)';
  c.fillStyle = 'rgba(214,206,180,.4)';
  for (let k = 0; k < 16; k++) {
    const x = 30 + hash(k * 5.3) * 580,
      yy = H + 40 + hash(k * 9.1) * (HW - H - 60),
      a = hash(k * 2.7) * PI,
      l = 9 + hash(k) * 8;
    if (x > 70 && x < 570 && yy > y + 10 && yy < y + 690) continue;
    c.lineWidth = 3;
    c.beginPath();
    c.moveTo(x - Math.cos(a) * l, yy - Math.sin(a) * l);
    c.lineTo(x + Math.cos(a) * l, yy + Math.sin(a) * l);
    c.stroke();
    for (const sg of [-1, 1]) {
      c.beginPath();
      c.arc(x + sg * Math.cos(a) * l, yy + sg * Math.sin(a) * l, 3, 0, TAU);
      c.fill();
    }
  }
  c.restore();
  // the coffin
  c.lineJoin = 'round';
  path(c, shape, 1);
  c.strokeStyle = '#120b06';
  c.lineWidth = 40;
  c.stroke();
  c.strokeStyle = '#3a2616';
  c.lineWidth = 30;
  c.stroke();
  c.strokeStyle = '#553920';
  c.lineWidth = 24;
  c.stroke();
  c.save();
  path(c, shape, 1);
  c.clip();
  g = c.createLinearGradient(0, y, 0, y + 700);
  g.addColorStop(0, p.a);
  g.addColorStop(1, p.b);
  c.fillStyle = g;
  c.fillRect(0, y - 10, W, 900);
  for (let x = 40; x < 620; x += 44) {
    c.strokeStyle = 'rgba(0,0,0,.5)';
    c.lineWidth = 2;
    c.beginPath();
    c.moveTo(x, y);
    c.lineTo(x + (hash(x) - 0.5) * 6, y + 800);
    c.stroke();
    c.strokeStyle = 'rgba(255,220,160,.035)';
    c.lineWidth = 1;
    for (let q = 1; q < 4; q++) {
      c.beginPath();
      c.moveTo(x + q * 11, y);
      c.lineTo(x + q * 11 + (hash(x + q) - 0.5) * 10, y + 800);
      c.stroke();
    }
    c.fillStyle = 'rgba(0,0,0,.35)';
    c.beginPath();
    c.ellipse(x + 22, y + 80 + hash(x * 1.7) * 560, 5, 9, 0, 0, TAU);
    c.fill();
  }
  g = c.createRadialGradient(320, y + 150, 10, 320, y + 150, 340);
  g.addColorStop(0, 'rgba(234,255,208,.26)');
  g.addColorStop(1, 'rgba(234,255,208,0)');
  c.fillStyle = g;
  c.fillRect(0, y, W, 560);
  c.fillStyle = 'rgba(125,255,176,.06)';
  c.strokeStyle = 'rgba(125,255,176,.2)';
  c.lineWidth = 1.5;
  path(
    c,
    [
      [312, y + 300],
      [328, y + 300],
      [328, y + 356],
      [372, y + 356],
      [372, y + 372],
      [328, y + 372],
      [328, y + 560],
      [312, y + 560],
      [312, y + 372],
      [268, y + 372],
      [268, y + 356],
      [312, y + 356]
    ],
    1
  );
  c.fill();
  c.stroke();
  c.strokeStyle = 'rgba(0,0,0,.5)';
  c.lineWidth = 2;
  for (const sx of [-1, 1])
    for (let k = 0; k < 4; k++) {
      c.beginPath();
      c.moveTo(320 + sx * (150 + k * 9), y + 380);
      c.lineTo(320 + sx * (128 + k * 9), y + 470);
      c.stroke();
    }
  c.restore();
  path(c, T.coffin);
  c.strokeStyle = '#030307';
  c.lineWidth = 7;
  c.stroke();
  c.strokeStyle = 'rgba(160,230,180,.38)';
  c.lineWidth = 1.6;
  c.stroke();
  for (const sd of [-1, 1]) {
    path(c, [
      [320 + sd * 100, y + 663],
      [320 + sd * 46, HW + 70]
    ]);
    c.strokeStyle = '#030307';
    c.lineWidth = 6;
    c.stroke();
    c.strokeStyle = 'rgba(160,230,180,.25)';
    c.lineWidth = 1.4;
    c.stroke();
  }
  c.textAlign = 'center';
  c.textBaseline = 'middle';
  c.font = '600 30px ' + R.fontD;
  for (const x of [96, 544]) {
    c.fillStyle = '#000';
    c.fillText('The Grave', x + 1, y + 62);
    c.fillStyle = 'rgba(157,255,200,.45)';
    c.fillText('The Grave', x, y + 60);
  }
}
/* ---------- sprites ---------- */
export function eyes(c, x, y, dx, r, col) {
  c.fillStyle = col;
  c.beginPath();
  c.arc(x - dx, y, r, 0, TAU);
  c.arc(x + dx, y, r, 0, TAU);
  c.fill();
  c.fillStyle = '#fff';
  c.globalAlpha = 0.7;
  c.beginPath();
  c.arc(x - dx, y, r * 0.4, 0, TAU);
  c.arc(x + dx, y, r * 0.4, 0, TAU);
  c.fill();
  c.globalAlpha = 1;
}
export const EDRAW = {
  skeleton(c) {
    c.fillStyle = '#d9d2bd';
    c.beginPath();
    c.arc(0, -2, 13, 0, TAU);
    c.fill();
    c.fillRect(-8, 6, 16, 9);
    c.fillStyle = '#0a0a0e';
    c.beginPath();
    c.arc(-5, -2, 4, 0, TAU);
    c.arc(5, -2, 4, 0, TAU);
    c.fill();
    c.beginPath();
    c.moveTo(0, 3);
    c.lineTo(-2, 7);
    c.lineTo(2, 7);
    c.fill();
    c.strokeStyle = '#0a0a0e';
    c.lineWidth = 1.2;
    for (let k = -2; k < 3; k++) {
      c.beginPath();
      c.moveTo(k * 3, 9);
      c.lineTo(k * 3, 15);
      c.stroke();
    }
    eyes(c, 0, -2, 5, 1.8, '#7dffb0');
  },
  goblin(c) {
    c.fillStyle = '#6f9a4a';
    c.beginPath();
    c.moveTo(-9, -4);
    c.lineTo(-20, -12);
    c.lineTo(-11, 4);
    c.fill();
    c.beginPath();
    c.moveTo(9, -4);
    c.lineTo(20, -12);
    c.lineTo(11, 4);
    c.fill();
    c.beginPath();
    c.arc(0, 0, 12, 0, TAU);
    c.fill();
    c.fillStyle = '#34521f';
    c.beginPath();
    c.arc(0, -6, 12, PI, TAU);
    c.fill();
    eyes(c, 0, -1, 4.5, 2.6, '#ffe14a');
    c.strokeStyle = '#1a2a10';
    c.lineWidth = 1.6;
    c.beginPath();
    c.arc(0, 3, 6, 0.2, PI - 0.2);
    c.stroke();
    c.fillStyle = '#eee';
    c.fillRect(-4, 6, 2, 3);
    c.fillRect(2, 6, 2, 3);
  },
  wolf(c) {
    c.fillStyle = '#6c7786';
    c.beginPath();
    c.moveTo(-11, -6);
    c.lineTo(-13, -18);
    c.lineTo(-3, -10);
    c.fill();
    c.beginPath();
    c.moveTo(11, -6);
    c.lineTo(13, -18);
    c.lineTo(3, -10);
    c.fill();
    c.beginPath();
    c.moveTo(-13, -6);
    c.lineTo(13, -6);
    c.lineTo(6, 12);
    c.lineTo(0, 16);
    c.lineTo(-6, 12);
    c.closePath();
    c.fill();
    c.fillStyle = '#3d4653';
    c.beginPath();
    c.moveTo(-4, 4);
    c.lineTo(4, 4);
    c.lineTo(0, 16);
    c.fill();
    c.fillStyle = '#0a0a0e';
    c.beginPath();
    c.arc(0, 13, 2.4, 0, TAU);
    c.fill();
    eyes(c, 0, -1, 5.5, 2.2, '#ffb030');
  },
  spirit(c) {
    c.globalAlpha = 0.75;
    c.fillStyle = '#9be8e0';
    c.beginPath();
    c.arc(0, -3, 13, PI, TAU);
    c.lineTo(13, 12);
    c.lineTo(8, 8);
    c.lineTo(4, 13);
    c.lineTo(0, 8);
    c.lineTo(-4, 13);
    c.lineTo(-8, 8);
    c.lineTo(-13, 12);
    c.closePath();
    c.fill();
    c.globalAlpha = 1;
    c.fillStyle = '#06242a';
    c.beginPath();
    c.ellipse(-5, -3, 3, 4.5, 0, 0, TAU);
    c.ellipse(5, -3, 3, 4.5, 0, 0, TAU);
    c.fill();
    c.beginPath();
    c.ellipse(0, 5, 2.5, 3.5, 0, 0, TAU);
    c.fill();
  },
  cultist(c) {
    c.fillStyle = '#4a2e66';
    c.beginPath();
    c.moveTo(0, -17);
    c.quadraticCurveTo(15, -8, 13, 12);
    c.lineTo(-13, 12);
    c.quadraticCurveTo(-15, -8, 0, -17);
    c.fill();
    c.fillStyle = '#0a0610';
    c.beginPath();
    c.ellipse(0, -1, 7.5, 9, 0, 0, TAU);
    c.fill();
    eyes(c, 0, -2, 3.5, 1.8, '#ff4060');
    c.strokeStyle = '#d9a441';
    c.lineWidth = 1.3;
    c.beginPath();
    c.moveTo(-13, 12);
    c.lineTo(13, 12);
    c.stroke();
  },
  revenant(c) {
    c.fillStyle = '#8a96a3';
    c.beginPath();
    c.arc(0, -2, 14, PI, TAU);
    c.lineTo(14, 12);
    c.lineTo(-14, 12);
    c.closePath();
    c.fill();
    c.fillStyle = '#5a6672';
    c.fillRect(-2, -16, 4, 28);
    c.fillStyle = '#0a0a0e';
    c.fillRect(-10, -3, 20, 5);
    eyes(c, 0, -0.5, 5, 1.7, '#7dffb0');
    c.fillStyle = '#0a0a0e';
    for (let k = -2; k < 3; k++) c.fillRect(k * 4 - 0.6, 5, 1.2, 6);
  },
  knight(c) {
    c.fillStyle = '#d9d2bd';
    c.beginPath();
    c.moveTo(-12, -8);
    c.quadraticCurveTo(-22, -14, -18, -22);
    c.quadraticCurveTo(-14, -14, -8, -13);
    c.fill();
    c.beginPath();
    c.moveTo(12, -8);
    c.quadraticCurveTo(22, -14, 18, -22);
    c.quadraticCurveTo(14, -14, 8, -13);
    c.fill();
    c.fillStyle = '#5a2030';
    c.beginPath();
    c.arc(0, -3, 15, PI, TAU);
    c.lineTo(13, 14);
    c.lineTo(0, 17);
    c.lineTo(-13, 14);
    c.closePath();
    c.fill();
    c.fillStyle = '#0a0a0e';
    c.beginPath();
    c.moveTo(-11, -3);
    c.lineTo(11, -3);
    c.lineTo(3, 3);
    c.lineTo(3, 11);
    c.lineTo(-3, 11);
    c.lineTo(-3, 3);
    c.closePath();
    c.fill();
    eyes(c, 0, -1, 5, 1.8, '#ff4040');
  },
  troll(c) {
    c.fillStyle = '#4d6b52';
    c.beginPath();
    c.ellipse(0, 0, 23, 21, 0, 0, TAU);
    c.fill();
    c.fillStyle = '#34493a';
    c.beginPath();
    c.ellipse(0, -10, 23, 12, 0, PI, TAU);
    c.fill();
    c.fillStyle = '#e6dfc4';
    c.beginPath();
    c.moveTo(-10, 8);
    c.lineTo(-8, -3);
    c.lineTo(-5, 8);
    c.fill();
    c.beginPath();
    c.moveTo(10, 8);
    c.lineTo(8, -3);
    c.lineTo(5, 8);
    c.fill();
    c.fillStyle = '#1a2a1c';
    c.beginPath();
    c.ellipse(0, 11, 10, 5, 0, 0, TAU);
    c.fill();
    eyes(c, 0, -5, 8, 3, '#ffcf40');
    c.fillStyle = '#34493a';
    c.beginPath();
    c.arc(-17, -14, 5, 0, TAU);
    c.arc(17, -14, 5, 0, TAU);
    c.fill();
  }
};
export const BDRAW = {
  warden(c) {
    c.fillStyle = '#d9d2bd';
    c.beginPath();
    c.moveTo(-26, -14);
    c.quadraticCurveTo(-50, -22, -44, -48);
    c.quadraticCurveTo(-34, -28, -18, -28);
    c.fill();
    c.beginPath();
    c.moveTo(26, -14);
    c.quadraticCurveTo(50, -22, 44, -48);
    c.quadraticCurveTo(34, -28, 18, -28);
    c.fill();
    const g = c.createLinearGradient(0, -36, 0, 36);
    g.addColorStop(0, '#8795a8');
    g.addColorStop(1, '#3c4656');
    c.fillStyle = g;
    c.beginPath();
    c.arc(0, -6, 32, PI, TAU);
    c.lineTo(30, 26);
    c.lineTo(0, 36);
    c.lineTo(-30, 26);
    c.closePath();
    c.fill();
    c.fillStyle = '#07070b';
    c.fillRect(-22, -8, 44, 30);
    c.strokeStyle = '#8795a8';
    c.lineWidth = 3;
    for (let k = -2; k < 3; k++) {
      c.beginPath();
      c.moveTo(k * 9, -8);
      c.lineTo(k * 9, 22);
      c.stroke();
    }
    c.beginPath();
    c.moveTo(-22, 6);
    c.lineTo(22, 6);
    c.stroke();
    eyes(c, 0, -1, 9, 3.4, '#9fd8ff');
    c.strokeStyle = '#c9cfe6';
    c.lineWidth = 2;
    c.beginPath();
    c.arc(0, -6, 32, PI, TAU);
    c.stroke();
  },
  necro(c) {
    c.fillStyle = '#1c1230';
    c.beginPath();
    c.moveTo(0, -46);
    c.quadraticCurveTo(40, -24, 34, 34);
    c.lineTo(-34, 34);
    c.quadraticCurveTo(-40, -24, 0, -46);
    c.fill();
    c.strokeStyle = '#7dffb0';
    c.lineWidth = 1.6;
    c.stroke();
    c.fillStyle = '#e6dfc4';
    c.beginPath();
    c.arc(0, -6, 17, 0, TAU);
    c.fill();
    c.fillRect(-10, 6, 20, 12);
    c.fillStyle = '#07070b';
    c.beginPath();
    c.arc(-7, -7, 5.5, 0, TAU);
    c.arc(7, -7, 5.5, 0, TAU);
    c.fill();
    c.beginPath();
    c.moveTo(0, 0);
    c.lineTo(-3, 6);
    c.lineTo(3, 6);
    c.fill();
    c.strokeStyle = '#07070b';
    c.lineWidth = 1.4;
    for (let k = -2; k < 3; k++) {
      c.beginPath();
      c.moveTo(k * 4, 10);
      c.lineTo(k * 4, 18);
      c.stroke();
    }
    eyes(c, 0, -7, 7, 2.6, '#7dffb0');
    c.fillStyle = '#e6dfc4';
    for (let k = -2; k < 3; k++) {
      c.beginPath();
      c.moveTo(k * 8 - 3, -22);
      c.lineTo(k * 8, -34 - (2 - Math.abs(k)) * 4);
      c.lineTo(k * 8 + 3, -22);
      c.fill();
    }
  },
  beast(c) {
    c.fillStyle = '#dfe8f2';
    c.beginPath();
    c.moveTo(-26, -14);
    c.lineTo(-32, -46);
    c.lineTo(-8, -26);
    c.fill();
    c.beginPath();
    c.moveTo(26, -14);
    c.lineTo(32, -46);
    c.lineTo(8, -26);
    c.fill();
    const g = c.createLinearGradient(0, -30, 0, 40);
    g.addColorStop(0, '#eef4fa');
    g.addColorStop(1, '#8fa0b4');
    c.fillStyle = g;
    c.beginPath();
    c.moveTo(-34, -16);
    c.lineTo(34, -16);
    c.lineTo(30, 6);
    c.lineTo(14, 30);
    c.lineTo(0, 40);
    c.lineTo(-14, 30);
    c.lineTo(-30, 6);
    c.closePath();
    c.fill();
    c.fillStyle = '#5d6c80';
    c.beginPath();
    c.moveTo(-10, 8);
    c.lineTo(10, 8);
    c.lineTo(0, 40);
    c.fill();
    c.fillStyle = '#07070b';
    c.beginPath();
    c.arc(0, 33, 5, 0, TAU);
    c.fill();
    eyes(c, 0, -4, 13, 4.4, '#6fc6ff');
    c.fillStyle = '#fff';
    c.beginPath();
    c.moveTo(-12, 22);
    c.lineTo(-9, 34);
    c.lineTo(-6, 24);
    c.fill();
    c.beginPath();
    c.moveTo(12, 22);
    c.lineTo(9, 34);
    c.lineTo(6, 24);
    c.fill();
    c.strokeStyle = '#6fc6ff';
    c.lineWidth = 2.4;
    c.beginPath();
    c.arc(3, -22, 7, 0.6, TAU - 0.9);
    c.stroke();
  },
  dragon(c) {
    c.fillStyle = '#2a1a16';
    c.beginPath();
    c.moveTo(-20, -8);
    c.lineTo(-64, -30);
    c.lineTo(-56, -6);
    c.lineTo(-66, 8);
    c.lineTo(-44, 8);
    c.lineTo(-48, 24);
    c.lineTo(-22, 12);
    c.fill();
    c.beginPath();
    c.moveTo(20, -8);
    c.lineTo(64, -30);
    c.lineTo(56, -6);
    c.lineTo(66, 8);
    c.lineTo(44, 8);
    c.lineTo(48, 24);
    c.lineTo(22, 12);
    c.fill();
    c.fillStyle = '#e6dfc4';
    c.beginPath();
    c.moveTo(-18, -20);
    c.quadraticCurveTo(-34, -34, -26, -56);
    c.quadraticCurveTo(-20, -36, -8, -30);
    c.fill();
    c.beginPath();
    c.moveTo(18, -20);
    c.quadraticCurveTo(34, -34, 26, -56);
    c.quadraticCurveTo(20, -36, 8, -30);
    c.fill();
    const g = c.createLinearGradient(0, -30, 0, 44);
    g.addColorStop(0, '#e9e2c8');
    g.addColorStop(1, '#9a8f72');
    c.fillStyle = g;
    c.beginPath();
    c.moveTo(-26, -22);
    c.lineTo(26, -22);
    c.lineTo(30, -2);
    c.lineTo(16, 22);
    c.lineTo(12, 44);
    c.lineTo(-12, 44);
    c.lineTo(-16, 22);
    c.lineTo(-30, -2);
    c.closePath();
    c.fill();
    c.fillStyle = '#07070b';
    c.beginPath();
    c.moveTo(-22, -10);
    c.lineTo(-6, -4);
    c.lineTo(-10, 6);
    c.lineTo(-22, 2);
    c.fill();
    c.beginPath();
    c.moveTo(22, -10);
    c.lineTo(6, -4);
    c.lineTo(10, 6);
    c.lineTo(22, 2);
    c.fill();
    c.beginPath();
    c.ellipse(-5, 36, 2.5, 4, 0, 0, TAU);
    c.ellipse(5, 36, 2.5, 4, 0, 0, TAU);
    c.fill();
    eyes(c, 0, -2, 14, 3.6, '#ff7a30');
    c.fillStyle = '#fff';
    for (let k = -2; k < 3; k++) {
      if (!k) continue;
      c.beginPath();
      c.moveTo(k * 5 - 2, 44);
      c.lineTo(k * 5, 52);
      c.lineTo(k * 5 + 2, 44);
      c.fill();
    }
  }
};
