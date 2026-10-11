/* ================= THE SPELLBOOK =================
   Four abilities per class, one per purpose (breaker, guard, striker, pressure), unlocked and levelled on level-up,
   cast by completing a goal on the table. */
import {G, bolt, burst, flash, float, focusBall, ring, shake} from '../core/state.js';
import {TAU, clamp, rand} from '../core/util.js';
import {hitBoss, interruptBoss} from './bosses.js';
import {openChoice} from './choices.js';
import {CLASSES} from './classes.js';
import {damageEnemy} from './foes.js';
import {relight} from './lamps.js';
import {heal} from './score.js';
import {callFoes, campFoes, foesOn} from './waves.js';
import {TEXT, USE} from '../table/content.js';
import {BT, NM, OX, TY} from '../table/layout.js';
import {A} from '../ui/audio.js';
import {popup} from '../ui/ui.js';

/* ================= THE SPELLBOOK =================
   Four abilities per class, one per purpose. Unlocking is the level-up; casting is earned on the table: each purpose
   has a goal on every terrace, and completing it casts the ability for a duration that rides the ball. Unlocked
   abilities all have their goals live at once, so they stack. Recasting a running one extends it to twice its base.
   See DESIGN.md. */
export const SLOT_GOAL = {
  breaker: {name: 'Breaker', need: 1, text: 'Complete a bank'},
  guard: {name: 'Guard', need: 4, text: 'Roll three lanes, then shoot a scoop'},
  striker: {name: 'Striker', need: 2, text: 'Make two ramps'},
  pressure: {name: 'Pressure', need: 20, text: 'Two orbits, or twenty spins'}
};
export const SLOTS_ORDER = ['breaker', 'guard', 'striker', 'pressure'];
// up: three upgrade rows. Each has a name, a value per rank (0..3) and how to print it. Row 0 is always Duration.
export const dur = (b, step) => ({
  k: 'dur',
  name: 'Duration',
  v: r => b + step * r,
  fmt: v => v + ' s',
  text: 'The spell lasts longer'
});
export const SPELLS = {
  knight: {
    charge: {
      slot: 'breaker',
      name: 'Charge',
      text: 'Every flipper hit sends the ball off as a battering ram: it plows through foes, shatters armor and flattens the drop banks it touches.',
      up: [
        dur(10, 3),
        {
          k: 'all',
          name: 'Juggernaut',
          v: r => r,
          fmt: v => (v ? 'Every bank on the level' : 'The bank it touches'),
          text: 'A ram flattens every drop bank on the level'
        },
        {
          k: 'stun',
          name: 'Trample',
          v: r => r * 0.6,
          fmt: v => (v ? v.toFixed(1) + ' s stagger' : 'No stagger'),
          text: 'Foes the ram plows through are staggered'
        }
      ]
    },
    aegis: {
      slot: 'guard',
      name: 'Aegis',
      text: 'A ward returns any lost ball and halves the damage you take.',
      up: [
        dur(10, 3),
        {
          k: 'dr',
          name: 'Bastion',
          v: r => [0.5, 0.4, 0.3, 0.2][r],
          fmt: v => 'Damage x' + v,
          text: 'You take less damage under the ward'
        },
        {
          k: 'wave',
          name: 'Rampart',
          v: r => r,
          fmt: v => (v ? 'Shockwave on return, ' + v * 40 + ' power' : 'No shockwave'),
          text: 'A returned ball lands with a Shockwave and refills the meter'
        }
      ]
    },
    warcry: {
      slot: 'striker',
      name: 'Warcry',
      text: 'Every hit staggers its target, and foes near the ball wind up slower.',
      up: [
        dur(9, 3),
        {
          k: 'stun',
          name: 'Dread',
          v: r => 0.8 + 0.5 * r,
          fmt: v => v.toFixed(1) + ' s stagger',
          text: 'Staggers last longer'
        },
        {
          k: 'crack',
          name: 'Sunder',
          v: r => r,
          fmt: v => (v ? 'Hits crack ' + v + ' armor' : 'No armor cracked'),
          text: 'Each hit cracks armor'
        }
      ]
    },
    shieldWall: {
      slot: 'pressure',
      name: 'Shield Wall',
      text: 'Strikes against you are blocked and thrown back at the striker. Bumpers barely move the ball.',
      up: [
        dur(10, 3),
        {
          k: 'ref',
          name: 'Riposte',
          v: r => 0.6 + 0.5 * r,
          fmt: v => 'Reflect x' + v.toFixed(1),
          text: 'Blocked strikes hit back harder'
        },
        {
          k: 'stun',
          name: 'Rebuke',
          v: r => r * 0.8,
          fmt: v => (v ? v.toFixed(1) + ' s stagger' : 'No stagger'),
          text: 'A blocked striker is staggered'
        }
      ]
    }
  },
  rogue: {
    cloak: {
      slot: 'breaker',
      name: 'Cloak',
      text: 'The ball passes through foes and cuts each one. Nothing can strike it while cloaked.',
      up: [
        dur(8, 3),
        {
          k: 'gold',
          name: 'Cutpurse',
          v: r => r * 3,
          fmt: v => (v ? '+' + v + ' gold a cut' : 'No gold'),
          text: 'Every cut steals gold'
        },
        {
          k: 'crit',
          name: 'Assassin',
          v: r => r,
          fmt: v => (v ? 'Cuts are crits' : 'Plain cuts'),
          text: 'Every cut is a critical'
        }
      ]
    },
    smoke: {
      slot: 'guard',
      name: 'Smoke',
      text: 'Foes lose the ball: no strikes land, wolves do not lunge, wind-ups freeze.',
      up: [
        dur(8, 3),
        {
          k: 'lost',
          name: 'Vanish',
          v: r => r,
          fmt: v => (v ? 'Swarms stop in their tracks' : 'Swarms keep coming'),
          text: 'Swarms lose their way too'
        },
        {
          k: 'crit',
          name: 'Ambush',
          v: r => r * 0.15,
          fmt: v => '+' + Math.round(v * 100) + '% crit',
          text: 'More crits from the smoke'
        }
      ]
    },
    markedPrey: {
      slot: 'striker',
      name: 'Marked Prey',
      text: 'Every hit is a critical, and the victim stays marked: everything crits it for a while after.',
      up: [
        dur(9, 3),
        {k: 'mark', name: 'Hunted', v: r => 8 + 4 * r, fmt: v => v + ' s mark', text: 'Marks last longer'},
        {
          k: 'refund',
          name: 'Bounty',
          v: r => r * 10,
          fmt: v => (v ? '+' + v + ' power a marked kill' : 'No refund'),
          text: 'Killing a marked foe refills the meter'
        }
      ]
    },
    knives: {
      slot: 'pressure',
      name: 'Fan of Knives',
      text: 'Blades fan out from the ball every second, wounding the foes they reach.',
      up: [
        dur(9, 3),
        {k: 'n', name: 'Volley', v: r => 2 + r, fmt: v => v + ' blades', text: 'More blades a volley'},
        {
          k: 'poison',
          name: 'Venom',
          v: r => r * 2,
          fmt: v => (v ? v + ' s poison' : 'No poison'),
          text: 'Blades poison'
        }
      ]
    }
  },
  mage: {
    frostNova: {
      slot: 'breaker',
      name: 'Frost Nova',
      text: 'Freezing pulses from the ball: foes near it freeze mid wind-up and casters fall silent.',
      up: [
        dur(9, 3),
        {k: 'r', name: 'Reach', v: r => 140 + 40 * r, fmt: v => v + ' reach', text: 'Wider pulses'},
        {
          k: 'boss',
          name: 'Deep Frost',
          v: r => r,
          fmt: v => (v ? 'Breaks boss spells' : 'Foes only'),
          text: 'A pulse breaks a boss spell'
        }
      ]
    },
    barrier: {
      slot: 'guard',
      name: 'Arcane Barrier',
      text: 'A shield that absorbs strikes, then detonates when it breaks.',
      up: [
        dur(12, 3),
        {k: 'n', name: 'Layers', v: r => 3 + r, fmt: v => v + ' strikes', text: 'The barrier takes more strikes'},
        {
          k: 'boom',
          name: 'Backlash',
          v: r => 1 + r * 0.6,
          fmt: v => 'Blast x' + v.toFixed(1),
          text: 'A bigger blast when it breaks'
        }
      ]
    },
    meteor: {
      slot: 'striker',
      name: 'Meteor Shower',
      text: 'Meteors fall around the ball wherever it goes.',
      up: [
        dur(8, 3),
        {k: 'dmg', name: 'Impact', v: r => 0.9 + 0.4 * r, fmt: v => 'Damage x' + v.toFixed(1), text: 'Heavier meteors'},
        {k: 'r', name: 'Scatter', v: r => 70 + 20 * r, fmt: v => v + ' blast radius', text: 'Wider blasts'}
      ]
    },
    blink: {
      slot: 'pressure',
      name: 'Blink Strike',
      text: 'Lightning arcs from the ball to every foe it passes and chains between them. Bumpers bolt foes.',
      up: [
        dur(9, 3),
        {k: 'chain', name: 'Fork', v: r => 1 + r, fmt: v => 'Chains to ' + v, text: 'Lightning forks to more foes'},
        {
          k: 'boss',
          name: 'Thunderclap',
          v: r => r,
          fmt: v => (v ? 'Bolts break boss spells' : 'Foes only'),
          text: 'A bolt breaks a boss spell'
        }
      ]
    }
  },
  cleric: {
    consecration: {
      slot: 'breaker',
      name: 'Consecration',
      text: 'The ball lays hallowed ground along its path: foes on it burn, you heal on it, strikes cannot land on it.',
      up: [
        dur(9, 3),
        {k: 'last', name: 'Enduring', v: r => 4 + 2 * r, fmt: v => v + ' s ground', text: 'The ground lasts longer'},
        {k: 'heal', name: 'Grace', v: r => 1.5 + r, fmt: v => v.toFixed(1) + ' a tick', text: 'Heals faster'}
      ]
    },
    sanctuary: {
      slot: 'guard',
      name: 'Sanctuary',
      text: 'Curses cannot touch you, the kickback stays lit, and a lost ball returns once.',
      up: [
        dur(12, 3),
        {
          k: 'heal',
          name: 'Benediction',
          v: r => r * 15,
          fmt: v => (v ? 'Heal ' + v + ' on cast' : 'No heal'),
          text: 'Heals when cast'
        },
        {k: 'ret', name: 'Vigil', v: r => 1 + r, fmt: v => v + ' returns', text: 'More lost balls returned'}
      ]
    },
    judgement: {
      slot: 'striker',
      name: 'Judgement',
      text: 'Every bumper, target and sling calls holy fire on the nearest foe. The boss takes holy damage on every hit.',
      up: [
        dur(9, 3),
        {k: 'chain', name: 'Wrath', v: r => 1 + r, fmt: v => v + ' foes a hit', text: 'Holy fire reaches more foes'},
        {
          k: 'boss',
          name: 'Verdict',
          v: r => 0.5 + 0.5 * r,
          fmt: v => 'Boss x' + v.toFixed(1),
          text: 'More holy damage to the boss'
        }
      ]
    },
    radiance: {
      slot: 'pressure',
      name: 'Radiance',
      text: 'The aura widens: every foe it touches burns, and every hit heals you.',
      up: [
        dur(9, 3),
        {k: 'undead', name: 'Purge', v: r => 1 + r, fmt: v => 'Undead x' + v, text: 'The undead burn harder'},
        {
          k: 'cleanse',
          name: 'Absolve',
          v: r => r,
          fmt: v => (v ? 'Heals lift curses' : 'Heals only'),
          text: 'Every heal lifts a curse'
        }
      ]
    }
  }
};
for (const cls in SPELLS)
  for (const id in SPELLS[cls]) {
    SPELLS[cls][id].id = id;
    SPELLS[cls][id].cls = cls;
  }
export const spellOf = (cls, slot) => {
  const S = SPELLS[cls];
  for (const id in S) if (S[id].slot === slot) return S[id];
  return null;
};
export const spellDef = id => {
  for (const cls in SPELLS) if (SPELLS[cls][id]) return SPELLS[cls][id];
  return null;
};
export function bookOf(r) {
  return r.book || (r.book = {});
}
export function spellRank(id) {
  const b = bookOf(G.run)[id];
  return b ? b.dur + b.a + b.b : -1;
}
// -1 locked, 0 unlocked
export function spellVal(id, k) {
  const d = spellDef(id),
    b = bookOf(G.run)[id] || {dur: 0, a: 0, b: 0};
  if (!d) return 0;
  const row = d.up.find(u => u.k === k) || d.up[0],
    rank = k === 'dur' ? b.dur : d.up[1].k === k ? b.a : b.b;
  return row.v(rank);
}
export function spellOn(id) {
  return G.casts.some(c => c.id === id && c.t > 0);
}
export function spellCast(id) {
  return G.casts.find(c => c.id === id);
}
export function unlockSpell(id) {
  const b = bookOf(G.run);
  if (!b[id]) b[id] = {dur: 0, a: 0, b: 0};
  G.run.goal = G.run.goal || {};
  relight();
  G.dirty = true;
}
export function levelSpell(id, k) {
  const d = spellDef(id),
    b = bookOf(G.run)[id];
  if (!b) return;
  if (k === 'dur') b.dur++;
  else if (d.up[1].k === k) b.a++;
  else b.b++;
  G.dirty = true;
}
// goals: progress per purpose; the class's ability for that purpose casts when the goal is met
export function spellProg(slot, n, x, y) {
  const r = G.run;
  if (!r || G.inGrave) return;
  const d = spellOf(r.cls, slot);
  if (!d || spellRank(d.id) < 0) return;
  const goal = r.goal || (r.goal = {}),
    need = SLOT_GOAL[slot].need;
  if (slot === 'guard' && n >= 4) {
    if ((goal[slot] || 0) < 3) return;
  } else if (slot === 'guard' && (goal[slot] || 0) >= 3) return;
  goal[slot] = Math.min(need, (goal[slot] || 0) + n);
  G.dirty = true;
  if (goal[slot] >= need) {
    goal[slot] = 0;
    castSpell(d.id, focusBall());
  } else if (x !== undefined) float(x, y - 40, d.name.toUpperCase() + ' ' + goalText(slot), CLASSES[r.cls].glow, 11);
  relight();
}
export function goalText(slot) {
  const g = G.run.goal || {},
    v = g[slot] || 0,
    need = SLOT_GOAL[slot].need;
  if (slot === 'guard') return v >= 3 ? 'shoot a scoop' : v + '/3 lanes';
  if (slot === 'pressure') return Math.floor(v / 10) + '/2 orbits';
  return v + '/' + need;
}
export function castSpell(id, b) {
  const r = G.run,
    d = spellDef(id),
    base = spellVal(id, 'dur'),
    c = spellCast(id);
  if (c) {
    c.t = Math.min(base * 2, c.t + base);
    c.max = Math.max(c.max, c.t);
    float(b ? b.x : 320, b ? b.y - 50 : TY[BT] + 500, d.name.toUpperCase() + ' EXTENDED', CLASSES[r.cls].glow, 14);
    A.s('ward');
    return;
  }
  // a spell is a flare in the dark: if the level is quiet, it draws them out
  {
    const t = b ? b.tier : G.focusTier;
    if (t < NM && foesOn(t) < 3) callFoes(t, campFoes(3), TEXT.feel, b ? b.x : 320, b ? b.y : TY[BT] + 500);
  }
  const cast = {id, t: base, max: base, tick: 0, hits: 0};
  G.casts.push(cast);
  const F = SPELL_FX[id];
  if (F && F.start) F.start(cast, b);
  popup(d.name, d.text, 'good');
  A.s('ability');
  flash(0.35, CLASSES[r.cls].glow, 'cast');
  shake(5, 'cast');
  relight();
  G.dirty = true;
}
export function endCast(c) {
  const F = SPELL_FX[c.id];
  if (F && F.end) F.end(c);
  G.casts = G.casts.filter(x => x !== c);
  relight();
  G.dirty = true;
}
export function updateSpells(dt) {
  if (!G.run) return;
  const hero = heroBall();
  for (const c of G.casts.slice()) {
    c.t -= dt;
    c.tick -= dt;
    const F = SPELL_FX[c.id];
    if (F && F.tick) F.tick(c, dt, hero);
    if (c.t <= 0) endCast(c);
  }
}
// helpers the effects share
export const nearFoes = (x, y, r, tier, n) =>
  G.enemies
    .filter(e => !e.dead && e.spawn <= 0 && e.tier === tier && Math.hypot(e.x - x, e.y - y) < r + e.r)
    .sort((p, q) => Math.hypot(p.x - x, p.y - y) - Math.hypot(q.x - x, q.y - y))
    .slice(0, n || 99);
export const bossNear = (x, y, r, tier) => {
  const bo = G.boss;
  return bo &&
    bo.alive &&
    bo.rise <= 0 &&
    bo.tier === tier &&
    bo.phase !== 'shield' &&
    Math.hypot(bo.x - x, bo.y - y) < r + bo.r
    ? bo
    : null;
};
export const SPELL_FX = {
  meteor: {
    tick(c, dt, b) {
      if (c.tick > 0 || !b) return;
      c.tick = 0.9;
      const m = G.mods,
        rr = spellVal('meteor', 'r'),
        k = spellVal('meteor', 'dmg'),
        a = rand(TAU),
        d = rand(20, 90),
        x = clamp(b.x + Math.cos(a) * d, OX[b.tier] + 30, OX[b.tier] + 610),
        y = clamp(b.y + Math.sin(a) * d, TY[b.tier] + 40, TY[b.tier] + 880);
      ring(x, y, rr, '#ff8a3a', 'meteor');
      burst(x, y, 14, '#ffb050', 300, 0.7, 'meteor');
      A.s('slam');
      shake(3, 'meteor');
      for (const e of nearFoes(x, y, rr, b.tier)) {
        e.armor = 0;
        damageEnemy(e, m.pow * 1.2 * k, false);
      }
      const bo = bossNear(x, y, rr, b.tier);
      if (bo) hitBoss(bo, m.pow * 1.2 * k, false);
    }
  },
  knives: {
    tick(c, dt, b) {
      if (c.tick > 0 || !b) return;
      c.tick = 1;
      const m = G.mods,
        n = spellVal('knives', 'n'),
        ps = spellVal('knives', 'poison');
      for (const e of nearFoes(b.x, b.y, 230, b.tier, n)) {
        bolt(b, e, 'knives');
        if (ps) e.poison = ps;
        damageEnemy(e, m.pow * 0.6, false);
      }
      const bo = bossNear(b.x, b.y, 230, b.tier);
      if (bo) {
        bolt(b, bo, 'knives');
        hitBoss(bo, m.pow * 0.6, false);
      }
    }
  },
  frostNova: {
    tick(c, dt, b) {
      if (c.tick > 0 || !b) return;
      c.tick = 1.2;
      const rr = spellVal('frostNova', 'r');
      ring(b.x, b.y, rr, '#9fe8ff', 'frostNova');
      A.s('ward');
      for (const e of nearFoes(b.x, b.y, rr, b.tier)) {
        e.wind = 0;
        e.stun = Math.max(e.stun, 1);
        e.lungeCd = Math.max(e.lungeCd || 0, 1.2);
        if (e.def.cast) e.castT = Math.max(e.castT, e.def.cast * 0.5);
        damageEnemy(e, G.mods.pow * 0.25, false);
      }
      const bo = G.boss;
      if (
        bo &&
        bo.alive &&
        bo.tier === b.tier &&
        spellVal('frostNova', 'boss') &&
        bo.phase === 'cast' &&
        Math.hypot(bo.x - b.x, bo.y - b.y) < rr + bo.r
      )
        interruptBoss(bo);
    }
  },
  blink: {
    tick(c, dt, b) {
      if (c.tick > 0 || !b) return;
      c.tick = 0.5;
      const m = G.mods,
        chain = spellVal('blink', 'chain');
      const first = nearFoes(b.x, b.y, 120, b.tier, 1)[0];
      if (!first) return;
      let from = b,
        e = first,
        done = [];
      for (let k = 0; k <= chain && e; k++) {
        bolt(from, e, 'blink');
        damageEnemy(e, m.pow * 0.5, false);
        done.push(e);
        from = e;
        e = nearFoes(e.x, e.y, 180, b.tier).find(q => !done.includes(q));
      }
    }
  },
  consecration: {
    tick(c, dt, b) {
      if (c.tick > 0 || !b) return;
      c.tick = 0.7;
      if (G.zones.some(z => !z.fire && !z.pyre && Math.hypot(z.x - b.x, z.y - b.y) < 40)) return;
      G.zones.push({x: b.x, y: b.y, r: 60, t: spellVal('consecration', 'last'), tick: 0, trail: true});
    }
  },
  barrier: {
    start(c) {
      c.hits = spellVal('barrier', 'n');
    },
    end(c) {
      if (c.broke) return;
    }
  },
  charge: {
    tick(c, dt, b) {
      if (b && b.st === 'live' && !b.pow && !b.arm) b.arm = 9;
    }
  },
  sanctuary: {
    start(c) {
      c.ret = spellVal('sanctuary', 'ret');
      const h = spellVal('sanctuary', 'heal');
      if (h) heal(h);
      G.run.kickback = true;
      G.curse = {};
      relight();
    },
    tick(c) {
      G.curse = {};
      G.run.kickback = true;
    }
  },
  aegis: {
    start(c) {
      G.buffs.aegisK = spellVal('aegis', 'dr');
    },
    tick(c) {
      G.buffs.aegisK = spellVal('aegis', 'dr');
    },
    end(c) {
      delete G.buffs.aegisK;
    }
  }
};
export function heroBall() {
  let f = null;
  for (const b of G.balls)
    if (b.hero && b.st === 'live') {
      if (!f || b.y > f.y) f = b;
    }
  return f;
}
export function heroBalls() {
  return G.balls.filter(b => !b.party);
}
/* ---------- the level-up: four cards, Unlock or Level Up ---------- */
export function bookChoice() {
  const r = G.run,
    cls = CLASSES[r.cls];
  const opts = SLOTS_ORDER.map(sl => {
    const d = spellOf(r.cls, sl),
      rk = spellRank(d.id),
      full = rk >= 0 && ['dur', 'a', 'b'].every(k => bookOf(r)[d.id][k] >= 3);
    return {
      name: d.name,
      desc: d.text + ' ' + SLOT_GOAL[sl].name + ': ' + SLOT_GOAL[sl].text.toLowerCase() + '.',
      tag: rk < 0 ? 'Unlock' : full ? 'Rank ' + (rk + 1) + ' · full' : 'Rank ' + (rk + 1) + ' · Level up',
      key: rk < 0,
      act: () => {
        if (rk < 0) {
          unlockSpell(d.id);
          popup(d.name + ' Unlocked', SLOT_GOAL[sl].text + ' to cast it', 'good');
          return;
        }
        if (full) {
          A.s('deny');
          return 'stay';
        }
        G.bookUp = d.id;
        openChoice('bookUp');
        return 'stay';
      }
    };
  });
  if (opts.every(o => /full/.test(o.tag))) {
    if (USE.cards) G.pending.unshift('perk');
    return bookDone();
  } // nothing left to learn: a boon instead
  return {kind: 'book', title: 'Level ' + r.level, sub: 'Your spellbook. Unlock an ability, or level one up', opts};
}
export function bookDone() {
  return {
    kind: 'book',
    title: 'The Spellbook Is Full',
    sub: 'Nothing left to learn. A boon instead',
    opts: [{name: 'Onward', desc: 'Take a boon in its place.', tag: '', act: () => {}}]
  };
}
export function bookUpChoice(id) {
  const r = G.run,
    d = spellDef(id),
    b = bookOf(r)[id];
  const opts = d.up.map((u, i) => {
    const key = i === 0 ? 'dur' : i === 1 ? 'a' : 'b',
      rk = b[key],
      cur = u.v(rk),
      nxt = u.v(Math.min(3, rk + 1)),
      full = rk >= 3;
    return {
      name: u.name,
      desc: u.text + '. ' + (full ? u.fmt(cur) + ', the most it can be' : u.fmt(cur) + ' \u2192 ' + u.fmt(nxt)),
      tag: full ? 'Full' : 'Rank ' + rk + ' \u2192 ' + (rk + 1),
      act: () => {
        if (full) {
          A.s('deny');
          return 'stay';
        }
        levelSpell(id, u.k);
        popup(d.name + ' ' + (spellRank(id) + 1), u.name + ': ' + u.fmt(nxt), 'good');
      }
    };
  });
  opts.push({
    name: 'Back',
    desc: 'Choose a different ability.',
    tag: '',
    act: () => {
      openChoice('book');
      return 'stay';
    }
  });
  return {kind: 'bookUp', title: d.name, sub: 'Level it up', opts};
}
export function holyFire(x, y, tier) {
  const m = G.mods,
    n = spellVal('judgement', 'chain');
  for (const e of nearFoes(x, y, 260, tier, n)) {
    bolt({x, y}, e, 'judgement');
    damageEnemy(e, m.pow * 0.6, false);
  }
}
