import {ART, BDRAW, EDRAW, GB_PAL, drawGrave} from './art.js';
import {mkBumper, mkStatue} from './props.js';
import {buildScenery} from './scenery.js';
import {WING_ART, WING_PROPS} from './wings.js';

/* Gravebound Pinball: the theme. Palettes, floor art, scenery, models. The engine asks for these by name. */
export const theme = {
  pal: GB_PAL, // per tier: a, b floor gradient; acc, acc2 accents; glow; stone
  stoneCol: ['#6a4c80', '#4c7466', '#526a96', '#6e6044', '#72785a', '#5e6a80', '#8a5a3a'], // wall stone per tier
  tierLight: ['#ff6a48', '#7fe0c0', '#ffb060', '#9dffc8'], // the pool of light over each field, then the Grave
  rampCol: [GB_PAL[0].acc2, GB_PAL[1].glow, GB_PAL[2].acc], // ramp beds and shot inserts per field
  fog: ['#0b0610', '#050b0a', '#06080f', '#030604', '#070803', '#05070c', '#0b0603'], // per tier
  motes: [
    {col: '#ff7a3a', style: 'rise'},
    {col: '#b8ff8a', style: 'blink'},
    {col: '#9cc8ff', style: 'drift'},
    {col: '#9dffc8', style: 'drift'}
  ], // drifting sparks per field, then the Grave
  music: [{low: true}, {wave: 'sine'}, {}], // per field: how the harp voice changes there
  floorArt: ART, // one painter per field: (c, y, palette)
  paintGrave: drawGrave,
  bumper: mkBumper,
  statue: mkStatue, // models per bumper group and statue
  scenery: buildScenery, // the world around the table
  wingArt: WING_ART,
  wingProps: WING_PROPS,
  sprites: {foes: EDRAW, bosses: BDRAW}, // painted billboards
  fitNames: false // level names are lettered at the original's fixed size
};
