import {
  FIELD_INDEX,
  G,
  RECRUIT_MAX,
  T,
  TAVERN_RECRUITS,
  burst,
  callFoes,
  campFoes,
  drawTavern,
  flash,
  float,
  gold,
  heal,
  later,
  lockBall,
  newSide,
  pick,
  popup,
  recruitCost,
  relight,
  score,
  spawnEnemy,
  spawnPickup,
  startMultiball,
  tavernOpen,
  waveJoin,
  xp
} from '../../engine/api.js';

/* Crush Hour: the table's own rules.
   The engine runs the pinball, the classes, the rivals, the people to win over and the routes. What is written here
   is what THIS table's features do when they are completed or shot: one function per bank or lane set (onComplete),
   one per scoop (onScoop), the lamps that belong to this table's features, and its timers. Everything used here
   comes from engine/api.js. See docs/TABLE_FORMAT.md, "Rules".

   The feature set is the one Gravebound and Neon Descent use, re-dressed, so the three play by the same book:
     Porch Lights = multiplier       Garden Gate = kickback + company    Sweet Shop = cheer up + cleanse
     Bike Rack = damage buff         Boba Cafe = favours + friends       Bus Stop = short cut to Sakura High
     Desks = lights the lock         Lockers = the lock                  Clubroom Door / Rooftop = short cut to the Plaza
     Nurse's Office = cleanse        Hall Passes = double scoring        Photo Booth = a treat on a timer
     Crepe Stand x2 = lights a wish  Wishing Fountain = Wish multiball   String Lights = cheer up + ball save

   One feature is this table's own: the Perfect Day. Three stops, one on each playfield (the Boba Cafe, the Rooftop,
   the Photo Booth). All three on one ball pays big and gives thirty seconds of double scoring; lose the ball first
   and the stops go out. It is the one goal that needs the whole heart. */
const PINK = '#ff9ac8';
const STOPS = {cafe: 'Boba', rooftop: 'Rooftop', photo: 'Photo'};
// a stop of the Perfect Day made: light it, and if that is all three, pay out
function dayStop(id, h, r) {
  if (r.day[id] || r.dayT > 0) return false;
  r.day[id] = 1;
  const n = Object.keys(STOPS).filter(k => r.day[k]).length;
  burst(h.x, h.y, 14, PINK, 240, 0.9, null, 'heart');
  if (n < 3) {
    float(h.x, h.y - 52, STOPS[id].toUpperCase() + ' ' + n + '/3', PINK, 13);
    score(5000 * n, h.x, h.y);
    return true;
  }
  r.day = {};
  r.dayT = 30;
  r.days = (r.days || 0) + 1;
  r.bb.days = (r.bb.days || 0) + 1;
  G.buffs.moon = Math.max(G.buffs.moon || 0, 30);
  r.kickback = true;
  score(50000, h.x, h.y);
  xp(25);
  flash(0.5, PINK);
  popup('The Perfect Day', 'Double scoring for 30 seconds. Kickback lit', 'main');
  for (let i = 0; i < 4; i++) later(0.15 * i, () => burst(h.x, h.y, 12, PINK, 320, 1.1, null, 'heart'));
  return true;
}

export const rules = {
  // once, when the table loads
  init() {
    G.photoT = 40;
  },
  // a new run: this table's own flags on the run (they are saved with it)
  newRun(r) {
    r.photoLit = true;
    r.wishLit = false;
    r.crepes = 0;
    r.day = {};
    r.dayT = 0;
    r.days = 0;
  },
  // every step: this table's own timers
  tick(dt, r) {
    if (!r.photoLit) {
      G.photoT -= dt;
      if (G.photoT <= 0) {
        r.photoLit = true;
        G.photoT = 40;
        relight();
      }
    }
    if (r.dayT > 0) {
      r.dayT -= dt;
      if (r.dayT <= 0) relight();
    }
  },
  // the lamps of this table's features. add(shotId, colour, state): colour main|side|lock|gold|soft|danger|spell, state flash|lit|done
  lamps(add, r) {
    if (r.lockLit) add('lockers', 'lock', r.locks > 0 ? 'flash' : 'lit');
    else if (r.locks > 0) add('lockers', 'lock', 'done');
    if (r.wishLit) add('fountain', 'gold', 'flash');
    if (r.photoLit) add('photo', 'soft', 'lit');
    else if (G.photoT > 0) add('photo', 'soft', 'done');
    if (r.side.length < 2 || (TAVERN_RECRUITS && tavernOpen())) add('cafe', 'soft', 'lit');
    if (G.doorT > 0) add('rooftop', 'gold');
    else if (T.banks.clubDoor.segs.some(x => !x.on)) add('rooftop', 'soft', 'lit');
    // the Perfect Day: the stops still to make
    if (!(r.dayT > 0)) for (const id in STOPS) if (!r.day[id]) add(id, 'gold', 'lit');
  },
  // this table's own state lamps (a `lamp` piece shows one): 0 dark, 1 lit, 2 flashing
  status: {
    wish: r => (r.wishLit ? 2 : 0),
    dayCafe: r => (r.dayT > 0 ? 2 : r.day.cafe ? 1 : 0),
    dayRoof: r => (r.dayT > 0 ? 2 : r.day.rooftop ? 1 : 0),
    dayPhoto: r => (r.dayT > 0 ? 2 : r.day.photo ? 1 : 0)
  },
  // one more line in the end-of-ball bonus
  bonus(r, bb) {
    return bb.days ? [['Perfect days', bb.days, bb.days * 10000]] : [];
  },

  /* ---------- a bank knocked down, or a lane set lit ---------- */
  onComplete: {
    // Maple Street
    porch(x, y, r) {
      r.mult = Math.min(6, r.mult + 1);
      heal(r.cls === 'cleric' ? 14 : 6);
      popup('Porch Lights On', 'Multiplier ' + r.mult + 'x', 'good');
    },
    gate(x, y, r) {
      r.kickback = true;
      callFoes(FIELD_INDEX.home, campFoes(2), 'THE NEIGHBOURS NOTICE', x, y);
      heal(5);
      popup('Garden Gate Open', 'Kickback lit', 'good');
    },
    sweets(x, y, r) {
      heal(r.cls === 'cleric' ? 30 : 18);
      G.curse = {};
      callFoes(FIELD_INDEX.home, ['jitters', 'jitters'], 'SUGAR AND BUTTERFLIES', x, y);
      popup('Sweet Tooth', 'Cheered up, and every hang-up lifted', 'good');
    },
    bikes(x, y, r) {
      G.buffs.sharp = 30;
      r.kickback = true;
      popup('New Wheels', '+25% charm for 30 seconds. Kickback lit', 'good');
    },
    // Sakura High
    desks(x, y, r) {
      r.lockLit = true;
      callFoes(FIELD_INDEX.school, ['snatcher', 'snatcher', 'snatcher'], 'NOTES ARE FLYING', x, y);
      popup('Desks Cleared', 'The Lockers are lit for a love letter', 'good');
    },
    passes(x, y, r) {
      G.buffs.moon = 20;
      r.photoLit = true;
      popup('Hall Passes', 'Double scoring for 20 seconds', 'good');
    },
    // Starlight Plaza
    crepe(x, y, r) {
      G.buffs.aegis = 30;
      callFoes(FIELD_INDEX.plaza, ['poet'], 'SOMEONE STARTS A SONNET', x, y);
      if (G.hoardDone) {
        heal(6);
        gold(10, x, y);
        return;
      }
      r.crepes = (r.crepes || 0) + 1;
      if (r.crepes >= 2) {
        r.crepes = 0;
        r.wishLit = true;
        popup('Two Crepes', 'Make a wish at the Fountain', 'good');
      } else popup('Sugar Rush', 'Half the embarrassment for 30 seconds. One more order lights a wish', 'good');
    },
    strings(x, y, r) {
      heal(12);
      G.save = Math.max(G.save, 10);
      popup('String Lights', 'Cheered up. Ball save for 10 seconds', 'good');
    }
  },

  /* ---------- a ball in a scoop. h is the scoop, b the ball, hd how it is held: hd.plan 'eject' | 'tunnel' | 'wait', hd.delay seconds ---------- */
  onScoop: {
    // the Boba Cafe: favours, friends for hire, and the first stop of the Perfect Day
    cafe(h, b, hd, r) {
      let got = dayStop('cafe', h, r);
      if (r.side.length < 2) {
        newSide();
        got = true;
      }
      if (TAVERN_RECRUITS && !G.demo && tavernOpen() && !G.pending.includes('tavern')) {
        r.tavern = drawTavern(3);
        hd.plan = 'wait';
        G.pending.push('tavern');
      } else if (!got) {
        float(
          h.x,
          h.y - 36,
          r.recruits.length >= RECRUIT_MAX
            ? 'The Cafe: everyone is already here'
            : 'The Cafe: ' + recruitCost() + ' bucks a friend',
          '#ffe4f0',
          12
        );
        gold(5, h.x, h.y);
      }
      hd.delay = 1.2;
    },
    busStop(h, b, hd, r) {
      hd.plan = 'tunnel';
      hd.delay = 0.6;
      float(h.x, h.y - 32, 'NEXT STOP: SAKURA HIGH', '#ffe4f0', 13);
    },
    // the Lockers: the multiball lock, or a few bucks and someone who noticed
    lockers(h, b, hd, r) {
      if (r.lockLit && !G.mb && !G.fallen) lockBall(b);
      else {
        gold(5, h.x, h.y);
        if (!G.enemies.some(e => e.type === 'chaperone' && e.tier === FIELD_INDEX.school))
          later(0.9, () => {
            const e = spawnEnemy('chaperone', FIELD_INDEX.school);
            if (e) {
              float(e.x, e.y - 40, 'A CHAPERONE NOTICED', '#d8f3ff', 12);
              waveJoin(e, FIELD_INDEX.school);
            }
          });
      }
    },
    // the Rooftop: behind the Clubroom Door. The fire stair comes down at the Plaza
    rooftop(h, b, hd, r) {
      hd.plan = 'tunnel';
      hd.delay = 0.6;
      score(10000);
      const day = dayStop('rooftop', h, r);
      if (!r.secret) {
        r.secret = 1;
        xp(12);
        popup('The Rooftop', 'The fire stair comes down at the Plaza', 'good');
      } else if (!day) float(h.x, h.y - 32, 'FIRE STAIR', '#ffd24a', 13);
    },
    // the Nurse's Office: lifts hang-ups, a little confidence
    nurse(h, b, hd, r) {
      const cursed = Object.keys(G.curse).length > 0;
      G.curse = {};
      heal(8);
      float(h.x, h.y - 32, cursed ? 'ALL BETTER' : 'A PLASTER AND A SMILE', '#d8f3ff', 13);
    },
    // the Photo Booth: favours, a treat when the sign is lit, and the third stop of the Perfect Day
    photo(h, b, hd, r) {
      dayStop('photo', h, r);
      if (r.side.length < 2 && Math.random() < 0.7) newSide();
      if (r.photoLit) {
        r.photoLit = false;
        G.photoT = 40;
        const f = pick([
          () => {
            gold(30, h.x, h.y);
            return 'Someone left 30 bucks in the tray';
          },
          () => {
            heal(40);
            return 'A good picture. +40 confidence';
          },
          () => {
            r.charge = 100;
            return 'You look great. Cradle the ball to call the squad';
          },
          () => {
            r.lockLit = true;
            return 'The Lockers are lit';
          },
          () => {
            r.mult = Math.min(6, r.mult + 1);
            return 'Multiplier ' + r.mult + 'x';
          },
          () => {
            G.buffs.moon = 20;
            return 'Golden hour. Double scoring';
          }
        ]);
        popup('Photo Strip', f(), 'good');
      }
      hd.delay = 1.2;
    },
    // the Wishing Fountain: Wish multiball once the Crepe Stand has served twice
    fountain(h, b, hd, r) {
      if (r.wishLit) {
        r.wishLit = false;
        G.hoardDone = true;
        hd.delay = 1.5;
        startMultiball('Wish', 1, 'fountain');
        for (let i = 0; i < 8; i++) later(0.3 + i * 0.25, () => spawnPickup(FIELD_INDEX.plaza, 'gold'));
        gold(40, h.x, h.y);
      } else gold(8, h.x, h.y);
    }
  },

  /* ---------- plain events: what this table adds to them ---------- */
  on: {
    // a rival sent off: they leave smiling
    kill(e) {
      float(e.x, e.y - 30, 'WON OVER', PINK, 11);
    },
    // a ball lost for good: the Perfect Day does not carry over
    ballEnd(what, ball, r) {
      if (r && r.day && Object.keys(r.day).length) {
        r.day = {};
        relight();
      }
    }
  }
};
