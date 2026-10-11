/* ================= CLASS POWERS =================
   The nudge power, the cradle shot and the passive traits of each class. */
import {G, T, bolt, burst, float, focusBall} from '../core/state.js';
import {hitBoss, interruptBoss} from './bosses.js';
import {CLASSES} from './classes.js';
import {damageEnemy} from './foes.js';
import {rally} from './rally.js';
import {heal, hurt} from './score.js';
import {spellOn, spellVal} from './spells.js';
import {TUNE, USE} from '../table/content.js';
import {tierOf} from '../table/layout.js';
import {A} from '../ui/audio.js';

/* ---------- class powers: cradle to charge, class nudge, ball traits ---------- */
export function endPower(b, expired) {
  const c = G.run.cls;
  b.pow = null;
  if (expired) {
    if (c === 'mage') explode(b.x, b.y);
    else if (c === 'cleric') consecrate(b.x, b.y);
  }
}
export function powerImpact(b, type) {
  if (!b || !b.pow) return;
  const c = G.run.cls;
  if (c === 'mage') {
    endPower(b);
    explode(b.x, b.y);
  } else if (c === 'cleric') {
    endPower(b);
    consecrate(b.x, b.y);
  }
}
export function explode(x, y) {
  const m = G.mods;
  G.booms.push({x, y, r: 140, t: 0, c: '#ff8a3a'});
  if (m.scorch) G.zones.push({x, y, r: 110, t: m.scorch, tick: 0, pyre: true});
  burst(x, y, 40, '#ffb050', 440, 0.9, 'fireball');
  A.s('slam');
  G.cam.shake = Math.max(G.cam.shake, 12);
  G.flash = 0.3;
  G.flashC = '#ff8a3a';
  for (const e of G.enemies) {
    if (e.dead || e.spawn > 0 || Math.hypot(e.x - x, e.y - y) > 130 + e.r) continue;
    if (e.def.cast) e.castT = e.def.cast + 1;
    e.armor = 0;
    damageEnemy(e, m.pow * 2.5, false);
  }
  const bo = G.boss;
  if (bo && bo.alive && bo.rise <= 0 && bo.phase !== 'shield' && Math.hypot(bo.x - x, bo.y - y) < 150 + bo.r)
    hitBoss(bo, m.pow * 2.5, false);
}
export function consecrate(x, y) {
  G.zones.push({x, y, r: 100, t: G.mods.zoneT, tick: 0});
  heal(8);
  A.s('ward');
  burst(x, y, 24, '#ffe0a0', 260, 0.9, 'consecrate');
  float(x, y - 30, 'CONSECRATED', '#ffe0a0', 13);
}
export function classNudge() {
  const r = G.run,
    m = G.mods,
    c = r.cls,
    live = G.balls.filter(b => b.st === 'live');
  if (!USE.classes) return; // a plain ball has no nudge power: a nudge is only a nudge
  if (G.nudgeCd > 0 || !live.length || G.fallen) return;
  G.nudgeCd = 2.5 + m.nudgeCd;
  const near = (e, d) => !e.dead && e.spawn <= 0 && live.some(b => Math.hypot(b.x - e.x, b.y - e.y) < d);
  if (c === 'knight') {
    for (const b of live) G.booms.push({x: b.x, y: b.y, r: 150, t: 0, c: '#8fb0d8'});
    for (const e of G.enemies)
      if (near(e, 150)) {
        e.atk = Math.max(e.atk, 6);
        e.wind = 0;
        e.stun = Math.max(e.stun, 1);
        if (e.def.cast) e.castT = Math.max(e.castT, e.def.cast * 0.8);
        damageEnemy(e, m.pow * 0.4, false);
      }
    if (m.shockHeal) {
      heal(m.shockHeal);
      for (const k in G.curse)
        if (G.curse[k] > 0) {
          G.curse[k] = 0;
          break;
        }
    }
  } else if (c === 'rogue') {
    G.phase = m.phaseT;
    for (const b of live) burst(b.x, b.y, 10, '#b08cff', 180, 0.5, 'cloak');
  } else if (c === 'mage') {
    const b = focusBall();
    let best = null,
      bd = 280;
    for (const e of G.enemies) {
      if (e.dead || e.spawn > 0 || e.tier !== tierOf(b.y, b.x)) continue;
      const d = Math.hypot(e.x - b.x, e.y - b.y);
      if (d < bd) {
        bd = d;
        best = e;
      }
    }
    if (best) {
      bolt(b, best);
      if (best.def.cast) best.castT = best.def.cast + 1;
      if (m.sparkStun) {
        best.wind = 0;
        best.stun = Math.max(best.stun, 1.5);
      }
      damageEnemy(best, m.pow * 0.8, false);
      if (m.chain) {
        const more = G.enemies
          .filter(e => e !== best && !e.dead && e.spawn <= 0 && e.tier === best.tier)
          .sort((p, q) => Math.hypot(p.x - best.x, p.y - best.y) - Math.hypot(q.x - best.x, q.y - best.y))
          .slice(0, m.chain);
        let from = best;
        for (const e of more) {
          bolt(from, e);
          damageEnemy(e, m.pow * 0.6, false);
          from = e;
        }
      }
    } else {
      const bo = G.boss;
      if (bo && bo.alive && bo.rise <= 0 && bo.phase !== 'shield' && Math.hypot(bo.x - b.x, bo.y - b.y) < 320) {
        bolt(b, bo);
        hitBoss(bo, m.pow * 0.5, false);
        if (m.sparkStun && bo.phase === 'cast') interruptBoss(bo);
      }
    }
  } else {
    heal(m.absolve ? 10 : 3);
    if (m.absolve) G.curse = {};
    else
      for (const k in G.curse)
        if (G.curse[k] > 0) {
          G.curse[k] = 0;
          break;
        }
    for (const b of live) G.booms.push({x: b.x, y: b.y, r: 150, t: 0, c: '#ffcf70'});
    for (const e of G.enemies) if (e.def.undead && near(e, 150)) damageEnemy(e, m.pow * 0.5, false);
  }
}
export function updatePowers(dt) {
  const r = G.run,
    c = r.cls,
    m = G.mods,
    cl = CLASSES[c];
  G.hidden = false;
  if (G.phase > 0) G.phase -= dt;
  if (G.nudgeCd > 0) G.nudgeCd -= dt;
  if (spellOn('cloak')) G.phase = Math.max(G.phase, 0.2);
  if (spellOn('cloak') || spellOn('smoke')) G.hidden = true;
  for (const b of G.balls) {
    if (b.st !== 'live') {
      b.cr = 0;
      continue;
    }
    // one hold, two stages: at 0.8 s the class shot arms (one bar, spent when the flip fires it); hold on to 1.5 s with a
    // full meter and the party rallies instead. Let go between the two and you keep the armed shot.
    const full = r.charge >= 100 && USE.party;
    let held = false;
    if (
      b.onFlip > 0 &&
      !b.pow &&
      !b.party &&
      G.tilt <= 0 &&
      (USE.classes ? r.charge >= 33 : full) &&
      (!b.arm || full) &&
      Math.hypot(b.vx, b.vy) < 95
    )
      for (const f of T.flips)
        if (f.on && f.a <= f.up + 0.02 && Math.abs(b.x - f.x) < 75 && Math.abs(b.y - f.y) < 60) {
          held = true;
          break;
        }
    if (held) {
      b.cr += dt;
      if (USE.classes && !b.arm && b.cr >= TUNE.cradleArm) {
        b.arm = 9;
        b.armCost = 33;
        A.s('ward');
        float(b.x, b.y - 30, cl.shot.toUpperCase() + ' READY' + (full ? '. HOLD TO RALLY' : ''), cl.glow, 13);
        G.dirty = true;
        if (!full) b.cr = 0;
      }
      if (full && b.cr >= TUNE.cradleRally) {
        b.cr = 0;
        b.arm = 0;
        b.armCost = 0;
        G.dirty = true;
        rally();
      }
    } else if (b.cr > 0) b.cr = Math.max(0, b.cr - dt * 2);
    if (b.arm > 0) {
      b.arm = Math.max(0, b.arm - dt);
      if (b.arm <= 0) b.armCost = 0;
      if (c === 'rogue') G.hidden = true;
    }
    if (b.pow) {
      b.pow.t -= dt;
      if (c === 'rogue') G.hidden = true;
      if (b.pow.t <= 0) endPower(b, true);
    }
    if (c === 'mage' || c === 'cleric') {
      b.tk -= dt;
      if (b.tk <= 0) {
        b.tk = c === 'mage' ? 0.12 : 0.5;
        for (const e of G.enemies) {
          if (e.dead || e.spawn > 0) continue;
          const d = Math.hypot(e.x - b.x, e.y - b.y);
          if (c === 'mage') {
            if (d < b.r + e.r + 24 && !(e.wakeT > G.t)) {
              e.wakeT = G.t + 1;
              bolt(b, e);
              damageEnemy(e, m.pow * 0.35, false);
            }
          } else {
            const rad = spellOn('radiance');
            if ((e.def.undead || rad) && d < (rad ? 170 : m.lantern ? 140 : 85))
              damageEnemy(
                e,
                m.pow * (m.smite ? 0.4 : 0.2) * (rad && e.def.undead ? spellVal('radiance', 'undead') : 1),
                false
              );
          }
        }
      }
    }
  }
  for (const z of G.zones) {
    z.t -= dt;
    z.tick -= dt;
    if (z.tick <= 0) {
      z.tick = 0.5;
      if (!z.fire && !z.pyre)
        for (const e of G.enemies) {
          if (e.dead || e.spawn > 0 || Math.hypot(e.x - z.x, e.y - z.y) > z.r + e.r) continue;
          e.atk += 0.3;
          damageEnemy(e, m.pow * 0.4 * (e.def.undead ? 2 : 1), false);
        }
      const bo = G.boss;
      if (
        !z.fire &&
        !z.pyre &&
        bo &&
        bo.alive &&
        bo.rise <= 0 &&
        bo.phase !== 'shield' &&
        Math.hypot(bo.x - z.x, bo.y - z.y) < z.r + bo.r
      )
        hitBoss(bo, m.pow * 0.4, false);
      if (z.fire) {
        if (
          G.balls.some(
            b => b.st === 'live' && b.tier === tierOf(z.y, z.x) && Math.hypot(b.x - z.x, b.y - z.y) < z.r + b.r
          )
        ) {
          hurt(2);
          G.curse.burn = Math.max(G.curse.burn || 0, 2);
        }
      } else if (z.pyre) {
        for (const e of G.enemies) {
          if (e.dead || e.spawn > 0 || Math.hypot(e.x - z.x, e.y - z.y) > z.r + e.r) continue;
          damageEnemy(e, m.pow * 0.45, false);
        }
      } else if (G.balls.some(b => b.st === 'live' && Math.hypot(b.x - z.x, b.y - z.y) < z.r))
        heal(z.trail ? spellVal('consecration', 'heal') : m.zoneHeal);
    }
  }
  if (G.zones.length && G.zones.some(z => z.t <= 0)) G.zones = G.zones.filter(z => z.t > 0);
}
