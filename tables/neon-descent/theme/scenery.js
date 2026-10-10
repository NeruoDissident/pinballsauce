import {
  FY,
  H,
  HW,
  M,
  MB,
  NM,
  PAL,
  PI,
  R3,
  SM,
  TY,
  ctex,
  elev,
  groundY,
  hash,
  hdr,
  mkCanvas
} from '../../../engine/api.js';

/* Neon Descent: the world around the table and what the cabinet is made of.
   The city is cheap on purpose: four merged meshes of towers (one window texture per district), a dark ground, a
   skyline behind the Citadel and a handful of signs. */
const FONT = 'Consolas,"Courier New",monospace';

// walls, frames and blocks: dark plate steel instead of the engine's dressed stone
export function restyle(Mx) {
  const S = 256,
    cv = mkCanvas(S, S),
    c = cv.getContext('2d');
  c.fillStyle = '#9aa1ad';
  c.fillRect(0, 0, S, S);
  for (let k = 0; k < 900; k++) {
    const v = hash(k * 3.3);
    c.fillStyle = 'rgba(' + (v > 0.5 ? '255,255,255' : '0,0,0') + ',' + (0.02 + v * 0.05) + ')';
    c.fillRect(hash(k * 7.7) * S, hash(k * 1.9) * S, 2 + v * 10, 1);
  }
  c.strokeStyle = 'rgba(0,0,0,.55)';
  c.lineWidth = 2;
  for (const q of [0, 128]) {
    c.beginPath();
    c.moveTo(0, q + 1);
    c.lineTo(S, q + 1);
    c.stroke();
    c.beginPath();
    c.moveTo(q + 1, 0);
    c.lineTo(q + 1, S);
    c.stroke();
  }
  c.strokeStyle = 'rgba(255,255,255,.18)';
  c.lineWidth = 1;
  for (const q of [3, 131]) {
    c.beginPath();
    c.moveTo(0, q);
    c.lineTo(S, q);
    c.stroke();
  }
  c.fillStyle = 'rgba(0,0,0,.5)';
  for (const x of [14, 114, 142, 242])
    for (const y of [14, 114, 142, 242]) {
      c.beginPath();
      c.arc(x, y, 3, 0, Math.PI * 2);
      c.fill();
    }
  const tex = ctex(cv, {repeat: 1});
  for (const m of Mx.stone.concat([Mx.frame, Mx.dark])) {
    m.map = tex;
    m.bumpMap = tex;
    m.bumpScale = 1.1;
    m.metalness = 0.5;
    m.roughness = 0.52;
    m.envMapIntensity = 0.9;
    m.needsUpdate = true;
  }
  Mx.frame.color.set(0x222b3c).convertSRGBToLinear();
  Mx.dark.color.set(0x161d2b).convertSRGBToLinear();
  Mx.wood.map = null;
  Mx.wood.color.set(0x4d5a70).convertSRGBToLinear();
  Mx.wood.metalness = 0.6;
  Mx.wood.roughness = 0.45;
  Mx.wood.needsUpdate = true;
  Mx.bone.color.set(0xd8dde6).convertSRGBToLinear();
  Mx.bronze.color.set(0xb8c2d8).convertSRGBToLinear();
}

// one facade texture per district: a grid of windows, some lit in the district's colour, some warm, most dark
function windows(col, seed) {
  const S = 256,
    a = mkCanvas(S, S),
    b = mkCanvas(S, S),
    ca = a.getContext('2d'),
    cb = b.getContext('2d');
  ca.fillStyle = '#0d121c';
  ca.fillRect(0, 0, S, S);
  cb.fillStyle = '#000';
  cb.fillRect(0, 0, S, S);
  for (let r = 0; r < 8; r++)
    for (let k = 0; k < 8; k++) {
      const h = hash(seed + r * 8.3 + k * 1.7),
        x = k * 32 + 7,
        y = r * 32 + 6,
        lit = h > 0.6,
        c2 = h > 0.9 ? '#ffd9a0' : col;
      ca.fillStyle = lit ? c2 : '#141c2a';
      ca.fillRect(x, y, 18, 20);
      if (lit) {
        cb.fillStyle = c2;
        cb.globalAlpha = 0.5 + h * 0.5;
        cb.fillRect(x, y, 18, 20);
        cb.globalAlpha = 1;
      }
    }
  const map = ctex(a, {repeat: 1}),
    em = ctex(b, {repeat: 1});
  return SM({
    map,
    emissiveMap: em,
    emissive: 0xffffff,
    emissiveIntensity: 0.95,
    roughness: 0.7,
    metalness: 0.2,
    envMapIntensity: 0.5
  });
}
// a tower: four walls and a roof, pushed into a merged mesh. Windows tile by size, so every tower shares one material.
function tower(mb, x, z, w, d, h, seed) {
  const y0 = groundY(x, z) - 30,
    y1 = y0 + h + 30,
    X = x - 320,
    u0 = Math.floor(hash(seed) * 8) / 8,
    cell = 22 * 8,
    v1 = (h + 30) / cell;
  mb.hint = null;
  const side = (ax, az, bx, bz) => {
    const len = Math.hypot(bx - ax, bz - az) / cell;
    mb.quad([ax, y0, az], [bx, y0, bz], [bx, y1, bz], [ax, y1, az], [u0, 0], [u0 + len, 0], [u0 + len, v1], [u0, v1]);
  };
  const x0 = X - w / 2,
    x1 = X + w / 2,
    z0 = z - d / 2,
    z1 = z + d / 2;
  side(x0, z1, x1, z1);
  side(x1, z1, x1, z0);
  side(x1, z0, x0, z0);
  side(x0, z0, x0, z1);
  mb.quad(
    [x0, y1, z1],
    [x1, y1, z1],
    [x1, y1, z0],
    [x0, y1, z0],
    [0.01, 0.01],
    [0.02, 0.01],
    [0.02, 0.02],
    [0.01, 0.02]
  );
  return y1;
}
function sign(text, col, X, Y, Z, w, tilt) {
  const cv = mkCanvas(512, 128),
    c = cv.getContext('2d');
  c.font = '700 76px ' + FONT;
  c.textAlign = 'center';
  c.textBaseline = 'middle';
  c.shadowColor = col;
  c.shadowBlur = 22;
  c.fillStyle = col;
  let size = 76;
  while (c.measureText(text).width > 470 && size > 20) {
    size -= 4;
    c.font = '700 ' + size + 'px ' + FONT;
  }
  c.fillText(text, 256, 66);
  c.shadowBlur = 0;
  c.fillStyle = 'rgba(255,255,255,.75)';
  c.fillText(text, 256, 66);
  c.strokeStyle = col;
  c.lineWidth = 5;
  c.strokeRect(8, 8, 496, 112);
  const m = new THREE.Mesh(
    new THREE.PlaneGeometry(w, w / 4),
    new THREE.MeshBasicMaterial({
      map: ctex(cv),
      color: hdr('#ffffff', 1.5),
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide
    })
  );
  m.position.set(X, Y, Z);
  m.rotation.x = tilt === undefined ? -0.3 : tilt;
  R3.scene.add(m);
  return m;
}

export function buildScenery() {
  const sc = R3.scene;
  // the ground: dark, terraced with the table
  {
    const mb = new MB();
    mb.hint = [0, 1, 0];
    const xs = [-1500, -1100, -800, -560, -390],
      P = (x, yy) => [x - 320, groundY(x, yy), yy];
    for (const sd of [-1, 1])
      for (let i = 0; i < xs.length - 1; i++)
        for (let y = -900; y < HW + 500; y += 90) {
          const xa = 320 + sd * -xs[i + 1],
            xb = 320 + sd * -xs[i],
            x0 = Math.min(xa, xb),
            x1 = Math.max(xa, xb);
          mb.quad(P(x0, y), P(x1, y), P(x1, y + 90), P(x0, y + 90), [0, 0], [1, 0], [1, 1], [0, 1]);
        }
    for (let x = -70; x < 710; x += 130)
      for (let y = -900; y < -70; y += 90)
        mb.quad(P(x, y), P(x + 130, y), P(x + 130, y + 90), P(x, y + 90), [0, 0], [1, 0], [1, 1], [0, 1]);
    sc.add(mb.mesh(SM({color: '#0a0e17', roughness: 0.92, metalness: 0.15, envMapIntensity: 0.3}), {cast: false}));
  }
  // a block of towers either side of each district, lit in its colour
  for (let i = 0; i < NM; i++) {
    const mb = new MB(),
      col = PAL[i].glow;
    let n = 0;
    for (const sd of [-1, 1])
      for (let row = 0; row < 3; row++)
        for (let z = TY[i] + 40; z < TY[i] + 1040;) {
          const s = i * 97 + row * 31 + n * 7.3 + (sd > 0 ? 500 : 0),
            d = 110 + hash(s) * 90,
            w = 100 + hash(s + 1) * 70,
            h = (row ? 150 : 70) + hash(s + 2) * (row ? 300 : 130) + row * 60;
          const x = 320 + sd * (540 + row * 190 + hash(s + 3) * 40);
          tower(mb, x, z + d / 2, w, d, h, s);
          z += d + 26 + hash(s + 4) * 40;
          n++;
        }
    const m = mb.mesh(windows(col, i * 13 + 1), {cast: false});
    m.receiveShadow = false;
    sc.add(m);
  }
  // the skyline behind the Citadel, and the Helix spire
  {
    const mb = new MB();
    for (let k = 0; k < 26; k++) {
      const x = -760 + k * 86 + hash(k * 2.1) * 30,
        z = -250 - hash(k * 5.3) * 520,
        h = 240 + hash(k * 3.7) * 520;
      tower(mb, x, z, 70 + hash(k) * 60, 90, h, k * 11.1);
    }
    const m = mb.mesh(windows(PAL[0].glow, 77), {cast: false});
    m.receiveShadow = false;
    sc.add(m);
    const y0 = groundY(320, -330),
      spire = new THREE.Mesh(
        new THREE.CylinderGeometry(10, 44, 1100, 6),
        SM({color: '#1a1630', roughness: 0.4, metalness: 0.8, emissive: hdr(PAL[0].glow), emissiveIntensity: 0.08})
      );
    spire.position.set(0, y0 + 550, -330);
    sc.add(spire);
    for (let k = 0; k < 7; k++) {
      const r = new THREE.Mesh(
        new THREE.TorusGeometry(46 - k * 4.6, 2.2, 6, 28).rotateX(PI / 2),
        new THREE.MeshBasicMaterial({color: hdr(PAL[0].glow, 1.8)})
      );
      r.position.set(0, y0 + 120 + k * 140, -330);
      r.rotation.z = 0.25 * (k % 2 ? 1 : -1);
      sc.add(r);
    }
  }
  // signs: the district's name on the cabinet rim at the head of each field, shop signs on the towers
  const NAMES = ['HELIX CITADEL', 'DATA CATHEDRAL', 'KABUKI', 'UNDERCITY'],
    SHOP = [
      ['GOD-MACHINE', 'ASCEND'],
      ['CONFESS', 'ARCHIVE'],
      ['PACHINKO', 'NOODLES', '24H'],
      ['RIPPERDOC', 'CHOP SHOP', 'TOLL']
    ];
  for (let i = 0; i < NM; i++) {
    const col = PAL[i].glow,
      z = TY[i] + 300,
      y = elev(z) + 34;
    for (const sd of [-1, 1]) {
      const X = sd * (320 + 46),
        post = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.6, 44, 6), M.iron);
      post.position.set(X, y + 22, z);
      sc.add(post);
      sign(NAMES[i % NAMES.length], col, X, y + 58, z, 116);
    }
    SHOP[i % SHOP.length].forEach((t, k) => {
      const sd = k % 2 ? 1 : -1,
        zz = TY[i] + 420 + k * 210,
        X = sd * (540 + 60),
        yy = groundY(320 + X, zz) + 120 + k * 26;
      sign(t, k % 2 ? '#ffd9a0' : col, X, yy, zz, 150, -0.2);
    });
  }
  // the pylons the two freeways stand on are the engine's; give the rim a guard rail in each district's colour
  for (let i = 0; i < NM; i++) {
    const col = PAL[i].glow,
      z0 = TY[i] + 340,
      z1 = i < NM - 1 ? FY[i] + 90 : H + 30;
    for (const sd of [-1, 1]) {
      const g = new THREE.Mesh(
        new THREE.BoxGeometry(2.4, 2.4, z1 - z0),
        new THREE.MeshBasicMaterial({color: hdr(col, 1.3)})
      );
      g.position.set(sd * (320 + 68), elev((z0 + z1) / 2) + 35, (z0 + z1) / 2);
      sc.add(g);
    }
  }
}
