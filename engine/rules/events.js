/* ================= TABLE EVENTS =================
   Everything the ball does to the table arrives here: ev(type, thing, ball, impact). This is where a hit becomes
   score, meter, quest progress and a call to the table's own rules (onComplete, onScoop). */
import {G, T, bolt, burst, comboF, float, later} from '../core/state.js';
import {rand} from '../core/util.js';
import {newBall} from '../physics/physics.js';
import {serve} from './ball.js';
import {wardHit} from './bosses.js';
import {CLASSES} from './classes.js';
import {damageEnemy, ritualBroken, spawnEnemy} from './foes.js';
import {graveHit} from './grave.js';
import {relight} from './lamps.js';
import {raiseParty} from './party.js';
import {powerImpact} from './powers.js';
import {qEvent} from './quests.js';
import {charge, gold, heal, jackpot, major, score, shot, xp} from './score.js';
import {holyFire, spellOn, spellProg, spellVal} from './spells.js';
import {callFoes, campFoes, startWave, waveJoin} from './waves.js';
import {breakSeal, wingDone} from './wings.js';
import {DEF, PAL, RULES, TEXT, WINGS} from '../table/content.js';
import {GT} from '../table/layout.js';
import {A} from '../ui/audio.js';
import {popup} from '../ui/ui.js';

/* ---------- table events ---------- */
export function ev(type, o, b, imp) {
  const r = G.run;
  if (!r) return;
  if (type === 'sling') G.slingRun = (G.slingRun || 0) + 1;
  else if (type !== 'wall' && type !== 'inlane' && type !== 'outlane') G.slingRun = 0;
  switch (type) {
    case 'wall':
      A.s('knock', imp);
      break;
    case 'flipHit':
      if (G.mods.ironFlip) {
        for (const e of G.enemies)
          if (!e.dead && e.spawn <= 0 && e.tier === b.tier && Math.hypot(e.x - b.x, e.y - b.y) < 90)
            damageEnemy(e, G.mods.pow * G.mods.ironFlip, false);
      }
      if (b.arm > 0 && b.armCost && r.charge < b.armCost) {
        b.arm = 0;
        b.armCost = 0;
      }
      if (b.arm > 0) {
        if (b.armCost) {
          r.charge -= b.armCost;
          b.armCost = 0;
          G.dirty = true;
        }
        b.arm = 0;
        b.pow = {t: r.cls === 'knight' ? 3.5 : 3, hits: 0};
        A.s('ability');
        burst(b.x, b.y, 18, CLASSES[r.cls].glow, 300, 0.6);
        float(b.x, b.y - 30, CLASSES[r.cls].shot.toUpperCase(), CLASSES[r.cls].glow, 15);
      }
      break;
    case 'sling':
      score(110);
      A.s('sling');
      charge(1, 'hit');
      if (spellOn('judgement')) holyFire(b.x, b.y, b.tier);
      if (G.mods.bumpGold && Math.random() < 0.3) gold(1, b.x, b.y);
      burst(b.x, b.y, 4, '#ffd9a0', 160, 0.5);
      break;
    case 'bump': {
      if (o.poss && !o.poss.dead) {
        A.s('clank');
        burst(o.x, o.y, 5, '#9be8e0', 160, 0.5);
        powerImpact(b, type);
        break;
      }
      score(o.bell ? 800 : 250);
      A.s(o.bell ? 'bell' : 'bump', o.tier);
      charge(1, 'hit');
      shot(o.group, o.x, o.y);
      burst(o.x, o.y, 6, o.bell ? '#ffd070' : '#bfe6ff', 200, 0.5);
      if (o.ward) {
        o.ward = false;
        wardHit(o);
      }
      if (o.opensGrave) {
        graveHit(o);
        G.graveStir = (G.graveStir || 0) + 1;
        const gs = DEF.content.graveStir;
        if (gs && G.graveStir % gs.every === 0 && !G.inGrave) {
          const e = spawnEnemy(gs.foe, o.tier);
          if (e) {
            float(o.x, o.y - 44, TEXT.graveStir, '#9dffc8', 12);
            waveJoin(e, o.tier);
          }
        }
      }
      if (o.bell && G.focusTier === o.tier && !(G.boss && G.boss.alive) && !((G.calls || {}).bell > G.t)) {
        (G.calls || (G.calls = {})).bell = G.t + 6;
        startWave(o.tier, 'bell');
      }
      if (o.bell && G.mods.bellHeal) {
        heal(G.mods.bellHeal);
        G.buffs.hallow = Math.max(G.buffs.hallow || 0, 8);
        float(o.x, o.y - 50, 'WARDED', '#ffe0a0', 13);
      } else if (o.group === 'bones' && G.graveBones < 4) {
        G.graveBones++;
        G.graveT += 1;
        float(o.x, o.y - 30, '+1s', '#9dffc8', 12);
      } else if (o.tier > GT) {
        gold(1, o.x, o.y);
        if (G.wingUrns < 6) {
          G.wingUrns++;
          G.wingT += 1;
          float(o.x, o.y - 30, '+1s', PAL[o.tier].glow, 12);
        }
      }
      if (G.mods.bumpGold && Math.random() < 0.35) gold(1, o.x, o.y);
      if (spellOn('judgement') || b.spell === 'judgement') holyFire(o.x, o.y, o.tier);
      if (b.party === 'healer') heal(2);
      if (G.mods.bumpDmg || (r.cls === 'mage' && (o.conduit || G.mods.conduit || spellOn('blink')))) {
        const n = G.mods.conduit && o.conduit ? 2 : 1,
          near = G.enemies
            .filter(e => e.tier === o.tier && e.spawn <= 0 && !e.dead)
            .sort((p, q) => Math.hypot(p.x - o.x, p.y - o.y) - Math.hypot(q.x - o.x, q.y - o.y))
            .slice(0, n);
        for (const best of near) {
          bolt(o, best);
          damageEnemy(best, G.mods.pow * 0.5, false);
        }
      }
      powerImpact(b, type);
      break;
    }
    case 'target': {
      {
        const wk = T.banks[o.bank].wing;
        if (wk && !o.lit && T.wings[wk].seal[0].on) {
          G.wingT += 6;
          float(b.x, b.y - 26, '+6s', WINGS[wk].col, 12);
        }
      }
      o.lit = true;
      score(500, b.x, b.y);
      A.s('target');
      charge(1, 'hit');
      shot(o.bank, b.x, b.y);
      if (spellOn('judgement')) holyFire(b.x, b.y, b.tier);
      const B = T.banks[o.bank];
      if (B.segs.every(s => s.lit)) {
        B.segs.forEach(s => (s.lit = false));
        done(o.bank, b.x, b.y);
      }
      powerImpact(b, type);
      break;
    }
    case 'drop': {
      score(750, b.x, b.y);
      A.s('drop');
      charge(1, 'hit');
      shot(o.bank, b.x, b.y);
      const B = T.banks[o.bank];
      if (o.bank === 'nails') {
        G.graveT += 3;
        float(b.x, b.y - 26, '+3s', '#9dffc8', 12);
      }
      if ((b.pow && r.cls === 'knight') || (B.door && r.cls === 'rogue'))
        B.segs.forEach(s => {
          if (s.on) {
            s.on = false;
            s.flash = 1;
            score(750);
          }
        });
      if (b.pow && r.cls === 'knight' && (G.mods.jugger || spellVal('charge', 'all')) && !G.inGrave)
        for (const id in T.banks) {
          const O = T.banks[id];
          if (O === B || O.kind !== 'drop' || O.tier !== B.tier || O.door || !O.segs.some(s => s.on)) continue;
          O.segs.forEach(s => {
            if (s.on) {
              s.on = false;
              s.flash = 1;
              score(750);
            }
          });
          O.reset = 1.4;
          done(id, b.x, b.y);
        }
      if (B.segs.every(s => !s.on)) {
        B.reset = 1.4;
        done(o.bank, b.x, b.y);
      }
      powerImpact(b, type);
      break;
    }
    case 'lane':
    case 'inlane':
    case 'outlane': {
      score(type === 'lane' ? 400 : 300);
      A.s('lane');
      charge(1, 'lane');
      if (type !== 'outlane' && !b.party) spellProg('guard', 1, o.x, o.y);
      if (G.mods.laneHeal) heal(G.mods.laneHeal);
      if (o.set) {
        const S = T.sets[o.set];
        if (S.skill && G.skill >= 0) {
          if (S.lanes[G.skill] === o) {
            score(15000, o.x, o.y, 'SKILL SHOT');
            xp(15);
            A.s('bank');
          }
          G.skill = -1;
        }
        o.lit = true;
        shot(o.set, o.x, o.y);
        if (S.lanes.every(l => l.lit)) {
          S.lanes.forEach(l => (l.lit = false));
          done(o.set, o.x, o.y);
          G.wave.t += 12;
          float(o.x, o.y + 30, TEXT.watch, '#9fe8ff', 12);
          if (G.mods.laneKick && !r.kickback) {
            r.kickback = true;
            float(o.x, o.y + 46, 'KICKBACK LIT', '#9fe8ff', 12);
            relight();
          }
        }
      }
      if (G.mods.laneWard && type !== 'outlane') G.buffs.hallow = G.mods.laneWard;
      if (type === 'outlane' && G.mods.outSave && !G.chanceUsed && G.save <= 0 && !r.shield && G.balls.length === 1) {
        G.chanceUsed = true;
        G.save = 3;
        float(o.x, o.y - 30, 'SECOND CHANCE', '#9fe8ff', 14);
        A.s('ward');
      }
      break;
    }
    case 'orbit': {
      const id = 'orbit' + (o.side < 0 ? 'L' : 'R') + o.tier,
        m = G.orbitMem;
      if (b.vy < -150) {
        major(o.x, o.y);
        score(3000 * comboF(), o.x, o.y);
        A.s('orbit');
        shot(id, o.x, o.y);
        r.stat.orbits++;
        if (!b.party) spellProg('pressure', 10, o.x, o.y);
        m[o.tier] = {side: o.side, t: G.t};
      } else if (b.vy > 80) {
        const p = m[o.tier];
        if (p && p.side === -o.side && G.t - p.t < 4) {
          score(6000, o.x, o.y, 'FULL ORBIT');
          xp(4);
          m[o.tier] = null;
          jackpot(o.x, o.y);
        }
      }
      break;
    }
    case 'spin':
      score(150);
      A.s('spin');
      charge(1, 'spin');
      shot(o.id, o.x, o.y);
      G.spinN = (G.spinN || 0) + 1;
      if (G.spinN % 18 === 0 && o.calls)
        callFoes(o.tier, o.calls.foes ? o.calls.foes : campFoes(o.calls.camp), o.calls.text, o.x, o.y);
      if (!(b && b.party)) spellProg('pressure', 1);
      break;
    case 'kick':
      if (r.kickback && !G.fallen && G.tilt <= 0) {
        r.kickback = false;
        G.kickT = 30;
        b.x = o.x;
        b.vx = 0;
        b.vy = -2050;
        A.s('kick');
        float(b.x + 40, b.y - 40, 'KICKBACK', '#9fe8ff', 15);
        burst(b.x, b.y, 14, '#9fe8ff', 300, 0.6);
        relight();
      }
      break;
    case 'rampIn':
      A.s('rampIn');
      for (const e of G.enemies) if (e.job === 'ritual' && e.post && e.post.rail === o.id) ritualBroken(e);
      break;
    case 'ramp':
      if (o.to === o.from && !b.party) callFoes(o.to, campFoes(2), TEXT.followed, b.x, b.y);
      r.stat.ramps++;
      if (r.bb) r.bb.ramps++;
      if (!b.party) spellProg('striker', 1, b.x, b.y);
      major(b.x, b.y);
      score(4000 * comboF(), b.x, b.y);
      A.s('ramp');
      shot(o.id, b.x, b.y);
      if (G.mods.rampHeal) heal(G.mods.rampHeal);
      if (G.mods.rampCharge) {
        r.charge = Math.min(100, r.charge + G.mods.rampCharge);
        score(G.mods.rampScore);
      }
      xp(2);
      jackpot(b.x, b.y);
      break;
    case 'rampFail':
      A.s('knock', 260);
      (G.tally || (G.tally = {}))['fail:' + o.id] = (G.tally['fail:' + o.id] || 0) + 1;
      break;
    case 'hole':
      handleHole(o, b);
      break;
  }
}
export function done(id, x, y) {
  const r = G.run;
  major(x, y);
  score(8000 * comboF(), x, y);
  A.s('bank');
  qEvent('done', id);
  xp(5);
  raiseParty(x, y);
  if (T.banks[id]) spellProg('breaker', 1, x, y);
  const B = T.banks[id];
  if (id === 'nails')
    popup(TEXT.graveLid[0], TEXT.graveLid[1], 'good'); // the Grave's own bank
  else if (B && B.door) {
    G.doorT = B.doorTime;
    if (B.doorPopup) popup(B.doorPopup[0], B.doorPopup[1], 'good');
  } // a sealed door stands open for a while
  else if (B && B.wing) {
    if (G.run.wing.key === B.wing) breakSeal();
  } // a wing's target bank breaks its seal
  else if (RULES.onComplete && RULES.onComplete[id]) RULES.onComplete[id](x, y, r); // the table's own
  relight();
}
export function openDoor(open) {
  if (T.door) T.door.segs.forEach(s => (s.on = !open));
  if (!open) G.doorT = 0;
  relight();
}
export function handleHole(h, b) {
  const r = G.run,
    hd = b.held;
  hd.plan = 'eject';
  hd.delay = 1;
  A.s('hole');
  major(h.x, h.y);
  spellProg('guard', 4, h.x, h.y);
  score(2500 * comboF(), h.x, h.y);
  shot(h.id, h.x, h.y);
  if (h.id === 'rise') {
    hd.plan = 'tunnel';
    hd.delay = 0.5;
    G.inGrave = false;
    G.graveLive = false;
    G.tilt = 0;
    G.save = Math.max(G.save, 6);
    score(50000, h.x, h.y, TEXT.risen[0].toUpperCase());
    xp(20);
    popup(TEXT.risen[0], TEXT.risen[1], 'main');
    A.s('victory');
    G.flash = 0.8;
    G.flashC = '#eaffd0';
  } // the way out of the Grave
  else if (h.wingGoal) {
    hd.plan = 'tunnel';
    hd.delay = 1.1;
    wingDone(h);
  } // the scoop at the head of a wing
  else if (h.wingIn) {
    hd.delay = 0.5;
  } // arriving in a wing
  else if (RULES.onScoop && RULES.onScoop[h.id]) RULES.onScoop[h.id](h, b, hd, r); // the table's own
  relight();
}
export function lockBall(b) {
  const r = G.run;
  r.locks++;
  if (r.locks >= 2) {
    r.locks = 0;
    if (!G.mods.lockKeep) r.lockLit = false;
    b.held.delay = 2.4;
    startMultiball(TEXT.lockMb, 2, b.held.id);
  } else {
    popup('Ball Locked', 'One more for multiball', 'mb');
    A.s('lock');
    G.balls = G.balls.filter(x => x !== b);
    if (!G.balls.length)
      later(1, () => {
        if (G.run === r && !G.balls.length && !G.sub) serve();
      });
  }
}
export function startMultiball(name, add, from) {
  if (!G.mb) G.mb = {name, jackpot: 40000};
  popup(name + ' Multiball', 'Ramps and orbits score jackpots', 'mb');
  A.s('multiball');
  G.save = Math.max(G.save, 8);
  G.flash = 0.5;
  G.flashC = '#ffd24a';
  for (let i = 0; i < add; i++) later(0.7 + i * 0.8, () => addBall(from));
  relight();
}
export function addBall(from) {
  if (G.balls.length >= 5 || G.sub || !G.run) return;
  if (from === 'shooter') {
    G.balls.push(newBall(T.shooter.x, T.shooter.y - 6, 0, -2280));
    A.s('launch');
    return;
  }
  const h = T.holes[from],
    b = newBall(h.x, h.y + h.r + 2, h.ev[0] * rand(0.85, 1.15), h.ev[1]);
  b.noHole = 0.8;
  G.balls.push(b);
  h.glow = 1;
  A.s('eject');
}
