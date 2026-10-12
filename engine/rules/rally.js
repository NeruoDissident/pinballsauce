/* ================= RALLY =================
   A full meter cradled: the party comes out as balls. */
import {G, T, bolt, burst, flash, float, focusBall, later, ring, shake} from '../core/state.js';
import {rand} from '../core/util.js';
import {newBall} from '../physics/physics.js';
import {hitBoss} from './bosses.js';
import {CLASSES} from './classes.js';
import {damageEnemy} from './foes.js';
import {COMPANIONS, ROLES} from './party.js';
import {heal} from './score.js';
import {SPELL_FX, heroBall, nearFoes} from './spells.js';
import {armRecruit} from './tavern.js';
import {BT, ST, OX, TY} from '../table/layout.js';
import {A} from '../ui/audio.js';
import {popup} from '../ui/ui.js';
import {TUNE, USE} from '../table/content.js';

/* ---------- Rally: three bars cradled, the party comes out ---------- */
/* The Rally is a spectacle: the party is fired up the field one ball at a time from between the flippers, each
   launch an explosion, and every ball out there keeps working: a pulse every second (bolts, shockwaves, heals, bursts)
   on top of its own ability. The music goes double time. */
export const RALLY_GAP = 0.55;
export const RALLY_PULSE = 1.1;
export function rally() {
  const r = G.run,
    h = heroBall() || focusBall();
  if (!USE.party || !h || G.rallyActive || G.rallyPend > 0) return;
  r.charge = 0;
  const party = (r.party || []).filter(c => c.hp > 0);
  if (!party.length && !(r.recruits && r.recruits.length)) {
    popup('No One Answers', 'You ride alone. Nothing comes to the call', 'info');
    A.s('deny');
    return;
  }
  const T0 = TUNE.rallyTime * (G.mods.twin ? 2 : 1),
    gen = G.gen,
    rallyId = ++G.rallyId,
    list = [];
  for (const c of party) {
    const d = COMPANIONS[c.id];
    list.push(b => {
      b.party = d.role;
      b.pc = ROLES[d.role].col;
      b.pg = b.pc;
      b.label = d.name;
      if (d.role === 'tank') {
        b.r = 12.5;
        b.kx = 0.6;
      } else if (d.role === 'dps') {
        b.r = 10;
        b.kx = 1.05;
      }
    });
  }
  for (const q of r.recruits || []) {
    const cc = CLASSES[q.cls];
    list.push(b => {
      b.party = 'recruit';
      b.cls = q.cls;
      b.pc = cc.color;
      b.pg = cc.glow;
      b.label = cc.name;
      b.r = cc.r;
      b.kx = cc.kx;
      armRecruit(b, q.spell, T0);
    });
  }
  G.rallyActive = true;
  G.rallyPend = list.length;
  list.forEach((dress, i) =>
    later(0.35 + i * RALLY_GAP, () => {
      if (G.gen !== gen || G.run !== r || G.rallyId !== rallyId || !G.rallyActive) return;
      G.rallyPend = Math.max(0, G.rallyPend - 1);
      // on the Hollow they're fired up the shooter lane like a real ball; on the levels above they drop in from the top
      const ht = (focusBall() || h).tier,
        up = ht < BT,
        b = up
          ? newBall(OX[ht] + 320 + rand(-70, 70), TY[ht] + 90, rand(-260, 260), rand(120, 320))
          : newBall(T.shooter.x, T.shooter.y - 6, 0, -rand(2200, 2380));
      b.tier = up ? ht : ST;
      b.life = T0 - i * RALLY_GAP;
      b.noHole = 1e9;
      b.noMouth = 0;
      b.pulse = rand(0.2, RALLY_PULSE);
      dress(b);
      G.balls.push(b);
      ring(b.x, b.y, 120, b.pg, 'rallyBall');
      burst(b.x, b.y, 34, b.pg, 520, 0.9, 'rallyBall');
      burst(b.x, b.y, 18, '#ffe9b0', 300, 0.7, 'rallySpark');
      float(b.x, b.y - 46, b.label.toUpperCase() + '!', b.pg, 17);
      A.s('launch');
      A.s('slam');
      shake(9, 'rallyBall');
      flash(0.18, b.pg, 'rallyBall');
      settleRally();
      G.dirty = true;
    })
  );
  G.save = Math.max(G.save, 3 + list.length * RALLY_GAP);
  G.rallyT = T0;
  popup('Rally', 'Keep any ball alive. The lowest ball leads', 'good');
  A.s('multiball');
  flash(0.5, '#ffe9b0', 'rally');
  shake(12, 'rally');
  G.dirty = true;
}
// what each party ball does on its pulse, besides its own ability
export function rallyPulse(b) {
  const role = b.party || b.rallyRole;
  const e = nearFoes(b.x, b.y, 260, b.tier)[0],
    P = G.mods.pow,
    bo = G.boss && G.boss.alive && G.boss.tier === b.tier && G.boss.rise <= 0 ? G.boss : null;
  burst(b.x, b.y, 10, b.pg || '#ffe9b0', 260, 0.5, 'partyPulse');
  if (role === 'tank') {
    ring(b.x, b.y, 110, b.pg, 'rallyTank');
    for (const f of nearFoes(b.x, b.y, 110, b.tier)) {
      f.stun = Math.max(f.stun, 1.2);
      f.wind = 0;
      damageEnemy(f, P * 0.3, false);
    }
    A.s('slam');
  } else if (role === 'healer') {
    heal(3);
    for (const c of G.run.party || []) if (c.hp > 0) c.hp = Math.min(c.maxHp, c.hp + 4);
    ring(b.x, b.y, 90, '#ffe0a0', 'rallyHeal');
  } else {
    if (e) {
      bolt(b, e, 'rallyPulse');
      damageEnemy(e, P * (role === 'dps' ? 0.6 : 0.45), role === 'dps');
    } else if (bo && bo.phase !== 'shield') {
      bolt(b, bo, 'rallyPulse');
      hitBoss(bo, P * 0.35, false);
    }
    if ((b.pn = (b.pn || 0) + 1) % 3 === 0) {
      ring(b.x, b.y, 130, b.pg, 'rallySlam');
      for (const f of nearFoes(b.x, b.y, 130, b.tier)) damageEnemy(f, P * 0.4, false);
      A.s('slam');
      shake(5, 'rallySlam');
    }
  }
}
// Once only one ball remains, it becomes the playable ball without changing the saved hero build.
export function settleRally() {
  if (!G.rallyActive || G.rallyPend > 0 || G.plunge.auto > 0 || G.balls.length !== 1) return;
  const b = G.balls[0];
  if (b.party) {
    b.rallyRole = b.party;
    delete b.party;
    b.hero = true;
    b.noHole = 0;
    float(b.x, b.y - 40, b.label.toUpperCase() + ' TAKES THE LEAD', b.pg, 13);
  }
  G.rallyActive = false;
  G.dirty = true;
}
export function endRally() {
  G.rallyId++;
  G.rallyPend = 0;
  G.rallyActive = false;
  G.rallyT = 0;
  G.dirty = true;
}
export function updateRally(dt) {
  // rallyTime now limits the opening ability burst, never a ball's lifetime.
  G.rallyT = Math.max(0, (G.rallyT || 0) - dt);
  for (const b of G.balls) {
    if (!(b.party || b.rallyRole) || b.gone) continue;
    const was = b.life;
    b.life = Math.max(0, (b.life || 0) - dt);
    if (b.life <= 0) {
      if (was > 0 || b.cast || b.phased) {
        b.cast = null;
        b.spell = null;
        b.phased = false;
        if (b.cls) b.kx = CLASSES[b.cls].kx;
      }
      continue;
    }
    if (b.st === 'live' && (b.pulse -= dt) <= 0) {
      b.pulse = RALLY_PULSE;
      rallyPulse(b);
    }
    if (b.cast) {
      b.cast.t = Math.max(0, b.cast.t - dt);
      b.cast.tick -= dt;
      const F = SPELL_FX[b.spell];
      if (F && F.tick) F.tick(b.cast, dt, b);
      if (b.spell === 'radiance') {
        b.tk = (b.tk || 0) - dt;
        if (b.tk <= 0) {
          b.tk = 0.5;
          for (const e of nearFoes(b.x, b.y, 170, b.tier)) damageEnemy(e, G.mods.pow * 0.2, false);
        }
      }
    }
  }
  settleRally();
  if (!G.rallyPend && !G.balls.some(b => b.party || b.rallyRole)) G.rallyT = 0;
}
