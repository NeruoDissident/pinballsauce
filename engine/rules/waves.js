/* ================= WAVES, CALLS AND PICKUPS ================= */
import {G, T, burst, float, later} from '../core/state.js';
import {pick, rand, shuffle} from '../core/util.js';
import {spawnEnemy} from './foes.js';
import {qCur, qEvent, quests} from './quests.js';
import {charge, gold, heal, score} from './score.js';
import {wingOfTier, wingProg} from './wings.js';
import {CAMPAIGNS, ENEMY, PTS, TEXT, TUNE, USE, WINGS} from '../table/content.js';
import {NM} from '../table/layout.js';
import {A} from '../ui/audio.js';
import {popup} from '../ui/ui.js';

export const waveGap = () =>
  Math.max(TUNE.waveMin, TUNE.waveEvery - G.run.level * TUNE.waveFaster - (G.run.threat - 1) * 4);
export const FOE_CAP = 22;
export const TIER_CAP = 10;
export const foesOn = t => G.enemies.filter(e => !e.dead && e.tier === t).length;
export function startWave(tier, why) {
  const r = G.run,
    W = G.wave,
    camp = CAMPAIGNS[r.arcs[r.arcs.length - 1]];
  if (!USE.foes || !camp || !(camp.foes || []).length) return false;
  if (tier >= NM || G.enemies.length >= FOE_CAP || foesOn(tier) >= TIER_CAP) return false;
  let budget = TUNE.waveBudget + r.level * TUNE.waveBudgetStep + (r.threat - 1) * 2 + (why === 'bell' ? 2 : 0);
  const foes = camp.foes,
    list = [],
    cheapest = foes.reduce((a, b) => (ENEMY[b].cost < ENEMY[a].cost ? b : a));
  while (budget > 0 && list.length < 7) {
    let ty = pick(foes);
    if (ENEMY[ty].cost > budget) ty = cheapest;
    if (ENEMY[ty].cost > budget) break;
    budget -= ENEMY[ty].cost;
    list.push(ty);
    if (ENEMY[ty].job === 'swarm')
      for (let k = 0; k < 2 && list.length < 7; k++) {
        list.push(ty);
        budget -= ENEMY[ty].cost * 0.5;
      }
  }
  if (!list.length) return false;
  return launchWave(tier, list, why, camp);
}
// put a list of foes on a level as one wave; waves overlap freely, each pays its own bounty when cleared
export function launchWave(tier, list, why, camp, quiet) {
  if (!USE.foes || !list.length) return false;
  const W = G.wave;
  W.n++;
  const wv = {tier, n: W.n, left: list.length, total: list.length};
  (W.list || (W.list = [])).push(wv);
  W.active = wv;
  list.forEach((ty, i) =>
    later(0.3 + i * 0.45, () => {
      if (!W.list.includes(wv)) return;
      const e = G.enemies.length < FOE_CAP ? spawnEnemy(ty, tier) : null;
      if (e) e.wave = wv;
      else wv.left--;
    })
  );
  if (quiet) return true;
  const nm = why === 'bell' ? TEXT.bell : TEXT.wave;
  popup(nm[0], nm[1], 'bad', list.length + ' foes');
  A.s('summon');
  G.cam.shake = Math.max(G.cam.shake, 6);
  G.dirty = true;
  return true;
}
export function waveJoin(e, tier) {
  const L = G.wave.list || [];
  let wv = null;
  for (let i = L.length - 1; i >= 0; i--)
    if (L[i].tier === tier) {
      wv = L[i];
      break;
    }
  if (e && wv) {
    e.wave = wv;
    wv.left++;
    wv.total++;
  }
}
// a shot on the table calls foes onto its level: a small wave of its own
export function callFoes(tier, types, text, x, y) {
  if (!USE.foes || !types.length) return false;
  if (G.demo || tier >= NM || G.inGrave || G.enemies.length >= FOE_CAP || foesOn(tier) >= TIER_CAP) return false;
  const k = 'call' + tier + text;
  if ((G.calls || (G.calls = {}))[k] > G.t) return false;
  G.calls[k] = G.t + 8;
  launchWave(tier, types.slice(), 'call', null, true);
  if (x !== undefined) float(x, y - 44, text, '#ff9a7a', 13);
  A.s('summon');
  G.dirty = true;
  return true;
}
export function campFoes(n) {
  const r = G.run,
    c = CAMPAIGNS[r.arcs[r.arcs.length - 1]],
    o = [];
  if (!USE.foes || !c || !(c.foes || []).length) return o;
  for (let i = 0; i < n; i++) o.push(pick(c.foes));
  return o;
}
export function waveTick() {
  const r = G.run,
    W = G.wave,
    tier = G.focusTier,
    L = W.list || (W.list = []);
  for (const wv of L.slice())
    if (wv.left <= 0) {
      W.list = L.filter(x => x !== wv);
      const g = 8 + 3 * wv.total;
      popup('Wave Cleared', '+' + g + ' ' + TEXT.coin, 'good');
      gold(g);
      score(PTS.wave * wv.total * r.level);
      charge(3, 'kill');
      A.s('questDone');
      G.dirty = true;
      L.splice(L.indexOf(wv), 1);
    }
  W.active = L.length ? L[L.length - 1] : null;
  // the next wave comes on a clock that runs on the ball's level, three times as fast while the level is empty
  if (tier >= NM || (G.boss && G.boss.alive && G.boss.tier === tier)) return;
  W.t -= 0.6 * (foesOn(tier) ? 1 : 3);
  if (W.t <= 0) {
    W.t = waveGap();
    startWave(tier, 'time');
  }
}
export function manageSpawns() {
  const r = G.run;
  if (!USE.foes) return;
  if (!G.balls.length || G.sub || G.fallen || G.inGrave) return;
  {
    const tw = wingOfTier(G.focusTier),
      wd = tw && WINGS[tw.key];
    if (wd && wd.rule === 'kills') {
      const need = wd.need - (r.wing.key === tw.key ? r.wing.prog || 0 : 0);
      if (tw.seal[0].on && G.enemies.filter(e => e.pack && !e.dead).length < Math.min(2, need)) {
        const e = spawnEnemy(wd.foe, tw.tier);
        if (e) e.pack = true;
      }
      return;
    }
  }
  for (const q of quests()) {
    const o = qCur(q);
    if (!o || o.t !== 'kill') continue;
    const alive = G.enemies.filter(e => e.type === o.e && e.tier === o.tier).length,
      want = Math.min(3, o.n - q.prog);
    if (alive < want) {
      spawnEnemy(o.e, o.tier, q);
      break;
    }
  }
  waveTick();
}
export function spawnPickup(tier, kind, quest) {
  let p = null;
  for (const c of shuffle(T.spawn[tier])) {
    if (G.enemies.some(e => Math.hypot(e.ax - c[0], e.ay - c[1]) < 40)) continue;
    if (G.pickups.some(e => Math.hypot(e.x - c[0], e.y - c[1]) < 30)) continue;
    p = c;
    break;
  }
  if (!p) p = pick(T.spawn[tier]);
  G.pickups.push({x: p[0] + rand(-8, 8), y: p[1] + rand(-8, 8), tier, kind, quest: quest || null, t: 0});
}
export function updatePickups(dt) {
  let hit = false;
  for (const p of G.pickups) {
    p.t += dt;
    if (p.t < 0.3) continue;
    if (!p.quest && !p.hoard && p.t > 20) {
      p.gone = true;
      hit = true;
      continue;
    }
    for (const b of G.balls) {
      if (b.st !== 'live') continue;
      const dx = b.x - p.x,
        dy = b.y - p.y;
      if (dx * dx + dy * dy < 28 * 28) {
        p.gone = true;
        hit = true;
        A.s('pickup');
        burst(p.x, p.y, 10, '#ffd24a', 180, 0.6, 'pickup');
        if (p.hoard) {
          gold(12, p.x, p.y);
          score(PTS.hoard, p.x, p.y);
          wingProg(5, p.x, p.y);
        } else if (p.quest) {
          score(PTS.pickup, p.x, p.y);
          qEvent('collect', p.quest);
        } else if (p.kind === 'gold') {
          gold(8, p.x, p.y);
          score(PTS.coin);
        } else {
          heal(8);
          float(p.x, p.y - 16, '+8 health', '#ff8aa0', 12);
        }
        break;
      }
    }
  }
  if (hit) G.pickups = G.pickups.filter(p => !p.gone);
}
