/* ================= QUESTS =================
   Main and side quests are lists of steps; table events move them along through qEvent(). */
import {G,T,float,later} from '../core/state.js';
import {pick} from '../core/util.js';
import {wakeBoss} from './bosses.js';
import {openDoor} from './events.js';
import {relight} from './lamps.js';
import {gameOver,giveRelic,makeCampaign,metaAdd,saveRun} from './run.js';
import {gold,heal,score,xp} from './score.js';
import {spawnPickup} from './waves.js';
import {CAMPAIGNS,SIDE,STAGES,WINGS} from '../table/content.js';
import {A} from '../ui/audio.js';
import {popup} from '../ui/ui.js';

/* ---------- quests ---------- */
export function quests(){const r=G.run;return r?[r.main].concat(r.side).filter(Boolean):[];}
export function qCur(q){return q.steps[q.si];}
export function qResume(q){const o=qCur(q);if(!o)return;if(o.t==='done'&&o.id==='wing'){G.run.wing.open=true;if(WINGS[G.run.wing.key].opensDoor)openDoor(true);}if(o.t==='boss')wakeBoss(o.boss);if(o.t==='collect')spawnPickup(o.tier,o.item||'relic',q);}
export function qBegin(q){const o=qCur(q);if(!o)return;q.prog=0;q.tl=o.time||0;qResume(q);relight();}
export function qAdd(q,n){const o=qCur(q);if(!o)return;q.prog+=n||1;G.dirty=true;
  if(q.prog<o.n&&o.n>1&&G.qxy){const s=o.id&&T.shots[o.id];float(G.qxy.x,G.qxy.y-34,(s?s.name.toUpperCase()+' ':'')+q.prog+'/'+o.n,q.main?'#ffd24a':'#9fe8ff',13);}
  if(q.prog>=o.n){q.si++;
    if(q.si>=q.steps.length)qFinish(q);
    else{qBegin(q);popup(q.main?(q.stages||STAGES)[q.si]||'Main Quest':'Quest Updated',qCur(q).text,q.main?'main':'quest');A.s('quest');if(q.main){score(20000);xp(25);saveRun();}}}
  relight();}
export function qEvent(kind,key,tier){for(const q of quests()){const o=qCur(q);if(!o||o.t!==kind)continue;
  if(kind==='kill'){if((o.e===key||o.e==='any')&&o.tier===tier)qAdd(q);}
  else if(kind==='collect'){if(key===q)qAdd(q);}
  else if((o.id||o.boss)===key)qAdd(q);}}
export function qFinish(q){const r=G.run;
  if(q.main){const c=CAMPAIGNS[q.key];r.main=null;score(250000);xp(150);gold(100);popup('Main Quest Complete',c.win,'main');A.s('victory');metaAdd('wins');
    r.threat++;r.won=(r.won||0)+1;
    if(G.opt.endless)later(7,()=>{if(G.run!==r||r.main)return;r.main=makeCampaign(r);qBegin(r.main);popup('A New Shadow Rises',r.main.name,'boss',r.main.text);saveRun();});
    else later(5,()=>{if(G.run===r&&G.mode!=='over')gameOver(true);});}
  else{r.side=r.side.filter(x=>x!==q);r.doneSide.push(q.id);r.questsDone++;if(r.bb)r.bb.quests++;const w=q.rw;score(25000);xp(w.xp||0);gold(w.gold||0);if(w.heal)heal(w.heal);
    let note=[w.gold?'+'+w.gold+' gold':'',w.xp?'+'+w.xp+' xp':''].filter(Boolean).join('  ');if(w.relic){const x=giveRelic();if(x)note+='  Relic: '+x.name;}
    popup('Quest Complete',q.name,'good',note);A.s('questDone');}
  saveRun();}
export function qFail(q){const r=G.run;r.side=r.side.filter(x=>x!==q);G.enemies.forEach(e=>{if(e.quest===q)e.quest=null;});G.pickups=G.pickups.filter(p=>p.quest!==q);popup('Quest Failed',q.name,'bad');relight();}
export function newSide(){const r=G.run;let pool=SIDE.filter(s=>!r.doneSide.includes(s.id)&&!r.side.some(q=>q.id===s.id));
  if(!pool.length){r.doneSide=[];pool=SIDE.filter(s=>!r.side.some(q=>q.id===s.id));}
  const s=pick(pool),q={id:s.id,name:s.name,giver:s.giver,text:s.text,steps:s.steps.map(o=>Object.assign({},o)),rw:s.rw,si:0,prog:0,tl:0};
  r.side.push(q);qBegin(q);popup('Quest Accepted',s.name,'quest',s.giver+': “'+s.text+'”');A.s('quest');return q;}
