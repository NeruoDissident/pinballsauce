import {hash} from '../../../engine/api.js';
const TAU = Math.PI * 2;
function line(c, p, col, w = 1) {
  c.beginPath();
  p.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y)));
  c.strokeStyle = col;
  c.lineWidth = w;
  c.stroke();
}
function text(c, s, x, y, size, col) {
  c.font = 'bold ' + size + 'px Georgia';
  c.textAlign = 'center';
  c.fillStyle = col;
  c.fillText(s, x, y);
}
function cross(c, x, y, size, col) {
  c.fillStyle = col;
  c.fillRect(x - size * 0.12, y - size * 0.6, size * 0.24, size);
  c.fillRect(x - size * 0.4, y - size * 0.32, size * 0.8, size * 0.22);
}
function ring(c, x, y, r, col, w = 1) {
  c.strokeStyle = col;
  c.lineWidth = w;
  c.beginPath();
  c.arc(x, y, r, 0, TAU);
  c.stroke();
}
function feather(c, x, y, angle, s, col) {
  c.save();
  c.translate(x, y);
  c.rotate(angle);
  c.fillStyle = col;
  c.beginPath();
  c.moveTo(0, 0);
  c.quadraticCurveTo(-s * 0.3, -s * 0.45, 0, -s);
  c.quadraticCurveTo(s * 0.3, -s * 0.4, 0, 0);
  c.fill();
  c.restore();
}
function border(c, col) {
  for (const x of [73, 567])
    line(
      c,
      [
        [x, 330],
        [x, 685]
      ],
      col,
      2
    );
  for (let y = 350; y < 670; y += 24) {
    ring(c, 73, y, 3, col);
    ring(c, 567, y, 3, col);
  }
}
function base(c, y, fn) {
  c.save();
  c.translate(0, y);
  fn();
  c.restore();
}
function heaven(c, y) {
  base(c, y, () => {
    // Quiet marble geometry, bright broad wings, engraved central medallion.
    for (let i = 0; i < 28; i++) {
      const x = hash(i + 21) * 640;
      line(
        c,
        [
          [x, 10],
          [x - 50, 300],
          [x + 30, 600],
          [x - 80, 940]
        ],
        '#9daeba44',
        1
      );
    }
    for (let i = 0; i < 18; i++)
      line(
        c,
        [
          [320, 330],
          [320 + Math.cos((i / 18) * TAU) * 570, 330 + Math.sin((i / 18) * TAU) * 570]
        ],
        '#f8efce44',
        2
      );
    ring(c, 320, 350, 178, '#ddc98b99', 3);
    ring(c, 320, 350, 188, '#d4b66b77');
    for (const s of [-1, 1])
      for (let i = 0; i < 12; i++)
        feather(c, 320 + s * (70 + i * 8), 390 - i * 5, s * (0.6 + i * 0.065), 130 + i * 4, '#f9f6df88');
    cross(c, 320, 268, 110, '#b7964699');
    ring(c, 320, 246, 77, '#b7964688', 3);
    border(c, '#e9cb8188');
    text(c, 'H E A V E N', 320, 70, 31, '#fff5d3');
    text(c, 'OPEN THE GATES', 320, 637, 22, '#fff2bf');
    text(c, 'GRACE RETURNS A LOST BALL', 320, 660, 10, '#e8edfa');
    text(c, 'THE FALL TO EARTH', 320, 1006, 15, '#bfcbd5');
  });
}
function earth(c, y) {
  base(c, y, () => {
    // Stained-glass rose, church paving and a nave aimed toward Sanctuary.
    for (let row = 0; row < 25; row++)
      for (let col = 0; col < 12; col++) {
        const h = hash(row * 47 + col * 9);
        c.fillStyle = 'rgba(166,161,183,' + (0.035 + h * 0.05) + ')';
        c.fillRect(col * 56 + (row % 2) * 28, row * 40, 53, 37);
      }
    c.save();
    c.translate(320, 260);
    for (let i = 0; i < 12; i++) {
      c.save();
      c.rotate((i * TAU) / 12);
      c.fillStyle = ['#40588788', '#80475b88', '#b28c5588'][i % 3];
      c.beginPath();
      c.moveTo(0, 0);
      c.quadraticCurveTo(-45, -90, 0, -147);
      c.quadraticCurveTo(45, -90, 0, 0);
      c.fill();
      c.strokeStyle = '#d9be7c55';
      c.stroke();
      c.restore();
    }
    ring(c, 0, 0, 154, '#c5ab7155', 6);
    ring(c, 0, 0, 163, '#c5ab7133', 2);
    c.restore();
    cross(c, 320, 258, 85, '#ecd59866');
    for (const s of [-1, 1])
      for (let i = 0; i < 4; i++)
        line(
          c,
          [
            [303 + s * (54 + i * 18), 515],
            [303 + s * (65 + i * 22), 870]
          ],
          '#9c8d7022',
          2
        );
    border(c, '#c3a57855');
    text(c, 'E A R T H', 320, 66, 30, '#e5d5b5');
    text(c, 'RESCUE THREE SOULS', 303, 632, 21, '#e6cca0');
    text(c, 'CANDLES  ·  BELLS  ·  SANCTUARY', 303, 655, 10, '#bac0ce');
    text(c, 'HELL WAITS BELOW', 303, 1004, 15, '#e68b6b');
    for (const x of [95, 530]) {
      cross(c, x, 265, 35, '#ac9c8266');
    }
  });
}
function hell(c, y) {
  base(c, y, () => {
    // Fissures follow the edges; the Beast's engraving frames a real scoop, never hides a shot.
    for (let i = 0; i < 36; i++) {
      const side = i % 2 ? 1 : -1,
        x = 320 + side * (190 + hash(i * 3) * 95),
        yy = 150 + hash(i * 7) * 720;
      line(
        c,
        [
          [x, yy],
          [x - side * 15, yy + 32],
          [x + side * 9, yy + 59],
          [x - side * 24, yy + 80]
        ],
        '#9d2d2966',
        2
      );
    }
    const g = c.createRadialGradient(346, 430, 5, 346, 430, 180);
    g.addColorStop(0, '#b8302044');
    g.addColorStop(1, '#19081100');
    c.fillStyle = g;
    c.fillRect(100, 160, 480, 490);
    for (const s of [-1, 1]) {
      c.fillStyle = '#79312888';
      c.beginPath();
      c.moveTo(346 + s * 35, 356);
      c.quadraticCurveTo(346 + s * 153, 305, 346 + s * 94, 180);
      c.quadraticCurveTo(346 + s * 103, 319, 346 + s * 18, 314);
      c.closePath();
      c.fill();
      line(
        c,
        [
          [346 + s * 70, 352],
          [346 + s * 24, 366]
        ],
        '#f3865566',
        6
      );
    }
    ring(c, 346, 424, 104, '#9e413744', 3);
    ring(c, 346, 424, 112, '#9e413733');
    for (let i = 0; i < 14; i++) {
      const a = (i * TAU) / 14;
      line(
        c,
        [
          [346 + Math.cos(a) * 120, 424 + Math.sin(a) * 120],
          [346 + Math.cos(a) * 132, 424 + Math.sin(a) * 132]
        ],
        '#bc593633',
        3
      );
    }
    border(c, '#b4453244');
    text(c, 'H E L L', 320, 68, 34, '#f99268');
    text(c, 'BREAK THE CHAINS', 320, 635, 20, '#f4a077');
    text(c, 'STRIKE THE BEAST  ·  SEEK REDEMPTION', 320, 655, 10, '#ca9b96');
    for (let i = 0; i < 9; i++) {
      const x = 230 + i * 22;
      c.fillStyle = '#8e624888';
      c.beginPath();
      c.moveTo(x, 990);
      c.lineTo(x + 10, 970);
      c.lineTo(x + 18, 990);
      c.fill();
    }
  });
}
export const floorArt = [heaven, earth, hell];
