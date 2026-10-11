import {G, T} from '../core/state.js';
import {clamp} from '../core/util.js';

export function stepMechanisms(dt) {
  for (const m of Object.values(T.mechanisms)) {
    m.cool = Math.max(0, m.cool - dt);
    m.flash = Math.max(0, m.flash - dt * 3);
    if (m.kind === 'captive') {
      m.v += (-m.spring * m.s - m.damping * m.v) * dt;
      m.s = clamp(m.s + m.v * dt, 0, m.travel);
      if ((m.s === 0 && m.v < 0) || (m.s === m.travel && m.v > 0)) m.v *= -0.25;
      continue;
    }
    let target = m.open ? 1 : 0;
    // Don't close a shutter on a ball sitting in its throat.
    if (
      !target &&
      m.position > 0.6 &&
      m.kind === 'shutter' &&
      G.balls.some(
        b =>
          (b.st === 'held' && m.scoop && b.held?.id === m.scoop) ||
          (b.st === 'live' &&
            b.y > m.y - m.clearance &&
            b.y < m.y + b.r + m.width + 8 &&
            b.x > m.x - b.r &&
            b.x < m.x + m.leaves[0].length + b.r)
      )
    )
      target = 1;
    const old = m.position;
    m.position += clamp(target - old, -m.speed * dt, m.speed * dt);
    for (const l of m.leaves) {
      const a = l.closed + (l.open - l.closed) * m.position;
      l.w = (a - l.a) / dt;
      l.a = a;
    }
  }
}
export function collideMechanisms(b, hitSeg, emit) {
  for (const m of Object.values(T.mechanisms)) {
    if (m.tier !== b.tier) continue;
    if (m.kind === 'captive') {
      const x = m.x + m.dx * m.s,
        y = m.y + m.dy * m.s;
      const dx = b.x - x,
        dy = b.y - y,
        d = Math.hypot(dx, dy),
        R = b.r + m.radius;
      if (d >= R || d < 0.0001) continue;
      const nx = dx / d,
        ny = dy / d,
        axis = nx * m.dx + ny * m.dy;
      b.x += nx * (R - d);
      b.y += ny * (R - d);
      const relative = b.vx * nx + b.vy * ny - m.v * axis;
      if (relative >= 0) continue;
      const impulse = (-(1 + m.bounce) * relative) / (1 + (axis * axis) / m.mass);
      b.vx += impulse * nx;
      b.vy += impulse * ny;
      m.v -= (impulse * axis) / m.mass;
      if (-relative > m.strike && m.cool <= 0) {
        m.cool = m.cooldown;
        m.flash = 1;
        emit('captive', m, b, -relative);
      }
      continue;
    }
    if (m.kind === 'shutter' && m.position * m.lift > b.r * 2 + m.width) continue;
    for (const l of m.leaves) {
      const x = m.x + (l.x || 0),
        y = m.y + (l.y || 0);
      const dx = Math.cos(l.a) * l.length,
        dy = Math.sin(l.a) * l.length;
      const t = clamp(((b.x - x) * dx + (b.y - y) * dy) / (l.length * l.length), 0, 1);
      const vx = -dy * t * l.w,
        vy = dx * t * l.w;
      b.vx -= vx;
      b.vy -= vy;
      hitSeg(b, {x1: x, y1: y, dx, dy, len: l.length, l2: l.length * l.length, w: m.width, e: m.bounce, kind: 'wall'});
      b.vx += vx;
      b.vy += vy;
    }
  }
}
