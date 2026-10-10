/* ================= RALLY =================
   A full meter cradled: the party comes out as balls. */
import {G, T, bolt, burst, float, focusBall, later} from '../core/state.js';
import {rand} from '../core/util.js';
import {newBall} from '../physics/physics.js';
import {hitBoss} from './bosses.js';
import {CLASSES} from './classes.js';
import {damageEnemy} from './foes.js';
import {COMPANIONS, ROLES} from './party.js';
import {heal} from './score.js';
import {SPELL_FX, heroBall, heroBalls, nearFoes} from './spells.js';
import {RECRUIT_RETURNS, armRecruit} from './tavern.js';
import {BT, CX, OX, TY} from '../table/layout.js';
import {A} from '../ui/audio.js';
import {popup} from '../ui/ui.js';

/* ---------- Rally: three bars cradled, the party comes out ---------- */
export const RALLY_T = 20;
/* The Rally is a spectacle: the party is fired up the field one ball at a time from between the flippers, each
   launch an explosion, and every ball out there keeps working: a pulse every second (bolts, shockwaves, heals, bursts)
   on top of its own ability. The music goes double time. */
export const RALLY_GAP = 0.55;
export const RALLY_PULSE = 1.1;
export function rally() {
  const r = G.run,
    h = heroBall() || focusBall();
  if (!h) return;
  r.charge = 0;
  const party = (r.party || []).filter(c => c.hp > 0);
  if (!party.length && !(r.recruits && r.recruits.length)) {
    popup('No One Answers', 'You ride alone. Nothing comes to the call', 'info');
    A.s('deny');
    return;
  }
  const T0 = RALLY_T * (G.mods.twin ? 2 : 1),
    tier = h.tier,
    cx = CX[tier],
    yF = TY[tier] + 900,
    gen = G.gen,
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
  G.rallyPend = list.length;
  list.forEach((dress, i) =>
    later(0.35 + i * RALLY_GAP, () => {
      G.rallyPend = Math.max(0, (G.rallyPend || 0) - 1);
      if (G.gen !== gen || G.run !== r || !heroBalls().length || G.rallyT <= 0) return;
      // on the Hollow they're fired up the shooter lane like a real ball; on the levels above they drop in from the top
      const ht = (heroBall() || heroBalls()[0] || h).tier,
        up = ht < BT,
        b = up
          ? newBall(OX[ht] + 320 + rand(-70, 70), TY[ht] + 90, rand(-260, 260), rand(120, 320))
          : newBall(T.shooter.x, T.shooter.y - 6, 0, -rand(2200, 2380));
      b.tier = up ? ht : BT;
      b.life = T0 - i * RALLY_GAP;
      b.noHole = 1e9;
      b.noMouth = 0;
      b.pulse = rand(0.2, RALLY_PULSE);
      dress(b);
      G.balls.push(b);
      G.booms.push({x: b.x, y: b.y, r: 120, t: 0, c: b.pg});
      burst(b.x, b.y, 34, b.pg, 520, 0.9);
      burst(b.x, b.y, 18, '#ffe9b0', 300, 0.7);
      float(b.x, b.y - 46, b.label.toUpperCase() + '!', b.pg, 17);
      A.s('launch');
      A.s('slam');
      G.cam.shake = Math.max(G.cam.shake, 9);
      G.flash = 0.18;
      G.flashC = b.pg;
      G.dirty = true;
    })
  );
  G.save = Math.max(G.save, 3 + list.length * RALLY_GAP);
  G.rallyT = T0;
  popup('Rally', 'The party is coming. Keep your own ball alive', 'good');
  A.s('multiball');
  G.flash = 0.5;
  G.flashC = '#ffe9b0';
  G.cam.shake = Math.max(G.cam.shake, 12);
  G.dirty = true;
}
// what each party ball does on its pulse, besides its own ability
export function rallyPulse(b) {
  const e = nearFoes(b.x, b.y, 260, b.tier)[0],
    P = G.mods.pow,
    bo = G.boss && G.boss.alive && G.boss.tier === b.tier && G.boss.rise <= 0 ? G.boss : null;
  burst(b.x, b.y, 10, b.pg || '#ffe9b0', 260, 0.5);
  if (b.party === 'tank') {
    G.booms.push({x: b.x, y: b.y, r: 110, t: 0, c: b.pg});
    for (const f of nearFoes(b.x, b.y, 110, b.tier)) {
      f.stun = Math.max(f.stun, 1.2);
      f.wind = 0;
      damageEnemy(f, P * 0.3, false);
    }
    A.s('slam');
  } else if (b.party === 'healer') {
    heal(3);
    for (const c of G.run.party || []) if (c.hp > 0) c.hp = Math.min(c.maxHp, c.hp + 4);
    G.booms.push({x: b.x, y: b.y, r: 90, t: 0, c: '#ffe0a0'});
  } else {
    if (e) {
      bolt(b, e);
      damageEnemy(e, P * (b.party === 'dps' ? 0.6 : 0.45), b.party === 'dps');
    } else if (bo && bo.phase !== 'shield') {
      bolt(b, bo);
      hitBoss(bo, P * 0.35, false);
    }
    if ((b.pn = (b.pn || 0) + 1) % 3 === 0) {
      G.booms.push({x: b.x, y: b.y, r: 130, t: 0, c: b.pg});
      for (const f of nearFoes(b.x, b.y, 130, b.tier)) damageEnemy(f, P * 0.4, false);
      A.s('slam');
      G.cam.shake = Math.max(G.cam.shake, 5);
    }
  }
}
export function endRally(why) {
  G.rallyPend = 0;
  const had = G.balls.some(b => b.party);
  G.balls = G.balls.filter(b => {
    if (b.party) {
      burst(b.x, b.y, 10, '#ffe9b0', 200, 0.6);
      return false;
    }
    return true;
  });
  G.rallyT = 0;
  if (had) popup('The Party Withdraws', why || 'The rally is over', 'info');
  G.dirty = true;
}
export function updateRally(dt) {
  if (!G.balls.some(b => b.party)) {
    if (!(G.rallyPend > 0)) G.rallyT = 0;
    return;
  }
  G.rallyT = Math.max(0, (G.rallyT || 0) - dt);
  let gone = false;
  const hero = heroBall();
  for (const b of G.balls)
    if (b.party) {
      b.life -= dt;
      if (b.life <= 0 || (b.st !== 'live' && b.st !== 'rail')) {
        b.gone = true;
        gone = true;
      } else if (b.st === 'live' && (b.pulse -= dt) <= 0) {
        b.pulse = RALLY_PULSE;
        rallyPulse(b);
      } else if (b.cast) {
        b.cast.t -= dt;
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
  if (gone)
    G.balls = G.balls.filter(b => {
      if (b.gone && b.party) {
        burst(b.x, b.y, 10, '#ffe9b0', 200, 0.6);
        if (
          b.party === 'recruit' &&
          b.st === 'live' &&
          hero &&
          RECRUIT_RETURNS.includes(b.spell) &&
          !b.returned &&
          b.life > 0
        ) {
          const nb = newBall(hero.x + rand(-30, 30), hero.y - 20, rand(-200, 200), -rand(200, 400));
          Object.assign(nb, {
            party: 'recruit',
            cls: b.cls,
            pc: b.pc,
            pg: b.pg,
            r: b.r,
            kx: b.kx,
            life: b.life,
            noHole: 1e9,
            returned: true
          });
          armRecruit(nb, b.spell, b.life);
          later(0.05, () => G.balls.push(nb));
          float(hero.x, hero.y - 40, CLASSES[b.cls].name.toUpperCase() + ' RETURNS', b.pg, 13);
        }
        return false;
      }
      return true;
    });
  if (!G.balls.some(b => b.party)) endRally('Their time is up');
}
