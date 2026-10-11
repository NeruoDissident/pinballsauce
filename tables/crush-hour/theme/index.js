import {ART, BOSS_ART, CH_PAL, floorBase, paintFriendZone} from './art.js';
import {figures, poses} from './figures.js';
import {mkBumper, mkStatue} from './props.js';
import {buildScenery} from './scenery.js';

/* Crush Hour: the theme. Palettes, floor art, models, the rivals' figures, scenery, and this table's say on the
   shared code's effects. The engine asks for these by name; anything left out falls back to the engine's default
   look (see docs/TABLE_FORMAT.md, "Theme"). Tiers here: Sakura High, Starlight Plaza, Maple Street, then the
   Friend Zone. */
const SKY = '#7fd4ff',
  GOLD = '#ffd24a',
  PINK = '#ff7eb6',
  HOT = '#ff5f9e',
  BLUE = '#8fb0d8';
export const theme = {
  pal: CH_PAL, // per tier: a, b floor gradient; acc, acc2 accents; glow; stone
  tierLight: [SKY, GOLD, PINK, BLUE], // the pool of light over each playfield, then the Friend Zone
  rampCol: ['#bfe9ff', '#ffe9a8', '#ffb3d4'], // ramp beds and shot inserts per playfield
  fog: ['#2a2450', '#33204e', '#3a1a3e', '#141a2c'], // per tier: a plum dusk
  motes: [
    {col: '#ffc4dc', style: 'drift'}, // petals
    {col: GOLD, style: 'blink'}, // fairy lights
    {col: PINK, style: 'rise'},
    {col: BLUE, style: 'drift'}
  ],
  music: [{wave: 'triangle'}, {wave: 'sine'}, {wave: 'triangle'}], // per playfield: how the lead voice sounds there
  fonts: {
    fontD: '"Arial Rounded MT Bold","Trebuchet MS","Segoe UI",system-ui,sans-serif',
    fontL: '"Trebuchet MS","Segoe UI",system-ui,sans-serif'
  },
  flagstones: false,
  floorBase,
  floorArt: ART,
  paintGrave: paintFriendZone,
  bumper: mkBumper,
  statue: mkStatue,
  figures, // this table's own rivals
  foePose: poses,
  sprites: {bosses: BOSS_ART},
  scenery: buildScenery,
  // the lamp colours are the engine's (gold the plan, blue a favour, green the lock), so they mean on this table what
  // they mean on the others; only the 'feature open' lamp changes, from violet to white, to read on a lilac floor
  lampCols: {soft: '#ffffff'},
  /* The shared code's effects, as this table wants them (docs/TABLE_FORMAT.md, "Nothing the shared code does is
     forced on a table"). Softer flashes and shake; hearts when somebody is won over, stars off the bumpers and the
     big moments; pink where the engine's own colour is fire or lightning. None of this changes how the table plays:
     only colours and shapes are changed, never how many particles a spray has. */
  fx: {
    flash: 0.7,
    shake: 0.7,
    particleSize: 11,
    bursts: {
      kill: {shape: 'heart', col: PINK},
      bossHit: {shape: 'heart', col: HOT},
      bossDown: {shape: 'heart', col: PINK},
      bossAura: {shape: 'star'},
      guardSave: {shape: 'heart', col: PINK},
      partyPulse: {shape: 'heart'},
      rallyBall: {shape: 'heart'},
      rallySpark: {shape: 'star'},
      bump: {shape: 'star'},
      pickup: {shape: 'star', col: GOLD},
      fireball: {shape: 'star', col: '#ffd0e4'},
      meteor: {shape: 'star', col: '#fff6d8'},
      powerShot: {shape: 'star'},
      foeStrike: {col: '#c9a8ff'},
      graveFall: {col: BLUE}
    },
    flashes: {
      bossDown: {v: 0.8, col: '#ffe4f0'},
      bossWake: {col: PINK},
      fireball: {col: '#ffd0e4'},
      graveCatch: {col: '#22345a'},
      graveOpen: {col: BLUE},
      graveRise: {col: '#ffe4f0'}
    },
    shakes: {nudge: 7, hurt: 4},
    rings: {fireball: {col: PINK}, meteor: {col: '#ffd0e4'}, aegis: {col: '#ffd9a8'}},
    bolts: {foeStrike: {col: '#c9a8ff'}, foeCast: {col: '#c9a8ff'}}
  }
};
