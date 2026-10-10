import {M, PI, R3, SM, TAU, at, box, cyl, hash, hdr, lerp, path, sigil} from '../../../engine/api.js';

// the court floor, relative to a wing's own origin
/* ---------- floor art, one painter per wing ---------- */
export const WING_ART = {
  crypt(c, y, p) {
    // the aisle to the sarcophagus, burial niches down both walls, a ward circle before the flippers
    let g = c.createLinearGradient(0, y + 190, 0, y + 560);
    g.addColorStop(0, 'rgba(120,130,60,.34)');
    g.addColorStop(1, 'rgba(90,100,40,.08)');
    c.fillStyle = g;
    path(
      c,
      [
        [302, y + 190],
        [338, y + 190],
        [356, y + 560],
        [284, y + 560]
      ],
      1
    );
    c.fill();
    c.strokeStyle = 'rgba(216,240,112,.3)';
    c.lineWidth = 1.6;
    path(c, [
      [304, y + 190],
      [288, y + 560]
    ]);
    c.stroke();
    path(c, [
      [336, y + 190],
      [352, y + 560]
    ]);
    c.stroke();
    for (const sx of [-1, 1])
      for (let k = 0; k < 3; k++) {
        const nx = 320 + sx * 150,
          ny = y + 360 + k * 56 - k * k * 4;
        c.fillStyle = 'rgba(0,0,0,.5)';
        c.beginPath();
        c.moveTo(nx - 15, ny + 20);
        c.lineTo(nx - 15, ny - 6);
        c.arc(nx, ny - 6, 15, PI, 0);
        c.lineTo(nx + 15, ny + 20);
        c.closePath();
        c.fill();
        c.strokeStyle = 'rgba(200,224,96,.22)';
        c.lineWidth = 1.2;
        c.stroke();
        c.fillStyle = 'rgba(230,224,196,.5)';
        c.beginPath();
        c.arc(nx, ny + 2, 6, 0, TAU);
        c.fill();
        c.fillRect(nx - 4, ny + 6, 8, 5);
        c.fillStyle = '#0a0b06';
        c.beginPath();
        c.arc(nx - 2.4, ny + 1.5, 1.7, 0, TAU);
        c.arc(nx + 2.4, ny + 1.5, 1.7, 0, TAU);
        c.fill();
      }
    sigil(c, 320, y + 430, 78, p.acc, 0);
    g = c.createRadialGradient(320, y + 150, 10, 320, y + 150, 230);
    g.addColorStop(0, 'rgba(216,240,112,.13)');
    g.addColorStop(1, 'rgba(216,240,112,0)');
    c.fillStyle = g;
    c.fillRect(60, y, 520, 420);
  },
  den(c, y, p) {
    // trampled earth, a shaft of moonlight, old kills, claw marks, a trail of prints to the lair
    for (let k = 0; k < 70; k++) {
      const x = 120 + hash(k * 3.7) * 400,
        yy = y + 60 + hash(k * 8.1) * 500,
        r = 10 + hash(k * 1.9) * 26;
      c.fillStyle =
        'rgba(' +
        ((30 + hash(k) * 30) | 0) +
        ',' +
        ((34 + hash(k + 1) * 26) | 0) +
        ',' +
        ((48 + hash(k + 2) * 30) | 0) +
        ',' +
        (0.1 + hash(k + 3) * 0.16) +
        ')';
      c.beginPath();
      c.ellipse(x, yy, r * 1.5, r, hash(k) * 3, 0, TAU);
      c.fill();
    }
    let g = c.createRadialGradient(320, y + 340, 10, 320, y + 340, 200);
    g.addColorStop(0, 'rgba(207,230,255,.13)');
    g.addColorStop(0.6, 'rgba(207,230,255,.04)');
    g.addColorStop(1, 'rgba(207,230,255,0)');
    c.fillStyle = g;
    c.fillRect(100, y + 120, 440, 440);
    c.strokeStyle = 'rgba(207,230,255,.22)';
    c.lineWidth = 1.6;
    c.beginPath();
    c.arc(320, y + 340, 118, 0, TAU);
    c.stroke();
    sigil(c, 320, y + 340, 86, p.glow, 1);
    c.fillStyle = 'rgba(96,10,18,.55)';
    for (const q of [
      [250, 150, 34],
      [400, 170, 26],
      [330, 215, 20]
    ]) {
      c.beginPath();
      c.ellipse(q[0], y + q[1], q[2] * 1.4, q[2], hash(q[0]) * 3, 0, TAU);
      c.fill();
    }
    c.lineCap = 'round';
    c.strokeStyle = 'rgba(226,222,200,.5)';
    c.fillStyle = 'rgba(226,222,200,.5)';
    for (let k = 0; k < 12; k++) {
      const x = 150 + hash(k * 5.3) * 340,
        yy = y + 110 + hash(k * 9.1) * 400,
        a = hash(k * 2.7) * PI,
        l = 8 + hash(k) * 8;
      if (Math.hypot(x - 320, yy - (y + 340)) < 70) continue;
      c.lineWidth = 3;
      c.beginPath();
      c.moveTo(x - Math.cos(a) * l, yy - Math.sin(a) * l);
      c.lineTo(x + Math.cos(a) * l, yy + Math.sin(a) * l);
      c.stroke();
      for (const sg of [-1, 1]) {
        c.beginPath();
        c.arc(x + sg * Math.cos(a) * l, yy + sg * Math.sin(a) * l, 2.8, 0, TAU);
        c.fill();
      }
    }
    c.strokeStyle = 'rgba(0,0,0,.5)';
    c.lineWidth = 2.2;
    for (const q of [
      [170, 400, 0.5],
      [468, 410, -0.5],
      [200, 200, 0.9],
      [440, 200, -0.9]
    ])
      for (let k = -1; k < 2; k++) {
        c.beginPath();
        c.moveTo(q[0] + k * 8, y + q[1] - 22);
        c.lineTo(q[0] + k * 8 + q[2] * 18, y + q[1] + 22);
        c.stroke();
      }
    c.fillStyle = 'rgba(207,230,255,.16)';
    for (let k = 0; k < 8; k++) {
      const t = k / 7,
        x = lerp(300, 330, t) + (k % 2 ? 10 : -10),
        yy = y + 520 - t * 290;
      c.beginPath();
      c.ellipse(x, yy, 5, 6.5, 0, 0, TAU);
      c.fill();
      for (let j = -1; j < 2; j++) {
        c.beginPath();
        c.arc(x + j * 4.6, yy - 9, 2, 0, TAU);
        c.fill();
      }
    }
  },
  hoard(c, y, p) {
    // scorched flagstones split by fire, loose coin washed against the walls, a scale-ring before the flippers
    c.fillStyle = 'rgba(0,0,0,.34)';
    for (const q of [
      [220, 320, 90],
      [430, 250, 70],
      [320, 470, 80]
    ]) {
      c.beginPath();
      c.ellipse(q[0], y + q[1], q[2] * 1.3, q[2], hash(q[0]) * 3, 0, TAU);
      c.fill();
    }
    c.lineCap = 'round';
    c.lineJoin = 'round';
    for (const q of [
      [150, 140, 0.5],
      [470, 120, 2.4],
      [130, 470, -0.3],
      [505, 430, 3.4],
      [320, 60, 1.57]
    ]) {
      let x = q[0],
        yy = y + q[1],
        a = q[2];
      const pts = [[x, yy]];
      for (let k = 0; k < 7; k++) {
        a += (hash(q[0] + k * 3.3) - 0.5) * 1.3;
        x += Math.cos(a) * 26;
        yy += Math.sin(a) * 26;
        pts.push([x, yy]);
      }
      path(c, pts);
      c.strokeStyle = 'rgba(255,90,20,.18)';
      c.lineWidth = 13;
      c.stroke();
      c.strokeStyle = 'rgba(255,150,50,.55)';
      c.lineWidth = 4;
      c.stroke();
      c.strokeStyle = 'rgba(255,232,150,.8)';
      c.lineWidth = 1.3;
      c.stroke();
    }
    for (let k = 0; k < 170; k++) {
      const a = hash(k * 2.3) * TAU,
        rr = 150 + hash(k * 5.9) * 110,
        x = 320 + Math.cos(a) * rr * 1.05,
        yy = y + 300 + Math.sin(a) * rr * 1.25;
      c.fillStyle = 'rgba(255,' + ((190 + hash(k) * 40) | 0) + ',70,' + (0.28 + hash(k + 4) * 0.4) + ')';
      c.beginPath();
      c.arc(x, yy, 2.2 + hash(k + 9) * 2, 0, TAU);
      c.fill();
    }
    sigil(c, 320, y + 445, 74, p.acc2, 2);
    const g = c.createRadialGradient(320, y + 130, 10, 320, y + 130, 240);
    g.addColorStop(0, 'rgba(255,176,80,.2)');
    g.addColorStop(1, 'rgba(255,176,80,0)');
    c.fillStyle = g;
    c.fillRect(60, y, 520, 420);
  }
};
/* ---------- what stands at the head of each room ---------- */
export const WING_PROPS = {
  crypt(Wg, g, mb, y, yE, p) {
    // a tomb front, and a stone chest whose lid slides when the seal breaks
    const fy = y + 6;
    box(mb.stone, 320, fy, 0, 150, 250, 34);
    for (const sx of [-1, 1]) {
      cyl(mb.stone, 320 + sx * 96, fy + 22, 12, 0, 128, 10);
      cyl(mb.stone, 320 + sx * 96, fy + 22, 15, 128, 138, 10);
    }
    box(mb.stone, 320, fy + 18, 138, 154, 236, 52);
    mb.roof.add(new THREE.CylinderGeometry(1, 1, 1, 3).rotateX(-PI / 2), at(320, fy + 18, 172, 0, [150, 36, 52]));
    const win = new THREE.Mesh(
      new THREE.CircleGeometry(26, 24),
      new THREE.MeshBasicMaterial({color: hdr(p.glow, 1.3)})
    );
    win.position.set(0, yE + 92, fy + 17.6);
    g.add(win);
    const halo = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: R3.glowTex,
        color: hdr(p.glow, 0.9),
        transparent: true,
        opacity: 0.4,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      })
    );
    halo.position.set(0, yE + 92, fy + 30);
    halo.scale.set(220, 220, 1);
    g.add(halo);
    box(mb.stone, 320, y + 96, 0, 24, 58, 112);
    box(mb.dark, 320, y + 96, 24, 27, 50, 104);
    const lid = new THREE.Mesh(new THREE.BoxGeometry(62, 9, 116), M.bone);
    lid.position.set(0, yE + 31, y + 96);
    lid.castShadow = true;
    g.add(lid);
    const cr = new THREE.Mesh(new THREE.BoxGeometry(6, 2, 70), SM({color: '#3a3e2a', roughness: 0.8}));
    cr.position.y = 5;
    const cr2 = new THREE.Mesh(new THREE.BoxGeometry(34, 2, 6), cr.material);
    cr2.position.set(0, 5, -16);
    lid.add(cr, cr2);
    Wg.anim = k => {
      lid.position.x = k * 30;
      lid.rotation.y = k * 0.22;
    };
  },
  den(Wg, g, mb, y, yE, p) {
    // a cave mouth of piled rock, and the ribs of something large arching over the way in
    const rock = new THREE.IcosahedronGeometry(1, 0);
    for (const q of [
      [196, 70, 58, 74],
      [258, 34, 50, 88],
      [320, 22, 56, 96],
      [382, 34, 50, 88],
      [444, 70, 58, 74],
      [150, 120, 40, 52],
      [490, 120, 40, 52]
    ]) {
      const m = at(q[0], y + q[1], q[3] * 0.38, hash(q[0]) * 6, [q[2], q[3] * 0.62, q[2] * 0.8]);
      mb.stone.add(rock, m);
    }
    const rib = new THREE.TorusGeometry(40, 3.2, 6, 18, PI);
    for (let k = 0; k < 4; k++) {
      const m = new THREE.Mesh(rib, M.bone);
      m.position.set(0, yE + 2, y + 92 + k * 17);
      m.scale.set(1 - k * 0.06, 1.25 - k * 0.1, 1);
      m.castShadow = true;
      g.add(m);
    }
    const sk = new THREE.Mesh(new THREE.SphereGeometry(15, 12, 10), M.bone);
    sk.position.set(0, yE + 102, y + 34);
    sk.scale.set(1, 0.8, 1.5);
    sk.castShadow = true;
    g.add(sk);
    for (const sx of [-1, 1]) {
      const e = new THREE.Mesh(
        new THREE.SphereGeometry(3.4, 8, 6),
        new THREE.MeshBasicMaterial({color: hdr(p.glow, 1.6)})
      );
      e.position.set(sx * 6.5, yE + 104, y + 53);
      g.add(e);
    }
    const shaft = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: R3.glowTex,
        color: hdr(p.glow, 0.6),
        transparent: true,
        opacity: 0.07,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      })
    );
    shaft.position.set(0, yE + 150, y + 330);
    shaft.scale.set(250, 560, 1);
    g.add(shaft);
    Wg.anim = () => {};
  },
  hoard(Wg, g, mb, y, yE, p) {
    // a vault door in the rock that rolls aside, and coin heaped in every corner
    const fy = y + 10;
    box(mb.stone, 320, fy, 0, 140, 280, 40);
    box(mb.stone, 320, fy + 2, 140, 158, 300, 48);
    const dm = SM({
        color: '#c9983f',
        metalness: 1,
        roughness: 0.34,
        envMapIntensity: 1.5,
        emissive: hdr('#ffb050'),
        emissiveIntensity: 0.08
      }),
      door = new THREE.Group();
    const disc = new THREE.Mesh(new THREE.CylinderGeometry(50, 50, 7, 28).rotateX(PI / 2), dm);
    disc.castShadow = true;
    door.add(disc);
    for (let k = 0; k < 4; k++) {
      const b = new THREE.Mesh(new THREE.BoxGeometry(96, 7, 3), M.iron);
      b.rotation.z = (k * PI) / 4;
      b.position.z = 5;
      door.add(b);
    }
    const hub = new THREE.Mesh(new THREE.CylinderGeometry(11, 11, 10, 12).rotateX(PI / 2), M.iron);
    hub.position.z = 5;
    door.add(hub);
    door.position.set(0, yE + 78, fy + 24);
    g.add(door);
    const hole = new THREE.Mesh(
      new THREE.CircleGeometry(44, 28),
      new THREE.MeshBasicMaterial({color: hdr('#ff9a3c', 0.85)})
    );
    {
      const dk = new THREE.Mesh(
        new THREE.CircleGeometry(26, 24),
        new THREE.MeshBasicMaterial({color: hdr('#ffd98a', 1.25)})
      );
      dk.position.z = 0.3;
      hole.add(dk);
    }
    hole.position.set(0, yE + 78, fy + 20.4);
    g.add(hole);
    const gold = SM({
      color: '#d9a441',
      metalness: 1,
      roughness: 0.42,
      envMapIntensity: 1.6,
      emissive: hdr('#ffb050'),
      emissiveIntensity: 0.22,
      flatShading: true
    });
    const heap = new THREE.IcosahedronGeometry(1, 1);
    for (const q of [
      [76, 96, 46, 58],
      [564, 96, 46, 58],
      [70, 470, 40, 46],
      [570, 470, 40, 46],
      [74, 290, 30, 34],
      [566, 290, 30, 34]
    ]) {
      const m = new THREE.Mesh(heap, gold);
      m.position.set(q[0] - 320, yE - q[3] * 0.18, y + q[1]);
      m.scale.set(q[2] * 1.15, q[3] * 0.8, q[2] * 1.15);
      m.rotation.y = hash(q[0] + q[1]) * 6;
      m.castShadow = true;
      g.add(m);
      const top = new THREE.Mesh(heap, gold);
      top.position.set(
        q[0] - 320 + (hash(q[1]) - 0.5) * q[2] * 0.7,
        yE + q[3] * 0.22,
        y + q[1] + (hash(q[0]) - 0.5) * q[2] * 0.6
      );
      top.scale.set(q[2] * 0.62, q[3] * 0.6, q[2] * 0.62);
      top.rotation.y = hash(q[0] * 3) * 6;
      g.add(top);
    }
    Wg.anim = k => {
      door.position.x = k * 104;
      door.rotation.z = -k * 2.1;
    };
  }
};
