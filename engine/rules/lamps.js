/* ================= LAMPS =================
   Which shot inserts are lit, in what colour and state. Recomputed from the game state by relight(); the renderer
   only reads G.lit and G.lampS. */
import {G, T} from '../core/state.js';
import {qCur, quests} from './quests.js';
import {SLOTS_ORDER, spellOf, spellOn, spellRank} from './spells.js';
import {wingOfTier} from './wings.js';
import {BOSSES, DEF, RULES, WINGS} from '../table/content.js';
import {BELOW, GT, NM} from '../table/layout.js';

/* Every insert has a state as well as a colour. flash: do this now (a quest step, a boss spell, a jackpot).
   lit: worth shooting, available (the way to the quest's level, a lit lock, a spell goal, a boon waiting).
   done: collected and still showing it (a running spell's goals, a used boon, lock 1 of 2). */
export const LAMP_RANK = {done: 1, lit: 2, flash: 3};
/* The way from one field to another, when the content does not list it (`ways`): the shots that begin a shortest
   road there. A road is made of ramps, scoops with a tunnel, and falls (the chute to the field joined below, or a
   drain ramp). If the shortest road begins with a fall there is nothing to light: the way is down the drain. */
// every way from one field straight to another: {to, id}. id is the shot that takes it, or null for a fall
export function roads() {
  if (T.roadList) return T.roadList;
  const out = [];
  for (let i = 0; i < NM; i++) out.push([]);
  for (const id in T.rails) {
    const r = T.rails[id];
    if (r.from < NM && r.to < NM && r.from !== r.to)
      out[r.from].push({to: r.to, id: r.drain || !T.shots[id] ? null : id});
  }
  for (const id in T.tunnels) {
    const h = T.holes[id],
      t = T.holes[T.tunnels[id].to];
    if (h && t && h.tier < NM && t.tier < NM && h.tier !== t.tier && T.shots[id]) out[h.tier].push({to: t.tier, id});
  }
  for (let i = 0; i < NM; i++) if (BELOW[i] >= 0) out[i].push({to: BELOW[i], id: null});
  return (T.roadList = out);
}
export function roadTo(a, b) {
  if (a === b || a >= NM || b >= NM) return [];
  const R = T.roads || (T.roads = {}),
    key = a + '>' + b;
  if (R[key]) return R[key];
  const out = roads();
  // how many hops each field is from b, counted backwards from b
  const d = new Array(NM).fill(1e9);
  d[b] = 0;
  for (let pass = 0; pass < NM; pass++)
    for (let i = 0; i < NM; i++) for (const e of out[i]) if (d[e.to] + 1 < d[i]) d[i] = d[e.to] + 1;
  const first = out[a].filter(e => d[e.to] + 1 === d[a] && d[a] < 1e9);
  return (R[key] = first.some(e => !e.id) ? [] : first.map(e => e.id));
}
export function relight() {
  const L = {},
    S = {},
    add = (id, c, st) => {
      (L[id] || (L[id] = [])).push(c);
      st = st || 'flash';
      if (!S[id] || LAMP_RANK[st] > LAMP_RANK[S[id]]) S[id] = st;
    },
    r = G.run;
  G.lit = L;
  G.lampS = S;
  if (!r) return;
  G.dirty = true;
  const ft0 = G.focusTier;
  if (G.inGrave) {
    add('rise', T.banks.nails.segs.some(x => x.on) ? 'main' : 'gold');
    return;
  }
  if (G.focusTier > GT) {
    const tw = wingOfTier(G.focusTier);
    if (!tw.seal[0].on) add(tw.goal, 'gold');
    else if (WINGS[tw.key].lamps) WINGS[tw.key].lamps.forEach(id => add(id, 'main'));
    return;
  }
  if (ft0 < NM && r.book)
    for (const sl of SLOTS_ORDER) {
      const d = spellOf(r.cls, sl);
      if (!d || spellRank(d.id) < 0) continue;
      const g = (r.goal || {})[sl] || 0,
        st = spellOn(d.id) ? 'done' : 'lit';
      if (sl === 'breaker') for (const id in T.banks) if (T.banks[id].tier === ft0 && T.shots[id]) add(id, 'spell', st);
      if (sl === 'striker') for (const id in T.rails) if (T.rails[id].from === ft0) add(id, 'spell', st);
      if (sl === 'pressure') {
        add('orbitL' + ft0, 'spell', st);
        add('orbitR' + ft0, 'spell', st);
        for (const q of T.sens)
          if (q.kind === 'spin' && T.shots[q.id] && T.shots[q.id].tier === ft0) add(q.id, 'spell', st);
      }
      if (sl === 'guard' && (g >= 3 || st === 'done'))
        for (const id in T.holes) if (T.holes[id].tier === ft0) add(id, 'spell', st);
    }
  const ft = G.focusTier,
    ways = DEF.content.ways,
    way = (tier, c) => {
      if (!ways) roadTo(ft, tier).forEach(id => add(id, c, 'lit'));
      else if (ft > tier) ((ways.up || {})[ft] || []).forEach(id => add(id, c, 'lit'));
      else if (ft < tier) ((ways.down || {})[ft] || []).forEach(id => add(id, c, 'lit'));
    };
  for (const q of quests()) {
    const o = qCur(q);
    if (!o) continue;
    const c = q.main ? 'main' : 'side';
    if (o.id === 'wing') {
      const gt = T.holes[WINGS[r.wing.key].gate].tier;
      if (ft === gt) add(WINGS[r.wing.key].gate, c);
      else way(gt, c);
    } else if (o.t === 'shot' || o.t === 'done') {
      add(o.id, c);
      const s = T.shots[o.id];
      if (s) way(s.tier, c);
    } else if (o.t === 'boss') way(BOSSES[o.boss].tier, c);
    else way(o.tier, c);
  }
  if (RULES.lamps) RULES.lamps(add, r); // the table's own features
  if (G.pending.length) for (const id in T.holes) if (T.holes[id].tier === ft0 && ft0 < NM) add(id, 'gold', 'lit');
  const bo = G.boss;
  if (bo && bo.alive && bo.phase === 'cast') bo.def.cast.shots.forEach(id => add(id, 'danger'));
  if (G.mb) for (const id in T.rails) add(id, 'gold');
}

/* ================= STATUS LAMPS =================
   A layout can set a `lamp` into the floor to show one of these, the way a real table prints 2X 3X 4X up the middle,
   SHOOT AGAIN between the flippers and LOCK by a scoop. Each is a function of the run: 0 dark, 1 lit, 2 flashing.
   A table adds its own under `status` in its rules. */
const multAt = n => r => +(r.mult >= n);
export const STATUS = {
  mult2: multAt(2),
  mult3: multAt(3),
  mult4: multAt(4),
  mult5: multAt(5),
  mult6: multAt(6),
  save: () => (G.save > 0 && !G.plunge.ready ? (G.save < 3 ? 2 : 1) : 0), // the ball save, flashing as it runs out
  kickback: r => +!!r.kickback,
  lockLit: r => +!!r.lockLit,
  lock1: r => +(r.locks >= 1),
  mb: () => (G.mb ? 2 : 0),
  levelup: () => (G.pending.indexOf('book') >= 0 ? 2 : 0), // a level-up is waiting at a scoop
  boon: () => (G.pending.indexOf('perk') >= 0 ? 2 : 0),
  rally: r => (G.rallyActive ? 2 : r.charge >= 100 ? 1 : 0), // the meter is full
  combo: () => +(G.combo > 1 && G.comboT > 0),
  grave: r => +!!(r.grave && r.grave.open)
};
const statusOf = show => (RULES.status && RULES.status[show]) || STATUS[show];
export function checkLamps() {
  for (const l of T.lamps)
    if (!statusOf(l.show))
      throw new Error(
        'layout: a lamp shows one of ' + Object.keys(STATUS).join(', ') + " (or one of the table's own); not " + l.show
      );
}
export const lampState = l => (G.run ? statusOf(l.show)(G.run) : 0);
