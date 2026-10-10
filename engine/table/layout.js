/* ================= THE LEVEL MODEL =================
   A table is a set of fields. Every field has the same footprint (640 wide, 1040 deep): that is the cabinet, and it
   does not change. What changes is where the fields stand and what is inside them.

   Where fields stand. Each field sits in a cell of a grid: `at: [column, row]` in the layout. Rows run down the
   table, 1040 apart; columns are 690 apart and may be halves or negative (a diamond is [0,0], [-0.5,1], [0.5,1],
   [0,2]). A layout that gives no `at` at all is a plain stack: column 0, one row per field, top first. Two fields
   in the same column on consecutive rows are joined: the upper one's drain falls into the lower one's arch. A
   field with nothing joined below it is either the HOME field (the last one listed: it has the plunger, the real
   drain, and the Grave under it; it stands in column 0 on the lowest row) or it drains into a guided ramp to a
   field the layout names (a ramp with `drain`).

   Tiers. A "tier" is an index:
     0 .. NM-1   the fields, in the order the layout lists them   (BT = NM-1 is the home field)
     GT = NM     the Grave                                        (the slot is kept on a table without one)
     WT0 ..      the wings, in the order the table lists them
   Physics runs on one plane. A field is the rectangle OX[i]..OX[i]+640 by TY[i]..TY[i]+1040 of it; the Grave and
   the wings are bands of y under the home field. These bindings are filled in by setLayout() when a table loads;
   nothing may read them while a module is still being evaluated. */
export const W = 640,
  WSTEP = 900,
  WLEN = 640,
  BR = 11,
  CELL = 80,
  FIELD_H = 1040,
  FIELD_Y0 = 40,
  COL_W = 690;
/* ================= FEEL =================
   How the ball moves. One set of numbers, shared by every table so they feel related; a table may pick another preset
   or change single numbers with `feel` in its table.js:
       feel: 'fast'                              a preset by name
       feel: {preset: 'standard', bounce: 0.5}   a preset with numbers changed
       feel: {speed: 1.1}                        the same table, 10% quicker
   `speed` is the safe knob: it speeds up everything the ball does together (gravity by its square, the rest in
   step), so every shot still goes where it went, only sooner. The other numbers change where shots go: after
   changing one, run the reach test. */
export const FEELS = {
  standard: {
    speed: 1,
    gravity: 1150, // units/s2 down the table
    maxSpeed: 2300, // nothing moves faster
    bounce: 0.45, // what a plain wall gives back
    flipper: 1, // flipper strength (1 = 21 radians a second on the way up)
    sling: 1, // slingshot kick (1 = 420 to 580)
    bumper: 470, // pop-bumper kick
    plunge: [1330, 1950], // launch speed, from a tap to a full pull
    ramp: {k: 0.2, drag: 0.1, exitV: 520} // what a ramp has unless its layout says otherwise
  },
  fast: {speed: 1.15},
  slow: {speed: 0.88},
  lively: {bounce: 0.52, sling: 1.12, bumper: 520}
};
export let FEEL = FEELS.standard,
  GRAV = 1150,
  VMAX = 2300;
export function setFeel(f) {
  const o = typeof f === 'string' ? {preset: f} : f || {},
    pre = FEELS[o.preset || 'standard'];
  if (!pre)
    throw new Error('table: there is no feel preset "' + o.preset + '" (' + Object.keys(FEELS).join(', ') + ')');
  const m = Object.assign({}, FEELS.standard, pre, o);
  m.ramp = Object.assign({}, FEELS.standard.ramp, pre.ramp || {}, o.ramp || {});
  const s = m.speed;
  // `speed` carries everything along with it
  FEEL = {
    speed: s,
    gravity: m.gravity * s * s,
    maxSpeed: m.maxSpeed * s,
    bounce: m.bounce,
    flipper: m.flipper * s,
    sling: m.sling * s,
    bumper: m.bumper * s,
    plunge: [m.plunge[0] * s, m.plunge[1] * s],
    ramp: {k: m.ramp.k, drag: m.ramp.drag, exitV: m.ramp.exitV * s}
  };
  GRAV = FEEL.gravity;
  VMAX = FEEL.maxSpeed;
}
// the flipper lengths the manufacturer makes. Standard is what every field gets unless its layout says otherwise.
export const FLIPPER = {mini: 58, standard: 82, long: 92};
export let NM = 0,
  BT = 0,
  GT = 0,
  WT0 = 0,
  NW = 0,
  NT = 0,
  H = 0,
  GY = 0,
  HW = 0,
  WY = 0,
  YTOP = 0, // the top of the highest field
  GRID = false; // true when the layout places its fields with `at`
export let TY = [], // each tier's top
  FY = [], // each tier's flipper line
  OX = [], // each tier's left edge (0 for a stack, the Grave and the wings)
  WB = [],
  CX = [], // the centre line between each tier's main flippers
  XR = [], // each field's right wall
  ABOVE = [], // the field joined above each field, or -1
  BELOW = [], // the field joined below each field, or -1
  CHAINS = [], // each run of joined fields, top first
  TIER_NAME = [],
  LEVEL_NAMES = {},
  FIELD_INDEX = {}; // field id -> index
export function setLayout(L) {
  NM = L.fields.length;
  BT = NM - 1;
  GT = NM;
  WT0 = NM + 1;
  NW = (L.wings || []).length;
  NT = NM + 1 + NW;
  TY = [];
  FY = [];
  OX = [];
  WB = [];
  CX = [];
  XR = [];
  ABOVE = [];
  BELOW = [];
  CHAINS = [];
  TIER_NAME = [];
  LEVEL_NAMES = {};
  FIELD_INDEX = {};
  GRID = L.fields.some(f => f.at);
  const col = [],
    row = [];
  for (let i = 0; i < NM; i++) {
    const f = L.fields[i];
    if (GRID && !f.at) throw new Error('layout: field ' + f.id + ' has no `at`; give every field one, or none');
    const at = GRID ? f.at : [0, i];
    if (at[1] % 1 || (at[0] * 2) % 1)
      throw new Error(
        'layout: field ' + f.id + ': `at` is [column, row]; rows are whole numbers, columns whole or half'
      );
    col.push(at[0]);
    row.push(at[1]);
    OX.push(at[0] * COL_W);
    TY.push(FIELD_Y0 + FIELD_H * at[1]);
    FY.push(TY[i] + 900);
    XR.push(OX[i] + (f.shooter ? 586 : 620));
    CX.push(OX[i] + (f.shooter ? 303 : 320));
    TIER_NAME.push(f.name);
    LEVEL_NAMES[i] = f.short || f.name;
    FIELD_INDEX[f.id] = i;
    if (f.shooter && i !== BT) throw new Error('layout: only the last field listed (the home field) has the shooter');
  }
  for (let i = 0; i < NM; i++) {
    ABOVE.push(col.findIndex((c, j) => c === col[i] && row[j] === row[i] - 1));
    BELOW.push(col.findIndex((c, j) => c === col[i] && row[j] === row[i] + 1));
    for (let j = i + 1; j < NM; j++)
      if (row[i] === row[j] && Math.abs(col[i] - col[j]) < 1)
        throw new Error('layout: fields ' + L.fields[i].id + ' and ' + L.fields[j].id + ' overlap');
  }
  if (GRID && (col[BT] !== 0 || row.some(r => r > row[BT])))
    throw new Error('layout: the home field (the last one listed) must stand in column 0 on the lowest row');
  for (let i = 0; i < NM; i++)
    if (ABOVE[i] < 0) {
      const c = [i];
      while (BELOW[c[c.length - 1]] >= 0) c.push(BELOW[c[c.length - 1]]);
      CHAINS.push(c);
    }
  YTOP = Math.min(...TY);
  H = TY[BT] + 1060;
  GY = H + 90;
  HW = GY + 740;
  WY = HW + 190;
  TY.push(GY);
  FY.push(GY + 650);
  OX.push(0);
  CX.push(320);
  XR.push(620);
  const gv = L.grave || {name: ''}; // the room under the home field, if the table has one
  TIER_NAME.push(gv.name);
  LEVEL_NAMES[GT] = gv.short || gv.name;
  for (let k = 0; k < NW; k++) {
    const w = L.wings[k];
    WB.push(WY + k * WSTEP);
    TY.push(WB[k]);
    FY.push(WB[k] + 570);
    OX.push(0);
    CX.push(320);
    XR.push(620);
    TIER_NAME.push(w.name);
    LEVEL_NAMES[WT0 + k] = w.short || w.name;
  }
}
// a stack: a tier is a band of y
const bandOf = y => {
  for (let i = 1; i < NM; i++) if (y < TY[i]) return i - 1;
  if (y < GY - 60) return BT;
  if (y < WY - 100 || !NW) return GT;
  return WT0 + Math.min(NW - 1, Math.floor((y - (WY - 100)) / WSTEP));
};
// the field whose rectangle holds a point of the plane, or -1
export const fieldAt = (x, y) => {
  for (let i = 0; i < NM; i++) if (x >= OX[i] && x < OX[i] + W && y >= TY[i] && y < TY[i] + FIELD_H) return i;
  return -1;
};
// the field nearest a point that is in none (a ball on a ramp between fields, a point on the rim)
export const fieldNear = (x, y) => {
  let best = 0,
    bd = 1e18;
  for (let i = 0; i < NM; i++) {
    const dx = Math.max(OX[i] - x, 0, x - (OX[i] + W)),
      dy = Math.max(TY[i] - y, 0, y - (TY[i] + FIELD_H)),
      d = dx * dx + dy * dy;
    if (d < bd) {
      bd = d;
      best = i;
    }
  }
  return best;
};
// which tier a point of the plane is in. Pass x as well as y: a stack does not need it, a grid does.
export const tierOf = (y, x) => {
  if (!GRID || x === undefined) return bandOf(y);
  const i = fieldAt(x, y);
  if (i >= 0) return i;
  if (y >= GY - 60) return bandOf(y); // the Grave and the wings lie under the home field
  return fieldNear(x, y);
};
// true where a field stands in the row above and overlaps this one's width (so its arch has no room for a cap)
export const roofed = i => {
  for (let j = 0; j < NM; j++) if (TY[j] === TY[i] - FIELD_H && Math.abs(OX[j] - OX[i]) < COL_W) return true;
  return false;
};
export const isField = t => t < NM,
  isWing = t => t > GT;
