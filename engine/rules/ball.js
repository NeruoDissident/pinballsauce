/* ================= THE BALL'S LIFE =================
   Serve, plunger, nudge and tilt, flipper input, scoops and tunnels, drains, ball save, end-of-ball bonus. */
import {G, T, burst, float, later, ring, shake} from '../core/state.js';
import {irand, rand} from '../core/util.js';
import {newBall} from '../physics/physics.js';
import {addBall} from './events.js';
import {graveCatch} from './grave.js';
import {relight} from './lamps.js';
import {classNudge} from './powers.js';
import {qCur, qFail} from './quests.js';
import {endRally, settleRally} from './rally.js';
import {gameOver, saveRun, startDemo} from './run.js';
import {gold} from './score.js';
import {spellCast, spellVal} from './spells.js';
import {leaveWing} from './wings.js';
import {PTS, RULES, TEXT, TUNE, USE, WING_KEYS, hook} from '../table/content.js';
import {railPos} from '../table/geometry.js';
import {enterRail} from '../table/mechanisms.js';
import {BT, ST, CX, FEEL, GRID, GT, H, HW, TY, WLEN, WT0, tierOf} from '../table/layout.js';
import {DRAIN_Y} from '../table/parts.js';
import {A} from '../ui/audio.js';
import {UI, popup} from '../ui/ui.js';

/* ---------- ball lifecycle ---------- */
export function serve() {
  const hb = newBall(T.shooter.x, T.shooter.y, 0, 0);
  hb.hero = true;
  G.balls.push(hb);
  {
    const ss = Object.values(T.sets).find(q => q.skill);
    G.skill = ss ? irand(0, ss.lanes.length - 1) : -1;
  }
  G.dirty = true;
}
export function startBall() {
  endRally();
  const r = G.run;
  r.bb = {kills: 0, quests: 0, ramps: 0};
  G.chanceUsed = false;
  G.martyrUsed = false;
  Object.assign(G, {
    balls: [],
    tilt: 0,
    fallen: false,
    hoardDone: false,
    slingRun: 0,
    booms: [],
    zones: [],
    phase: 0,
    nudgeCd: 0,
    hidden: false,
    inGrave: false,
    graveLive: false,
    nudges: [],
    curse: {},
    buffs: {},
    combo: 0,
    comboT: 0,
    mb: null,
    save: 0,
    sub: null
  });
  if (r.hp < G.mods.maxHp * TUNE.ballHeal) r.hp = Math.round(G.mods.maxHp * TUNE.ballHeal);
  r.mult = G.mods.multMin;
  r.kickback = true;
  r.shop = true;
  for (const id in T.sets) if (T.sets[id].ballReset) T.sets[id].lanes.forEach(l => (l.lit = false));
  G.lampShow = 1.6;
  saveRun();
  serve();
  popup(
    'Ball ' + r.ballNum,
    r.ballsLeft > 1 ? r.ballsLeft - 1 + ' in reserve' : 'Last ball',
    'info',
    r.ballNum === 1 && r.time < 1
      ? UI.touch
        ? 'Tap the left and right sides to flip. Hold the right side and let go to launch. Double-tap a side to nudge.'
        : 'Z and / flip. Hold Space and release to launch. Space also nudges.'
      : r.ballNum === 1
        ? ''
        : ''
  );
  hook('ball', null, null, r);
  relight();
}
export function updatePlunger(dt) {
  const p = G.plunge;
  if (p.auto > 0) {
    p.auto -= dt;
    if (p.auto <= 0) addBall('shooter');
  }
  const b = G.balls.find(
    b =>
      b.st === 'live' &&
      b.x > T.shooter.x - 17 &&
      b.y > T.shooter.y - 60 &&
      (ST === BT || (b.x < T.shooter.x + 17 && b.y < T.shooter.y + 20)) &&
      Math.abs(b.vy) < 60
  );
  p.ready = !!b;
  if (!b) {
    p.charge = 0;
    p.held = false;
    return;
  }
  if (G.in.n || G.in.r) {
    p.charge = Math.min(1, p.charge + dt / 0.85);
    p.held = true;
  } else if (p.held) {
    p.held = false;
    b.vy = -(FEEL.plunge[0] + (FEEL.plunge[1] - FEEL.plunge[0]) * p.charge);
    b.y -= 3;
    p.charge = 0;
    A.s('launch');
    G.save = Math.max(G.save, G.mods.save + 2);
  }
}
export function nudge() {
  if (G.plunge.ready || G.tilt > 0 || G.choice || G.paused || !G.run || G.sub) return;
  const now = G.t;
  G.nudges = G.nudges.filter(t => now - t < TUNE.tiltTime);
  G.nudges.push(now);
  if (G.nudges.length >= TUNE.tiltNudges) {
    G.tilt = 1e9;
    G.save = 0;
    popup('Tilt', 'The table goes dead', 'bad');
    A.s('tilt');
    return;
  }
  if (G.nudges.length === TUNE.tiltNudges - 1) popup('Warning', 'Ease off the table', 'bad');
  for (const b of G.balls)
    if (b.st === 'live') {
      const cx = CX[b.tier];
      b.vy -= 230 * FEEL.speed;
      b.vx += ((b.x < cx ? 1 : -1) * 90 + rand(-40, 40)) * FEEL.speed;
    }
  shake(10, 'nudge');
  G.nudgeT = 0.25;
  A.s('nudge');
  classNudge();
}
export function setFlip(side, on) {
  const k = side < 0 ? 'l' : 'r';
  if (G.in[k] === on) return;
  G.in[k] = on;
  for (const f of T.flips) if (f.side === side) f.on = on;
  if (on) {
    if (!G.bot) A.s('flip');
    for (const id in T.sets) {
      const L = T.sets[id].lanes,
        v = L.map(l => l.lit);
      L.forEach((l, i) => (l.lit = v[(i - side + L.length) % L.length]));
    }
    if (G.skill >= 0) {
      const n = Object.values(T.sets).find(q => q.skill).lanes.length;
      G.skill = (G.skill + side + n) % n;
    }
  } else if (!G.bot) A.s('flipDown');
}
export function updateBalls(dt) {
  let gone = false;
  for (const b of G.balls) {
    b.age += dt;
    if (b.onFlip > 0) b.onFlip -= dt;
    if (b.lead && (b.lead[2] -= dt) <= 0) b.lead = null;
    // which tier the ball is in. Where fields stand on a grid, a ball riding a ramp between two of them belongs to the
    // one it left until half way and to the one it is going to after, so a field it only passes never counts.
    b.tier = GRID && b.st === 'rail' && b.rail ? (b.rs < b.rail.len / 2 ? b.rail.from : b.rail.to) : tierOf(b.y, b.x);
    const dr = b.st === 'live' ? T.drains[b.tier] : null;
    if (dr && b.y > TY[b.tier] + DRAIN_Y) {
      // off the foot of a field that drains into a ramp: the ramp takes it, wherever across the field it fell
      b.lead = [b.x - dr.x[0], b.y - dr.y[0], 0.3];
      b.st = 'rail';
      b.rail = dr;
      b.rs = 0;
      b.rv = Math.max(260, Math.hypot(b.vx, b.vy) * 0.6);
      b.hgt = 0;
      A.s('chute');
    }
    if (b.st === 'live') {
      b.rot += (b.vx * dt) / b.r;
      const sp = Math.hypot(b.vx, b.vy),
        inLane = b.x > T.shooter.x - 17 && b.y > T.shooter.y - 100 && b.y < T.shooter.y + 100;
      if (sp < 28 && b.onFlip <= 0 && !inLane) b.slow = (b.slow || 0) + dt;
      else b.slow = 0;
      if (Math.hypot(b.x - b.sx, b.y - b.sy) > 46 || b.onFlip > 0 || inLane) {
        b.sx = b.x;
        b.sy = b.y;
        b.still = 0;
      } else b.still += dt;
      if (b.slow > 2 || b.still > 6) {
        G.stuck.push([Math.round(b.x), Math.round(b.y), b.slow > 2 ? 'rest' : 'trap']);
        if (G.stuck.length > 200) G.stuck.shift();
        b.vx = rand(-320, 320);
        b.vy = -rand(300, 520);
        b.slow = 0;
        b.still = 0;
        b.sx = b.x;
        b.sy = b.y;
      }
      if (b.tier > GT) {
        if (b.y > TY[b.tier] + WLEN + 24) {
          b.st = 'tunnel';
          b.tun = T.tunnels['out_' + WING_KEYS[b.tier - WT0]];
          b.rs = 0;
          b.vx = b.vy = 0;
          A.s('chute');
          leaveWing(b.tier);
        }
      } else if (G.inGrave ? b.y > HW + 28 : b.y > H + 28) {
        if (!G.inGrave && !b.party && graveCatch(b)) {
        } else {
          b.gone = true;
          gone = true;
        }
      }
    } else if (b.st === 'held') {
      const hd = b.held,
        h = T.holes[hd.id];
      hd.t += dt;
      h.glow = Math.max(h.glow, 0.6);
      if (hd.plan !== 'wait' && hd.t >= hd.delay) {
        if (hd.plan === 'rail') {
          enterRail(b, hd.rail || h.rail);
        } else if (hd.plan === 'tunnel') {
          b.st = 'tunnel';
          b.tun = hd.tun || T.tunnels[hd.id];
          b.rs = 0;
          A.s('chute');
        } else {
          b.st = 'live';
          b.x = h.x;
          b.y = h.y + h.r + 2;
          b.vx = h.ev[0];
          b.vy = h.ev[1];
          b.noHole = 0.8;
          b.held = null;
          b.sx = b.x;
          b.sy = b.y;
          A.s('eject');
          burst(h.x, h.y + 12, 6, '#ffd9a0', 140, 0.4, 'eject');
        }
      }
    } else if (b.st === 'tunnel') {
      const tn = b.tun;
      b.rs += 1150 * dt;
      railPos(tn, Math.min(b.rs, tn.len), b);
      if (b.rs >= tn.len && tn.grave) {
        b.st = 'live';
        b.vx = b.vy = 0;
        b.tun = null;
        b.sx = b.x;
        b.sy = b.y;
        b.trail = [];
        G.graveLive = true;
        A.s('slam');
        shake(14, 'graveFall', true);
        burst(b.x, b.y, 20, '#9dffc8', 260, 0.8, 'graveFall');
      } else if (b.rs >= tn.len) {
        const h = T.holes[tn.to];
        b.st = 'held';
        b.held = {id: tn.to, t: 0, plan: 'eject', delay: 0.45};
        b.x = h.x;
        b.y = h.y;
        b.tun = null;
        h.glow = 1;
      }
    }
    const tr = b.trail;
    tr.push(b.x, b.y);
    if (tr.length > 16) tr.splice(0, 2);
  }
  if (gone) {
    const g = G.balls.filter(b => b.gone);
    G.balls = G.balls.filter(b => !b.gone);
    for (const b of g) onDrain(b);
    settleRally();
  }
}
export function onDrain(b) {
  const r = G.run;
  if (G.sub === 'bonus') return;
  A.s('drain');
  if (G.rallyActive || b.party || b.rallyRole) {
    if (G.balls.length || G.rallyPend > 0 || G.plunge.auto > 0) {
      settleRally();
      if (G.balls.length <= 1 && G.mb) {
        G.mb = null;
        relight();
      }
      return;
    }
    endRally();
  }
  if (!G.fallen && G.tilt <= 0 && !G.inGrave && !G.balls.length) {
    const cA = spellCast('aegis'),
      cS = spellCast('sanctuary');
    if (cA) {
      saveBall('Aegis', 'The ward returns your ball');
      if (spellVal('aegis', 'wave')) {
        ring(b.x, b.y, 400, '#8fb0d8', 'aegis');
        for (const e of G.enemies)
          if (e.tier === G.focusTier && !e.dead) {
            e.wind = 0;
            e.stun = Math.max(e.stun, 2);
          }
        r.charge = Math.min(100, r.charge + 40);
      }
      return;
    }
    if (cS && cS.ret > 0) {
      cS.ret--;
      saveBall('Sanctuary', 'The light returns your ball');
      return;
    }
  }
  if (G.inGrave) {
    G.inGrave = false;
    G.graveLive = false;
    popup(TEXT.graveLost[0], TEXT.graveLost[1], 'bad');
    endBall();
    return;
  }
  if (!G.fallen && G.tilt <= 0) {
    if (G.save > 0) {
      saveBall('Ball Saved', 'The ball returns');
      return;
    }
    if (r.shield) {
      r.shield = false;
      saveBall('Aegis', 'The ward returns your ball');
      if (G.mods.bulwark) {
        ring(b.x, b.y, 400, '#8fb0d8', 'aegis');
        for (const e of G.enemies)
          if (e.tier === G.focusTier && !e.dead) {
            e.wind = 0;
            e.stun = Math.max(e.stun, 2);
          }
        float(b.x, b.y - 60, 'BULWARK', '#8fb0d8', 15);
      }
      return;
    }
  }
  if (G.balls.length + (G.plunge.auto > 0 ? 1 : 0) >= 1) {
    if (G.balls.length <= 1 && G.mb) {
      G.mb = null;
      relight();
    }
    return;
  }
  if (G.mods.bargain && G.tilt <= 0) gold(G.mods.bargain, b.x, b.y - 40);
  endBall();
}
export function saveBall(t, s) {
  popup(t, s, 'good');
  A.s('save');
  G.plunge.auto = Math.max(G.plunge.auto, 0.9);
  G.dirty = true;
}
export function endBall() {
  if (G.sub === 'bonus') return;
  endRally();
  const r = G.run;
  hook('ballEnd', null, null, r);
  G.sub = 'bonus';
  G.mb = null;
  for (const q of r.side.slice()) {
    const o = qCur(q);
    if (o && o.time) qFail(q);
  }
  const bb = r.bb || {kills: 0, quests: 0, ramps: 0},
    tilt = G.tilt > 0,
    // one line for each thing this table counts; a table's rules may add lines of their own: bonus(run, counts)
    // returns [[label, count, points], ...]. `counts` is the run's tally for this ball (run.bb); rules may keep
    // their own numbers in it.
    lines = [
      USE.foes && ['Foes slain', bb.kills, bb.kills * PTS.bonusKill],
      USE.side && ['Side quests done', bb.quests, bb.quests * PTS.bonusSide],
      ['Ramps', bb.ramps, bb.ramps * PTS.bonusRamp],
      USE.levels && ['Level', r.level, r.level * PTS.bonusLevel]
    ]
      .filter(Boolean)
      .concat((RULES.bonus && RULES.bonus(r, bb)) || []);
  const base = lines.reduce((a, l) => a + l[2], 0),
    total = tilt ? 0 : base * r.mult;
  r.score += total;
  G.bonus = {lines, mult: r.mult, total, tilt, fallen: G.fallen};
  A.s('ballEnd');
  r.ballsLeft--;
  G.dirty = true;
  if (G.demo) {
    later(1.5, startDemo);
    return;
  }
  UI.bonus(G.bonus, r.ballsLeft > 0);
  later(3.4, () => {
    if (G.run !== r) return;
    G.sub = null;
    UI.bonus(null);
    if (r.ballsLeft > 0) {
      r.ballNum++;
      startBall();
    } else gameOver();
  });
}
