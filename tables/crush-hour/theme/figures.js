import {BM, PI, SM, biped, clamp, foeEyes, foePart, foePivot, hdr} from '../../../engine/api.js';

/* Crush Hour: the rivals. Six of this table's own jointed figures, all cut from one pattern: a small body under a
   big head, big eyes, a blush. The engine poses the joints it knows (hip, legs, body, arms, head) exactly as it
   poses its stock figures; `poses` below adds what each one does with its hands.
   (The Loose Corgi and the Butterflies are stock figures, recoloured in content.js.) */
const mat = (color, o) => SM(Object.assign({color, roughness: 0.8}, o || {}));
const HAIR = {
  // each adds to the head, over a cap of hair that every style starts with
  tails(h, m) {
    for (const sx of [-1, 1]) {
      foePart(h, new THREE.SphereGeometry(3.6, 8, 7), m, sx * 9.5, 3, -2);
      foePart(h, new THREE.ConeGeometry(3, 12, 7).rotateX(PI), m, sx * 11, -5, -2);
    }
  },
  cap(h, m, o) {
    const c = mat(o.capCol || '#8ff0c8');
    foePart(h, new THREE.SphereGeometry(9.3, 12, 8, 0, PI * 2, 0, PI * 0.45), c, 0, 0.6, 0);
    foePart(h, new THREE.BoxGeometry(11, 1.4, 7), c, 0, 3.2, -10.5);
  },
  beret(h, m, o) {
    const c = mat(o.capCol || '#d0564a');
    foePart(h, new THREE.SphereGeometry(8.6, 12, 8).scale(1.1, 0.42, 1.1), c, 2, 8, 0);
    foePart(h, new THREE.SphereGeometry(1.2, 6, 5), c, 2, 11.8, 0);
  },
  bun(h, m) {
    foePart(h, new THREE.SphereGeometry(4.4, 9, 8), m, 0, 9.4, -3.5);
  },
  band(h, m, o) {
    foePart(h, new THREE.TorusGeometry(8.6, 1.1, 5, 18).rotateX(PI / 2), mat(o.capCol || '#ffffff'), 0, 3.6, 0);
    foePart(h, new THREE.ConeGeometry(2.4, 9, 6).rotateX(-PI / 2 - 0.5), m, 0, 5, -9);
  }
};
// the pattern. o: skin, hair, style, top, bottom, eye, scale, and what to hold
function chibi(o) {
  return (g, m) => {
    const s = o.scale || 1,
      skin = mat(o.skin || '#ffdcc8'),
      hair = mat(o.hair, {roughness: 0.6}),
      top = mat(o.top),
      bottom = mat(o.bottom || o.top),
      R = 8.6 * s;
    const P = biped(g, {
      hip: 8 * s,
      stance: 3.2 * s,
      leg: 2.1 * s,
      legM: o.legs ? mat(o.legs) : skin,
      torso: 10 * s,
      torsoG: new THREE.CylinderGeometry(4.4 * s, (o.skirt ? 7.4 : 5.6) * s, 10 * s, 12),
      torsoM: top,
      shoulder: 5.8 * s,
      arm: 1.7 * s,
      armLen: 9 * s,
      armM: top,
      headR: R
    });
    if (o.skirt) foePart(P.hip, new THREE.CylinderGeometry(5.4 * s, 8 * s, 4.5 * s, 12), bottom, 0, 0.4 * s, 0);
    else foePart(P.hip, new THREE.CylinderGeometry(5.4 * s, 5 * s, 3 * s, 10), bottom, 0, 0, 0);
    // the head: skin, a cap of hair, a fringe, eyes and a blush
    foePart(P.head, new THREE.SphereGeometry(R, 14, 12), skin, 0, 0, 0);
    foePart(P.head, new THREE.SphereGeometry(R * 1.06, 14, 10, 0, PI * 2, 0, PI * 0.52), hair, 0, 0.3, -0.6 * s);
    foePart(
      P.head,
      new THREE.SphereGeometry(R * 0.98, 12, 8, 0, PI * 2, 0, PI * 0.3).rotateX(0.75),
      hair,
      0,
      0.6,
      0.9 * s
    );
    const eye = m[o.eye || 'eyeV'];
    eye.color.copy(hdr(o.eyeCol || '#4a2244', 1));
    foeEyes(P.head, eye, 3.1 * s, -0.9 * s, R * 0.9, 1.7 * s);
    for (const sx of [-1, 1]) {
      foePart(
        P.head,
        new THREE.SphereGeometry(0.6 * s, 5, 4),
        BM({color: '#ffffff'}),
        sx * 3.1 * s - 0.6 * s,
        -0.2 * s,
        R * 0.9 + 1.5 * s
      );
      const bl = foePart(
        P.head,
        new THREE.SphereGeometry(1.5 * s, 6, 5).scale(1, 0.6, 0.4),
        BM({color: '#ff8fb4'}),
        sx * 5.4 * s,
        -3 * s,
        R * 0.78
      );
      bl.castShadow = false;
    }
    if (HAIR[o.style]) HAIR[o.style](P.head, hair, o);
    if (o.hold) o.hold(P, s);
    return {P, h: (8 + 10 + 17) * s, eyes: eye};
  };
}

export const figures = {
  // a phone in one hand and a lot to say
  gossip: chibi({
    hair: '#ffb86b',
    style: 'tails',
    top: '#ff9ac8',
    bottom: '#3d5a8a',
    skirt: true,
    hold(P, s) {
      P.weapon = foePart(
        P.armR,
        new THREE.BoxGeometry(3.2, 5.4, 0.9),
        mat('#2a3a4a', {roughness: 0.3}),
        0,
        -9.6 * s,
        2
      );
      foePart(P.weapon, new THREE.BoxGeometry(2.6, 4.4, 0.3), BM({color: hdr('#7fd4ff', 1.6)}), 0, 0, 0.6);
    }
  }),
  // a cap, a hoodie, and (when it has got one) your note under its arm
  snatcher: chibi({
    hair: '#5a4a3a',
    style: 'cap',
    capCol: '#8ff0c8',
    top: '#7fd4ff',
    bottom: '#3a4a5a',
    legs: '#3a4a5a',
    hold(P, s) {
      P.loot = foePart(P.body, new THREE.BoxGeometry(7, 5, 0.8), mat('#fff6fa'), 0, 6 * s, -5.4 * s);
      foePart(P.loot, new THREE.SphereGeometry(1.4, 6, 5).scale(1, 1, 0.3), BM({color: '#ff5f9e'}), 0, 0, -0.5);
      P.loot.visible = false;
    }
  }),
  // a beret, a scarf, an open book and a heart that swells as the sonnet goes on
  poet: chibi({
    hair: '#3a2a4a',
    style: 'beret',
    capCol: '#d0564a',
    top: '#2c3a66',
    bottom: '#2c3a66',
    legs: '#2c3a66',
    hold(P, s) {
      foePart(P.body, new THREE.TorusGeometry(4.8 * s, 1.5, 6, 14).rotateX(PI / 2), mat('#ffd24a'), 0, 9.4 * s, 0);
      P.weapon = foePart(P.armL, new THREE.BoxGeometry(6.4, 0.9, 5), mat('#fff6d8'), 0, -9.4 * s, 2.6);
      P.tip = foePart(
        P.weapon,
        new THREE.OctahedronGeometry(2.2, 0).scale(1, 1.15, 0.6),
        BM({color: hdr('#ff7eb6', 1.2)}),
        0,
        6,
        0
      );
      P.tip.castShadow = false;
    }
  }),
  // grown up, hair in a bun, spectacles, and a clipboard held like a shield
  chaperone: chibi({
    scale: 1.18,
    hair: '#b8b0c8',
    style: 'bun',
    top: '#9478c4',
    bottom: '#553c78',
    skirt: true,
    legs: '#553c78',
    hold(P, s) {
      for (const sx of [-1, 1])
        foePart(
          P.head,
          new THREE.TorusGeometry(2.6 * s, 0.45, 5, 12),
          mat('#4a2244', {metalness: 0.5}),
          sx * 3.4 * s,
          -1 * s,
          8.4 * s
        );
      P.shield = foePart(P.armL, new THREE.BoxGeometry(11, 14, 1.2), mat('#d8b890'), -1, -9 * s, 3.4);
      foePart(P.shield, new THREE.BoxGeometry(9, 11.4, 0.4), mat('#ffffff'), 0, -0.6, 0.8);
      foePart(P.shield, new THREE.BoxGeometry(4.4, 1.6, 0.8), mat('#8a94a8', {metalness: 0.7}), 0, 6.4, 0.7);
    }
  }),
  // a headband, a navy jacket and a bamboo sword
  captain: chibi({
    scale: 1.12,
    hair: '#2a2a3a',
    style: 'band',
    capCol: '#ffffff',
    top: '#2c3a66',
    bottom: '#22345a',
    skirt: true,
    legs: '#22345a',
    hold(P, s) {
      P.weapon = foePart(P.armR, new THREE.CylinderGeometry(0.9, 1.1, 30, 6), mat('#e8cf9a'), 0, -10 * s, 9);
      P.weapon.rotation.x = -PI / 2;
      foePart(P.weapon, new THREE.CylinderGeometry(2.2, 2.2, 1.2, 10), mat('#4a2244'), 0, -8, 0);
    }
  }),
  // somebody in the school's bear suit: all head, with a ribbon
  mascot: chibi({
    scale: 1.7,
    skin: '#f0b070',
    hair: '#f0b070',
    top: '#f0b070',
    bottom: '#d8904a',
    legs: '#d8904a',
    eyeCol: '#3a2a2a',
    hold(P, s) {
      const fur = mat('#f0b070'),
        pale = mat('#fff1dc');
      for (const sx of [-1, 1]) {
        foePart(P.head, new THREE.SphereGeometry(3.4 * s, 10, 8), fur, sx * 6.6 * s, 7 * s, 0);
        foePart(P.head, new THREE.SphereGeometry(1.9 * s, 8, 6), pale, sx * 6.6 * s, 7 * s, 1.8 * s);
      }
      foePart(P.head, new THREE.SphereGeometry(3 * s, 10, 8).scale(1.2, 0.85, 0.8), pale, 0, -3.4 * s, 7 * s);
      foePart(P.head, new THREE.SphereGeometry(0.9 * s, 6, 5), mat('#3a2a2a'), 0, -2.4 * s, 9.4 * s);
      foePart(P.body, new THREE.SphereGeometry(5.6 * s, 12, 10).scale(1.15, 1, 1), fur, 0, 5 * s, 0);
      foePart(P.body, new THREE.SphereGeometry(3.6 * s, 10, 8).scale(1, 1, 0.5), pale, 0, 5 * s, 4.6 * s);
      const bow = mat('#ff5f9e');
      for (const sx of [-1, 1])
        foePart(
          P.body,
          new THREE.ConeGeometry(2.2 * s, 4.4 * s, 6).rotateZ((sx * PI) / 2),
          bow,
          sx * 2.6 * s,
          10.4 * s,
          4.4 * s
        );
    }
  })
};

// what each one does with its hands, on top of the engine's own posing: (rig, foe, time, def, parts)
export const poses = {
  snatcher(rig, e, t, d, P) {
    P.loot.visible = !!e.loot;
  },
  poet(rig, e, t, d, P) {
    const f = 1 - e.castT / d.cast,
      up = clamp((f - 0.2) / 0.6, 0, 1);
    if (e.stun <= 0) {
      P.armL.rotation.x = -1.1 - 0.5 * up;
      P.armR.rotation.x = -0.3 - 1.9 * up;
    }
    P.tip.material.color.copy(hdr('#ff7eb6', 0.9 + 2.2 * up));
    P.tip.rotation.y = t * 2.4;
    P.tip.scale.setScalar(1 + 1.2 * up + (up > 0.9 ? 0.25 * Math.sin(t * 26) : 0));
  },
  chaperone(rig, e, t, d, P) {
    if (e.stun <= 0 && e.wind <= 0 && rig.strikeT <= 0) {
      P.armL.rotation.x = -1.3;
      P.armL.rotation.y = 0.4;
    }
  },
  gossip(rig, e, t, d, P) {
    if (e.stun <= 0 && e.wind <= 0 && rig.strikeT <= 0 && !e.moving) P.armR.rotation.x = -1.9 + Math.sin(t * 5) * 0.08;
    P.head.rotation.z = Math.sin(t * 3.1) * 0.1;
  },
  mascot(rig, e, t, d, P) {
    if (e.stun <= 0 && e.wind <= 0 && rig.strikeT <= 0) {
      P.armL.rotation.z = -0.5 + Math.sin(t * 2) * 0.25;
      P.armR.rotation.z = 0.5 - Math.sin(t * 2) * 0.25;
    }
  }
};
