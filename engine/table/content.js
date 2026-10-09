/* ================= THE TABLE'S CONTENT =================
   What a table brings besides its layout: foes, bosses, campaigns, side quests, wings, palettes, text and its own
   rules. The engine reads all of it through these bindings, which setContent() fills when a table loads.
   DEF is the whole table definition; RULES are its hook functions (see docs/TABLE_FORMAT.md). */
export let DEF=null,RULES={},THEME={},TEXT={};
export let ENEMY={},BOSSES={},CAMPAIGNS={},SIDE=[],STAGES=[],WINGS={},WING_KEYS=[],HELP=[],PAL=[];
const TEXT0={ // engine defaults; a table's content.text overrides any of them
  title:'Pinball',titleSmall:'',eyebrow:'',version:'',hintFresh:'',quiet:'The table is quiet. For now.',lost:'The table keeps what it is given.',
  tavern:'The Tavern',tavernWaits:'The Tavern waits',noMain:'Nothing stirs. Yet.',noSide:'No errands.',alone:'You ride alone.',
  graveOpen:['The Grave Opens','Your next lost ball falls into it. Fight your way back out'],graveIn:['The Grave','Drive both coffin nails, then shoot the light before the lid closes'],
  graveObjNails:'Drive both coffin nails at the head of the coffin',graveObjLight:'The lid is split. Shoot the light',graveLost:['Gravebound','The earth keeps what it is given'],
  graveLid:['The Lid Splits','Shoot the light'],graveClosed:['The Lid Closes','The flippers go dead'],risen:['Risen','The grave gives you back'],
  graveStir:'THE GRAVE STIRS',watch:'THE WATCH HOLDS +12s',followed:'SOMETHING FOLLOWED YOU ROUND',feel:'THEY FEEL IT',bell:['The Bell Tolls','Every ear in the dark heard that'],
  barred:'BARRED',wave:['They Come','']};
export function setContent(def){DEF=def;const c=def.content;RULES=def.rules||{};THEME=def.theme||{};TEXT=Object.assign({},TEXT0,c.text||{});
  ENEMY=c.foes;BOSSES=c.bosses;CAMPAIGNS=c.campaigns;SIDE=c.side||[];STAGES=c.stages||[];WINGS=c.wings||{};WING_KEYS=(def.layout.wings||[]).map(w=>w.key);HELP=c.help||[];PAL=THEME.pal;}

