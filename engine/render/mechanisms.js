import {T} from '../core/state.js';
import {THEME} from '../table/content.js';
import {R3, SM} from './core.js';
import {elev} from './world.js';

function mesh(g, geo, material, x, y, z) {
  const o = new THREE.Mesh(geo, material);
  o.position.set(x, y, z);
  o.castShadow = true;
  o.receiveShadow = true;
  g.add(o);
  return o;
}
export function buildMovingParts() {
  R3.movingParts = [];
  if (!T.mechanisms) return;
  const steel = SM({color: '#c4d3dd', metalness: 0.95, roughness: 0.18});
  for (const m of Object.values(T.mechanisms)) {
    const root = new THREE.Group();
    root.position.set(m.x - 320, elev(m.y, m.x), m.y);
    R3.scene.add(root);
    const o = {m, root, leaves: []},
      mat = SM({color: m.color, metalness: 0.65, roughness: 0.3});
    if (m.kind === 'captive') {
      o.ball = mesh(root, new THREE.SphereGeometry(m.radius, 20, 14), steel, 0, m.radius, 0);
      const track = new THREE.Group();
      track.rotation.y = -m.angle - Math.PI / 2;
      root.add(track);
      for (const side of [-1, 1]) {
        mesh(track, new THREE.BoxGeometry(2, 6, m.travel + 26), steel, side * (m.radius + 5), 4, -m.travel / 2);
      }
    } else
      for (const l of m.leaves) {
        const leaf = new THREE.Group();
        root.add(leaf);
        o.leaves.push(leaf);
        if (m.kind === 'gate') {
          for (const y of [9, m.height - 8]) mesh(leaf, new THREE.BoxGeometry(l.length, 4, 5), mat, l.length / 2, y, 0);
          for (let x = 4; x < l.length; x += 9) {
            mesh(leaf, new THREE.CylinderGeometry(1.7, 1.7, m.height, 8), mat, x, m.height / 2, 0);
            mesh(leaf, new THREE.SphereGeometry(3, 8, 6), mat, x, m.height, 0);
          }
        } else mesh(leaf, new THREE.BoxGeometry(l.length, m.height, 10), mat, l.length / 2, m.height / 2, 0);
      }
    if (THEME.mechanism) o.animate = THEME.mechanism(m, o);
    R3.movingParts.push(o);
  }
  for (const r of Object.values(T.rails)) {
    if (r.hold) {
      const i = Math.floor(r.n * r.hold.at),
        ring = new THREE.Group();
      ring.position.set(r.x[i] - 320, r.h3[i] + 2, r.y[i]);
      R3.scene.add(ring);
      const mat = SM({color: '#abdfff', emissive: '#8bdfff', emissiveIntensity: 0.7, metalness: 0.6, roughness: 0.2});
      const disk = mesh(ring, new THREE.TorusGeometry(18, 3, 8, 32), mat, 0, 0, 0);
      disk.rotation.x = Math.PI / 2;
      R3.movingParts.push({magnet: r, mat});
    }
    if (r.next) {
      const n = r.n - 1,
        root = new THREE.Group();
      root.position.set(r.x[n] - 320, r.h3[n] + 3, r.y[n]);
      R3.scene.add(root);
      mesh(root, new THREE.BoxGeometry(4, 14, 35), steel, 0, 7, 10);
      R3.movingParts.push({diverter: r, root});
    }
  }
}
export function frameMovingParts(balls) {
  for (const o of R3.movingParts || []) {
    if (o.diverter) {
      o.root.rotation.y = o.diverter.divert ? -0.85 : 0.35;
      continue;
    }
    if (o.magnet) {
      o.mat.emissiveIntensity = balls.some(b => b.rail === o.magnet && b.railHold > 0) ? 3 : 0.45;
      continue;
    }
    const m = o.m;
    if (o.ball) o.ball.position.set(m.dx * m.s, m.radius, m.dy * m.s);
    m.leaves?.forEach((l, i) => {
      o.leaves[i].position.set(l.x || 0, m.kind === 'shutter' ? m.position * m.lift : 0, l.y || 0);
      o.leaves[i].rotation.y = -l.a;
    });
    if (o.animate) o.animate();
  }
}
