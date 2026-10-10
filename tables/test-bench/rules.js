import {
  FIELD_INDEX,
  G,
  callFoes,
  campFoes,
  float,
  gold,
  heal,
  lockBall,
  newSide,
  popup,
  relight,
  score
} from '../../engine/api.js';

/* Test Bench: the table's own rules. Kept small on purpose. What is new in the engine and used here:
     on      the table's say on plain events (a ramp made, a chute ridden, a slingshot, a ball served)
     status  a lamp state of the table's own (the West Wing's HOOKS lamp shows it)
   See docs/TABLE_FORMAT.md, "Rules". */
export const rules = {
  newRun(r) {
    r.rides = 0; // chutes ridden this run
    r.whips = 0; // times round the Whip this ball
  },
  tick(dt) {
    if (G.benchT > 0) G.benchT -= dt;
  },
  lamps(add, r) {
    if (r.lockLit) add('hatch', 'lock', r.locks > 0 ? 'flash' : 'lit');
    if (r.side.length < 2) add('den', 'soft', 'lit');
  },
  // a lamp state of this table's own: lit for five seconds after any chute, flashing for the first two
  status: {
    bench: () => (G.benchT > 3 ? 2 : G.benchT > 0 ? 1 : 0)
  },
  on: {
    // a ball has just been served
    ball(what, ball, r) {
      r.whips = 0;
    },
    // a drain ramp has set a ball down on another field
    chute(ramp, ball, r) {
      r.rides++;
      G.benchT = 5;
      if (ball) float(ball.x, ball.y - 30, ramp.name.toUpperCase(), '#62d8ff', 12);
    },
    // a ramp made: the Whip pays more each time round, until the ball is lost
    ramp(ramp, ball, r) {
      if (ramp.id !== 'whip') return;
      r.whips++;
      score(2000 * r.whips, ball.x, ball.y);
      if (r.whips % 3 === 0) {
        r.mult = Math.min(6, r.mult + 1);
        popup('Whip Cracked', 'Multiplier ' + r.mult + 'x', 'good');
      }
    },
    // the West Wing's own slingshots pay a little: they are pieces of the layout, so they are this table's business
    sling(s, ball, r) {
      if (s.tier === FIELD_INDEX.west) score(50);
    }
  },
  onComplete: {
    start(x, y, r) {
      r.mult = Math.min(6, r.mult + 1);
      popup('Start Lanes', 'Multiplier ' + r.mult + 'x', 'good');
    },
    guard(x, y, r) {
      r.lockLit = true;
      r.kickback = true;
      popup('Guard Down', 'The Hatch lock is lit. Kickback lit', 'good');
    },
    tops(x, y) {
      heal(10);
      G.save = Math.max(G.save, 10);
      popup('Top Lanes', 'Healed. Ball save for 10 seconds', 'good');
    },
    rails() {
      G.buffs.moon = 20;
      popup('Rail Lanes', 'Double scoring for 20 seconds', 'good');
    },
    floor() {
      G.buffs.aegis = 30;
      popup('Floor Lanes', 'Half damage for 30 seconds', 'good');
    },
    crest(x, y) {
      G.buffs.sharp = 30;
      callFoes(FIELD_INDEX.crown, campFoes(2), 'THE CREST CALLS', x, y);
      popup('Crest', '+25% damage for 30 seconds', 'good');
    },
    stack(x, y) {
      gold(20, x, y);
    },
    bars(x, y) {
      heal(8);
      callFoes(FIELD_INDEX.apex, campFoes(2), 'THE BARS RATTLE', x, y);
    },
    cross(x, y, r) {
      r.charge = Math.min(100, r.charge + 25);
      popup('Cross Bank', 'Power +25', 'good');
    }
  },
  onScoop: {
    den(h, b, hd, r) {
      if (r.side.length < 2) newSide();
      else gold(5, h.x, h.y);
      hd.delay = 1.2;
    },
    hatch(h, b, hd, r) {
      if (r.lockLit && !G.mb && !G.fallen) lockBall(b);
      else {
        hd.plan = 'tunnel';
        hd.delay = 0.6;
        float(h.x, h.y - 32, 'TO THE EAST WING', '#ffe2a0', 13);
      }
    },
    vault(h, b, hd) {
      hd.plan = 'tunnel';
      hd.delay = 0.6;
      float(h.x, h.y - 32, 'ALL THE WAY DOWN', '#ffe2a0', 13);
    },
    dock(h) {
      gold(8, h.x, h.y);
    },
    nook(h) {
      const cursed = Object.keys(G.curse).length > 0;
      G.curse = {};
      heal(8);
      float(h.x, h.y - 32, cursed ? 'CLEANSED' : 'RESTED', '#d8fbff', 13);
    },
    lift(h, b, hd, r) {
      r.mult = Math.min(6, r.mult + 1);
      float(h.x, h.y - 32, r.mult + 'X', '#ffd24a', 14);
      relight();
    },
    pit(h) {
      gold(12, h.x, h.y);
    }
  }
};
