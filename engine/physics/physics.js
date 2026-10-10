/* ================= PHYSICS =================
   The ball, the flippers and every collision. 480 steps a second, 1920 while a flipper is swinging. Planar: height is
   visual only. Collisions raise events through ev() in rules/events.js; nothing here knows what a hit is worth.
   THIS FILE IS THE FEEL OF THE BALL. tests/replay.mjs fails if any result here changes. */
import {G, T, burst, float} from '../core/state.js';
import {TAU, clamp, rand} from '../core/util.js';
import {CLASSES} from '../rules/classes.js';
import {ev} from '../rules/events.js';
import {collideActors} from '../rules/foes.js';
import {guardHit, liveGuards} from '../rules/party.js';
import {TEXT} from '../table/content.js';
import {railPos} from '../table/geometry.js';
import {BR, CELL, FEEL, GRAV, NM, OX, VMAX, YTOP, tierOf} from '../table/layout.js';
import {A} from '../ui/audio.js';

/* ================= PHYSICS ================= */
export const SUB = 1 / 480;
export function newBall(x, y, vx, vy) {
  const c = G.run && CLASSES[G.run.cls];
  return {
    x,
    y,
    vx: vx || 0,
    vy: vy || 0,
    r: c ? c.r : BR,
    kx: c ? c.kx : 1,
    cr: 0,
    arm: 0,
    pow: null,
    tk: 0,
    st: 'live',
    rail: null,
    rs: 0,
    rv: 0,
    hgt: 0,
    rot: 0,
    trail: [],
    still: 0,
    noMouth: 0,
    noHole: 0,
    onFlip: 0,
    age: 0,
    tier: tierOf(y, x),
    sx: x,
    sy: y,
    held: null
  };
}
export function hitSeg(b, s) {
  let t = ((b.x - s.x1) * s.dx + (b.y - s.y1) * s.dy) / s.l2;
  t = t < 0 ? 0 : t > 1 ? 1 : t;
  const qx = s.x1 + s.dx * t,
    qy = s.y1 + s.dy * t;
  let nx = b.x - qx,
    ny = b.y - qy;
  const R = b.r + s.w,
    d2 = nx * nx + ny * ny;
  if (d2 >= R * R) return;
  if (s.ow && (b.x - s.x1) * s.onx + (b.y - s.y1) * s.ony <= 0) return;
  let d = Math.sqrt(d2);
  if (d < 1e-5) {
    nx = -s.dy / s.len;
    ny = s.dx / s.len;
    d = 1e-5;
  } else {
    nx /= d;
    ny /= d;
  }
  b.x += nx * (R - d);
  b.y += ny * (R - d);
  const vn = b.vx * nx + b.vy * ny;
  if (vn >= 0) return;
  const imp = -vn,
    e = imp < 70 ? 0 : s.e;
  b.vx -= (1 + e) * vn * nx;
  b.vy -= (1 + e) * vn * ny;
  const tx = -ny,
    ty = nx,
    vt = b.vx * tx + b.vy * ty,
    fr = imp < 70 ? 0.0025 : 0.03;
  b.vx -= tx * vt * fr;
  b.vy -= ty * vt * fr;
  if (imp < 55) return;
  if (s.kind === 'sling') {
    if (t > 0.1 && t < 0.9 && nx * s.kx + ny * s.ky > 0.5) {
      const k = (G.slingRun > 4 ? 140 : rand(420, 580)) * (0.5 + 0.5 * b.kx) * FEEL.sling;
      b.vx += s.kx * k;
      b.vy += s.ky * k + rand(-50, 30);
      s.flash = 1;
      ev('sling', s, b, imp);
    }
  } else if (s.kind === 'target') {
    if (s.cool <= 0) {
      s.cool = 0.2;
      s.flash = 1;
      ev('target', s, b, imp);
    }
  } else if (s.kind === 'drop') {
    s.on = false;
    s.flash = 1;
    ev('drop', s, b, imp);
  } else if (imp > 160) ev('wall', s, b, imp);
}
export function hitFlipper(b, f) {
  const ca = Math.cos(f.a),
    sa = Math.sin(f.a),
    ex = f.dir * f.L * ca,
    ey = f.L * sa;
  let t = ((b.x - f.x) * ex + (b.y - f.y) * ey) / (f.L * f.L);
  t = t < 0 ? 0 : t > 1 ? 1 : t;
  const qx = f.x + ex * t,
    qy = f.y + ey * t;
  let nx = b.x - qx,
    ny = b.y - qy;
  const R = b.r + 8.5 - 3.5 * t,
    d2 = nx * nx + ny * ny;
  if (d2 >= R * R) return;
  let d = Math.sqrt(d2);
  if (d < 1e-5) {
    nx = 0;
    ny = -1;
    d = 1e-5;
  } else {
    nx /= d;
    ny /= d;
  }
  b.x += nx * (R - d);
  b.y += ny * (R - d);
  const sx = -f.dir * sa * f.L * t * f.w,
    sy = ca * f.L * t * f.w;
  const rx = b.vx - sx,
    ry = b.vy - sy,
    vn = rx * nx + ry * ny;
  b.onFlip = 0.15;
  if (vn >= 0) return;
  const moving = Math.abs(f.w) > 1,
    e = moving ? 0.1 : vn > -110 ? 0 : 0.3;
  b.vx -= (1 + e) * vn * nx;
  b.vy -= (1 + e) * vn * ny;
  const tx = -ny,
    ty = nx,
    vt = (b.vx - sx) * tx + (b.vy - sy) * ty,
    fr = !moving && vn > -110 ? 0.0025 : 0.03;
  b.vx -= tx * vt * fr;
  b.vy -= ty * vt * fr;
  if (moving && -vn > 200) ev('flipHit', f, b, -vn);
}
export function hitCircle(b, c, R, e) {
  // returns impact speed (>0) when the ball struck the circle
  const dx = b.x - c.x,
    dy = b.y - c.y,
    RR = b.r + R,
    d2 = dx * dx + dy * dy;
  if (d2 >= RR * RR) return 0;
  const d = Math.sqrt(d2) || 1e-5,
    nx = dx / d,
    ny = dy / d;
  b.x = c.x + nx * RR;
  b.y = c.y + ny * RR;
  const vn = b.vx * nx + b.vy * ny;
  if (vn >= 0) return 0.001;
  b.vx -= (1 + e) * vn * nx;
  b.vy -= (1 + e) * vn * ny;
  b._nx = nx;
  b._ny = ny;
  return -vn;
}
export function stepFlippers(h) {
  for (const f of T.flips) {
    const pw = G.flipPow || 1,
      dead = G.tilt > 0;
    const up = f.on && !dead,
      target = up ? f.up : f.rest,
      st = FEEL.stroke;
    let sp = up ? -21 * pw * FEEL.flipper : 13;
    if (up && st) {
      // The power stroke (see `stroke` in table/layout.js). The coil punches the bat to a share of its top speed at
      // once; from there its speed closes on the top speed, quickly at first and then less and less. Past the cut
      // the coil only holds, and the bat slows toward the stop. A bat already on its way up carries on from the
      // speed it has.
      const done = (f.rest - f.a) / (f.rest - f.up),
        want = sp * st.peak * (done < st.cut ? 1 : st.hold),
        was = Math.min(0, f.w, want * st.punch);
      sp = want + (was - want) * Math.exp(-h / st.rise);
    }
    let na = f.a + sp * h;
    if (sp < 0 && na < target) na = target;
    if (sp > 0 && na > target) na = target;
    f.w = (na - f.a) / h;
    f.a = na;
  }
}
export function stepBall(b, h) {
  if (b.st === 'rail') {
    const r = b.rail,
      p = railPos(r, b.rs, b);
    b.rv += GRAV * r.k * p.ty * h;
    b.rv -= b.rv * (r.drag === undefined ? FEEL.ramp.drag : r.drag) * h;
    if (r.drain && b.rv < 140) b.rv = 140; // a drain ramp never lets a ball roll back
    b.rs += b.rv * h;
    b.hgt = Math.min(1, b.rs / 80, (r.len - b.rs) / 80);
    if (b.rs >= r.len) {
      railPos(r, r.len, b);
      const v = clamp(b.rv, 200, r.exitV);
      b.vx = b.tx * v;
      b.vy = b.ty * v;
      b.st = 'live';
      b.hgt = 0;
      b.noMouth = 0.3;
      ev(r.drain ? 'chute' : 'ramp', r, b);
    } else if (b.rs <= 0) {
      railPos(r, 0, b);
      const v = Math.min(b.rv, -140);
      b.vx = b.tx * v;
      b.vy = b.ty * v;
      b.st = 'live';
      b.hgt = 0;
      b.noMouth = 0.5;
      ev('rampFail', r, b);
    } else railPos(r, b.rs, b);
    return;
  }
  if (b.st !== 'live') return;
  b.vy += GRAV * h;
  const s2 = b.vx * b.vx + b.vy * b.vy;
  if (s2 > VMAX * VMAX) {
    const k = VMAX / Math.sqrt(s2);
    b.vx *= k;
    b.vy *= k;
  }
  b.x += b.vx * h;
  b.y += b.vy * h;
  for (const f of T.flips) {
    if (b.y > f.y - 110 && b.y < f.y + 90 && Math.abs(b.x - f.x) < (f.L > 82 ? f.L + 28 : 110)) hitFlipper(b, f);
  }
  const row = T.grid[(b.y / CELL) | 0];
  if (row)
    for (let i = 0; i < row.length; i++) {
      const s = row[i];
      if (s.on) hitSeg(b, s);
    }
  for (const c of T.bumps) {
    if (Math.abs(b.y - c.y) < 60) {
      const imp = hitCircle(b, c, c.r, 0.3);
      if (imp > 0 && c.cool <= 0) {
        c.cool = 0.06;
        c.flash = 1;
        const k = c.kick * (imp > 40 ? b.kx : 0.6);
        b.vx += ((b.x - c.x) / (b.r + c.r)) * k;
        b.vy += ((b.y - c.y) / (b.r + c.r)) * k;
        ev('bump', c, b, imp);
      }
    }
  }
  if (b.tier < NM && G.run && G.run.party && G.run.party.length)
    for (const g of liveGuards(b.tier)) {
      const p = g.p,
        c = g.c;
      if (Math.abs(b.y - p.y) > 60) continue;
      const imp = hitCircle(b, p, p.r, 0.3);
      if (imp > 0 && c.cool <= 0) {
        const k = p.slot === 'center' ? 440 : 360;
        b.vx += ((b.x - p.x) / (b.r + p.r)) * k * 0.6;
        b.vy = -Math.abs(b.vy) * 0.5 - k * 0.8;
        guardHit(c, p, b, imp);
      }
    }
  collideActors(b);
  // the cabinet's own sides and the top of the table, as a last resort behind the wall segments
  const xl = OX[b.tier] + 20,
    xr = OX[b.tier] + 620;
  if (b.x < xl + b.r) {
    b.x = xl + b.r;
    if (b.vx < 0) b.vx *= -0.4;
  }
  if (b.x > xr - b.r) {
    b.x = xr - b.r;
    if (b.vx > 0) b.vx *= -0.4;
  }
  if (b.y < YTOP + b.r) {
    b.y = YTOP + b.r;
    if (b.vy < 0) b.vy *= -0.4;
  }
}
export function stepSensors(dt) {
  for (const s of T.sens) {
    if (s.cool > 0) s.cool -= dt;
    if (s.flash > 0) s.flash -= dt * 3;
    if (s.kind === 'spin' && s.rate > 0) {
      s.ang += s.rate * dt * TAU;
      s.acc += s.rate * dt;
      while (s.acc >= 1) {
        s.acc -= 1;
        ev('spin', s);
      }
      s.rate *= Math.pow(0.25, dt);
      if (s.rate < 0.6) s.rate = 0;
    }
  }
  for (const b of G.balls) {
    if (b.st !== 'live') continue;
    if (b.noMouth > 0) b.noMouth -= dt;
    else
      for (const m of T.mouths) {
        const dx = b.x - m.x,
          dy = b.y - m.y;
        if (dx * dx + dy * dy < m.r * m.r) {
          const v = b.vx * m.dx + b.vy * m.dy;
          if (v > 90 && T.rails[m.rail].closed) {
            b.vx = -b.vx * 0.55;
            b.vy = -b.vy * 0.55 + 90;
            A.s('clank');
            float(b.x, b.y - 26, TEXT.barred, '#cfd8e0', 12);
            burst(b.x, b.y, 6, '#cfd8e0', 200, 0.5);
            break;
          }
          if (v > 90) {
            b.st = 'rail';
            b.rail = T.rails[m.rail];
            b.rs = 0;
            b.rv = v;
            b.hgt = 0;
            ev('rampIn', b.rail, b);
            break;
          }
        }
      }
    if (b.st !== 'live') continue;
    if (b.noHole > 0) b.noHole -= dt;
    else
      for (const id in T.holes) {
        const h = T.holes[id],
          dx = b.x - h.x,
          dy = b.y - h.y;
        if (dx * dx + dy * dy < h.r * h.r) {
          b.st = 'held';
          b.held = {id, t: 0};
          b.x = h.x;
          b.y = h.y;
          b.vx = b.vy = 0;
          h.glow = 1;
          ev('hole', h, b);
          break;
        }
      }
    if (b.st !== 'live') continue;
    for (const s of T.sens) {
      const dx = b.x - s.x,
        dy = b.y - s.y;
      if (dx * dx + dy * dy < (s.r + 4) * (s.r + 4)) {
        if (s.kind === 'spin') {
          if (s.cool <= 0) {
            s.cool = 0.25;
            s.acc = s.acc || 0;
            s.rate = Math.min(26, Math.hypot(b.vx, b.vy) / 60);
            s.dir = b.vy < 0 ? 1 : -1;
          }
        } else if (s.cool <= 0) {
          s.cool = 0.6;
          s.flash = 1;
          ev(s.kind, s, b);
        } else s.cool = Math.max(s.cool, 0.25);
      }
    }
  }
}
export function collideBalls() {
  const B = G.balls;
  for (let i = 0; i < B.length; i++)
    for (let j = i + 1; j < B.length; j++) {
      const a = B[i],
        b = B[j];
      if (a.st !== 'live' || b.st !== 'live') continue;
      const dx = b.x - a.x,
        dy = b.y - a.y,
        d2 = dx * dx + dy * dy,
        R = a.r + b.r;
      if (d2 >= R * R || d2 < 1e-6) continue;
      const d = Math.sqrt(d2),
        nx = dx / d,
        ny = dy / d,
        p = (R - d) / 2;
      a.x -= nx * p;
      a.y -= ny * p;
      b.x += nx * p;
      b.y += ny * p;
      const rv = (b.vx - a.vx) * nx + (b.vy - a.vy) * ny;
      if (rv < 0) {
        const j2 = -rv * 0.95;
        a.vx -= nx * j2;
        a.vy -= ny * j2;
        b.vx += nx * j2;
        b.vy += ny * j2;
      }
    }
}
export function physics(dt) {
  // flippers in mid-swing get four times the resolution, which is what makes the shot fan smooth
  let fine = false;
  for (const f of T.flips) {
    if (f.on && G.tilt <= 0 ? f.a > f.up : f.a < f.rest) {
      fine = true;
      break;
    }
  }
  const n = Math.max(1, Math.round((dt / SUB) * (fine ? 4 : 1))),
    h = dt / n;
  for (let k = 0; k < n; k++) {
    stepFlippers(h);
    for (const b of G.balls) stepBall(b, h);
    if (G.balls.length > 1) collideBalls();
  }
  for (const s of T.segs) {
    if (s.flash > 0) s.flash -= dt * 4;
    if (s.cool > 0) s.cool -= dt;
  }
  for (const c of T.bumps) {
    if (c.flash > 0) c.flash -= dt * 5;
    if (c.cool > 0) c.cool -= dt;
  }
  for (const id in T.holes) {
    const h = T.holes[id];
    if (h.glow > 0) h.glow -= dt * 1.5;
  }
  stepSensors(dt);
}
