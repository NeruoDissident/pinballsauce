import {BM, MB, PI, R3, SM, groundY, hash, hdr} from '../../../engine/api.js';

/* Crush Hour: the world round the table. A lawn at dusk, cherry trees, a row of houses either side of Maple Street,
   the school behind the left lobe and the big wheel behind the right one. Cheap on purpose: a handful of merged
   meshes, nothing that moves. x and y here are whole-table (the school's corner is at -345, 40; the plaza's at
   345, 40; Maple Street's at 0, 1080); the world's X is x - 320 and its Z is y. */
const FIELDS = [
  [-345, 40],
  [345, 40],
  [0, 1080]
];
// is this spot under the table (a playfield, the cleft, or the Friend Zone's pit below Maple Street)?
const under = (x, y, pad) =>
  FIELDS.some(f => x > f[0] - pad && x < f[0] + 640 + pad && y > f[1] - pad && y < f[1] + 1040 + pad) ||
  (x > -pad && x < 640 + pad && y > 1080);
const put = (mb, geo, x, y, h, sc, ry) =>
  mb.add(
    geo,
    new THREE.Matrix4().compose(
      new THREE.Vector3(x - 320, groundY(x, y) + h, y),
      new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), ry || 0),
      new THREE.Vector3(sc[0], sc[1], sc[2])
    )
  );

export function buildScenery() {
  const sc = R3.scene,
    BOX = new THREE.BoxGeometry(1, 1, 1),
    CYL = new THREE.CylinderGeometry(1, 1, 1, 8),
    BALL = new THREE.SphereGeometry(1, 10, 8),
    ROOF = new THREE.ConeGeometry(1, 1, 4).rotateY(PI / 4);
  // the lawn
  {
    const mb = new MB(),
      S = 120,
      P = (x, y) => [x - 320, groundY(x, y), y];
    mb.hint = [0, 1, 0];
    for (let x = -1900; x < 2540; x += S)
      for (let y = -1100; y < 3400; y += S) {
        if (under(x + S / 2, y + S / 2, 10)) continue;
        mb.quad(P(x, y), P(x + S, y), P(x + S, y + S), P(x, y + S), [0, 0], [1, 0], [1, 1], [0, 1]);
      }
    sc.add(mb.mesh(SM({color: '#3f4f7a', roughness: 0.95, metalness: 0, envMapIntensity: 0.2}), {cast: false}));
  }
  // cherry trees, scattered wherever the table is not
  {
    const trunk = new MB(),
      pink = new MB(),
      pale = new MB();
    let n = 0;
    for (let k = 0; k < 520 && n < 150; k++) {
      const x = -1350 + hash(k * 12.9898) * 3340,
        y = -760 + hash(k * 78.233) * 3300;
      if (under(x, y, 150) || (y < -120 && Math.abs(x - 320) < 900)) continue; // not on the table, not in front of the buildings
      const s = 0.8 + hash(k * 3.7) * 0.8,
        h = 46 * s;
      put(trunk, CYL, x, y, h / 2, [5 * s, h, 5 * s]);
      for (let j = 0; j < 3; j++) {
        const a = hash(k * 5.1 + j) * PI * 2,
          r = (20 + hash(k * 2.3 + j * 7) * 14) * s;
        put(j === 1 ? pale : pink, BALL, x + Math.cos(a) * 12 * s, y + Math.sin(a) * 12 * s, h + r * 0.6 + j * 6 * s, [
          r,
          r * 0.85,
          r
        ]);
      }
      n++;
    }
    sc.add(trunk.mesh(SM({color: '#5a3a3a', roughness: 0.9}), {cast: false}));
    sc.add(
      pink.mesh(SM({color: '#ff9ac8', roughness: 0.85, emissive: hdr('#ff7eb6'), emissiveIntensity: 0.12}), {
        cast: false
      })
    );
    sc.add(
      pale.mesh(SM({color: '#ffd0e4', roughness: 0.85, emissive: hdr('#ff9ac8'), emissiveIntensity: 0.12}), {
        cast: false
      })
    );
  }
  // houses either side of Maple Street: a box, a pitched roof, a lit window and a door
  {
    const wall = new MB(),
      roofA = new MB(),
      roofB = new MB(),
      glow = new MB(),
      door = new MB();
    let i = 0;
    for (const sd of [-1, 1])
      for (let k = 0; k < 4; k++, i++) {
        const x = 320 + sd * (560 + (k % 2) * 150 + hash(i * 3.3) * 30),
          y = 1240 + k * 230 + hash(i * 7.1) * 40,
          w = 150 + hash(i * 1.9) * 40,
          d = 130,
          h = 84 + hash(i * 5.7) * 26,
          face = x - sd * (w / 2 + 1); // the side that looks at the street
        put(wall, BOX, x, y, h / 2, [w, h, d]);
        put(i % 2 ? roofA : roofB, ROOF, x, y, h + 30, [w * 0.82, 60, d * 0.82]);
        for (const dz of [-34, 34]) put(glow, BOX, face, y + dz, h * 0.6, [2, 26, 26]);
        put(door, BOX, face, y, 22, [2, 44, 22]);
      }
    sc.add(wall.mesh(SM({color: '#fff1dc', roughness: 0.9}), {cast: false}));
    sc.add(roofA.mesh(SM({color: '#ff7eb6', roughness: 0.8}), {cast: false}));
    sc.add(roofB.mesh(SM({color: '#7fd4ff', roughness: 0.8}), {cast: false}));
    sc.add(glow.mesh(BM({color: hdr('#ffe9a8', 1.5)}), {cast: false}));
    sc.add(door.mesh(SM({color: '#c06894', roughness: 0.7}), {cast: false}));
  }
  // Sakura High, behind the left lobe: a long block, a clock tower, rows of lit windows
  {
    const wall = new MB(),
      roof = new MB(),
      glow = new MB(),
      x = -25,
      y = -300;
    put(wall, BOX, x, y, 100, [640, 200, 150]);
    put(wall, BOX, x, y - 10, 190, [110, 380, 130]);
    put(roof, ROOF, x, y - 10, 425, [96, 90, 96]);
    put(roof, BOX, x, y, 204, [660, 10, 166]);
    for (let r = 0; r < 3; r++)
      for (let c = -4; c <= 4; c++) {
        if (c === 0) continue;
        put(glow, BOX, x + c * 66, y + 76, 44 + r * 56, [38, 30, 2]);
      }
    const clock = new THREE.Mesh(new THREE.CircleGeometry(30, 24), BM({color: hdr('#fff6d8', 1.3)}));
    clock.position.set(x - 320, groundY(x, y) + 330, y + 56);
    sc.add(clock);
    sc.add(wall.mesh(SM({color: '#e8f0ff', roughness: 0.9}), {cast: false}));
    sc.add(roof.mesh(SM({color: '#6c8cc0', roughness: 0.8}), {cast: false}));
    sc.add(glow.mesh(BM({color: hdr('#ffe9a8', 1.4)}), {cast: false}));
  }
  // the big wheel, behind the right lobe: a rim, spokes, lit cabins, two legs
  {
    const x = 665,
      y = -320,
      R = 250,
      cy = groundY(x, y) + R + 70,
      g = new THREE.Group(),
      white = SM({color: '#fff6fa', roughness: 0.5, metalness: 0.3});
    g.position.set(x - 320, cy, y);
    for (const r of [R, R - 22]) g.add(new THREE.Mesh(new THREE.TorusGeometry(r, 3.2, 6, 48), white));
    const cols = ['#ff7eb6', '#ffd24a', '#7fd4ff', '#8ff0c8', '#c9a8ff'];
    for (let k = 0; k < 12; k++) {
      const a = (k * PI * 2) / 12,
        sp = new THREE.Mesh(new THREE.BoxGeometry(2.4, R, 2.4), white);
      sp.position.set((Math.cos(a) * R) / 2, (Math.sin(a) * R) / 2, 0);
      sp.rotation.z = a - PI / 2;
      g.add(sp);
      const cab = new THREE.Mesh(new THREE.SphereGeometry(17, 10, 8), BM({color: hdr(cols[k % cols.length], 1.5)}));
      cab.position.set(Math.cos(a) * R, Math.sin(a) * R - 14, 0);
      g.add(cab);
    }
    g.add(new THREE.Mesh(new THREE.SphereGeometry(16, 12, 10), BM({color: hdr('#ffd24a', 1.6)})));
    for (const sx of [-1, 1]) {
      const leg = new THREE.Mesh(new THREE.BoxGeometry(8, R + 90, 8), white);
      leg.position.set(sx * 70, -(R + 70) / 2, -14);
      leg.rotation.z = sx * 0.38;
      g.add(leg);
    }
    sc.add(g);
  }
}
