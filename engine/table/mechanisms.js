// Optional moving parts. No objects or collisions are created for layouts without them.
import {T} from '../core/state.js';
import {OX, TY, FIELD_INDEX} from './layout.js';

export const MECHANISM_DEFAULTS = {
  gate: {speed: 2, width: 3, bounce: 0.45, height: 52, color: '#d5b66e'},
  shutter: {speed: 2, width: 4, bounce: 0.45, height: 42, lift: 54, clearance: 65, color: '#69515a'},
  captive: {
    radius: 10,
    travel: 44,
    spring: 38,
    damping: 4,
    mass: 1.4,
    bounce: 0.8,
    strike: 24,
    cooldown: 0.3,
    color: '#d9e4ec'
  }
};
export const RAIL_TRANSFER_DEFAULTS = {feedSpeed: 700};
export function buildMechanisms(list) {
  delete T.mechanisms;
  if (!list?.length) return;
  T.mechanisms = {};
  for (const p of list) {
    const defaults = MECHANISM_DEFAULTS[p.kind];
    if (!p.id || !defaults || T.mechanisms[p.id]) throw Error('layout: invalid or duplicate mechanism ' + p.id);
    const tier = FIELD_INDEX[p.field];
    if (tier === undefined) throw Error('layout: unknown mechanism field ' + p.field);
    const m = Object.assign({}, defaults, p, {tier, x: p.x + OX[tier], y: p.y + TY[tier]});
    if (![m.x, m.y].every(Number.isFinite)) throw Error('layout: mechanism position must be finite');
    if (m.kind === 'captive') {
      if (![m.radius, m.travel, m.mass, m.spring].every(v => Number.isFinite(v) && v > 0))
        throw Error('layout: captive radius, travel, mass and spring must be positive');
      m.angle ??= -Math.PI / 2;
      m.dx = Math.cos(m.angle);
      m.dy = Math.sin(m.angle);
    } else {
      if (
        !(m.speed > 0) ||
        !p.leaves?.length ||
        p.leaves.some(l => !(l.length > 0) || !Number.isFinite(l.closed) || !Number.isFinite(l.open))
      )
        throw Error('layout: moving barrier needs positive speed/length and finite leaf angles');
      m.leaves = p.leaves.map(l => ({...l, a: l.closed, w: 0}));
    }
    T.mechanisms[p.id] = m;
  }
  resetMechanisms();
}
export function resetMechanisms() {
  for (const m of Object.values(T.mechanisms || {})) {
    m.open = false;
    m.position = m.s = m.v = m.cool = m.flash = 0;
    for (const l of m.leaves || []) {
      l.a = l.closed;
      l.w = 0;
    }
  }
}

// A scoop, track junction or rule may send a ball onto a visible track.
export function enterRail(b, id, speed) {
  const r = T.rails[id];
  if (!r) throw Error('Unknown rail ' + id);
  b.st = 'rail';
  b.rail = r;
  b.rs = 0;
  b.rv = speed ?? r.feedSpeed ?? RAIL_TRANSFER_DEFAULTS.feedSpeed;
  b.railHold = 0;
  b.railHeld = false;
  b.hgt = 0;
  b.held = null;
  b.x = r.x[0];
  b.y = r.y[0];
}
