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
  graveStir:'THE GRAVE STIRS',graveCount:'GRAVE',watch:'THE WATCH HOLDS +12s',followed:'SOMETHING FOLLOWED YOU ROUND',feel:'THEY FEEL IT',bell:['The Bell Tolls','Every ear in the dark heard that'],
  barred:'BARRED',lockMb:'Restless Dead',coin:'gold',coinMark:'g',graveChip:'Grave',wave:['They Come','']};
// a palette per tier when the theme gives none: a, b floor gradient; acc, acc2 accents; glow; stone
const PAL0=[{a:'#1d1124',b:'#110a17',acc:'#c0283c',acc2:'#d9a441',glow:'#ff4a5a',stone:'#3a2c44'},{a:'#10201b',b:'#0a1411',acc:'#58b89a',acc2:'#cfeef2',glow:'#8fe8d0',stone:'#2c4038'},
  {a:'#16203a',b:'#0c121f',acc:'#e0a040',acc2:'#9cc0ea',glow:'#ffc060',stone:'#2f3a52'},{a:'#1c1430',b:'#0d0a18',acc:'#9a7cff',acc2:'#e0d4ff',glow:'#b9a0ff',stone:'#352c4e'}];
function themeDefaults(def,th){const nm=def.layout.fields.length,nt=nm+1+(def.layout.wings||[]).length,t=Object.assign({},th);
  if(!t.pal){t.pal=[];for(let i=0;i<nt;i++)t.pal.push(i===nm?{a:'#1b1710',b:'#080705',acc:'#7dffb0',acc2:'#cfe8c0',glow:'#7dffb0',stone:'#3a3222'}:PAL0[(i<nm?i:i-1)%PAL0.length]);}
  const P=t.pal,each=f=>P.map(f);
  if(!t.stoneCol)t.stoneCol=each(p=>p.stone);
  if(!t.tierLight)t.tierLight=P.slice(0,nm+1).map(p=>p.glow);
  if(!t.rampCol)t.rampCol=P.slice(0,nm).map(p=>p.glow);
  if(!t.fog)t.fog=each(p=>p.b);
  if(!t.motes)t.motes=P.slice(0,nm+1).map(p=>({col:p.glow,style:'drift'}));
  return t;}
export function setContent(def){DEF=def;const c=def.content;RULES=def.rules||{};THEME=themeDefaults(def,def.theme||{});TEXT=Object.assign({},TEXT0,c.text||{});
  ENEMY=c.foes;BOSSES=c.bosses;CAMPAIGNS=c.campaigns;SIDE=c.side||[];STAGES=c.stages||[];WINGS=c.wings||{};WING_KEYS=(def.layout.wings||[]).map(w=>w.key);HELP=c.help||[];PAL=THEME.pal;}

