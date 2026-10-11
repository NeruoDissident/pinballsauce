import {G, R3, SM, BM, TY, E, hash, bumperBase} from '../../../engine/api.js';

function mesh(g, geo, mat, x, y, z, rx = 0, rz = 0) {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x, y, z);
  m.rotation.set(rx, 0, rz);
  m.castShadow = true;
  m.receiveShadow = true;
  g.add(m);
  return m;
}
function block(g, mat, x, y, z, w, h, d) {
  return mesh(g, new THREE.BoxGeometry(w, h, d), mat, x, y, z);
}
function orb(g, mat, x, y, z, r, sx = 1, sy = 1, sz = 1) {
  const m = mesh(g, new THREE.SphereGeometry(r, 14, 10), mat, x, y, z);
  m.scale.set(sx, sy, sz);
  return m;
}
function wing(g, mat, side, x, y, z, scale = 1) {
  // Individual carved feathers create the silhouette even with textures disabled.
  for (let i = 0; i < 9; i++) {
    const length = (150 - i * 8) * scale;
    const w = (15 - i * 0.5) * scale,
      shape = new THREE.Shape();
    shape.moveTo(0, -length * 0.5);
    shape.bezierCurveTo(-w, -length * 0.1, -w, length * 0.32, 0, length * 0.5);
    shape.bezierCurveTo(w, length * 0.28, w, -length * 0.18, 0, -length * 0.5);
    const f = mesh(
      g,
      new THREE.ExtrudeGeometry(shape, {
        depth: 5 * scale,
        bevelEnabled: true,
        bevelSize: 2 * scale,
        bevelThickness: 2 * scale,
        bevelSegments: 1,
        steps: 1,
        curveSegments: 8
      }),
      mat,
      x + side * (27 + i * 15) * scale,
      y + (20 + i * 6) * scale,
      z + i * 3 * scale,
      0,
      -side * (0.7 + i * 0.095)
    );
    f.scale.z = 0.65;
  }
}
function angel(g, ivory, gold, glow, x, z, scale) {
  const y = 30;
  mesh(g, new THREE.ConeGeometry(26 * scale, 112 * scale, 10), ivory, x, y + 55 * scale, z);
  orb(g, ivory, x, y + 123 * scale, z, 17 * scale);
  for (const s of [-1, 1])
    mesh(
      g,
      new THREE.CylinderGeometry(6 * scale, 8 * scale, 48 * scale, 8),
      ivory,
      x + s * 21 * scale,
      y + 79 * scale,
      z - 7 * scale,
      0,
      s * 0.5
    );
  mesh(g, new THREE.TorusGeometry(26 * scale, 2.4 * scale, 8, 36), glow, x, y + 158 * scale, z, Math.PI / 2);
  wing(g, ivory, -1, x, y + 88 * scale, z + 8, scale);
  wing(g, ivory, 1, x, y + 88 * scale, z + 8, scale);
  block(g, gold, x, y + 80 * scale, z - 18 * scale, 5 * scale, 67 * scale, 5 * scale);
}
function horn(g, mat, x, y, z, side, s = 1) {
  const pts = [
    new THREE.Vector3(x, y, z),
    new THREE.Vector3(x + side * 29 * s, y + 38 * s, z - 5 * s),
    new THREE.Vector3(x + side * 24 * s, y + 91 * s, z - 17 * s),
    new THREE.Vector3(x + side * 4 * s, y + 120 * s, z - 20 * s)
  ];
  const path = new THREE.CatmullRomCurve3(pts);
  // A tapering horn assembled from rings along the curve.
  const pos = [],
    idx = [];
  for (let i = 0; i <= 16; i++) {
    const p = path.getPoint(i / 16),
      r = 17 * s * (1 - i / 17);
    for (let j = 0; j < 9; j++) {
      const a = (j * Math.PI * 2) / 9;
      pos.push(p.x + Math.cos(a) * r, p.y, p.z + Math.sin(a) * r);
    }
  }
  for (let i = 0; i < 16; i++)
    for (let j = 0; j < 9; j++) {
      const a = i * 9 + j,
        b = i * 9 + ((j + 1) % 9);
      idx.push(a, b, a + 9, b, b + 9, a + 9);
    }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  geo.setIndex(idx);
  geo.computeVertexNormals();
  mesh(g, geo, mat, 0, 0, 0);
}
export function scenery() {
  const ivory = SM({color: '#fff5d9', roughness: 0.65}),
    gold = SM({color: '#d5ac55', metalness: 0.7, roughness: 0.25}),
    white = BM({color: '#fff0bb'}),
    stone = SM({color: '#5e6171', roughness: 0.95}),
    dark = SM({color: '#251720', roughness: 0.8}),
    bone = SM({color: '#8b6558', roughness: 0.9}),
    fire = BM({color: '#ff653a'}),
    glass = BM({color: '#a9c6ff'});
  // Scenery stays outside x 20..620. The ball and both flippers remain unobscured.
  for (let t = 0; t < 3; t++) {
    const g = new THREE.Group();
    g.position.set(-320, E[t], TY[t]);
    R3.scene.add(g);
    for (const side of [-1, 1]) {
      const x = side < 0 ? -62 : 702;
      if (t === 0) {
        for (let j = 0; j < 5; j++) {
          const z = 90 + j * 175;
          mesh(g, new THREE.CylinderGeometry(16, 20, 145, 12), ivory, x, 56, z);
          block(g, gold, x, 130, z, 48, 12, 48);
          block(g, ivory, x, -18, z, 58, 20, 58);
        }
        angel(g, ivory, gold, white, x + side * 80, 265, 1.15);
        for (let j = 0; j < 8; j++)
          orb(
            g,
            SM({color: '#c9d9e9', roughness: 1}),
            x + side * (70 + hash(j + side) * 100),
            -20,
            j * 130,
            90,
            1.5,
            0.4,
            1
          );
      } else if (t === 1) {
        for (let j = 0; j < 5; j++) {
          const z = 80 + j * 180,
            h = 95 + hash(j * 17 + side) * 100;
          block(g, stone, x, h / 2 - 30, z, 52, h, 60);
          mesh(g, new THREE.ConeGeometry(39, 65, 4), dark, x, h - 2, z, 0, 0).rotation.y = Math.PI / 4;
          block(g, glass, x - side * 28, 46, z, 3, 50, 18);
          block(g, gold, x, h + 37, z, 5, 35, 5);
          block(g, gold, x, h + 45, z, 19, 5, 5);
        }
      } else {
        for (let j = 0; j < 7; j++) {
          const z = 100 + j * 126,
            h = 80 + hash(j + 11) * 70;
          mesh(g, new THREE.ConeGeometry(49, h, 5), dark, x, h / 2 - 25, z, 0, side * 0.14);
          horn(g, bone, x, 30, z, side, 0.7);
          orb(g, fire, x - side * 15, 0, z, 22, 1, 0.3, 1);
        }
      }
    }
    if (t === 0) {
      block(g, gold, 320, 80, -105, 380, 12, 26);
      for (const x of [158, 482]) {
        block(g, ivory, x, 25, -100, 42, 160, 42);
        mesh(g, new THREE.SphereGeometry(22, 16, 12), white, x, 118, -100);
      }
      for (let i = 0; i < 13; i++) block(g, gold, 176 + i * 24, 38, -104, 5, 96, 7);
      angel(g, ivory, gold, white, 320, -170, 1.55);
    }
  }
}
export function mechanism(m, o) {
  const gold = SM({color: '#d5b46c', metalness: 0.8, roughness: 0.25});
  const ivory = SM({color: '#fff3d5', roughness: 0.5});
  if (m.id === 'pearlyGates') {
    for (const x of [-7, 87]) {
      mesh(o.root, new THREE.CylinderGeometry(6, 9, 90, 12), ivory, x, 45, -4);
      mesh(o.root, new THREE.SphereGeometry(9, 12, 8), gold, x, 95, -4);
    }
    const pts = [];
    for (let i = 0; i <= 24; i++) {
      const a = Math.PI - (i * Math.PI) / 24;
      pts.push(new THREE.Vector3(40 + 47 * Math.cos(a), 87 + 29 * Math.sin(a), -4));
    }
    mesh(o.root, new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 32, 3, 8, false), gold, 0, 0, 0);
    return;
  }
  if (m.id === 'cathedralBell') {
    for (const x of [-24, 24]) block(o.root, gold, x, 31, -38, 5, 62, 6);
    block(o.root, gold, 0, 63, -38, 58, 6, 8);
    const bell = new THREE.Group();
    bell.position.set(0, 55, -38);
    o.root.add(bell);
    mesh(bell, new THREE.CylinderGeometry(7, 24, 29, 24), gold, 0, -14, 0);
    mesh(bell, new THREE.TorusGeometry(24, 3, 8, 32), gold, 0, -29, 0, Math.PI / 2);
    orb(bell, ivory, 0, -32, 0, 5);
    return () => {
      bell.rotation.x = Math.sin(G.t * 24) * m.flash * 0.3;
    };
  }
  if (m.id === 'beastJaw') {
    const dark = SM({color: '#3d1924', roughness: 0.55}),
      bone = SM({color: '#be9474', roughness: 0.65});
    const fire = SM({color: '#ff9458', emissive: '#ff3a13', emissiveIntensity: 1.3});
    const face = new THREE.Group();
    face.position.set(37, 51, -42);
    o.root.add(face);
    orb(face, dark, 0, 14, 0, 51, 1.3, 0.72, 0.8);
    horn(face, bone, -38, 27, -10, -1, 0.64);
    horn(face, bone, 38, 27, -10, 1, 0.64);
    for (const side of [-1, 1]) {
      orb(face, fire, side * 25, 26, 31, 8, 1.6, 0.4, 0.65);
      orb(face, dark, side * 47, -10, 16, 21, 0.6, 1, 0.7);
      const brow = block(face, dark, side * 25, 35, 34, 39, 10, 12);
      brow.rotation.z = side * 0.28;
      const cheek = mesh(face, new THREE.ConeGeometry(16, 47, 4), dark, side * 43, -4, 31, 0, side * 0.4);
      cheek.rotation.y = Math.PI / 4;
    }
    mesh(face, new THREE.ConeGeometry(10, 27, 4), bone, 0, 7, 35, Math.PI);
    for (let i = 0; i < 7; i++) mesh(o.leaves[0], new THREE.ConeGeometry(4.5, 20, 6), bone, 5 + i * 10, -5, 6, Math.PI);
    const cracks = [];
    for (let i = 0; i < 3; i++) {
      const crack = block(face, fire, -22 + i * 22, 30, 38, 3, 35, 3);
      crack.rotation.z = (i - 1) * 0.35;
      cracks.push(crack);
    }
    return () => {
      const wounds = G.run?.wounds || 0;
      // Dress the retracting barrier as a lower jaw folding flat toward the player.
      o.leaves[0].position.y = 0;
      o.leaves[0].rotation.x = m.position * Math.PI / 2;
      cracks.forEach((q, i) => {
        q.visible = i < wounds;
      });
      fire.emissiveIntensity = G.run?.judgment === 3 ? 0.12 : m.open ? 2.3 : 1;
      face.rotation.z = m.flash * Math.sin(G.t * 35) * 0.05;
    };
  }
}
export function bumper(b) {
  const {o, lit, mesh: put, r} = bumperBase(b);
  const gold = lit({color: b.tier === 2 ? '#652b25' : '#c9a35b'}, 0.25);
  put(new THREE.CylinderGeometry(r * 0.85, r, 7, 24), gold, 5);
  if (b.tier !== 2) {
    const bell = new THREE.Group();
    o.g.add(bell);
    o.bell = bell;
    bell.position.y = 39;
    mesh(bell, new THREE.CylinderGeometry(r * 0.33, r * 0.88, 29, 24), gold, 0, -5, 0);
    mesh(bell, new THREE.TorusGeometry(r * 0.88, 2.5, 7, 24), gold, 0, -19, 0, Math.PI / 2);
    orb(bell, gold, 0, -18, 0, 4);
    if (b.tier === 0) {
      wing(o.g, lit({color: '#fff5d9'}, 0.15), -1, 0, 19, 0, 0.22);
      wing(o.g, lit({color: '#fff5d9'}, 0.15), 1, 0, 19, 0, 0.22);
    }
  } else {
    put(new THREE.DodecahedronGeometry(r * 0.86), gold, 24);
    const f = lit({color: '#ffad66'}, 1);
    for (const x of [-9, 9]) {
      const eye = put(new THREE.SphereGeometry(4, 8, 6), f, 30);
      eye.position.set(x, 30, 17);
    }
    for (const s of [-1, 1]) {
      const h = put(new THREE.ConeGeometry(6, 27, 7), gold, 46);
      h.position.x = s * 16;
      h.rotation.z = -s * 0.35;
    }
  }
  return o;
}
