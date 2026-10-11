import {M, PI, SM, bumperBase, statueBase} from '../../../engine/api.js';

/* Crush Hour: the models that stand on the table. One bumper per group, one statue per lobe.
   Each starts from the engine's base (the floor ring, the ward, the group at the right spot) and adds its own shape;
   lit() makes a material that flashes when the bumper is hit. */
// a heart lying flat, its point toward the player: the cap of a Heartbeat, and the head of Cupid's plinth
function heartGeo(s, depth) {
  const sh = new THREE.Shape();
  sh.moveTo(0, -9);
  sh.bezierCurveTo(-14, 1, -12, 13, -5, 13);
  sh.bezierCurveTo(-2, 13, 0, 10.5, 0, 8);
  sh.bezierCurveTo(0, 10.5, 2, 13, 5, 13);
  sh.bezierCurveTo(12, 13, 14, 1, 0, -9);
  return new THREE.ExtrudeGeometry(sh, {
    depth,
    bevelEnabled: true,
    bevelThickness: 1.2,
    bevelSize: 1,
    bevelSegments: 2,
    curveSegments: 10
  })
    .translate(0, -2, -depth / 2)
    .scale(s, s, 1)
    .rotateX(-PI / 2);
}
export function mkBumper(b) {
  const {o, lit, mesh, r, p} = bumperBase(b),
    at = (m, x, z) => {
      m.position.x = x;
      m.position.z = z || 0;
      return m;
    };
  mesh(new THREE.CylinderGeometry(r * 0.93, r * 0.97, 6, 24), SM({color: '#fff0f6', roughness: 0.5}), 3);
  if (b.group === 'hearts') {
    // a Heartbeat: a candy-striped post under a fat heart
    mesh(new THREE.CylinderGeometry(r * 0.42, r * 0.5, 22, 16), SM({color: '#fff6fa', roughness: 0.4}), 17);
    for (const y of [11, 19, 27])
      mesh(
        new THREE.TorusGeometry(r * 0.47, 1.2, 5, 20).rotateX(PI / 2),
        SM({color: '#ff7eb6', roughness: 0.5}),
        y
      ).castShadow = false;
    mesh(heartGeo(r / 13, 8), lit({color: '#ff5f9e', roughness: 0.3, metalness: 0.1}, 0.75), 33);
  } else if (b.group === 'bells') {
    // a school bell: a brass dome on a bracket, a clapper underneath
    mesh(new THREE.CylinderGeometry(2.4, 3, 16, 8), M.iron, 14);
    mesh(
      new THREE.SphereGeometry(r * 0.86, 22, 12, 0, PI * 2, 0, PI / 2),
      lit({color: '#ffd98a', roughness: 0.25, metalness: 0.8}, 0.4),
      22
    );
    mesh(
      new THREE.CylinderGeometry(r * 0.9, r * 0.9, 2.4, 22),
      lit({color: '#ffe9b0', roughness: 0.3, metalness: 0.7}, 0.5),
      22
    );
    mesh(new THREE.SphereGeometry(4, 10, 8), SM({color: '#ff7eb6', roughness: 0.4}), 22 + r * 0.86);
    mesh(new THREE.SphereGeometry(3.4, 8, 6), M.iron, 16);
  } else {
    // a claw machine's prize dome: a coloured base, a clear dome, capsules inside
    mesh(new THREE.CylinderGeometry(r * 0.8, r * 0.86, 16, 18), lit({color: p.acc, roughness: 0.4}, 0.45), 14);
    const caps = ['#ff7eb6', '#7fd4ff', '#8ff0c8', '#fff6d8', '#c9a8ff'];
    for (let k = 0; k < 5; k++) {
      const a = (k * PI * 2) / 5 + 0.4;
      at(
        mesh(new THREE.SphereGeometry(r * 0.24, 10, 8), SM({color: caps[k], roughness: 0.35}), 26 + (k % 2) * 3),
        Math.cos(a) * r * 0.36,
        Math.sin(a) * r * 0.36
      );
    }
    const dome = mesh(
      new THREE.SphereGeometry(r * 0.78, 20, 12, 0, PI * 2, 0, PI / 2),
      SM({color: '#ffffff', roughness: 0.08, metalness: 0.1, transparent: true, opacity: 0.32, envMapIntensity: 1.6}),
      22
    );
    dome.castShadow = false;
    mesh(new THREE.TorusGeometry(r * 0.8, 1.6, 6, 24).rotateX(PI / 2), lit({color: '#fff6d8'}, 0.6), 22).castShadow =
      false;
  }
  return o;
}
export function mkStatue(s) {
  const {o, lit, mesh} = statueBase(s),
    gold = lit({color: '#ffd24a', roughness: 0.3, metalness: 0.85}, 0.25);
  mesh(new THREE.CylinderGeometry(s.r - 1, s.r, 6, 20), SM({color: '#fff0f6', roughness: 0.5}), 3);
  if (s.id === 'trophy') {
    // the Trophy Case's best cup
    mesh(new THREE.BoxGeometry(18, 8, 18), SM({color: '#5a3a4a', roughness: 0.6}), 10);
    mesh(new THREE.CylinderGeometry(2.2, 5, 12, 10), gold, 20);
    mesh(new THREE.CylinderGeometry(12, 5, 20, 16), gold, 36);
    for (const sx of [-1, 1]) {
      const h = mesh(new THREE.TorusGeometry(6, 1.4, 6, 14, PI), gold, 37);
      h.position.x = sx * 11;
      h.rotation.z = (-sx * PI) / 2;
    }
  } else {
    // Cupid: a heart on a plinth with an arrow through it
    mesh(new THREE.CylinderGeometry(7, 10, 22, 12), SM({color: '#fff6fa', roughness: 0.45}), 17);
    const h = mesh(heartGeo(1.5, 9), lit({color: '#ff5f9e', roughness: 0.3}, 0.6), 46);
    h.rotation.x = PI / 2; // stood up to face the player
    const arrow = mesh(new THREE.CylinderGeometry(1, 1, 52, 6), gold, 46);
    arrow.rotation.z = PI / 2 - 0.35;
    const tip = mesh(new THREE.ConeGeometry(3.4, 8, 6), gold, 46 + Math.sin(0.35) * 26);
    tip.position.x = Math.cos(0.35) * 26;
    tip.rotation.z = -(PI / 2 - 0.35);
  }
  return o;
}
