/* ================= THE RUN =================
   Loading a table, starting, continuing and ending a run, the run's modifiers, and how a campaign's main quest is
   assembled from the table's plan. */
import {FXO, G, T, later} from '../core/state.js';
import {pick, prefs, rand, setStoreNs, shuffle, store} from '../core/util.js';
import {startBall} from './ball.js';
import {CLASSES} from './classes.js';
import {checkLamps} from './lamps.js';
import {applyNames} from './names.js';
import {COMPANIONS, TAVERN_RECRUITS, drawRecruits, recruit} from './party.js';
import {PERKS, RELICS} from './perks.js';
import {qBegin, qResume, quests} from './quests.js';
import {gold} from './score.js';
import {buildTable} from '../table/build.js';
import {resetMechanisms} from '../table/mechanisms.js';
import {BOSSES, CAMPAIGNS, DEF, RULES, SIDE, THEME, TUNE, USE, setContent} from '../table/content.js';
import {ST, TY, setFeel, setFlipperBoost, setLayout} from '../table/layout.js';
import {A} from '../ui/audio.js';
import {UI, popup} from '../ui/ui.js';

// a table is loaded once: its layout becomes T, its content and rules become the bindings in table/content.js
export function initGame(def) {
  setStoreNs('pinballsauce.' + (def.store || def.id) + '.');
  setLayout(def.layout);
  setFeel(def.feel);
  setFlipperBoost(prefs.get('flipperBoost', 0));
  setContent(def);
  // the table's say on each of the engine's named effects (see burst, flash, shake, ring, bolt in core/state.js)
  for (const k in FXO) FXO[k] = THEME.fx[k] && typeof THEME.fx[k] === 'object' ? THEME.fx[k] : {};
  applyNames((def.content || {}).names);
  buildTable(def);
  checkLamps();
  G.statues = T.statues.map(s => ({x: s.x, y: s.y, r: s.r, tier: s.tier, id: s.id, on: true, flash: 0, cool: 0}));
  G.cam.y = G.cam.ty = TY[ST] - 20;
  G.focusTier = ST;
  if (RULES.init) RULES.init();
}
export function resetWorld() {
  if (T.mechanisms) resetMechanisms();
  G.gen = (G.gen || 0) + 1;
  Object.assign(G, {
    balls: [],
    enemies: [],
    pickups: [],
    queue: [],
    pending: [],
    boss: null,
    choice: null,
    sub: null,
    mb: null,
    tilt: 0,
    fallen: false,
    curse: {},
    buffs: {},
    combo: 0,
    comboT: 0,
    save: 0,
    paused: false,
    bonus: null,
    doorT: 0,
    orbitMem: {},
    booms: [],
    zones: [],
    phase: 0,
    nudgeCd: 0,
    hidden: false,
    inGrave: false,
    graveLive: false,
    wave: {n: 0, t: 18, active: null, list: []},
    casts: [],
    rallyT: 0
  });
  for (const id in T.rails) T.rails[id].closed = false;
  G.plunge = {ready: false, charge: 0, held: false, auto: 0};
  for (const s of T.segs) {
    if (s.bank) {
      s.on = true;
      s.lit = false;
    }
  }
  for (const id in T.banks) T.banks[id].reset = 0;
  for (const k in T.wings) T.wings[k].seal.forEach(s => (s.on = true));
  for (const s of T.sens) s.lit = false;
  for (const c of T.bumps) {
    c.ward = false;
    c.poss = null;
  }
  G.statues.forEach(s => (s.on = true));
}
/* ---------- run ---------- */
export function newRun(cls, comp) {
  if (!USE.classes || !CLASSES[cls]) cls = USE.classes ? Object.keys(CLASSES)[0] : 'plain';
  const c = CLASSES[cls],
    meta = store.get('meta', {}),
    leg = G.demo ? 0 : Math.min(100, (meta.bosses || 0) * 10);
  const r = {
    cls,
    score: 0,
    ballNum: 1,
    ballsLeft: DEF.balls || 3,
    level: 1,
    xp: 0,
    hp: c.hp,
    gold: leg,
    mult: 1,
    charge: 0,
    perks: [],
    relics: [],
    kills: 0,
    questsDone: 0,
    bossKills: 0,
    threat: 1,
    main: null,
    side: [],
    doneSide: [],
    arcs: [],
    locks: 0,
    lockLit: false,
    kickback: true,
    shield: false,
    shop: true,
    time: 0,
    grave: {hits: 0, need: TUNE.graveHits, used: 0, open: false},
    wing: {key: null, open: false, done: false, prog: 0},
    stat: {ramps: 0, orbits: 0, jackpots: 0, bestCombo: 0}
  };
  r.party = [];
  r.tavern = [];
  r.recruits = [];
  r.book = {};
  r.goal = {};
  G.run = r;
  if (RULES.newRun) RULES.newRun(r);
  recalc();
  r.hp = G.mods.maxHp;
  if (USE.party) {
    if (comp && COMPANIONS[comp]) recruit(comp);
    else if (G.demo) recruit(pick(Object.keys(COMPANIONS)));
  }
  r.main = USE.quests ? makeCampaign(r) : null;
  return r;
}
export function recalc() {
  const r = G.run,
    c = CLASSES[r.cls];
  const m = {
    dmg: 1,
    gold: 1,
    xp: 1,
    crit: c.crit,
    save: TUNE.ballSave - 2 + c.save, // the launch adds 2: see launch in ball.js
    flip: c.flip,
    dr: c.dr,
    hp: 0,
    charge: 1,
    combo: TUNE.comboTime,
    comboPay: 0,
    healKill: 0,
    pierce: false,
    kickRelight: false,
    bumpGold: 0,
    bumpDmg: 0,
    multMin: 1,
    laneHeal: 0,
    killGold: 0,
    rampHeal: 0,
    jackpot: 1,
    lockKeep: false,
    dmgMul: 1,
    rampScore: 0,
    aegisT: 12,
    aegisK: 0.5,
    nudgeCd: 0,
    phaseT: 0.7,
    critCharge: 0,
    zoneT: 9,
    zoneHeal: 1.5,
    rampCharge: 0,
    ironFlip: 0,
    toll: 0,
    hpK: 1,
    saveK: 1,
    hour: 1,
    laneWard: 0,
    bellHeal: 0,
    bargain: 0,
    cutpurse: 0,
    marked: 0,
    poison: 0,
    chain: 0,
    scorch: 0,
    deathWish: 0
  };
  for (const id of r.perks) {
    const p = PERKS.find(p => p.id === id);
    if (p) p.f(m);
  }
  for (const id of r.relics) {
    const p = RELICS.find(p => p.id === id);
    if (p) p.f(m);
  }
  m.dmg *= m.dmgMul;
  m.maxHp = Math.round((c.hp + m.hp + (r.level - 1) * 8) * m.hpK);
  m.pow = (c.pow + 2 * (r.level - 1)) * m.dmg;
  m.dr = Math.min(0.75, m.dr);
  m.save *= m.saveK;
  G.mods = m;
  if (r.hp > m.maxHp) r.hp = m.maxHp;
  if (r.mult < m.multMin) r.mult = m.multMin;
  G.dirty = true;
}
export function makeCampaign(r) {
  const all = Object.keys(CAMPAIGNS),
    keys = all.filter(k => !r.arcs.includes(k)),
    key = pick(keys.length ? keys : all);
  r.arcs.push(key);
  r.tavern = TAVERN_RECRUITS && USE.party ? drawRecruits(3) : [];
  r.wing = {key: CAMPAIGNS[key].wing ? CAMPAIGNS[key].wing.key : null, open: false, done: false, prog: 0};
  const c = CAMPAIGNS[key],
    cp = o => Object.assign({}, o),
    steps = [],
    stages = [];
  // the table's plan says how a main quest is assembled from the campaign's pools (see docs/TABLE_FORMAT.md)
  for (const p of c.plan || DEF.content.plan) {
    if (p.shuffle) {
      const l = shuffle(c[p.shuffle]);
      for (let i = 0; i < p.n; i++) {
        steps.push(cp(l[i]));
        stages.push(p.stage);
      }
    } else if (p.pick) {
      steps.push(cp(pick(c[p.pick])));
      stages.push(p.stage);
    } else if (p.use) {
      steps.push(cp(c[p.use]));
      stages.push(p.stage);
    } else if (p.boss) {
      const b = p.boss === '$boss' ? c.boss : p.boss;
      if (!USE.bosses || !BOSSES[b]) continue;
      steps.push({t: 'boss', boss: b, n: 1, text: p.text || 'Destroy ' + BOSSES[b].name});
      stages.push(p.stage);
    } else if (p.wing) {
      if (c.wing) {
        steps.push({t: 'done', id: 'wing', n: 1, text: c.wing.text});
        stages.push(c.wing.name);
      }
    } else if (p.step) {
      steps.push(cp(p.step));
      stages.push(p.stage);
    }
  }
  return {main: true, key, name: c.name, text: c.intro, steps, stages, si: 0, prog: 0, tl: 0};
}
export function giveRelic() {
  if (!USE.cards) return null;
  const r = G.run,
    pool = RELICS.filter(x => !x.stack && !r.relics.includes(x.id));
  if (!pool.length) {
    gold(60);
    return null;
  }
  const x = pick(pool);
  r.relics.push(x.id);
  recalc();
  return x;
}
export function saveRun() {
  if (G.demo || !G.run || G.mode !== 'play') return;
  store.set('run', {v: 2, run: G.run});
}
export function metaAdd(k, n) {
  if (G.demo) return;
  const m = store.get('meta', {});
  m[k] = (m[k] || 0) + (n || 1);
  store.set('meta', m);
}
export function gameOver(won) {
  if (G.demo) {
    later(1.5, startDemo);
    return;
  } // the attract mode never ends a run of yours, never touches your save
  const r = G.run;
  r.ended = won ? 'won' : 'fell';
  G.mode = 'over';
  G.sub = null;
  store.del('run');
  A.s(won ? 'victory' : 'over');
  metaAdd('runs');
  const m = store.get('meta', {});
  if (r.level > (m.bestLevel || 0)) {
    m.bestLevel = r.level;
    store.set('meta', m);
  }
  UI.gameOver(r);
}
export function startRun(cls, comp) {
  G.demo = false;
  G.bot = null;
  resetWorld();
  G.mode = 'play';
  newRun(cls, comp);
  G.cam.y = TY[ST] - 20;
  if (G.run.main) qBegin(G.run.main);
  startBall();
  if (G.run.main) popup(G.run.main.name, G.run.main.text, 'main');
  newSideQuiet();
  UI.sync(true);
}
export function newSideQuiet() {
  if (!USE.side) return;
  const r = G.run,
    pool = SIDE.filter(
      s => s.steps[0].tier === ST || (s.steps[0].id && T.shots[s.steps[0].id] && T.shots[s.steps[0].id].tier === ST)
    );
  if (!pool.length) return;
  const s = pick(pool);
  const q = {
    id: s.id,
    name: s.name,
    giver: s.giver,
    text: s.text,
    steps: s.steps.map(o => Object.assign({}, o)),
    rw: s.rw,
    si: 0,
    prog: 0,
    tl: 0
  };
  r.side.push(q);
  qBegin(q);
}
export function continueRun() {
  const d = store.get('run', null);
  if (!d || !d.run) return false;
  G.demo = false;
  G.bot = null;
  resetWorld();
  G.mode = 'play';
  G.run = d.run;
  if (!G.run.grave) G.run.grave = {hits: 0, need: 8, used: 0, open: false};
  if (!G.run.party) {
    G.run.party = [];
    G.run.tavern = [];
  }
  if (!G.run.book) {
    G.run.book = {};
    G.run.goal = {};
  }
  if (!G.run.recruits) G.run.recruits = [];
  G.run.party = G.run.party.filter(c => COMPANIONS[c.id]).slice(0, 1);
  if (G.run.party[0]) G.run.party[0].slot = 'center';
  if (TAVERN_RECRUITS && !G.run.tavern.length && G.run.party.length < 3) G.run.tavern = drawRecruits(3);
  if (!G.run.wing || G.run.wing.key === undefined) {
    const m = G.run.main,
      cw = m && CAMPAIGNS[m.key].wing;
    G.run.wing = {key: cw && m.steps.some(x => x.id === 'wing') ? cw.key : null, open: false, done: false, prog: 0};
  }
  recalc();
  G.cam.y = TY[ST] - 20;
  if (!G.run.main && USE.quests) {
    G.run.main = makeCampaign(G.run);
    qBegin(G.run.main);
  } else quests().forEach(qResume);
  startBall();
  UI.sync(true);
  return true;
}
export function startDemo() {
  G.demo = true;
  G.demoT = 180;
  resetWorld();
  G.mode = 'title';
  newRun(pick(Object.keys(CLASSES)));
  if (G.run.main) qBegin(G.run.main);
  newSideQuiet();
  G.bot = {hl: 0, hr: 0, tl: rand(20, 60), tr: rand(20, 60), pl: 0, plT: rand(0.3, 0.9)};
  startBall();
}
