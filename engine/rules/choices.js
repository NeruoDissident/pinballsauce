/* ================= CHOICES =================
   The card screens: level-up (spellbook), boons, the Tavern. Auto pick resolves them without a menu. */
import {G} from '../core/state.js';
import {shuffle} from '../core/util.js';
import {CLASSES} from './classes.js';
import {COMPANIONS,ROLES,TAVERN_RECRUITS,recruit} from './party.js';
import {PERKS} from './perks.js';
import {recalc,saveRun} from './run.js';
import {bookChoice,bookUpChoice} from './spells.js';
import {tavernChoice} from './tavern.js';
import {DEF,TEXT} from '../table/content.js';
import {A} from '../ui/audio.js';
import {UI,popup} from '../ui/ui.js';

/* ---------- choices (perks, shop) ---------- */
export function openChoice(kind){const r=G.run;let c;
  if(kind==='perk'){const cnt=id=>r.perks.filter(x=>x===id).length,off=DEF.content.noPerks||[],can=p=>!off.includes(p.id)&&cnt(p.id)<p.max&&(!p.cls||p.cls===r.cls)&&(!p.rare||Math.random()<.35),picks=[];
    const take=k=>{const l=shuffle(PERKS.filter(p=>p.kind===k&&can(p)&&!picks.includes(p)));if(l.length)picks.push(l[0]);};
    const hasKey=r.perks.some(id=>{const p=PERKS.find(q=>q.id===id);return p&&p.kind==='key';});
    take('table');take('stat');take(!hasKey&&r.level>=3&&Math.random()<.35?'key':'table');
    while(picks.length<3){const l=shuffle(PERKS.filter(p=>p.kind!=='key'&&can(p)&&!picks.includes(p)));if(!l.length)break;picks.push(l[0]);}
    const tag=p=>cnt(p.id)?'Rank '+(cnt(p.id)+1):p.kind==='class'?CLASSES[r.cls].name:p.kind==='table'?'The table':p.kind==='key'?'Keystone':'Boon';
    c={kind,title:'A Boon',sub:'The spoils of the fight. Choose one',opts:picks.map(p=>({name:p.name,desc:p.desc,tag:tag(p),key:p.kind==='key',act:()=>{r.perks.push(p.id);recalc();if(p.now)p.now();}}))};}
  else if(kind==='book'){c=bookChoice();}
  else if(kind==='bookUp'){c=bookUpChoice(G.bookUp);}
  else if(kind==='tavern'&&TAVERN_RECRUITS){c=tavernChoice();}
  else{const opts=r.tavern.map(id=>{const d=COMPANIONS[id],R=ROLES[d.role];return {name:d.name,desc:R.name+'. '+d.desc,cost:d.cost,tag:d.cost+' '+TEXT.coin,role:d.role,act:()=>{const c=recruit(id);if(c)popup(d.name+' Joins','They take the '+c.slot+' post','good',d.desc);}};});
    c={kind,title:TEXT.tavern,sub:'Recruits for hire. You have '+r.gold+' '+TEXT.coin+(r.party.length?'; '+(3-r.party.length)+' post'+(3-r.party.length===1?'':'s')+' free':''),opts:opts.concat([{name:'Leave',desc:'Keep your coin and get back to it.',tag:'',act:()=>{}}])};}
  if(G.demo||G.auto||G.opt.autoPick){autoPick(kind,c);resumeHeld();G.dirty=true;return;}
  c.sel=0;G.choice=c;UI.choice(c);A.s('choice');}
// Auto pick (Options): level-ups, boons and hires are chosen for you the moment they come up, no menu, no scoop.
// Picks at random among the real options; an option that opens a sub-menu (levelling a spell) resolves that too.
export function autoPick(kind,c){const r=G.run,n0=G.autoN||0;
  for(const o of shuffle(c.opts.filter(o=>!/^(Back|Leave)$/.test(o.name)&&(!o.cost||o.cost<=r.gold)))){if(o.cost)r.gold-=o.cost;const res=o.act();
    if(res!=='stay'||(G.autoN||0)>n0){G.autoN=(G.autoN||0)+1;if(kind==='perk'&&!G.demo&&!G.auto)popup(c.title,o.name,'good',o.desc);return true;}if(o.cost)r.gold+=o.cost;}
  return false;}
export function choose(i){const c=G.choice;if(!c)return;const o=c.opts[i];if(!o)return;if(o.cost&&G.run.gold<o.cost){A.s('deny');return;}if(o.cost)G.run.gold-=o.cost;if(o.act()==='stay'){A.s('ui');return;}
  G.choice=null;UI.choice(null);G.slow=.7;resumeHeld();A.s('pick');G.dirty=true;saveRun();}
export function resumeHeld(){for(const b of G.balls)if(b.st==='held'&&b.held.plan==='wait'){b.held.plan='eject';b.held.t=0;b.held.delay=.5;}}
