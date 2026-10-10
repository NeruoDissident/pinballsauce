import {G, float, fmt, lockBall, popup, relight, score} from '../../engine/api.js';

/* Starfall: the table's own rules. What each bank, lane set and scoop gives (PINBALL.md, section 5: "each small
   thing gives something"), one risk-and-reward feature of its own (the cargo), and the lamps that go with them.
   No classes, no enemies, no party: see `uses` in table.js. */
const CARGO_MAX = 60000;
const load = (r, n, x, y) => {
  r.cargo = Math.min(CARGO_MAX, r.cargo + n);
  if (x !== undefined && r.cargo >= 10000 && r.cargo - n < 10000) float(x, y - 30, 'CARGO READY', '#ffb050', 13);
  relight();
};

export const rules = {
  newRun(r) {
    r.cargo = 0; // built by laps and asteroids, banked at the Dock, lost with the ball
  },
  // this table's shot lights. add(shotId, colour, state)
  lamps(add, r) {
    if (r.lockLit) add('airlock', 'lock', r.locks > 0 ? 'flash' : 'lit');
    else if (r.locks > 0) add('airlock', 'lock', 'done');
    else add('sensors', 'soft', 'lit'); // the way to light the lock
    if (r.cargo >= 10000) add('dock', 'gold', r.cargo >= 30000 ? 'flash' : 'lit');
    if (!r.kickback) add('hull', 'soft', 'lit'); // the way to relight the kickback
  },
  // this table's own state lamp: lit with cargo worth banking, flashing when it is big
  status: {
    cargo: r => (r.cargo >= 30000 ? 2 : r.cargo >= 10000 ? 1 : 0)
  },
  on: {
    ball(what, ball, r) {
      r.cargo = 0;
      r.bb.targets = 0;
    },
    ramp(ramp, ball, r) {
      load(r, 4000, ball.x, ball.y);
    },
    bump(b, ball, r) {
      load(r, 300);
    },
    target(s, ball, r) {
      r.bb.targets++;
    },
    drop(s, ball, r) {
      r.bb.targets++;
    }
  },
  // the goal line in the HUD if the mission is switched off (uses:{quests:false}): the cargo is the game then
  objective(r) {
    return r.cargo >= 10000 ? 'Bank the cargo at the Dock: ' + fmt(r.cargo) : 'Build cargo: laps and Asteroids';
  },
  // the end-of-ball bonus counts targets as well as ramps
  bonus(r, bb) {
    return [['Targets', bb.targets || 0, (bb.targets || 0) * 150]];
  },
  onComplete: {
    beacons(x, y, r) {
      r.mult = Math.min(6, r.mult + 1);
      popup('Beacons Lit', 'Multiplier ' + r.mult + 'x', 'good');
    },
    hull(x, y, r) {
      r.kickback = true;
      G.save = Math.max(G.save, 10);
      popup('Hull Sealed', 'Kickback lit. Ball save for 10 seconds', 'good');
    },
    sensors(x, y, r) {
      r.lockLit = true;
      G.buffs.moon = 20;
      popup('Sensors Awake', 'The Airlock lock is lit. Double scoring for 20 seconds', 'good');
    },
    thrusters(x, y, r) {
      if (r.cargo > 0) {
        load(r, r.cargo, x, y);
        float(x, y - 34, 'CARGO DOUBLED', '#ffb050', 13);
      } else score(2000, x, y);
    }
  },
  onScoop: {
    // the Dock banks the cargo
    dock(h, b, hd, r) {
      if (r.cargo > 0) {
        score(r.cargo, h.x, h.y, 'CARGO');
        r.cargo = 0;
      }
      hd.delay = 1;
    },
    // the Airlock holds a ball when the lock is lit; the second one starts multiball
    airlock(h, b, hd, r) {
      if (r.lockLit && !G.mb) lockBall(b);
      else score(1500, h.x, h.y);
    }
  }
};
