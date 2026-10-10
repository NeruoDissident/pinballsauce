import {M, PAL, PI, R3, SM, elev, hash, hdr, runeTex} from '../../../engine/api.js';

export function mkBumper(b) {
  const g = new THREE.Group(),
    p = PAL[b.tier],
    col = b.bell ? '#ffd070' : p.glow,
    r = b.r,
    o = {b, g, mats: [], bell: null, flame: null, t: 0};
  const S = SM,
    lit = (base, k) => {
      const m = S(
        Object.assign(
          {
            emissive: hdr(col),
            emissiveIntensity: k === undefined ? 0.12 : k,
            roughness: 0.6,
            metalness: 0.1,
            envMapIntensity: 0.8
          },
          base
        )
      );
      o.mats.push({m, k: k === undefined ? 0.12 : k});
      return m;
    };
  const mesh = (geo, mat, y) => {
    const m = new THREE.Mesh(geo, mat);
    m.position.y = y || 0;
    m.castShadow = true;
    m.receiveShadow = true;
    g.add(m);
    return m;
  };
  const ringM = new THREE.MeshBasicMaterial({color: hdr(col, 0.5)});
  o.ring = ringM;
  mesh(new THREE.TorusGeometry(r - 1.6, 1.7, 6, 28).rotateX(PI / 2), ringM, 3).castShadow = false;
  const lathe = (pts, seg) =>
    new THREE.LatheGeometry(
      pts.map(q => new THREE.Vector2(q[0], q[1])),
      seg || 20
    );
  if (b.bell) {
    mesh(new THREE.CylinderGeometry(r * 0.92, r * 0.98, 6, 20), M.iron, 3);
    for (const sx of [-1, 1]) mesh(new THREE.CylinderGeometry(1.8, 1.8, 54, 8), M.iron, 27).position.x = sx * (r - 4);
    mesh(new THREE.BoxGeometry(r * 2 - 4, 3.5, 4), M.iron, 54);
    const bell = new THREE.Group();
    bell.position.y = 52;
    const bm = lit({color: '#d9a441', metalness: 1, roughness: 0.3, envMapIntensity: 1.6}, 0.05);
    const bg = new THREE.Mesh(
      lathe(
        [
          [0, 0],
          [4, -1],
          [6.5, -6],
          [8, -16],
          [10.5, -26],
          [14, -32],
          [14.5, -34],
          [12.5, -34]
        ],
        18
      ),
      bm
    );
    bg.castShadow = true;
    bm.side = THREE.DoubleSide;
    bell.add(bg);
    const cl = new THREE.Mesh(new THREE.SphereGeometry(3, 8, 6), M.iron);
    cl.position.y = -33;
    bell.add(cl);
    g.add(bell);
    o.bell = bell;
  } else if (b.group === 'braziers' || b.group === 'urns' || b.group === 'pyre') {
    const fc = b.group === 'urns' ? p.glow : '#ff8a3c',
      ec = b.group === 'urns' ? p.acc : '#ff7a30';
    mesh(
      lathe([
        [r * 0.95, 0],
        [r * 0.95, 4],
        [r * 0.5, 8],
        [r * 0.36, 20],
        [r * 0.5, 26],
        [r * 0.96, 35],
        [r * 0.9, 37],
        [r * 0.72, 33],
        [0, 31]
      ]),
      M.iron
    );
    const em = new THREE.MeshBasicMaterial({color: hdr(ec, 1.6)});
    mesh(new THREE.CircleGeometry(r * 0.74, 16).rotateX(-PI / 2), em, 34.5).castShadow = false;
    const fl = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: R3.flameTex,
        color: hdr(fc, 2.2),
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      })
    );
    fl.position.y = 52;
    fl.scale.set(30, 46, 1);
    g.add(fl);
    o.flame = fl;
  } else if (b.group === 'stones') {
    mesh(new THREE.CylinderGeometry(r * 0.93, r * 0.97, 7, 20), M.stone[1], 3.5);
    const sm = lit(
      {
        map: M.stone[1].map,
        bumpMap: M.stone[1].map,
        bumpScale: 1.5,
        color: '#8fb0a4',
        flatShading: true,
        roughness: 0.85
      },
      0.1
    );
    const st = mesh(new THREE.CylinderGeometry(r * 0.42, r * 0.78, 50, 6), sm, 31);
    st.rotation.y = hash(b.x) * 3;
    st.rotation.z = (hash(b.y) - 0.5) * 0.14;
    const rune = new THREE.Mesh(
      new THREE.PlaneGeometry(13, 26),
      new THREE.MeshBasicMaterial({
        map: runeTex(1),
        color: hdr(col, 1.6),
        transparent: true,
        opacity: 0.5,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      })
    );
    rune.position.set(0, 30, r * 0.62);
    rune.rotation.x = -0.12;
    g.add(rune);
    o.rune = rune.material;
  } else if (b.group === 'graves') {
    mesh(new THREE.CylinderGeometry(r * 0.93, r * 0.97, 8, 20), M.stone[2], 4);
    const sh = new THREE.Shape();
    sh.moveTo(-13, 0);
    sh.lineTo(-13, 22);
    sh.absarc(0, 22, 13, PI, 0, true);
    sh.lineTo(13, 0);
    sh.closePath();
    const sm = lit({map: M.stone[2].map, color: '#9aa8c8', roughness: 0.8}, 0.1);
    mesh(
      new THREE.ExtrudeGeometry(sh, {
        depth: 8,
        bevelEnabled: true,
        bevelSize: 0.8,
        bevelThickness: 0.8,
        bevelSegments: 1,
        curveSegments: 10
      }).translate(0, 0, -4),
      sm,
      8
    ).rotation.x = -0.08;
    const rune = new THREE.Mesh(
      new THREE.PlaneGeometry(16, 22),
      new THREE.MeshBasicMaterial({
        map: runeTex(2),
        color: hdr(col, 1.5),
        transparent: true,
        opacity: 0.5,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      })
    );
    rune.position.set(0, 28, 6.2);
    rune.rotation.x = -0.08;
    g.add(rune);
    o.rune = rune.material;
  } else {
    // bones
    mesh(new THREE.CylinderGeometry(r * 0.93, r * 0.97, 5, 20), b.tier >= 4 ? M.stone[b.tier] : M.wood, 2.5);
    const bm = lit({color: '#8f8a78', roughness: 0.6}, 0.05);
    const sk = mesh(new THREE.SphereGeometry(r * 0.72, 16, 12), bm, 19);
    sk.scale.set(1, 0.92, 1.08);
    mesh(new THREE.BoxGeometry(r * 0.8, 7, r * 0.6), bm, 8).position.z = r * 0.3;
    const ec = b.tier >= 4 ? p.glow : '#7dffb0',
      em = new THREE.MeshBasicMaterial({color: hdr(ec, 0.25)});
    o.ember = em;
    o.emberCol = hdr(ec, 1);
    for (const sx of [-1, 1]) {
      const e = new THREE.Mesh(new THREE.SphereGeometry(3.4, 8, 6), em);
      e.position.set(sx * 5.6, 20, r * 0.62);
      g.add(e);
    }
  }
  {
    const w = new THREE.Group(),
      tm = new THREE.MeshBasicMaterial({color: hdr('#9fe8ff', 1.8)}),
      tr = new THREE.Mesh(new THREE.TorusGeometry(r + 5, 1.6, 6, 32).rotateX(PI / 2), tm);
    tr.position.y = 10;
    const ws = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: R3.glowTex,
        color: hdr('#62d8ff', 1.5),
        transparent: true,
        opacity: 0.6,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      })
    );
    ws.position.y = 26;
    ws.scale.set(r * 5, r * 5, 1);
    w.add(tr, ws);
    w.visible = false;
    g.add(w);
    o.ward = w;
    o.wardS = ws;
    o.wardT = tr;
  }
  g.position.set(b.x - 320, elev(b.y), b.y);
  R3.scene.add(g);
  return o;
}
export function mkStatue(s) {
  const g = new THREE.Group(),
    col = PAL[s.tier].acc2,
    o = {s, g, mats: []};
  const lit = (base, k) => {
    const m = SM(
      Object.assign(
        {emissive: hdr(col), emissiveIntensity: k, roughness: 0.7, metalness: 0.15, envMapIntensity: 0.8},
        base
      )
    );
    o.mats.push({m, k});
    return m;
  };
  const mesh = (geo, mat, y) => {
    const m = new THREE.Mesh(geo, mat);
    m.position.y = y || 0;
    m.castShadow = true;
    m.receiveShadow = true;
    g.add(m);
    return m;
  };
  if (s.id === 'throne') {
    const dk = lit({map: M.stone[0].map, color: '#5a3f6a'}, 0.05),
      gold = lit({color: '#d9a441', metalness: 1, roughness: 0.35, envMapIntensity: 1.5}, 0.1);
    mesh(new THREE.CylinderGeometry(s.r - 1, s.r, 7, 24), dk, 3.5);
    mesh(new THREE.BoxGeometry(24, 13, 18), dk, 13.5).position.z = 3;
    const sh = new THREE.Shape();
    sh.moveTo(-14, 0);
    sh.lineTo(-14, 40);
    sh.lineTo(-8, 52);
    sh.lineTo(-4, 44);
    sh.lineTo(0, 62);
    sh.lineTo(4, 44);
    sh.lineTo(8, 52);
    sh.lineTo(14, 40);
    sh.lineTo(14, 0);
    sh.closePath();
    mesh(new THREE.ExtrudeGeometry(sh, {depth: 6, bevelEnabled: false}).translate(0, 0, -13), dk, 7);
    for (const sx of [-1, 1]) mesh(new THREE.BoxGeometry(4, 9, 16), gold, 22).position.set(sx * 11, 22, 3);
    mesh(new THREE.SphereGeometry(3.2, 10, 8), gold, 72).position.z = -10;
  } else {
    const st = lit(
      {
        map: M.stone[1].map,
        bumpMap: M.stone[1].map,
        bumpScale: 1.5,
        color: '#a8c4c0',
        flatShading: true,
        roughness: 0.85
      },
      0.08
    );
    mesh(new THREE.CylinderGeometry(s.r - 1, s.r, 6, 20), M.stone[1], 3);
    mesh(new THREE.CylinderGeometry(8, 14.5, 60, 5), st, 36).rotation.y = 0.4;
    const rune = new THREE.Mesh(
      new THREE.PlaneGeometry(14, 30),
      new THREE.MeshBasicMaterial({
        map: runeTex(3),
        color: hdr(col, 1.7),
        transparent: true,
        opacity: 0.6,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      })
    );
    rune.position.set(0, 36, 12.4);
    rune.rotation.x = -0.1;
    g.add(rune);
    o.rune = rune.material;
  }
  g.position.set(s.x - 320, elev(s.y), s.y);
  R3.scene.add(g);
  return o;
}
