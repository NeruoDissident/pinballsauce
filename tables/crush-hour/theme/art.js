import {GY, PI, TAU, defaultPaintGrave, hash} from '../../../engine/api.js';

/* Crush Hour: everything painted flat. The floor of each playfield, what shows between them, the Friend Zone's
   floor, and the six billboards of the people to win over.
   Nothing here uses Math.random: art must not move the game's random numbers. */
export const CH_PAL = [
  // per tier: a, b floor gradient; acc, acc2 accents; glow; stone (the wall colour)
  {a: '#35507c', b: '#22345a', acc: '#7fd4ff', acc2: '#e8f8ff', glow: '#7fd4ff', stone: '#6c8cc0'}, // Sakura High
  {a: '#553c78', b: '#34224f', acc: '#ffd24a', acc2: '#fff6d8', glow: '#ffd24a', stone: '#9478c4'}, // Starlight Plaza
  {a: '#7a2f5a', b: '#4c1a3c', acc: '#ff7eb6', acc2: '#ffe4f0', glow: '#ff7eb6', stone: '#c06894'}, // Maple Street
  {a: '#2a3550', b: '#161d30', acc: '#8fb0d8', acc2: '#e0ecff', glow: '#8fb0d8', stone: '#4a5878'} // the Friend Zone
];

// what shows between and round the playfields: plum, with polka dots
export function floorBase(c) {
  c.fillStyle = '#4a2244';
  c.fillRect(-40, -400, 720, 5600);
  c.fillStyle = 'rgba(255,214,236,.10)';
  for (let y = -390, r = 0; y < 5200; y += 34, r++)
    for (let x = -10 + (r % 2) * 17; x < 660; x += 34) {
      c.beginPath();
      c.arc(x, y, 3.2, 0, TAU);
      c.fill();
    }
}

function heart(c, x, y, s, rot) {
  c.save();
  c.translate(x, y);
  c.rotate(rot || 0);
  c.scale(s, s);
  c.beginPath();
  c.moveTo(0, 9);
  c.bezierCurveTo(-14, -1, -12, -13, -5, -13);
  c.bezierCurveTo(-2, -13, 0, -10.5, 0, -8);
  c.bezierCurveTo(0, -10.5, 2, -13, 5, -13);
  c.bezierCurveTo(12, -13, 14, -1, 0, 9);
  c.restore();
}
function star(c, x, y, r, rot) {
  c.beginPath();
  for (let i = 0; i < 10; i++) {
    const a = (rot || 0) - PI / 2 + (i * PI) / 5,
      q = i % 2 ? r * 0.45 : r;
    c.lineTo(x + Math.cos(a) * q, y + Math.sin(a) * q);
  }
  c.closePath();
}
function petal(c, x, y, s, rot) {
  c.save();
  c.translate(x, y);
  c.rotate(rot);
  c.beginPath();
  c.moveTo(0, -7 * s);
  c.bezierCurveTo(5 * s, -4 * s, 5 * s, 3 * s, 0, 7 * s);
  c.bezierCurveTo(-5 * s, 3 * s, -5 * s, -4 * s, 0, -7 * s);
  c.fill();
  c.restore();
}
// a zebra crossing above the flippers: every playfield of this table has one
function crossing(c, y, cx, col) {
  c.fillStyle = col;
  for (let x = cx - 84; x < cx + 84; x += 21) c.fillRect(x, y + 840, 11, 28);
}

export const ART = [
  // Sakura High: a ruled exercise book with a margin, and cherry petals blown across it
  (c, y) => {
    c.strokeStyle = 'rgba(210,235,255,.13)';
    c.lineWidth = 1.2;
    for (let yy = y + 150; yy < y + 900; yy += 26) {
      c.beginPath();
      c.moveTo(24, yy);
      c.lineTo(616, yy);
      c.stroke();
    }
    c.strokeStyle = 'rgba(255,140,180,.22)';
    c.lineWidth = 1.6;
    c.beginPath();
    c.moveTo(74, y + 140);
    c.lineTo(74, y + 900);
    c.stroke();
    for (let k = 0; k < 70; k++) {
      c.fillStyle = 'rgba(255,' + Math.round(170 + hash(k * 3.1) * 50) + ',215,' + (0.1 + hash(k * 7.7) * 0.16) + ')';
      petal(
        c,
        30 + hash(k * 12.9898) * 580,
        y + 120 + hash(k * 78.233) * 780,
        0.8 + hash(k * 1.7) * 0.9,
        hash(k * 5.3) * TAU
      );
    }
    crossing(c, y, 320, 'rgba(232,248,255,.20)');
  },
  // Starlight Plaza: a night sky of stars, the big wheel drawn faint behind the Ferris Wheel lane
  (c, y) => {
    for (let k = 0; k < 90; k++) {
      c.fillStyle = 'rgba(255,' + Math.round(225 + hash(k * 2.3) * 30) + ',170,' + (0.08 + hash(k * 9.1) * 0.2) + ')';
      star(
        c,
        28 + hash(k * 12.9898 + 4) * 584,
        y + 110 + hash(k * 78.233 + 9) * 790,
        2.5 + hash(k * 3.3) * 5.5,
        hash(k * 6.1) * TAU
      );
      c.fill();
    }
    c.strokeStyle = 'rgba(255,220,130,.16)';
    c.lineWidth = 2;
    for (const r of [150, 132]) {
      c.beginPath();
      c.arc(320, y + 650, r, 0, TAU);
      c.stroke();
    }
    c.lineWidth = 1.2;
    for (let k = 0; k < 12; k++) {
      const a = (k * TAU) / 12;
      c.beginPath();
      c.moveTo(320 + Math.cos(a) * 26, y + 650 + Math.sin(a) * 26);
      c.lineTo(320 + Math.cos(a) * 150, y + 650 + Math.sin(a) * 150);
      c.stroke();
      c.fillStyle = 'rgba(255,' + (k % 2 ? '150,200' : '230,150') + ',.22)';
      c.beginPath();
      c.arc(320 + Math.cos(a) * 150, y + 650 + Math.sin(a) * 150, 9, 0, TAU);
      c.fill();
    }
    crossing(c, y, 320, 'rgba(255,246,216,.20)');
  },
  // Maple Street: hearts, a garden path of stepping stones up the middle
  (c, y) => {
    for (let k = 0; k < 64; k++) {
      c.fillStyle = 'rgba(255,' + Math.round(150 + hash(k * 4.1) * 70) + ',200,' + (0.08 + hash(k * 8.3) * 0.15) + ')';
      heart(
        c,
        30 + hash(k * 12.9898 + 2) * 540,
        y + 110 + hash(k * 78.233 + 5) * 790,
        0.6 + hash(k * 2.9) * 1.1,
        (hash(k * 6.7) - 0.5) * 0.9
      );
      c.fill();
    }
    c.strokeStyle = 'rgba(255,228,240,.16)';
    c.lineWidth = 2;
    for (const dx of [-152, 152]) {
      c.setLineDash([4, 12]);
      c.beginPath();
      c.moveTo(303 + dx, y + 560);
      c.lineTo(303 + dx, y + 700);
      c.stroke();
    }
    c.setLineDash([]);
    crossing(c, y, 303, 'rgba(255,228,240,.22)');
  }
];

// the Friend Zone: the stock room, with a heart in two halves on the floor
export function paintFriendZone(c) {
  defaultPaintGrave(c);
  const y = GY + 430;
  c.save();
  c.strokeStyle = 'rgba(143,176,216,.5)';
  c.lineWidth = 3;
  c.lineJoin = 'round';
  heart(c, 320, y, 5.2);
  c.stroke();
  c.strokeStyle = 'rgba(224,236,255,.55)';
  c.beginPath();
  c.moveTo(320, y - 44);
  for (const q of [
    [-10, -26],
    [8, -10],
    [-8, 8],
    [6, 24],
    [0, 46]
  ])
    c.lineTo(320 + q[0], y + q[1]);
  c.stroke();
  c.restore();
  c.font = '700 13px "Trebuchet MS","Segoe UI",sans-serif';
  c.textAlign = 'center';
  c.fillStyle = 'rgba(224,236,255,.45)';
  c.fillText('JUST FRIENDS?', 320, y + 84);
}

/* The people to win over: billboards, drawn in a 160-unit square centred on 0,0. One face, six people: skin, hair
   and what they carry. */
const INK = '#4a2244';
function face(c, o) {
  c.lineJoin = 'round';
  c.lineCap = 'round';
  // hair behind the head
  c.fillStyle = o.hair;
  if (o.back) o.back(c);
  // shoulders
  c.fillStyle = o.top;
  c.strokeStyle = INK;
  c.lineWidth = 3;
  c.beginPath();
  c.moveTo(-46, 74);
  c.quadraticCurveTo(-44, 34, -14, 30);
  c.lineTo(14, 30);
  c.quadraticCurveTo(44, 34, 46, 74);
  c.closePath();
  c.fill();
  c.stroke();
  if (o.collar) o.collar(c);
  // head
  c.fillStyle = o.skin || '#ffe0cc';
  c.beginPath();
  c.ellipse(0, -8, 40, 38, 0, 0, TAU);
  c.fill();
  c.stroke();
  // fringe
  c.fillStyle = o.hair;
  c.beginPath();
  c.moveTo(-41, -10);
  c.quadraticCurveTo(-46, -54, 0, -52);
  c.quadraticCurveTo(46, -54, 41, -10);
  c.quadraticCurveTo(30, -34, 12, -30);
  c.quadraticCurveTo(4, -22, -6, -31);
  c.quadraticCurveTo(-28, -36, -41, -10);
  c.fill();
  c.stroke();
  // eyes, blush, mouth
  for (const sx of [-1, 1]) {
    c.fillStyle = INK;
    c.beginPath();
    c.ellipse(sx * 16, -2, 7, 9.5, 0, 0, TAU);
    c.fill();
    c.fillStyle = o.eye || '#7a4a2a';
    c.beginPath();
    c.ellipse(sx * 16, 0, 5, 6.5, 0, 0, TAU);
    c.fill();
    c.fillStyle = '#fff';
    c.beginPath();
    c.arc(sx * 16 - 2.5, -5, 3, 0, TAU);
    c.fill();
    c.fillStyle = 'rgba(255,120,160,.55)';
    c.beginPath();
    c.ellipse(sx * 27, 10, 7, 4, 0, 0, TAU);
    c.fill();
  }
  c.strokeStyle = INK;
  c.lineWidth = 2.5;
  c.beginPath();
  if (o.frown) {
    c.moveTo(-6, 17);
    c.quadraticCurveTo(0, 13, 6, 17);
  } else {
    c.moveTo(-6, 14);
    c.quadraticCurveTo(0, 20, 6, 14);
  }
  c.stroke();
  if (o.front) o.front(c);
}
const specs = c => {
  c.strokeStyle = INK;
  c.lineWidth = 2.5;
  c.fillStyle = 'rgba(255,255,255,.28)';
  for (const sx of [-1, 1]) {
    c.beginPath();
    c.rect(sx * 16 - 11, -12, 22, 19);
    c.fill();
    c.stroke();
  }
  c.beginPath();
  c.moveTo(-5, -3);
  c.lineTo(5, -3);
  c.stroke();
};
export const BOSS_ART = {
  // Dad at the Door: a moustache, a cardigan, arms that are definitely folded
  dad(c) {
    face(c, {
      hair: '#6b4a3a',
      top: '#7fae8a',
      frown: true,
      collar(c) {
        c.fillStyle = '#fff';
        c.beginPath();
        c.moveTo(-12, 30);
        c.lineTo(0, 46);
        c.lineTo(12, 30);
        c.closePath();
        c.fill();
        c.stroke();
        c.fillStyle = '#d0564a';
        c.fillRect(-4, 40, 8, 30);
      },
      front(c) {
        c.fillStyle = '#6b4a3a';
        c.strokeStyle = INK;
        c.lineWidth = 2;
        c.beginPath();
        c.moveTo(-17, 10);
        c.quadraticCurveTo(0, 2, 17, 10);
        c.quadraticCurveTo(0, 13, -17, 10);
        c.fill();
        c.stroke();
        specs(c);
      }
    });
  },
  // the Hall Monitor: a severe bob, an armband and a whistle
  monitor(c) {
    face(c, {
      hair: '#2c3a66',
      top: '#3d5a8a',
      frown: true,
      eye: '#3a5a8a',
      back(c) {
        c.beginPath();
        c.rect(-45, -30, 90, 62);
        c.fill();
      },
      collar(c) {
        c.fillStyle = '#ffd24a';
        c.fillRect(-46, 52, 20, 12);
        c.strokeRect(-46, 52, 20, 12);
        c.strokeStyle = '#e8f8ff';
        c.lineWidth = 2;
        c.beginPath();
        c.moveTo(-10, 32);
        c.lineTo(4, 56);
        c.stroke();
        c.fillStyle = '#e8f8ff';
        c.beginPath();
        c.arc(6, 60, 6, 0, TAU);
        c.fill();
      },
      front: specs
    });
  },
  // the Queen Bee: a high ponytail, a tiara, not looking at you
  queen(c) {
    face(c, {
      hair: '#ffd24a',
      top: '#ff7eb6',
      eye: '#3aa0c8',
      back(c) {
        c.beginPath();
        c.moveTo(20, -50);
        c.quadraticCurveTo(78, -66, 66, 10);
        c.quadraticCurveTo(60, 44, 40, 30);
        c.quadraticCurveTo(56, -10, 22, -30);
        c.closePath();
        c.fill();
        c.strokeStyle = INK;
        c.lineWidth = 3;
        c.stroke();
      },
      front(c) {
        c.fillStyle = '#fff6d8';
        c.strokeStyle = INK;
        c.lineWidth = 2;
        c.beginPath();
        c.moveTo(-22, -46);
        c.lineTo(-16, -66);
        c.lineTo(-8, -52);
        c.lineTo(0, -72);
        c.lineTo(8, -52);
        c.lineTo(16, -66);
        c.lineTo(22, -46);
        c.closePath();
        c.fill();
        c.stroke();
        c.fillStyle = '#ff7eb6';
        c.beginPath();
        c.arc(0, -56, 3.5, 0, TAU);
        c.fill();
      }
    });
  },
  // Momo, next door: two buns and a heart clip
  momo(c) {
    face(c, {
      hair: '#ff9ac8',
      top: '#fff6d8',
      eye: '#c8507a',
      back(c) {
        c.strokeStyle = INK;
        c.lineWidth = 3;
        for (const sx of [-1, 1]) {
          c.beginPath();
          c.arc(sx * 38, -44, 17, 0, TAU);
          c.fill();
          c.stroke();
        }
      },
      collar(c) {
        c.fillStyle = '#ff7eb6';
        c.beginPath();
        c.moveTo(-12, 30);
        c.lineTo(0, 44);
        c.lineTo(12, 30);
        c.closePath();
        c.fill();
        c.stroke();
      },
      front(c) {
        c.fillStyle = '#ff4f8a';
        heart(c, 26, -38, 0.9, 0.3);
        c.fill();
      }
    });
  },
  // Hana, student council: long hair, a clipboard held like a shield
  hana(c) {
    face(c, {
      hair: '#8a6ad8',
      top: '#2c3a66',
      eye: '#6a4ab8',
      back(c) {
        c.beginPath();
        c.moveTo(-44, -30);
        c.lineTo(-52, 72);
        c.lineTo(52, 72);
        c.lineTo(44, -30);
        c.closePath();
        c.fill();
      },
      collar(c) {
        c.fillStyle = '#e8f8ff';
        c.beginPath();
        c.moveTo(-14, 30);
        c.lineTo(0, 48);
        c.lineTo(14, 30);
        c.closePath();
        c.fill();
        c.stroke();
        c.fillStyle = '#d8b890';
        c.fillRect(18, 44, 34, 30);
        c.strokeRect(18, 44, 34, 30);
        c.fillStyle = '#fff';
        c.fillRect(22, 50, 26, 22);
        c.fillStyle = '#8a94a8';
        c.fillRect(29, 41, 12, 6);
      }
    });
  },
  // Riku, arcade ace: a cap on backwards and headphones round his neck
  riku(c) {
    face(c, {
      hair: '#3a4a5a',
      top: '#8ff0c8',
      eye: '#3a8a6a',
      collar(c) {
        c.strokeStyle = '#2a3a4a';
        c.lineWidth = 7;
        c.beginPath();
        c.arc(0, 30, 24, 0.15, PI - 0.15);
        c.stroke();
        c.fillStyle = '#ff7eb6';
        c.strokeStyle = INK;
        c.lineWidth = 2;
        for (const sx of [-1, 1]) {
          c.beginPath();
          c.ellipse(sx * 26, 36, 7, 10, 0, 0, TAU);
          c.fill();
          c.stroke();
        }
      },
      front(c) {
        c.fillStyle = '#ff7eb6';
        c.strokeStyle = INK;
        c.lineWidth = 3;
        c.beginPath();
        c.moveTo(-42, -26);
        c.quadraticCurveTo(-44, -62, 0, -60);
        c.quadraticCurveTo(44, -62, 42, -26);
        c.quadraticCurveTo(0, -40, -42, -26);
        c.fill();
        c.stroke();
        c.fillStyle = '#fff';
        c.beginPath();
        c.arc(0, -46, 5, 0, TAU);
        c.fill();
      }
    });
  }
};
