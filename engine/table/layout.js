/* ================= THE LEVEL MODEL =================
   Every table is a stack of fields, top to bottom, each 640 wide and 1040 apart. Under the bottom field lies the
   Grave; past it in table space come the wings (side rooms). A "tier" is an index into that list:
     0 .. NM-1   the fields, top first      (BT = NM-1 is the bottom field: it has the plunger and the real drain)
     GT = NM     the Grave                   (every table has one)
     WT0 ..      the wings, in the order the table lists them
   Physics runs on one plane, so a tier is just a band of y. These bindings are filled in by setLayout() when a table
   loads; nothing may read them while a module is still being evaluated. */
export const W = 640,
  WSTEP = 900,
  WLEN = 640,
  BR = 11,
  CELL = 80,
  GRAV = 1150,
  VMAX = 2300,
  FIELD_H = 1040,
  FIELD_Y0 = 40;
export let NM = 0,
  BT = 0,
  GT = 0,
  WT0 = 0,
  NW = 0,
  NT = 0,
  H = 0,
  GY = 0,
  HW = 0,
  WY = 0;
export let TY = [],
  FY = [],
  WB = [],
  CX = [],
  XR = [],
  TIER_NAME = [],
  LEVEL_NAMES = {};
export function setLayout(L) {
  NM = L.fields.length;
  BT = NM - 1;
  GT = NM;
  WT0 = NM + 1;
  NW = (L.wings || []).length;
  NT = NM + 1 + NW;
  TY = [];
  FY = [];
  WB = [];
  CX = [];
  XR = [];
  TIER_NAME = [];
  LEVEL_NAMES = {};
  for (let i = 0; i < NM; i++) {
    const f = L.fields[i];
    TY.push(FIELD_Y0 + FIELD_H * i);
    FY.push(TY[i] + 900);
    XR.push(f.shooter ? 586 : 620);
    CX.push(f.shooter ? 303 : 320);
    TIER_NAME.push(f.name);
    LEVEL_NAMES[i] = f.short || f.name;
  }
  H = TY[BT] + 1060;
  GY = H + 90;
  HW = GY + 740;
  WY = HW + 190;
  TY.push(GY);
  FY.push(GY + 650);
  CX.push(320);
  XR.push(620);
  TIER_NAME.push(L.grave.name);
  LEVEL_NAMES[GT] = L.grave.short || L.grave.name;
  for (let k = 0; k < NW; k++) {
    const w = L.wings[k];
    WB.push(WY + k * WSTEP);
    TY.push(WB[k]);
    FY.push(WB[k] + 570);
    CX.push(320);
    XR.push(620);
    TIER_NAME.push(w.name);
    LEVEL_NAMES[WT0 + k] = w.short || w.name;
  }
}
export const tierOf = y => {
  for (let i = 1; i < NM; i++) if (y < TY[i]) return i - 1;
  if (y < GY - 60) return BT;
  if (y < WY - 100 || !NW) return GT;
  return WT0 + Math.min(NW - 1, Math.floor((y - (WY - 100)) / WSTEP));
};
export const isField = t => t < NM,
  isWing = t => t > GT;
