/* ================= THE PARTY: the guard at the drain =================
   The companion picked with the hero stands on a post at the bottom drain. (Recruits and the Rally are in
   rules/tavern.js and rules/rally.js.) */
import {G, T, bolt, burst, float} from '../core/state.js';
import {shuffle} from '../core/util.js';
import {damageEnemy} from './foes.js';
import {relight} from './lamps.js';
import {charge, heal, score} from './score.js';
import {BT, CX, NM, TY} from '../table/layout.js';
import {A} from '../ui/audio.js';
import {popup} from '../ui/ui.js';

/* ---------- the party: companions stand guard at the drains ----------
   A recruited companion stands on a post at one of the three drains (the centre gap and the two outlanes). A ball
   that would go out bounces off them instead, at a cost to their health; swarms go for the guards; a guard at zero
   is wounded, the drain opens, and they stand again when you complete a bank. Good pinball wins the run; the party
   makes it more forgiving and more fun. */
export const ROLES = {
  tank: {name: 'Tank', col: '#8fb0d8', hp: 130},
  healer: {name: 'Healer', col: '#ffe0a0', hp: 80},
  dps: {name: 'Striker', col: '#ff8a6a', hp: 70},
  support: {name: 'Support', col: '#b08cff', hp: 90}
};
export const COMPANIONS = {
  // roles, not people. One stands guard at the bottom drain on the Hollow
  tank: {
    name: 'Tank',
    role: 'tank',
    cost: 0,
    perk: 'intercept',
    desc: 'The most health. Every 12 seconds, takes a strike that was meant for you.'
  },
  healer: {
    name: 'Healer',
    role: 'healer',
    cost: 0,
    perk: 'heal',
    desc: 'A ball off the post heals you 10 and lifts a curse. Mends itself while it stands.'
  },
  dps: {
    name: 'Striker',
    role: 'dps',
    cost: 0,
    perk: 'mark',
    desc: 'A ball off the post marks the nearest foe: everything crits it for 6 seconds.'
  }
};
export const TAVERN_RECRUITS = true;
// the Tavern hires recruits: a random class with a random one of its abilities (see spells.js)
export const SLOTS = ['center', 'left', 'right'];
export function guardPosts(tier) {
  const P = T.gposts || (T.gposts = {});
  if (P[tier]) return P[tier];
  if (tier !== BT) return (P[tier] = []);
  const yF = TY[tier] + 900; // one post: the bottom drain, before the Grave
  return (P[tier] = [{slot: 'center', x: CX[tier], y: yF + 36, r: 24}]);
}
export function partyAt(slot) {
  const r = G.run;
  return r && r.party ? r.party.find(c => c.slot === slot) : null;
}
export function guardAt(tier, slot) {
  const c = partyAt(slot);
  return c && c.hp > 0 ? c : null;
}
export function liveGuards(tier) {
  return tier < NM && G.run
    ? guardPosts(tier)
        .map(p => ({p, c: guardAt(tier, p.slot)}))
        .filter(g => g.c)
    : [];
}
export function recruit(id) {
  const r = G.run,
    d = COMPANIONS[id],
    slot = SLOTS.find(sl => !partyAt(sl));
  if (!d || !slot) return null;
  const c = {id, slot, hp: ROLES[d.role].hp, maxHp: ROLES[d.role].hp, cool: 0, ready: 0, saves: 0};
  r.party.push(c);
  r.tavern = r.tavern.filter(x => x !== id);
  G.dirty = true;
  return c;
}
export function drawRecruits(n) {
  const have = new Set(((G.run && G.run.party) || []).map(c => c.id)),
    pool = shuffle(Object.keys(COMPANIONS).filter(k => !have.has(k))),
    out = [],
    roles = new Set();
  for (const k of pool) {
    if (out.length >= n) break;
    if (roles.has(COMPANIONS[k].role)) continue;
    roles.add(COMPANIONS[k].role);
    out.push(k);
  }
  for (const k of pool) {
    if (out.length >= n) break;
    if (!out.includes(k)) out.push(k);
  }
  return out;
}
export function guardHit(c, p, b, imp) {
  const r = G.run,
    d = COMPANIONS[c.id],
    tier = b.tier;
  c.cool = 0.35;
  if (!b.party) c.hp -= 12;
  c.saves++;
  c.flash = 1;
  A.s('kick');
  burst(p.x, p.y - 10, 10, ROLES[d.role].col, 220, 0.6);
  const near = () => {
    let best = null,
      bd = 1e9;
    for (const e of G.enemies) {
      if (e.dead || e.spawn > 0 || e.tier !== tier) continue;
      const dd = Math.hypot(e.x - p.x, e.y - p.y);
      if (dd < bd) {
        bd = dd;
        best = e;
      }
    }
    return best;
  };
  float(p.x, p.y - 44, d.name.toUpperCase() + ' HOLDS', '#ffe9b0', 12);
  score(500);
  charge(1, 'hit');
  switch (d.perk) {
    case 'crack': {
      const e = near();
      if (e) {
        if (e.armor > 0) {
          e.armor--;
          float(e.x, e.y - 26, 'ARMOR CRACKED', '#cfd8e0', 12);
        }
        e.wind = 0;
        e.stun = Math.max(e.stun, 1.5);
      }
      break;
    }
    case 'mend':
      heal(4);
      break;
    case 'heal':
      heal(10);
      for (const k in G.curse)
        if (G.curse[k] > 0) {
          G.curse[k] = 0;
          break;
        }
      break;
    case 'mend':
      heal(4);
      break;
    case 'mark': {
      const e = near();
      if (e) {
        e.marked = 6;
        float(e.x, e.y - 26, 'MARKED', '#ff8a6a', 12);
      }
      break;
    }
    case 'bolt': {
      const e = near();
      if (e) {
        bolt(p, e);
        damageEnemy(e, G.mods.pow * 0.6, false);
      }
      break;
    }
    case 'charge':
      r.charge = Math.min(100, r.charge + 12);
      break;
    case 'hold':
      G.wave.t += 8;
      r.kickback = true;
      relight();
      break;
  }
  if (c.hp <= 0) {
    c.hp = 0;
    popup(
      d.name + ' Falls',
      d.role === 'tank'
        ? 'The drain stands open. Complete a bank to raise them'
        : 'The drain stands open. Complete a bank to raise them',
      'bad'
    );
    A.s('hurt');
    G.cam.shake = Math.max(G.cam.shake, 8);
  }
  G.dirty = true;
}
export function guardStruck(c, dmg, e) {
  const d = COMPANIONS[c.id];
  c.hp -= dmg;
  c.flash = 1;
  G.dirty = true;
  float(e.x, e.y - 36, d.name.toUpperCase() + ' IS STRUCK', '#ff8a8a', 12);
  if (c.hp <= 0) {
    c.hp = 0;
    popup(d.name + ' Falls', 'The drain stands open. Complete a bank to raise them', 'bad');
    A.s('hurt');
  }
}
export function raiseParty(x, y) {
  const r = G.run;
  let n = 0;
  for (const c of r.party)
    if (c.hp <= 0) {
      c.hp = Math.round(c.maxHp * 0.5);
      n++;
      float(x, y - 50, COMPANIONS[c.id].name.toUpperCase() + ' STANDS AGAIN', '#ffe9b0', 13);
    }
  if (n) {
    A.s('ward');
    G.dirty = true;
  }
}
export function updateParty(dt) {
  const r = G.run;
  if (!r || !r.party) return;
  for (const c of r.party) {
    if (c.cool > 0) c.cool -= dt;
    if (c.flash > 0) c.flash -= dt * 4;
    if (c.ready > 0) c.ready -= dt;
    const d = COMPANIONS[c.id];
    if (d && (d.perk === 'heal' || d.perk === 'mend') && c.hp > 0 && c.hp < c.maxHp) {
      c.hp = Math.min(c.maxHp, c.hp + 2 * dt);
      G.dirty = true;
    }
  }
}
export function interceptor() {
  const r = G.run;
  return r && r.party ? r.party.find(c => c.hp > 0 && COMPANIONS[c.id].perk === 'intercept' && c.ready <= 0) : null;
}
