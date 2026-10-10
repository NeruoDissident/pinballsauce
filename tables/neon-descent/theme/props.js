import {M, PI, bumperBase, statueBase} from '../../../engine/api.js';

/* Neon Descent: the models that stand on the table. One bumper per group, one statue per district.
   Each starts from the engine's base (the floor ring, the ward, the group at the right spot) and adds its own shape;
   lit() makes a material that flashes when the bumper is hit. */
export function mkBumper(b) {
  const {o, lit, mesh, r, p} = bumperBase(b),
    at = (m, x, z) => {
      m.position.x = x;
      m.position.z = z || 0;
      return m;
    };
  mesh(new THREE.CylinderGeometry(r * 0.93, r * 0.97, 6, 24), M.iron, 3);
  if (b.group === 'grid') {
    // a street transformer: a finned can, three insulators with live tips
    mesh(new THREE.CylinderGeometry(r * 0.62, r * 0.66, 26, 8), M.steel, 19);
    for (let k = 0; k < 8; k++) {
      const a = (k * PI) / 4,
        f = mesh(new THREE.BoxGeometry(2, 20, 7), M.iron, 19);
      f.position.x = Math.cos(a) * r * 0.68;
      f.position.z = Math.sin(a) * r * 0.68;
      f.rotation.y = -a + PI / 2;
    }
    mesh(new THREE.CylinderGeometry(r * 0.92, r * 0.78, 5, 24), lit({color: p.acc}, 0.55), 34.5);
    for (let k = 0; k < 3; k++) {
      const a = (k * PI * 2) / 3 + 0.5;
      at(
        mesh(new THREE.CylinderGeometry(2.2, 3.2, 9, 8), M.bone, 41.5),
        Math.cos(a) * r * 0.42,
        Math.sin(a) * r * 0.42
      );
      at(
        mesh(new THREE.SphereGeometry(2.6, 8, 6), lit({color: '#fff3c8'}, 1.1), 47.5),
        Math.cos(a) * r * 0.42,
        Math.sin(a) * r * 0.42
      );
    }
  } else if (b.group === 'lanterns') {
    // a paper lantern on a post
    mesh(new THREE.CylinderGeometry(2.2, 2.8, 14, 8), M.iron, 13);
    const l = mesh(
      new THREE.SphereGeometry(r * 0.84, 18, 12),
      lit({color: '#ffd0e6', roughness: 0.9, metalness: 0}, 0.95),
      34
    );
    l.scale.y = 1.12;
    for (const y of [22, 34, 46]) {
      const s = Math.sqrt(Math.max(0.05, 1 - Math.pow((y - 34) / (r * 0.94), 2)));
      mesh(new THREE.TorusGeometry(r * 0.84 * s, 1.1, 5, 24).rotateX(PI / 2), M.iron, y).castShadow = false;
    }
    mesh(new THREE.CylinderGeometry(r * 0.34, r * 0.4, 4, 12), M.iron, 34 + r * 0.9);
    mesh(new THREE.CylinderGeometry(r * 0.4, r * 0.34, 4, 12), M.iron, 34 - r * 0.9);
  } else if (b.group === 'pipes') {
    // five organ pipes on a wind chest
    mesh(new THREE.BoxGeometry(r * 1.7, 8, r * 0.9), M.iron, 10);
    for (let k = -2; k <= 2; k++) {
      const h = 30 + (2 - Math.abs(k)) * 10;
      at(mesh(new THREE.CylinderGeometry(3.7, 3.7, h, 10), M.steel, 14 + h / 2), k * 8.6);
      at(mesh(new THREE.BoxGeometry(4.6, 3, 1.2), lit({color: p.acc}, 1), 22), k * 8.6, 3.6);
      at(mesh(new THREE.CylinderGeometry(3.9, 3.9, 1.6, 10), lit({color: p.acc2}, 0.5), 14 + h), k * 8.6);
    }
  } else if (b.group === 'reactors') {
    // a core held in two rings
    mesh(new THREE.CylinderGeometry(r * 0.4, r * 0.4, 34, 16), lit({color: p.acc}, 0.95), 24);
    for (const y of [14, 24, 34]) mesh(new THREE.TorusGeometry(r * 0.7, 2.2, 6, 28).rotateX(PI / 2), M.steel, y);
    for (let k = 0; k < 4; k++) {
      const a = (k * PI) / 2 + PI / 4;
      at(mesh(new THREE.CylinderGeometry(1.8, 1.8, 34, 6), M.iron, 24), Math.cos(a) * r * 0.7, Math.sin(a) * r * 0.7);
    }
    mesh(new THREE.CylinderGeometry(r * 0.5, r * 0.74, 5, 16), M.iron, 43.5);
  } else {
    // anything else (Flatline's two): the stock cap
    mesh(new THREE.CylinderGeometry(r * 0.5, r * 0.62, 22, 20), M.steel, 17);
    mesh(new THREE.CylinderGeometry(r * 0.96, r * 0.7, 7, 24), lit({color: p.acc}, 0.5), 31);
    mesh(new THREE.CylinderGeometry(r * 0.6, r * 0.96, 4, 24), lit({color: '#f4f4f8'}, 0.25), 36.5);
  }
  return o;
}

// a hologram on a projector plinth: an idol in Kabuki, an altar light in the Cathedral, the Godhead in the Citadel
export function mkStatue(s) {
  const {o, lit, mesh, p} = statueBase(s),
    big = s.id === 'godhead';
  mesh(new THREE.CylinderGeometry(s.r - 1, s.r, 6, 20), M.iron, 3);
  mesh(new THREE.CylinderGeometry(s.r * 0.5, s.r * 0.72, 8, 16), M.steel, 10);
  mesh(new THREE.CylinderGeometry(s.r * 0.42, s.r * 0.42, 1.6, 16), lit({color: p.acc2}, 0.9), 14.6);
  const holo = lit(
    {color: p.acc, transparent: true, opacity: 0.72, roughness: 0.2, metalness: 0, flatShading: true},
    1.1
  );
  const h = mesh(
    s.id === 'altar'
      ? new THREE.OctahedronGeometry(13, 0)
      : big
        ? new THREE.IcosahedronGeometry(17, 0)
        : new THREE.ConeGeometry(11, 30, 5),
    holo,
    big ? 44 : 40
  );
  h.castShadow = false;
  if (s.id === 'altar') h.scale.y = 1.6;
  mesh(
    new THREE.TorusGeometry(big ? 24 : 18, 1, 5, 28).rotateX(PI / 2),
    lit({color: p.acc2}, 0.8),
    big ? 44 : 28
  ).castShadow = false;
  return o;
}
