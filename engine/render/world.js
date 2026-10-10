import {clamp, lerp} from '../core/util.js';
import {
  ABOVE,
  BELOW,
  BT,
  FIELD_H,
  FY,
  GRID,
  GT,
  H,
  NM,
  NW,
  OX,
  TY,
  W,
  WB,
  WSTEP,
  WT0,
  WY,
  fieldAt,
  fieldNear
} from '../table/layout.js';

/* ================= WHERE THINGS STAND IN THE WORLD =================
   World units are table units. X = table x - 320, Z = table y (towards the player), Y is up.
   Physics stays on the table plane, as on a real machine; height comes from here. Each field is a terrace: 75 above
   the row below it unless the layout gives the field a `height`. Where one field is joined under another the chute
   between them is a slope. The Grave lies under the home field, and each wing is a sunken court beside the main
   table (its `court` in the layout). setWorld() fills these in when a table loads. */
export const WALL_H = 26,
  BLOCK_H = 38,
  RAMP_H = 46,
  UP = new THREE.Vector3(0, 1, 0);
export let E = [],
  WOXS = [],
  WOZS = [],
  WTOP = 0,
  SLOPES = [],
  PITS = [];
export function setWorld(L) {
  E = [];
  for (let i = 0; i < NM; i++) {
    const h = L.fields[i].height;
    E.push(h === undefined ? (75 * (TY[BT] - TY[i])) / FIELD_H : h);
  }
  E.push(E[BT] - 260);
  WOXS = [];
  WOZS = [];
  PITS = [];
  (L.wings || []).forEach((w, k) => {
    const c = w.court;
    E.push(c.e);
    WOXS.push(c.x);
    WOZS.push(c.z - WB[k]);
    PITS.push({x0: c.side < 0 ? -1180 : 710, x1: c.side < 0 ? -70 : 1820, z0: c.z0, z1: c.z1, sd: c.side});
  });
  WTOP = WY - 90;
  SLOPES = [];
  for (let i = 0; i < NM; i++) if (BELOW[i] >= 0) SLOPES.push([FY[i] + 18, FY[i] + 138]);
  SLOPES.push([H + 36, H + 96]);
}
export const sstep = (a, b, v) => {
  const t = clamp((v - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
};
export const wingIdx = y => (NW && y > WTOP ? Math.min(NW - 1, Math.floor((y - WTOP) / WSTEP)) : -1),
  inWing = y => NW > 0 && y > WTOP,
  ZX = y => (NW && y > WTOP ? WOXS[wingIdx(y)] : 0),
  ZZ = y => (NW && y > WTOP ? WOZS[wingIdx(y)] : 0);
export function zshift(o) {
  const i = wingIdx(o.position.z);
  if (i >= 0) {
    o.position.x += WOXS[i];
    o.position.z += WOZS[i];
  }
  return o;
} // table space to world, for anything standing in a wing
// the height of the ground of field i (and of the fields joined above and below it) at depth y: a terrace, and
// a slope down the chute where a field is joined below
export function elevIn(i, y) {
  if (i >= NM) return E[i];
  while (BELOW[i] >= 0 && y >= TY[BELOW[i]]) i = BELOW[i];
  while (ABOVE[i] >= 0 && y < TY[i]) i = ABOVE[i];
  const j = BELOW[i];
  if (j >= 0) return lerp(E[i], E[j], sstep(FY[i] + 18, FY[i] + 138, y));
  if (i === BT) return lerp(E[BT], E[GT], sstep(H + 36, H + 96, y));
  return E[i];
}
/* Building something that belongs to one field but stands outside its rectangle (its frame, the block over its arch)?
   Say whose it is with elevOf(i), build, then elevOf(-1). Until then a height is looked up by position. */
let OWNER = -1;
export function elevOf(i) {
  OWNER = i;
}
// the height of the ground at a point of the table. Pass x as well as y: a stack does not need it, a grid does.
export function elev(y, x) {
  if (NW && y > WTOP) return E[WT0 + wingIdx(y)];
  if (GRID) {
    if (OWNER >= 0) return elevIn(OWNER, y);
    if (x === undefined) throw new Error('elev(y, x): this table places its fields with `at`, so pass x as well');
    const i = fieldAt(x, y);
    return elevIn(i >= 0 ? i : y >= TY[BT] + FIELD_H ? BT : fieldNear(x, y), y);
  }
  // a stack: each field is a terrace; the chutes between them are the slopes
  for (let i = 0; i < NM - 1; i++)
    if (y < FY[i] + 150) return lerp(E[i], E[i + 1], sstep(SLOPES[i][0], SLOPES[i][1], y));
  return lerp(E[BT], E[GT], sstep(SLOPES[BT][0], SLOPES[BT][1], y));
}
export const inSlope = (a, b) => {
  const lo = Math.min(a, b),
    hi = Math.max(a, b);
  return SLOPES.some(s => hi > s[0] - 2 && lo < s[1] + 2);
};
// table-space footprints of the cuts in the ground around each wing (x is table x)
export function pitDist(x, y) {
  let d = 1e9;
  for (const p of PITS) d = Math.min(d, Math.max(p.x0 - x, x - p.x1, p.z0 - y, y - p.z1));
  return d;
}
export function groundY(x, y) {
  if (GRID) {
    // the land outside a table of several columns: level with the nearest field, rising away from the table
    const i = y >= TY[BT] + FIELD_H ? BT : fieldNear(x, y),
      d = Math.max(0, Math.max(OX[i] - x, x - (OX[i] + W)) - 110);
    return (
      elevIn(i, clamp(y, TY[i], TY[i] + FIELD_H + (i === BT ? 20 : 0))) -
      38 +
      sstep(0, 700, d) *
        sstep(0, 220, pitDist(x, y)) *
        (60 + 90 * Math.sin(x * 0.004 + y * 0.0021) + 50 * Math.sin(y * 0.0057 + x * 0.003))
    );
  }
  const d = Math.max(0, Math.abs(x - 320) - 430);
  return (
    elev(clamp(y, TY[0], H)) -
    38 +
    sstep(0, 700, d) *
      sstep(0, 220, pitDist(x, y)) *
      (60 + 90 * Math.sin(x * 0.004 + y * 0.0021) + 50 * Math.sin(y * 0.0057 + x * 0.003))
  );
}
