/* ================= BOSSES =================
   A boss stands on its field's circle and loops through phases: shield | open | summon | cast | frenzy. */
import {G, T, burst, float, later} from '../core/state.js';
import {clamp, rand} from '../core/util.js';
import {startMultiball} from './events.js';
import {spawnEnemy} from './foes.js';
import {relight} from './lamps.js';
import {RELICS} from './perks.js';
import {consecrate, endPower, explode} from './powers.js';
import {qCur, qEvent} from './quests.js';
import {metaAdd, recalc} from './run.js';
import {charge, gold, hurt, score, xp} from './score.js';
import {spellOn, spellVal} from './spells.js';
import {BOSSES, ENEMY} from '../table/content.js';
import {TY} from '../table/layout.js';
import {A} from '../ui/audio.js';
import {popup} from '../ui/ui.js';

/* ---------- bosses ---------- */
/* The circle: every level's resident is there from ball 1. Its runes fill as the main quest closes in on its step;
   when that step comes up the boss rises. Returns {key, fill 0-1, state: 'dormant'|'awake'|'dead'} or null. */
export function wakeInfo(tier) {
  const r = G.run,
    q = r && r.main;
  if (!q) return null;
  const st = q.steps;
  let pb = -1,
    bi = -1;
  for (let i = 0; i < st.length; i++)
    if (st[i].t === 'boss') {
      if (BOSSES[st[i].boss].tier === tier) {
        bi = i;
        break;
      }
      pb = i;
    }
  if (bi < 0) return null;
  const key = st[bi].boss;
  if (q.si > bi) return {key, fill: 1, state: 'dead'};
  const bo = G.boss;
  if (q.si === bi) return {key, fill: 1, state: bo && bo.alive && bo.key === key ? 'awake' : 'dead'};
  const span = bi - pb - 1,
    o = qCur(q),
    done = q.si - pb - 1 + (o && o.n ? Math.min(q.prog, o.n) / o.n : 0);
  return {key, fill: span > 0 ? clamp(done / span, 0, 1) : 0, state: 'dormant'};
}
export function wakeBoss(key) {
  const d = BOSSES[key],
    r = G.run,
    sp = T.bossSpot[d.tier],
    th = 1 + 0.4 * (r.threat - 1);
  const bo = {
    key,
    def: d,
    tier: d.tier,
    x: sp.x,
    y: sp.y,
    ax: sp.x,
    ay: sp.y,
    r: d.r,
    hp: d.hp * th,
    maxHp: d.hp * th,
    alive: true,
    pi: -1,
    phase: '',
    pt: 0,
    pdmg: 0,
    hitCd: 0,
    flash: 0,
    t: 0,
    minions: 0,
    stun: 0,
    castT: 0,
    rise: 3,
    th,
    dying: 0
  };
  G.enemies.forEach(e => {
    if (e.tier === d.tier && Math.hypot(e.x - sp.x, e.y - sp.y) < d.r + 40) e.dead = true;
  });
  float(sp.x, sp.y - 60, 'SOMETHING IS COMING', '#ff6070', 16);
  G.boss = bo;
  {
    const st = G.statues.find(q => q.tier === d.tier);
    if (st) st.on = false;
  }
  bossNext(bo);
  popup('Boss Awakened', d.name, 'boss');
  A.s('boss');
  G.cam.shake = 14;
  G.flash = 0.6;
  G.flashC = '#ff3040';
  relight();
}
export function bossPhaseEnd(bo) {
  for (const id in T.rails) T.rails[id].closed = false;
  G.enemies.forEach(e => {
    e.frenzy = false;
  });
  T.bumps.forEach(c => {
    if (c.tier === bo.tier) c.ward = false;
  });
}
export function bossNext(bo) {
  const d = bo.def;
  bo.pi = (bo.pi + 1) % d.seq.length;
  bo.phase = d.seq[bo.pi];
  bo.pt = 0;
  bo.pdmg = 0;
  bossPhaseEnd(bo);
  switch (bo.phase) {
    case 'shield':
      if (d.wardBy) {
        for (let i = 0; i < d.nSum; i++) {
          const e = spawnEnemy(d.wardBy, bo.tier, null, true);
          if (e) e.warder = true;
        }
        float(bo.x, bo.y + 62, 'WARDED. Slay the ' + ENEMY[d.wardBy].name.toLowerCase() + 's', '#9fe8ff', 13);
      } else {
        T.bumps.forEach(c => {
          if (c.tier === bo.tier) c.ward = true;
        });
        float(bo.x, bo.y + 62, 'WARDED. Strike the lit bumpers', '#9fe8ff', 13);
      }
      A.s('ward');
      break;
    case 'summon':
      bo.minions = 0;
      for (let i = 0; i < d.nSum; i++) if (spawnEnemy(d.summon, bo.tier, null, true)) bo.minions++;
      float(bo.x, bo.y + 62, 'RISE AND SERVE', '#9dffc8', 13);
      A.s('summon');
      break;
    case 'cast':
      bo.castT = d.cast.time;
      popup(d.cast.name, 'Hit a flashing red shot to break the spell', 'boss', d.cast.note || '');
      A.s('cast');
      if (d.cast.closes) T.rails[d.cast.closes].closed = true;
      if (d.cast.frenzy) {
        const fz = d.cast.frenzy;
        let n = G.enemies.filter(e => e.type === fz && e.tier === bo.tier && !e.dead).length;
        while (n < 2) {
          const e = spawnEnemy(fz, bo.tier, null, true);
          if (!e) break;
          n++;
        }
        G.enemies.forEach(e => {
          if (e.type === fz && e.tier === bo.tier) {
            e.frenzy = true;
            e.lungeCd = Math.min(e.lungeCd, 1);
          }
        });
      }
      if (d.cast.fire)
        G.zones.push({
          x: d.cast.fire.x,
          y: TY[bo.tier] + d.cast.fire.y,
          r: d.cast.fire.r,
          t: d.cast.time + 6,
          tick: 0,
          fire: true
        });
      break;
    case 'frenzy':
      if (G.balls.length < 3 && G.balls.length > 0) startMultiball('Frenzy', 2, d.frenzyFrom);
      break;
  }
  relight();
}
export function updateBoss(dt) {
  const bo = G.boss;
  if (!bo) return;
  bo.t += dt;
  if (bo.flash > 0) bo.flash -= dt * 4;
  if (bo.hitCd > 0) bo.hitCd -= dt;
  if (!bo.alive) {
    bo.dying -= dt;
    if (Math.random() < 0.5) burst(bo.x + rand(-30, 30), bo.y + rand(-30, 30), 3, bo.def.color, 200, 1);
    return;
  }
  if (G.focusTier !== bo.tier) {
    if (bo.rise > 0) bo.rise = Math.max(bo.rise, 0.01);
    return;
  }
  bo.pt += dt;
  if (bo.rise > 0) bo.rise -= dt;
  if (bo.stun > 0) bo.stun -= dt;
  if (bo.marked > 0) bo.marked -= dt;
  if (bo.poison > 0) {
    bo.poison -= dt;
    bo.dot = (bo.dot || 0) + dt;
    if (bo.dot >= 1) {
      bo.dot = 0;
      if (bo.phase !== 'shield') hitBoss(bo, G.mods.pow * 0.35, false);
    }
  }
  if (bo.def.moving) {
    bo.x = bo.ax + Math.sin(bo.t * 0.8) * 118;
    bo.y = bo.ay + 18 + Math.sin(bo.t * 1.6) * 22;
  }
  if (!G.balls.length || G.fallen || G.inGrave || G.focusTier !== bo.tier) return;
  switch (bo.phase) {
    case 'shield':
      if (bo.def.wardBy) {
        if (bo.pt > 1 && !G.enemies.some(e => e.warder && !e.dead)) {
          bo.stun = 3;
          bossNext(bo);
          popup('Wards Broken', 'Strike ' + bo.def.short + ' now', 'good');
        }
      } else if (bo.pt > 45) bossNext(bo);
      break;
    case 'open':
    case 'frenzy':
      if (bo.pdmg >= bo.maxHp * 0.3 || bo.pt > 24) bossNext(bo);
      break;
    case 'summon':
      if ((bo.minions <= 0 && bo.pt > 1) || bo.pt > 28) bossNext(bo);
      break;
    case 'cast':
      bo.castT -= dt;
      if (bo.castT <= 0) {
        hurt(bo.def.cast.dmg * bo.th);
        G.curse[bo.def.cast.curse] = 12;
        G.flash = 0.5;
        G.flashC = bo.def.color;
        G.cam.shake = 18;
        A.s('slam');
        float(bo.x, bo.y + 62, bo.def.cast.name.toUpperCase(), '#ff6060', 16);
        bossNext(bo);
      }
      break;
  }
}
export function wardHit(c) {
  const bo = G.boss;
  if (!bo || bo.phase !== 'shield') return;
  const left = T.bumps.filter(x => x.tier === bo.tier && x.ward).length;
  A.s('ward');
  float(c.x, c.y - 34, left ? left + (left > 1 ? ' WARDS LEFT' : ' WARD LEFT') : 'WARDS BROKEN', '#9fe8ff', 14);
  if (!left) {
    bo.stun = 3;
    bossNext(bo);
    popup('Wards Broken', 'Strike ' + bo.def.short + ' now', 'good');
  }
}
export function interruptBoss(bo) {
  bo.stun = 9;
  bo.phase = 'open';
  bo.pt = 0;
  bo.pdmg = 0;
  bossPhaseEnd(bo);
  popup('Spell Interrupted', bo.def.short + ' staggers. Double damage', 'good');
  A.s('interrupt');
  score(30000);
  xp(15);
  if (G.run.cls === 'mage') hitBoss(bo, G.mods.pow * 4, true);
  relight();
}
export function strikeBoss(bo, b, imp) {
  const m = G.mods,
    r = G.run;
  if (bo.rise > 0) return;
  const pw = b.pow ? r.cls : null;
  if (pw === 'mage') {
    endPower(b);
    explode(b.x, b.y);
    if (!bo.alive) return;
  } else if (pw === 'cleric') {
    endPower(b);
    consecrate(bo.x, bo.y + bo.r * 0.6);
  }
  if (bo.phase === 'shield') {
    A.s('clank');
    float(bo.x, bo.y - bo.r - 10, 'WARDED', '#9fe8ff', 13);
    return;
  }
  let dmg = m.pow * clamp(imp / 800, 0.55, 1.6);
  const crit =
    pw === 'rogue' ||
    G.buffs.stealth > 0 ||
    bo.marked > 0 ||
    Math.random() < m.crit ||
    (r.cls === 'rogue' && G.combo > 1 && G.comboT > 0);
  if (pw === 'knight') {
    dmg *= 2.5;
    endPower(b);
  } else if (pw === 'rogue') {
    dmg *= 3;
    endPower(b);
    float(bo.x, bo.y - bo.r - 26, 'BACKSTAB', '#c9a6ff', 15);
    if (m.marked) bo.marked = m.marked;
  }
  if (crit) {
    if (m.critCharge) r.charge = Math.min(100, r.charge + m.critCharge);
    if (m.poison) bo.poison = m.poison;
  }
  if (spellOn('judgement')) dmg += m.pow * spellVal('judgement', 'boss');
  if (crit) dmg *= 2;
  if (G.buffs.sharp > 0) dmg *= 1.25;
  if (bo.def.undead && r.cls === 'cleric') dmg *= 1.5;
  if (bo.phase === 'summon') dmg *= 0.5;
  if (bo.stun > 0) dmg *= 2;
  score(1500);
  charge(1, 'hit');
  A.s('bossHit');
  hitBoss(bo, dmg, crit);
}
export function hitBoss(bo, dmg, crit) {
  if (!bo.alive) return;
  bo.hp -= dmg;
  bo.pdmg += dmg;
  bo.flash = 1;
  float(
    bo.x + rand(-20, 20),
    bo.y - bo.r - 8,
    (crit ? 'CRIT ' : '') + Math.round(dmg),
    crit ? '#ffb040' : '#ffffff',
    crit ? 17 : 13
  );
  burst(bo.x, bo.y, 8, bo.def.color, 260, 0.6);
  G.dirty = true;
  if (bo.hp <= 0) killBoss(bo);
}
export function killBoss(bo) {
  const r = G.run,
    d = bo.def;
  bo.alive = false;
  bo.dying = 2.2;
  bo.hp = 0;
  r.bossKills++;
  bossPhaseEnd(bo);
  G.zones = G.zones.filter(z => !z.fire);
  G.enemies.forEach(e => {
    if (e.minion) e.dead = true;
  });
  score(150000, bo.x, bo.y);
  xp(d.xp);
  gold(d.gold, bo.x, bo.y);
  G.cam.shake = 24;
  G.flash = 1;
  G.flashC = '#ffffff';
  A.s('bossDie');
  burst(bo.x, bo.y, 60, d.color, 420, 1.6);
  let note = '';
  if (d.relic && !r.relics.includes(d.relic)) {
    r.relics.push(d.relic);
    recalc();
    note = 'Relic claimed: ' + RELICS.find(x => x.id === d.relic).name;
  }
  popup('Boss Slain', d.name, 'main', note);
  r.shop = true;
  if (!G.demo) G.pending.push('perk');
  later(2.2, () => {
    if (G.boss === bo) {
      G.boss = null;
      const st = G.statues.find(q => q.tier === bo.tier);
      if (st) st.on = true;
    }
  });
  metaAdd('bosses');
  qEvent('boss', bo.key);
  relight();
}
