/* ================= STANDARD PARTS =================
   What a field is built from unless its layout says otherwise, so every table plays like the same manufacturer made
   it: the arch at the top, the two orbits, and the floor (slingshots, flippers, inlanes, outlanes, and the way out
   at the bottom). A field can switch each of these off with `standard: {arch, orbits, slings, lanes, flippers}` and
   place its own pieces instead (see docs/TABLE_FORMAT.md). What it cannot switch off is the shelf the flippers
   stand on and the way out below it: that is the cabinet.
   Changing a number here changes every table. */
import {T} from '../core/state.js';
import {PI, TAU} from '../core/util.js';
import {arcPts, block, gpoly, gseg, poly, seg, sensor} from './geometry.js';
import {ABOVE, BELOW, BT, ST, CX, FLIPPER, OX, TY, XR} from './layout.js';

// which standard parts a field keeps. Everything is on unless the layout turns it off; no arch means no orbits.
export function standardOf(f) {
  const s = Object.assign({arch: true, orbits: true, slings: true, lanes: true, flippers: true}, f.standard || {});
  if (!s.arch) s.orbits = false;
  return s;
}
// a flipper: where its pivot is, which button works it (side -1 left, 1 right), how long it is
export function flipper(x, y, side, tier, o) {
  o = o || {};
  const L = typeof o.size === 'number' ? o.size : FLIPPER[o.size || 'standard'];
  if (!L) throw new Error('layout: unknown flipper size ' + o.size + ' (mini, standard or long)');
  const rest = o.rest === undefined ? 0.5 : o.rest,
    up = o.up === undefined ? -0.44 : o.up;
  if (side !== -1 && side !== 1) throw new Error('layout: a flipper is side -1 (left button) or 1 (right button)');
  if (!(up < rest)) throw new Error('layout: a flipper swings from `rest` up to `up`, and up is the smaller angle');
  const f = {x, y, side, dir: o.dir || -side, tier, L, rest, up, a: rest, w: 0, on: false};
  T.flips.push(f);
  return f;
}
// a slingshot: the triangle A (top), B (back corner), C (tip). The face from A to C kicks, away from B.
export function sling(A, B, C, tier, side) {
  poly([A, B, C], {w: 2}, 'none');
  const s = seg(A[0], A[1], C[0], C[1], {kind: 'sling', e: 0.25, w: 2, tier});
  let kx = -s.dy / s.len,
    ky = s.dx / s.len;
  if (side !== undefined ? kx * side > 0 : kx * ((A[0] + C[0]) / 2 - B[0]) + ky * ((A[1] + C[1]) / 2 - B[1]) < 0) {
    kx = -kx;
    ky = -ky;
  }
  s.kx = kx;
  s.ky = ky;
  T.slings.push({A, B, C, s, tier, side: side || (kx > 0 ? -1 : 1)});
  return s;
}

/* The top of a field. With the standard arch: a solid half circle if nothing is joined above, or one with three
   one-way gates the ball drops in through. Without it (only where nothing is joined above): a flat lid and square
   corners, for the layout to shape with its own walls. */
export function buildFrame(i, S) {
  const ox = OX[i],
    y = TY[i],
    yA = y + 300,
    aF = Math.acos(258 / 300),
    aG = Math.asin(36 / 300);
  if (!S.arch) {
    if (ABOVE[i] >= 0)
      throw new Error('layout: a field joined under another keeps its arch (the arch is how the ball arrives)');
    poly(
      [
        [ox + 20, yA],
        [ox + 20, y + 20],
        [ox + 620, y + 20],
        [ox + 620, yA]
      ],
      {},
      'none'
    );
    return;
  }
  const A = (a0, a1, n) => arcPts(320 + ox, yA, 300, a0, a1, n);
  if (ABOVE[i] < 0) {
    poly(A(PI, TAU, 60), {}, 'none');
    return;
  }
  gpoly(A(PI, PI + aF, 7), 320 + ox, yA);
  poly(A(PI + aF, 1.5 * PI - aG, 24), {}, 'none');
  gpoly(A(1.5 * PI - aG, 1.5 * PI + aG, 4), 320 + ox, yA);
  poly(A(1.5 * PI + aG, TAU - aF, 24), {}, 'none');
  gpoly(A(TAU - aF, TAU, 7), 320 + ox, yA);
}
/* The floor of a field: on each side the lane guide, the slingshot, the flap at the head of the outlane, the
   flipper and the two lane sensors; then the shelf under the flippers and the way out.
   The way out is one of three: a chute into the arch of the field joined below; the home field's apron, where a
   ball is lost; or, for a field with nothing below it, a short throat that hands the ball to its drain ramp. */
export function buildFloor(i, S) {
  const ox = OX[i],
    xL = ox + 20,
    xR = XR[i],
    cx = CX[i],
    yF = TY[i] + 900,
    nb = BELOW[i],
    nextA = nb >= 0 ? TY[nb] + 300 : 0;
  for (const sd of [-1, 1]) {
    const X = d => (sd < 0 ? xL + d : xR - d);
    const G0 = [X(42), yF - 170],
      G1 = [X(42), yF - 70],
      G2 = [cx + sd * 103, yF - 9];
    poly(S.lanes ? [G0, G1, G2] : [G1, G2], {w: 3});
    if (S.slings) {
      const gl = Math.hypot(G2[0] - G1[0], G2[1] - G1[1]),
        ux = (G2[0] - G1[0]) / gl,
        uy = (G2[1] - G1[1]) / gl;
      let nx = -uy,
        ny = ux;
      if (ny > 0) {
        nx = -nx;
        ny = -ny;
      }
      const px = G1[0] + nx * 37,
        py = G1[1] + ny * 37,
        lineY = x => py + ((x - px) / ux) * uy;
      const A = [X(80), yF - 190],
        B = [X(80), lineY(X(80))],
        C = [cx + sd * 140, lineY(cx + sd * 140)];
      sling(A, B, C, i, sd);
    }
    if (S.lanes) {
      const D0 = [X(0), yF - 262],
        D1 = [X(30), yF - 205];
      gseg(D0, D1, D0[0] - sd * 100, D0[1] - 100);
      T.wallPaths.push({pts: [D0, D1], style: 'flap'});
    }
    if (S.flippers) flipper(cx + sd * 100, yF, sd, i, {size: S.flippers === true ? 'standard' : S.flippers});
    if (S.lanes) {
      sensor(X(21), yF - 118, 14, {kind: 'outlane', side: sd, tier: i});
      sensor(X(61), yF - 118, 14, {kind: 'inlane', side: sd, tier: i});
    }
    if (nb >= 0) {
      // An interior launch field is narrower on the right. Flare its falling-ball
      // channel into the next field's orbit instead of ending against its arch.
      const exitX = X(42) + (i === ST && i !== BT && sd > 0 ? XR[nb] - XR[i] : 0);
      poly([G1, [exitX, nextA - 153]], {w: 2});
      poly(
        [
          [cx + sd * 100, yF + 13],
          [320 + ox + sd * 36, yF + 141]
        ],
        {},
        'none'
      );
      T.blocks.push({
        pts: [G1, G2, [cx + sd * 100, yF + 13], [320 + ox + sd * 36, yF + 141], [exitX, nextA - 153]],
        dead: true,
        tier: i
      });
    } else {
      // the home field's apron runs 150 below the flippers; a drain throat stops at 105, inside the field's own cell
      const yE = yF + (i === BT ? 150 : THROAT);
      poly([G1, [X(42), yE]], {w: 2});
      poly(
        [
          [cx + sd * 100, yF + 13],
          [cx + sd * 40, yE]
        ],
        {},
        'none'
      );
      T.blocks.push({
        pts: [G1, G2, [cx + sd * 100, yF + 13], [cx + sd * 40, yE], [X(42), yE]],
        dead: true,
        tier: i,
        apron: true
      });
    }
  }
  if (nb >= 0) {
    T.chans.push([
      [ox + 220, yF + 13],
      [ox + 420, yF + 13],
      [ox + 356, yF + 143],
      [ox + 284, yF + 143]
    ]);
    T.chans.push([
      [ox + 20, yF - 70],
      [ox + 62, yF - 70],
      [ox + 62, nextA - 153],
      [ox + 20, nextA]
    ]);
    T.chans.push([
      [ox + 620, yF - 70],
      [i === ST && i !== BT ? XR[i] - 42 : ox + 578, yF - 70],
      [ox + 578, nextA - 153],
      [ox + 620, nextA]
    ]);
  }
}
// how far below the flipper line a drain throat ends, and where the ball is taken onto the drain ramp
export const THROAT = 105,
  DRAIN_Y = 1010;
export function buildOrbits(i) {
  const ox = OX[i],
    y = TY[i],
    yA = y + 300,
    rr = 254 - (ox + 620 - XR[i]);
  poly(
    [
      [ox + 66, y + 500],
      [ox + 66, yA]
    ].concat(arcPts(320 + ox, yA, 254, PI, PI + 0.7, 8).slice(1)),
    {w: 3}
  );
  poly(
    [
      [320 + ox + rr, y + 500],
      [320 + ox + rr, yA]
    ].concat(arcPts(320 + ox, yA, rr, TAU, TAU - 0.7, 8).slice(1)),
    {w: 3}
  );
  sensor(ox + 43, y + 405, 21, {kind: 'orbit', side: -1, tier: i});
  sensor(ox + 597 - (ox + 620 - XR[i]), y + 405, 21, {kind: 'orbit', side: 1, tier: i});
}
export function centerScoop(cx, y, w) {
  w = w || 20;
  poly(
    [
      [cx - w, 466],
      [cx - w - 2, 438],
      [cx - 13, 420],
      [cx, 415],
      [cx + 13, 420],
      [cx + w + 2, 438],
      [cx + w, 466]
    ].map(p => [p[0], p[1] + y]),
    {w: 3},
    'scoop'
  );
}
// the block between a side ramp mouth and the orbit guide, with a scoop notch facing down. ox is the field's left edge.
export function sideScoopBlock(m, sx, y, xg, topY, name, tier, ox) {
  ox = ox || 0;
  const c = ox + (sx < 0 ? 112 : 528),
    o = p => [p[0], p[1] + y];
  const notch = [
    [c + 20, 508],
    [c + 20, 482],
    [c + 10, 470],
    [c - 10, 470],
    [c - 20, 482],
    [c - 20, 508]
  ].map(o);
  if (sx < 0) block([o([ox + xg, topY]), m.lt, m.lb].concat(notch, [o([ox + xg, 505])]), {name, tier});
  else block([m.rt, o([ox + xg, topY]), o([ox + xg, 505])].concat(notch, [m.rb]), {name, tier});
  return c;
}
