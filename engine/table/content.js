/* ================= THE TABLE'S CONTENT =================
   What a table brings besides its layout: foes, bosses, campaigns, side quests, wings, palettes, text and its own
   rules. The engine reads all of it through these bindings, which setContent() fills when a table loads.
   DEF is the whole table definition; RULES are its hook functions (see docs/TABLE_FORMAT.md). */
import {FIELD_INDEX} from './layout.js';

export let DEF = null,
  RULES = {},
  THEME = {},
  TEXT = {},
  USE = {}, // which game systems this table uses (see uses() below)
  PTS = {}, // what things are worth on this table (POINTS0 below, with the table's own `points` laid over it)
  TUNE = {}; // the rule numbers on this table (TUNE0 below, with the table's own `tune` laid over it)
export let ENEMY = {},
  BOSSES = {},
  CAMPAIGNS = {},
  SIDE = [],
  STAGES = [],
  WINGS = {},
  WING_KEYS = [],
  HELP = [],
  PAL = [];
/* What things are worth, unless a table says otherwise: `points: {ramp: 6000}` in its table.js changes one and
   leaves the rest. Everything paid through score() is multiplied by the multiplier; the lines marked "x combo" are
   also multiplied by the combo factor. These are defaults, not law: a table whose ramp is its hardest shot can pay
   more for it. */
export const POINTS0 = {
  // the playfield
  sling: 110,
  bumper: 250,
  bell: 800, // a bumper flagged bell:true
  target: 500, // a standup
  drop: 750, // a drop target
  lane: 400, // a top lane
  floorLane: 300, // an inlane or an outlane
  skill: 15000, // the flashing lane off the plunger
  spin: 150, // one turn of a spinner
  scoop: 2500, // x combo
  orbit: 3000, // x combo
  fullOrbit: 6000, // up one side and down the other inside 4 seconds
  ramp: 4000, // x combo
  bank: 8000, // a bank knocked down or a lane set lit; x combo
  statue: 600,
  // multiball
  jackpot: 40000, // the first one
  jackpotStep: 8000, // each one grows by this
  jackpotMax: 200000,
  // the end-of-ball bonus, each
  bonusRamp: 300,
  bonusKill: 400,
  bonusSide: 8000,
  bonusLevel: 2500,
  // goals written as data
  questStep: 20000, // a step of the main quest
  quest: 250000, // the main quest
  side: 25000, // a side quest
  // enemies and bosses
  foeHit: 300,
  foeKill: 1000, // x level
  foeStagger: 500,
  foeInterrupt: 2000, // a foe's spell broken
  ritual: 3000, // a ritual broken
  wave: 4000, // a wave cleared: x foes x level
  bossHit: 1500,
  bossInterrupt: 30000,
  boss: 150000,
  // pickups, the party, the rooms
  coin: 1000,
  hoard: 3000,
  pickup: 5000, // a quest pickup
  guard: 500, // the party's guard turns a ball back
  grave: 50000, // out of the Grave
  wing: 100000 // a wing won
};
/* The engine's own visual effects, and what a table's theme may do about them:  theme.fx = {...}
   For the whole table:
     flash     how strong the full-screen colour flashes are (1 = as built, 0 = none)
     shake     how strong the camera shake is (the player's own Screen Shake option still switches it off)
     rings     false = no shockwave rings on the floor at all
     bolts     false = no lightning lines at all
     particle  the sprite a particle is drawn with unless its spray says otherwise: 'dot', 'heart', 'star', 'spark',
               one of this table's own `shapes`, or a function (c, size) that paints one in white on a 2D canvas
     particleSize   how big a particle is drawn (9)
     shapes    {name: (c, size) => {...}}: this table's own particle sprites, usable by name wherever a shape is
   For one moment, by its name (the lists below; a name that is not in its list stops the table loading):
     bursts    {name: false | {n, col, speed, life, shape}}   one spray of particles
     flashes   {name: false | strength | {v, col}}            one screen flash
     shakes    {name: false | amount | {v}}                   one camera shake
     rings     {name: false | {col, r}}                       one shockwave ring
     bolts     {name: false | {col}}                          one kind of lightning line */
export const FX0 = {
  flash: 1,
  shake: 1,
  rings: true,
  bolts: true,
  particle: 'dot',
  particleSize: 9,
  shapes: {},
  bursts: {},
  flashes: {},
  shakes: {}
};
export const SHAPES = ['dot', 'heart', 'star', 'spark'];
// Is this something a particle can be drawn as? Throws, naming what can, if not.
export function checkShape(s) {
  if (typeof s === 'function' || SHAPES.includes(s) || (THEME.fx && THEME.fx.shapes && s in THEME.fx.shapes)) return s;
  throw new Error(
    'a particle shape is ' +
      SHAPES.concat(Object.keys((THEME.fx && THEME.fx.shapes) || {})).join(', ') +
      ' or a function, not "' +
      s +
      '"'
  );
}
// every screen flash, camera shake, shockwave ring and lightning line the engine fires, by name
export const FLASHES = [
  'jackpot',
  'multiball',
  'cast', // an ability going off
  'fireball',
  'martyr',
  'rally',
  'rallyBall', // each party ball arriving
  'graveOpen',
  'graveCatch', // the ball taken down into the Grave
  'graveRise', // out of the Grave
  'wingEnter',
  'wingWon',
  'bossWake',
  'bossCast', // a boss's spell landing
  'bossDown'
];
export const SHAKES = [
  'nudge',
  'hurt',
  'wave', // a wave of enemies arriving
  'cast',
  'fireball',
  'meteor',
  'rally',
  'rallyBall',
  'rallySlam', // every third pulse of a party ball
  'partyFall', // a companion going down
  'graveFall', // a ball landing in the Grave
  'sealBreak', // a wing's seal breaking
  'bossWake',
  'bossCast',
  'bossDown'
];
export const RINGS = [
  'aegis',
  'barrier',
  'fireball',
  'meteor',
  'frostNova',
  'knightNudge',
  'clericNudge',
  'rallyBall',
  'rallyTank',
  'rallyHeal',
  'rallySlam'
];
export const BOLTS = [
  'conduit', // a mage's bumper arcing to an enemy
  'mageNudge',
  'powerShot', // a mage's charged ball arcing to enemies it passes
  'knives',
  'blink',
  'judgement',
  'shieldWall',
  'guardBolt', // a companion at the drain striking back
  'rallyPulse',
  'foeStrike', // an enemy hitting the ball
  'foeCast' // an enemy's curse
];
// every spray of particles the engine fires, by name
export const BURSTS = [
  'sling',
  'bump',
  'bell',
  'bumpDead', // a bumper an enemy is sitting on
  'kickback',
  'eject', // a scoop kicking the ball out
  'barred', // a closed ramp turning the ball away
  'pickup',
  'graveFall', // a ball landing in the Grave
  'powerShot', // a class's held-ball shot firing
  'fireball',
  'consecrate',
  'cloak',
  'meteor',
  'rallyBall', // each party ball arriving
  'rallySpark',
  'partyPulse',
  'partyLeave',
  'guardSave', // the guard at the drain turning a ball back
  'guardStruck',
  'foeRise', // an enemy appearing
  'foeDeny',
  'foeStrike',
  'foeSwat', // a hunter batting the ball
  'armor',
  'kill',
  'bossAura',
  'bossHit',
  'bossDown'
];
/* The rule numbers: how long, how many, how often. Defaults, like the points: `tune: {ballSave: 15}` in a table's
   table.js changes one and leaves the rest. */
export const TUNE0 = {
  // every table
  ballSave: 10, // seconds of ball save from the launch (a class may add its own)
  comboTime: 5, // seconds between two shots that still count as a combo
  comboStep: 0.25, // each step of a combo pays this much more...
  comboSteps: 8, // ...for this many steps
  tiltNudges: 5, // this many nudges inside tiltTime is a tilt; one fewer is the warning
  tiltTime: 4,
  mbSave: 8, // seconds of ball save when a multiball starts
  mbMaxBalls: 5, // the most balls on the table at once
  spinCall: 18, // a spinner that calls something calls it every this many turns
  // health
  healthScale: 0.3, // enemies hit for this share of their listed damage
  ballHeal: 0.6, // health is topped up to this share at the start of each ball
  // enemies
  waveEvery: 30, // seconds between waves...
  waveFaster: 1.5, // ...less this much a level...
  waveMin: 14, // ...and never under this
  waveBudget: 3, // what a wave may spend on enemies (each has a cost)...
  waveBudgetStep: 0.6, // ...plus this much a level
  // levels
  xpBase: 45, // experience for the second level...
  xpGrow: 1.32, // ...and each level after needs this many times more
  // classes and the party
  cradleArm: 0.8, // seconds a ball is held on a raised flipper to arm the class shot
  cradleRally: 1.5, // ...and to call the Rally with a full meter
  rallyTime: 20, // seconds of Rally pulses and recruit abilities (balls stay until drained)
  // the Grave
  graveHits: 8, // hits that open it the first time...
  graveHitsStep: 4, // ...and this many more each time after
  graveTime: 22 // seconds to get out
};
const TEXT0 = {
  // engine defaults; a table's content.text overrides any of them
  title: 'Pinball',
  titleSmall: '',
  eyebrow: '',
  version: '',
  hintFresh: '',
  quiet: 'The table is quiet. For now.',
  lost: 'The table keeps what it is given.',
  tavern: 'The Tavern',
  tavernWaits: 'The Tavern waits',
  noMain: 'Nothing stirs. Yet.',
  noSide: 'No errands.',
  alone: 'You ride alone.',
  graveOpen: ['The Grave Opens', 'Your next lost ball falls into it. Fight your way back out'],
  graveIn: ['The Grave', 'Drive both coffin nails, then shoot the light before the lid closes'],
  graveObjNails: 'Drive both coffin nails at the head of the coffin',
  graveObjLight: 'The lid is split. Shoot the light',
  graveLost: ['Gravebound', 'The earth keeps what it is given'],
  graveLid: ['The Lid Splits', 'Shoot the light'],
  graveClosed: ['The Lid Closes', 'The flippers go dead'],
  risen: ['Risen', 'The grave gives you back'],
  graveStir: 'THE GRAVE STIRS',
  graveCount: 'GRAVE',
  watch: 'THE WATCH HOLDS +12s',
  followed: 'SOMETHING FOLLOWED YOU ROUND',
  feel: 'THEY FEEL IT',
  bell: ['The Bell Tolls', 'Every ear in the dark heard that'],
  barred: 'BARRED',
  lockMb: 'Restless Dead',
  coin: 'gold',
  coinMark: 'g',
  graveChip: 'Grave',
  wave: ['They Come', ''],
  mainHead: 'Main Quest', // what the table's ladder of goals is called (a plain table might say Goals)
  mainDone: 'Main Quest Complete',
  sideHead: 'Side quests',
  heroHead: 'Hero',
  campHead: 'Campaign',
  overWon: 'The expedition is over',
  overLost: 'The hero falls',
  nameAsk: 'Carve your name',
  noScores: 'No scores yet. The first name on the stone is yours to carve.',
  // the timed effects a table's rules can switch on (G.buffs.<name> = seconds), as the HUD words them
  buffs: {sharp: 'Sharpened', stealth: 'Shadowstrike', aegis: 'Aegis', moon: 'Moonlight 2x'},
  endlessNote: 'Endless: a new shadow rises after every campaign, instead of the run ending',
  controlsNote:
    'Flashing gold arrows are your main quest. Blue ones are side quests. Ramps climb to the level above; the gap between the upper flippers drops you to the level below.'
};
// a palette per tier when the theme gives none: a, b floor gradient; acc, acc2 accents; glow; stone
const PAL0 = [
  {a: '#1d1124', b: '#110a17', acc: '#c0283c', acc2: '#d9a441', glow: '#ff4a5a', stone: '#3a2c44'},
  {a: '#10201b', b: '#0a1411', acc: '#58b89a', acc2: '#cfeef2', glow: '#8fe8d0', stone: '#2c4038'},
  {a: '#16203a', b: '#0c121f', acc: '#e0a040', acc2: '#9cc0ea', glow: '#ffc060', stone: '#2f3a52'},
  {a: '#1c1430', b: '#0d0a18', acc: '#9a7cff', acc2: '#e0d4ff', glow: '#b9a0ff', stone: '#352c4e'},
  {a: '#0f2230', b: '#08121a', acc: '#3fb6d8', acc2: '#d0f2ff', glow: '#62d8ff', stone: '#28404e'},
  {a: '#2a1c10', b: '#150d07', acc: '#e07a3a', acc2: '#ffe0b8', glow: '#ffa050', stone: '#4a3626'}
];
function themeDefaults(def, th) {
  const nm = def.layout.fields.length,
    nt = nm + 1 + (def.layout.wings || []).length,
    t = Object.assign({}, th);
  if (!t.pal) {
    t.pal = [];
    for (let i = 0; i < nt; i++)
      t.pal.push(
        i === nm
          ? {a: '#1b1710', b: '#080705', acc: '#7dffb0', acc2: '#cfe8c0', glow: '#7dffb0', stone: '#3a3222'}
          : PAL0[(i < nm ? i : i - 1) % PAL0.length]
      );
  }
  const P = t.pal,
    each = f => P.map(f);
  if (!t.stoneCol) t.stoneCol = each(p => p.stone);
  if (!t.tierLight) t.tierLight = P.slice(0, nm + 1).map(p => p.glow);
  if (!t.rampCol) t.rampCol = P.slice(0, nm).map(p => p.glow);
  if (!t.fog) t.fog = each(p => p.b);
  if (!t.motes) t.motes = P.slice(0, nm + 1).map(p => ({col: p.glow, style: 'drift'}));
  const fx = th.fx || {};
  for (const [key, list, what] of [
    ['bursts', BURSTS, 'particle effect'],
    ['flashes', FLASHES, 'screen flash'],
    ['shakes', SHAKES, 'camera shake'],
    ['rings', RINGS, 'shockwave ring'],
    ['bolts', BOLTS, 'lightning line']
  ]) {
    const m = fx[key];
    if (!m || typeof m !== 'object') continue; // rings and bolts may also be true or false for the whole table
    for (const k in m)
      if (!list.includes(k))
        throw new Error('theme: fx.' + key + ' has no ' + what + ' "' + k + '" (' + list.join(', ') + ')');
  }
  t.fx = Object.assign({}, FX0, fx);
  // shapes: the table's default and any a spray asks for must be ones that exist
  const shapeOk = s =>
    typeof s === 'function' || SHAPES.includes(s) || s in t.fx.shapes
      ? s
      : (() => {
          throw new Error(
            'theme: a particle shape is ' +
              SHAPES.concat(Object.keys(t.fx.shapes)).join(', ') +
              ' or a function, not "' +
              s +
              '"'
          );
        })();
  shapeOk(t.fx.particle);
  for (const k in t.fx.bursts) if (t.fx.bursts[k] && t.fx.bursts[k].shape) shapeOk(t.fx.bursts[k].shape);
  t.sounds = th.sounds || {};
  return t;
}
/* A table's own say on what happens. Its rules may give `on: {name(what, ball, run, impact) {...}}` for any of:
     sling bump target drop lane inlane outlane orbit spin kick rampIn ramp rampFail hole flipHit wall chute
       what is the part that was hit or made: the bumper, the target segment, the sensor, the ramp, the scoop
     kill (what is the foe)   boss (what is the boss; its .phase has just begun)   bossDown (what is the boss)
     ball (a ball has just been served)   ballEnd (a ball has just been lost for good)
   The engine does its own part first, then calls the hook. ball is null where there is none. */
/* The engine's own words: the banners ("Tilt", "Level Up"), the words that float off the table ("JACKPOT",
   "STAGGERED", "3x COMBO"), the chips under the score and the lines of the end-of-ball bonus. A table replaces any
   of them by writing the engine's wording and its own:
     text: {words: {'JACKPOT': 'FIRST KISS', 'Tilt': 'Busted', 'COMBO': 'CHAIN', 'STAGGERED': ''}}
   A whole line that matches is replaced as it stands; otherwise each phrase is replaced wherever it appears in the
   line (so 'COMBO' also changes '3x COMBO'), longest phrase first. An empty string drops a floating word or a
   banner altogether. */
let WORDS = null,
  WORD_KEYS = [];
export function tr(s) {
  if (!WORDS || typeof s !== 'string' || !s) return s;
  if (s in WORDS) return WORDS[s];
  for (const k of WORD_KEYS) if (s.includes(k)) s = s.split(k).join(WORDS[k]);
  return s;
}
export function hook(name, what, ball, run, imp) {
  const f = RULES.on && RULES.on[name];
  if (f) f(what, ball || null, run, imp);
}
// content may name a field by its id wherever it gives a `tier`; the engine works in indices
function tiersById(o) {
  if (!o || typeof o !== 'object') return;
  if (typeof o.tier === 'string') {
    if (!(o.tier in FIELD_INDEX)) throw new Error('content: there is no field "' + o.tier + '"');
    o.tier = FIELD_INDEX[o.tier];
  }
  for (const k in o) tiersById(o[k]);
}
/* Which game systems a table uses. Nothing is compulsory.
   Systems that live in the engine are switches, on unless the table says `uses: {name: false}`:
     health    the health bar: foes and boss spells wound, and at zero the flippers die
     classes   class balls: a ball picked at the start, with its own weight, nudge power and cradle shot
     levels    experience, level-ups and the spellbook (needs classes)
     party     companions, recruits, the guard post and the Rally
     cards     boons and relics
     gold      the coin
   Systems that are made of a table's own data are on when the data is there:
     foes, bosses   content.foes, content.bosses
     quests, side   content.campaigns (the main goals), content.side
     grave          layout.grave
   (`uses: {foes: false}` switches one of those off without deleting its data.) */
function uses(def) {
  const u = def.uses || {},
    c = def.content || {},
    on = k => u[k] !== false,
    any = o => !!o && Object.keys(o).length > 0;
  const U = {
    classes: on('classes'),
    party: on('party'),
    cards: on('cards'),
    gold: on('gold'),
    foes: on('foes') && any(c.foes),
    bosses: on('bosses') && any(c.bosses),
    quests: on('quests') && any(c.campaigns),
    side: on('side') && any(c.side),
    grave: on('grave') && !!def.layout.grave
  };
  U.health = on('health') && (U.foes || U.bosses); // with nothing to wound you there is nothing to show
  U.levels = on('levels') && U.classes;
  U.meter = U.classes || U.party; // the power meter feeds the class shot and the Rally
  return U;
}
export function setContent(def) {
  DEF = def;
  const c = def.content || (def.content = {});
  tiersById(c);
  USE = uses(def);
  for (const k in def.points || {})
    if (!(k in POINTS0))
      throw new Error('table: there is no point value "' + k + '" (' + Object.keys(POINTS0).join(', ') + ')');
  PTS = Object.assign({}, POINTS0, def.points || {});
  for (const k in def.tune || {})
    if (!(k in TUNE0))
      throw new Error('table: there is no setting "' + k + '" (' + Object.keys(TUNE0).join(', ') + ')');
  TUNE = Object.assign({}, TUNE0, def.tune || {});
  RULES = def.rules || {};
  THEME = themeDefaults(def, def.theme || {});
  TEXT = Object.assign({}, TEXT0, c.text || {});
  TEXT.buffs = Object.assign({}, TEXT0.buffs, (c.text || {}).buffs || {});
  WORDS = (c.text || {}).words || null;
  WORD_KEYS = WORDS ? Object.keys(WORDS).sort((a, b) => b.length - a.length) : [];
  ENEMY = c.foes || {};
  BOSSES = c.bosses || {};
  CAMPAIGNS = c.campaigns || {};
  SIDE = c.side || [];
  STAGES = c.stages || [];
  WINGS = c.wings || {};
  WING_KEYS = (def.layout.wings || []).map(w => w.key);
  HELP = c.help || [];
  PAL = THEME.pal;
}
