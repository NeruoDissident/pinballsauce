/* ================= STOCK FIGURES =================
   Eight jointed figures any table can use for its foes, and the flourishes that go with them. A foe in content.foes
   picks one with `figure` (it defaults to the foe's own key) and can recolour it with `tint`:
     drone:{name:'Scrap Drone', job:'swarm', figure:'skeleton', tint:{bone:'#8fa0b0', eyeG:'#43e7ed'}, ...}
   skeleton, goblin, cultist, revenant, knight, troll are bipeds; wolf goes on four legs; spirit floats.
   Material names a tint can use are the keys of foeMats() in figures.js. A theme can still supply its own builder
   for a foe type in theme.figures. */
import {PI, clamp} from '../core/util.js';
import {hdr} from './core.js';
import {biped, foeEyes, foePart, foePivot, limbG} from './figures.js';

export const FIGURES = {
  skeleton(g, m) {
    const P = biped(g, {
      hip: 17,
      stance: 4,
      leg: 1.7,
      legM: m.bone,
      torso: 13,
      torsoG: new THREE.BoxGeometry(2.2, 13, 2.2),
      torsoM: m.bone,
      shoulder: 8,
      arm: 1.5,
      armLen: 14,
      armM: m.bone,
      headR: 6
    });
    foePart(P.head, new THREE.SphereGeometry(6, 10, 8), m.bone, 0, 0, 0);
    foePart(P.head, new THREE.BoxGeometry(6, 3, 4), m.bone, 0, -5, 1.5);
    foeEyes(P.head, m.eyeG, 2.4, 0.5, 5.2, 1.6);
    for (let k = 0; k < 4; k++)
      foePart(P.body, new THREE.TorusGeometry(5.2 - k * 0.7, 0.8, 5, 10).rotateX(PI / 2), m.bone, 0, 11 - k * 2.6, 0);
    foePart(P.body, new THREE.BoxGeometry(14, 2, 2.4), m.bone, 0, 12.5, 0);
    foePart(P.hip, new THREE.BoxGeometry(9, 2.4, 4), m.bone, 0, -0.6, 0);
    P.weapon = foePart(P.armR, new THREE.BoxGeometry(1.8, 22, 0.8), m.rust, 0, -13, 8);
    P.weapon.rotation.x = -PI / 2;
    foePart(P.armR, new THREE.BoxGeometry(6, 1.5, 1.5), m.wood, 0, -13, -1);
    return {P, h: 41, eyes: m.eyeG};
  },
  goblin(g, m) {
    const P = biped(g, {
      hip: 12,
      stance: 4,
      leg: 2,
      legM: m.gob,
      torso: 11,
      torsoG: new THREE.SphereGeometry(6, 10, 8).scale(1, 1, 0.8),
      torsoM: m.gobD,
      shoulder: 7,
      arm: 1.7,
      armLen: 11,
      armM: m.gob,
      headR: 6.5
    });
    foePart(P.head, new THREE.SphereGeometry(6.5, 10, 8), m.gob, 0, 0, 0);
    for (const sx of [-1, 1]) {
      const ear = foePart(P.head, new THREE.ConeGeometry(2.2, 10, 5).rotateZ((-sx * PI) / 2), m.gob, sx * 8.5, 2.5, -1);
      ear.rotation.y = sx * 0.4;
    }
    foeEyes(P.head, m.eyeY, 3, 0.5, 6, 1.7);
    foePart(P.head, new THREE.ConeGeometry(1.5, 4, 5).rotateX(PI / 2), m.gob, 0, -2, 7);
    P.weapon = foePart(P.armR, new THREE.ConeGeometry(1.4, 10, 4).rotateX(PI / 2), m.rust, 0, -11, 6);
    P.loot = foePart(P.body, new THREE.SphereGeometry(5.5, 8, 7), m.sack, 0, 7, -7.5);
    P.loot.visible = false;
    return {P, h: 31, eyes: m.eyeY};
  },
  cultist(g, m) {
    const P = {};
    P.hip = foePivot(g, 0, 8, 0);
    P.body = foePivot(P.hip, 0, 0, 0);
    foePart(P.body, new THREE.ConeGeometry(9, 30, 8).translate(0, 15 - 8, 0), m.robe, 0, 0, 0);
    foePart(P.body, new THREE.TorusGeometry(6, 1, 5, 12).rotateX(PI / 2), m.trim, 0, 14, 0);
    P.armL = foePivot(P.body, -7, 19, 0);
    P.armR = foePivot(P.body, 7, 19, 0);
    foePart(P.armL, limbG(2, 1.5, 12), m.robe);
    foePart(P.armR, limbG(2, 1.5, 12), m.robe);
    P.head = foePivot(P.body, 0, 26, 0);
    foePart(P.head, new THREE.SphereGeometry(5.5, 9, 8), m.robe, 0, 0, 0);
    foePart(P.head, new THREE.ConeGeometry(6, 9, 8), m.robe, 0, 5, -1);
    foeEyes(P.head, m.eyeV, 2.2, 0, 4.6, 1.4);
    const staff = foePart(P.armR, new THREE.CylinderGeometry(0.9, 0.9, 36, 5), m.wood, 0, -12, 4);
    P.tip = foePart(staff, new THREE.OctahedronGeometry(3.2, 0), m.staff, 0, 19, 0);
    P.weapon = staff;
    P.robed = true;
    return {P, h: 38, eyes: m.eyeV};
  },
  revenant(g, m) {
    const P = biped(g, {
      hip: 16,
      stance: 4.5,
      leg: 2,
      legM: m.bone,
      torso: 14,
      torsoG: new THREE.BoxGeometry(13, 14, 8),
      torsoM: m.plate,
      shoulder: 8.5,
      arm: 1.8,
      armLen: 13,
      armM: m.bone,
      headR: 6
    });
    foePart(P.head, new THREE.SphereGeometry(6, 10, 8), m.bone, 0, 0, 0);
    foePart(P.head, new THREE.CylinderGeometry(6.6, 7, 7, 10), m.rust, 0, 2, 0);
    foeEyes(P.head, m.eyeG, 2.4, -0.5, 5.4, 1.6);
    for (const sx of [-1, 1]) foePart(P.body, new THREE.SphereGeometry(4.2, 7, 6), m.rust, sx * 8.5, 13, 0);
    P.shield = foePart(P.armL, new THREE.CylinderGeometry(10, 10, 1.6, 14).rotateX(PI / 2), m.rust, -2, -9, 3);
    foePart(P.shield, new THREE.SphereGeometry(2.5, 6, 5), m.iron, 0, 0, 1.2);
    P.weapon = foePart(P.armR, new THREE.CylinderGeometry(1, 1, 18, 5), m.wood, 0, -13, 6);
    P.weapon.rotation.x = -PI / 2;
    foePart(P.weapon, new THREE.DodecahedronGeometry(3.6, 0), m.iron, 0, 9, 0);
    return {P, h: 44, eyes: m.eyeG};
  },
  knight(g, m) {
    const P = biped(g, {
      hip: 19,
      stance: 5,
      leg: 2.4,
      legM: m.plate,
      torso: 16,
      torsoG: new THREE.BoxGeometry(14, 16, 8),
      torsoM: m.plate,
      shoulder: 10.5,
      arm: 2.2,
      armLen: 15,
      armM: m.plate,
      headR: 6.5
    });
    foePart(P.head, new THREE.CylinderGeometry(6, 6.4, 10, 10), m.plate, 0, 0, 0);
    foePart(P.head, new THREE.BoxGeometry(8, 1.6, 2), m.eyeR, 0, 0.5, 5.6);
    foePart(P.head, new THREE.ConeGeometry(2.4, 10, 6).rotateX(-0.5), m.cape, 0, 7, -3);
    for (const sx of [-1, 1]) foePart(P.body, new THREE.SphereGeometry(5, 7, 6), m.plate, sx * 10, 15, 0);
    P.cape = foePart(P.body, new THREE.PlaneGeometry(14, 22).translate(0, -11, 0), m.cape, 0, 15, -5);
    P.weapon = foePart(P.armR, new THREE.BoxGeometry(2.4, 30, 1.2), m.rust, 0, -15, 9);
    P.weapon.rotation.x = -PI / 2;
    foePart(P.armR, new THREE.BoxGeometry(9, 1.8, 1.8), m.iron, 0, -15, -1);
    return {P, h: 50, eyes: m.eyeR};
  },
  troll(g, m) {
    const P = biped(g, {
      hip: 17,
      stance: 8,
      leg: 4.5,
      legM: m.troll,
      torso: 22,
      torsoG: new THREE.SphereGeometry(14, 12, 10).scale(1, 0.85, 0.75),
      torsoM: m.troll,
      shoulder: 17,
      arm: 4,
      armLen: 26,
      armM: m.troll,
      headR: 8
    });
    foePart(P.body, new THREE.SphereGeometry(10, 10, 8).scale(1, 0.8, 0.6), m.tbelly, 0, 8, 8);
    foePart(P.head, new THREE.SphereGeometry(8, 10, 8).scale(1, 0.85, 1), m.troll, 0, 0, 6);
    foePart(P.head, new THREE.SphereGeometry(3.5, 7, 6), m.tbelly, 0, -2, 10);
    foeEyes(P.head, m.eyeO, 3.4, 2, 12.5, 1.8);
    for (const sx of [-1, 1]) foePart(P.head, new THREE.ConeGeometry(1.4, 5, 5), m.bone, sx * 3.5, -4, 13);
    P.weapon = foePart(P.armR, new THREE.CylinderGeometry(2, 4, 30, 6), m.wood, 0, -26, 8);
    P.weapon.rotation.x = -PI / 2;
    P.hunch = 0.5;
    return {P, h: 52, eyes: m.eyeO};
  },
  wolf(g, m) {
    const P = {};
    P.hip = foePivot(g, 0, 18, 0);
    P.body = foePivot(P.hip, 0, 0, 0);
    foePart(P.body, new THREE.SphereGeometry(5, 10, 8).scale(1, 0.95, 2.7), m.fur, 0, 0, 0);
    foePart(P.body, new THREE.SphereGeometry(6.2, 10, 8).scale(1, 0.95, 1.1), m.mane, 0, 1, 7);
    foePart(P.body, new THREE.SphereGeometry(4, 8, 6).scale(1, 0.7, 2.3), m.belly, 0, -3.5, -2);
    P.head = foePivot(P.body, 0, 5, 15);
    foePart(P.head, new THREE.SphereGeometry(4.6, 10, 8).scale(1, 0.9, 1.3), m.fur, 0, 0, 3);
    foePart(P.head, new THREE.SphereGeometry(2.6, 8, 6).scale(1, 0.8, 2.2), m.belly, 0, -1.5, 8);
    for (const sx of [-1, 1]) foePart(P.head, new THREE.ConeGeometry(2, 6, 4), m.fur, sx * 3.2, 6, -1);
    foeEyes(P.head, m.eyeY, 2.6, 1.5, 6.2, 1.3);
    P.tail = foePart(P.body, new THREE.ConeGeometry(1.8, 14, 5).rotateX(-PI * 0.65), m.fur, 0, 3, -19);
    P.legs = [];
    for (const q of [
      [-4, 9],
      [4, 9],
      [-4, -10],
      [4, -10]
    ]) {
      const L = foePivot(P.body, q[0], -3, q[1]);
      foePart(L, limbG(1.9, 1.4, 15), m.fur);
      P.legs.push(L);
    }
    P.quad = true;
    return {P, h: 30, eyes: m.eyeY};
  },
  spirit(g, m) {
    const P = {};
    P.hip = foePivot(g, 0, 16, 0);
    P.body = foePivot(P.hip, 0, 0, 0);
    const sheet = foePart(P.body, new THREE.ConeGeometry(9, 30, 9, 1, true).translate(0, 15 - 6, 0), m.ghost, 0, 0, 0);
    sheet.castShadow = false;
    P.head = foePivot(P.body, 0, 22, 0);
    const hd = foePart(P.head, new THREE.SphereGeometry(6.5, 10, 8), m.ghost, 0, 0, 0);
    hd.castShadow = false;
    foeEyes(P.head, m.eyeC, 2.6, 0, 5.4, 1.6);
    P.armL = foePivot(P.body, -7, 14, 2);
    P.armR = foePivot(P.body, 7, 14, 2);
    for (const a of [P.armL, P.armR]) {
      const x = foePart(a, limbG(2, 1, 12), m.ghost);
      x.castShadow = false;
      a.rotation.x = -0.9;
    }
    P.ghost = true;
    return {P, h: 38, eyes: m.eyeC};
  }
};
export const FIGURE_POSE = {
  // per-type flourishes on top of the engine's posing: (rig, foe, time, def, parts)
  cultist(rig, e, t, d, P) {
    const f = 1 - e.castT / d.cast,
      up = clamp((f - 0.3) / 0.5, 0, 1);
    if (e.stun <= 0) {
      P.armL.rotation.x = -0.4 - 2.2 * up;
      P.armR.rotation.x = -0.4 - 2.2 * up;
    }
    P.tip.material.color.set(hdr('#c08cff', 0.8 + 2.4 * up));
    P.tip.rotation.y = t * 3;
    P.tip.scale.setScalar(1 + 0.4 * up + (up > 0.9 ? 0.3 * Math.sin(t * 30) : 0));
  },
  revenant(rig, e, t, d, P) {
    if (e.stun <= 0 && e.wind <= 0 && rig.strikeT <= 0) {
      P.armL.rotation.x = -1.3;
      P.armL.rotation.y = 0.4;
    }
  },
  goblin(rig, e, t, d, P) {
    P.loot.visible = !!e.loot;
  },
  wolf(rig, e, t, d, P) {
    const l = e.state === 'lunge';
    P.body.scale.set(1, l ? 0.85 : 1, l ? 1.35 : 1);
    P.body.rotation.x = l ? 0.35 : 0;
    P.tail.rotation.z = Math.sin(t * 6) * 0.3;
    P.head.rotation.x = l ? -0.3 : 0;
  },
  troll(rig, e, t, d, P) {
    if (e.stun <= 0 && e.wind <= 0 && rig.strikeT <= 0) {
      P.armL.rotation.x = 0.4 + Math.sin(t * 1.5) * 0.1;
      P.armR.rotation.x = 0.4 - Math.sin(t * 1.5) * 0.1;
    }
  }
};
