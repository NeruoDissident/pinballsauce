/* ================= STATE =================
   G is the game in play (balls, foes, run, timers). T is the table as built from a layout (walls, flippers, bumpers,
   sensors, scoops, banks, ramps). Both are plain objects every module reads and writes. Also the few helpers that
   only touch G: delayed calls, floating text, particles, lightning, the ball the camera follows. */
import {TAU, lerp, prefs, rand} from './util.js';
import {TUNE, tr} from '../table/content.js';

export const T = {
  segs: [],
  grid: [],
  flips: [],
  bumps: [],
  sens: [],
  holes: {},
  rails: {},
  mouths: [],
  shots: {},
  banks: {},
  sets: {},
  slings: [],
  spawn: [[], [], [], [], [], [], []],
  torches: [],
  wallPaths: [],
  blocks: [],
  chans: [],
  bossSpot: [],
  statueSpot: [],
  tunnels: {},
  posts: []
};
/* ================= GAME STATE & RULES ================= */
export const G = {
  mode: 'title',
  sub: null,
  paused: false,
  demo: false,
  auto: false,
  bot: null,
  balls: [],
  enemies: [],
  pickups: [],
  parts: [],
  floats: [],
  bolts: [],
  queue: [],
  pending: [],
  run: null,
  mods: {},
  boss: null,
  lit: {},
  cam: {y: 0, ty: 0, shake: 0, viewH: 1000},
  t: 0,
  tilt: 0,
  nudges: [],
  nudgeT: 0,
  flipPow: 1,
  in: {l: false, r: false, n: false},
  plunge: {ready: false, charge: 0, held: false, auto: 0},
  save: 0,
  mb: null,
  choice: null,
  curse: {},
  buffs: {},
  combo: 0,
  comboT: 0,
  statues: [],
  flash: 0,
  flashC: '#fff',
  booms: [],
  zones: [],
  phase: 0,
  nudgeCd: 0,
  hidden: false,
  inGrave: false,
  graveT: 0,
  graveLive: false,
  wingT: 0,
  wave: {n: 0, t: 18, active: null, list: []},
  casts: [],
  rallyT: 0,
  wingUrns: 0,
  spawnT: 0,
  ambT: 6,
  doorT: 0,
  kickT: 0,
  skill: -1,
  fallen: false,
  hurtT: 0,
  dirty: true,
  orbitMem: {},
  focusTier: 0,
  stuck: [],
  bonus: null
};
export const xpNeed = l => Math.round(TUNE.xpBase * Math.pow(TUNE.xpGrow, l - 1));
export function later(t, fn) {
  G.queue.push({t, fn});
}
export function float(x, y, text, color, size) {
  text = tr(text); // the table's wording, if it has its own (see tr in table/content.js)
  if (!text) return; // a table that sets one of the engine's floating words to '' does not get it
  G.floats.push({x, y, text, color: color || '#ffe9b0', size: size || 13, t: 0});
  if (G.floats.length > 40) G.floats.shift();
}
/* A spray of particles. Every spray the engine itself fires has a name (the last argument), and a table's theme may
   change or silence any of them: fx: {bursts: {kill: {col: '#ff9ac8', n: 24}, sling: false}}  (see FX0 in
   table/content.js for the names). A table's own rules call burst() with no name, or with one of their own. */
export const FXO = {}; // name -> false | {n, col, speed, life}, filled from the table's theme when it loads
export function burst(x, y, n, color, sp, life, name) {
  const o = name === undefined ? undefined : FXO[name];
  if (o === false) return;
  if (o) {
    if (o.n !== undefined) n = o.n;
    if (o.col) color = o.col;
    if (o.speed !== undefined) sp = o.speed;
    if (o.life !== undefined) life = o.life;
  }
  for (let i = 0; i < n; i++) {
    const a = rand(TAU),
      v = rand(0.3, 1) * (sp || 220);
    G.parts.push({
      x,
      y,
      vx: Math.cos(a) * v,
      vy: Math.sin(a) * v,
      life: 0,
      max: rand(0.3, 0.8) * (life || 1),
      color,
      size: rand(1.5, 3.5)
    });
  }
  if (G.parts.length > 450) G.parts.splice(0, G.parts.length - 450);
}
export function bolt(a, b) {
  if (!a || !b) return;
  const pts = [],
    n = 7;
  for (let i = 0; i <= n; i++) {
    const t = i / n,
      j = i && i < n ? 1 : 0;
    pts.push([lerp(a.x, b.x, t) + j * rand(-16, 16), lerp(a.y, b.y, t) + j * rand(-16, 16)]);
  }
  G.bolts.push({pts, t: 0});
}
export function focusBall() {
  let f = null;
  const rallying = G.balls.some(b => b.party);
  for (const b of G.balls) {
    if (rallying && b.party) continue;
    if (!f || b.y > f.y) f = b;
  }
  return f || G.balls[0] || null;
}
export function comboF() {
  return G.combo > 1 ? 1 + TUNE.comboStep * Math.min(TUNE.comboSteps, G.combo - 1) * (1 + G.mods.comboPay) : 1;
}
G.opt = prefs.get('opt', {shake: !(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches)});
