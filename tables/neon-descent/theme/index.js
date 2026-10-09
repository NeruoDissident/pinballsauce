import {ART,BOSS_ART,ND_PAL,floorBase,paintFlatline} from './art.js';
import {mkBumper,mkStatue} from './props.js';
import {buildScenery,restyle} from './scenery.js';

/* Neon Descent: the theme. Palettes, floor art, scenery, models. The engine asks for these by name; anything left
   out falls back to the engine's default look (see docs/TABLE_FORMAT.md, "Theme"). Tiers here: the four districts
   top to bottom, then Flatline. */
const VIOLET='#b9a0ff',CYAN='#43e7ed',PINK='#ff4c9a',AMBER='#f6c85f',RED='#ff4c6a';
export const theme={
  pal:ND_PAL,                                              // per tier: a, b floor gradient; acc, acc2 accents; glow; stone
  stoneCol:['#58527a','#3d6170','#684660','#566172','#4a2e3a'], // wall plate per tier
  tierLight:[VIOLET,CYAN,PINK,AMBER,RED],                  // the pool of light over each field, then Flatline
  rampCol:[VIOLET,CYAN,PINK,AMBER],                        // ramp beds and shot inserts per field (a ramp takes its home field's colour)
  fog:['#0a0816','#06101a','#12081a','#080c16','#0a0306'], // per tier
  motes:[{col:VIOLET,style:'rise'},{col:CYAN,style:'drift'},{col:PINK,style:'blink'},{col:AMBER,style:'drift'},{col:RED,style:'drift'}],
  music:[{low:true,wave:'sawtooth'},{wave:'sine'},{wave:'square'},{}], // per field: how the lead voice changes there
  fonts:{fontD:'"Arial Black","Segoe UI",system-ui,sans-serif',fontL:'Consolas,"Courier New",monospace'}, // what is lettered on the table
  flagstones:false,floorBase,floorArt:ART,paintGrave:paintFlatline,
  bumper:mkBumper,statue:mkStatue,                         // models per bumper group and statue
  scenery:buildScenery,materials:restyle,                  // the city, and what the cabinet is made of
  sprites:{bosses:BOSS_ART}                                // painted billboards
};
