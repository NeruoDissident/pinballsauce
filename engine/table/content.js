/* ================= THE TABLE'S CONTENT =================
   What a table brings besides its layout: foes, bosses, campaigns, side quests, wings, palettes, text and its own
   rules. The engine reads all of it through these bindings, which setContent() fills when a table loads.
   DEF is the whole table definition; RULES are its hook functions (see docs/TABLE_FORMAT.md). */
import {FIELD_INDEX} from './layout.js';

export let DEF = null,
  RULES = {},
  THEME = {},
  TEXT = {},
  USE = {}; // which game systems this table uses (see uses() below)
export let ENEMY = {},
  BOSSES = {},
  CAMPAIGNS = {},
  SIDE = [],
  STAGES = [],
  WINGS = {},
  WING_KEYS = [],
  HELP = [],
  PAL = [];
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
  return t;
}
/* A table's own say on what happens. Its rules may give `on: {name(what, ball, run, impact) {...}}` for any of:
     sling bump target drop lane inlane outlane orbit spin kick rampIn ramp rampFail hole flipHit wall chute
       what is the part that was hit or made: the bumper, the target segment, the sensor, the ramp, the scoop
     kill (what is the foe)   boss (what is the boss; its .phase has just begun)   bossDown (what is the boss)
     ball (a ball has just been served)   ballEnd (a ball has just been lost for good)
   The engine does its own part first, then calls the hook. ball is null where there is none. */
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
  RULES = def.rules || {};
  THEME = themeDefaults(def, def.theme || {});
  TEXT = Object.assign({}, TEXT0, c.text || {});
  TEXT.buffs = Object.assign({}, TEXT0.buffs, (c.text || {}).buffs || {});
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
