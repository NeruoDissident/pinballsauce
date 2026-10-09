/* ================= WINGS =================
   Side rooms with their own flippers, a rule to meet and a clock. Rules: targets | kills | coins (content.wings). */
import {G,T,float} from '../core/state.js';
import {openDoor} from './events.js';
import {relight} from './lamps.js';
import {qEvent} from './quests.js';
import {giveRelic,saveRun} from './run.js';
import {gold,heal,score,xp} from './score.js';
import {heroBalls} from './spells.js';
import {WINGS,WING_KEYS} from '../table/content.js';
import {GT,WT0} from '../table/layout.js';
import {A} from '../ui/audio.js';
import {popup} from '../ui/ui.js';

export function wingOfTier(t){return t>GT?T.wings[WING_KEYS[t-WT0]]:null;}
export function wingReady(gate){const w=G.run.wing,d=w&&WINGS[w.key];return !!(d&&w.open&&!w.done&&d.gate===gate&&heroBalls().length===1&&!G.balls.some(b=>b.party)&&!G.fallen&&!G.mb);}
export function wingHoldsDoor(){const w=G.run&&G.run.wing;return !!(w&&w.key&&WINGS[w.key].opensDoor&&w.open&&!w.done);}
export function wingText(){const tw=wingOfTier(G.focusTier),d=WINGS[tw.key];return tw.seal[0].on?d.sealed(G.run.wing.key===tw.key?G.run.wing.prog||0:0):d.open;}
export function wingCoins(){const w=G.run.wing,tw=T.wings[w.key];G.pickups=G.pickups.filter(p=>!p.hoard);for(let i=w.prog||0;i<WINGS[w.key].need;i++){const c=tw.coins[i];G.pickups.push({x:c[0],y:c[1],tier:tw.tier,kind:'gold',hoard:true,quest:null,t:.3});}}
export function enterWing(hd){const w=G.run.wing,d=WINGS[w.key],tw=T.wings[w.key];hd.plan='tunnel';hd.tun=T.tunnels['in_'+w.key];hd.delay=.7;w.visits=(w.visits||0)+1;G.wingT=d.time*G.mods.hour;G.wingUrns=0;
  if(d.rule==='targets'){w.prog=0;T.banks[d.bank].segs.forEach(s=>s.lit=false);}
  tw.seal.forEach(s=>s.on=!(d.need&&(w.prog||0)>=d.need));if(d.rule==='coins')wingCoins();
  popup(d.name,d.enter,'boss',d.note);A.s('boss');G.flash=.5;G.flashC='#101010';}
export function breakSeal(){const w=G.run.wing,d=WINGS[w.key],tw=T.wings[w.key];if(!tw.seal[0].on)return;tw.seal.forEach(s=>{s.on=false;s.flash=1;});popup(d.broke[0],d.broke[1],'good');A.s('slam');G.cam.shake=Math.max(G.cam.shake,10);relight();}
export function wingProg(sec,x,y){const w=G.run.wing,d=WINGS[w.key];w.prog=(w.prog||0)+1;G.wingT+=sec;float(x,y-30,'+'+sec+'s',d.col,12);G.dirty=true;if(w.prog>=d.need)breakSeal();}
export function leaveWing(tier){G.enemies.forEach(e=>{if(e.tier===tier&&!e.quest)e.dead=true;});G.pickups=G.pickups.filter(p=>!p.hoard);if(!G.fallen)G.tilt=0;
  const w=G.run.wing,d=w&&WINGS[w.key];if(d&&!w.done)popup(d.backTitle||'Back to the table',d.back,'info');}
export function wingDone(h){const r=G.run,w=r.wing,d=WINGS[w.key];w.done=true;score(100000,h.x,h.y,d.label);xp(40);gold(60,h.x,h.y);heal(25);const x=giveRelic();
  popup(d.won,x?'Relic claimed: '+x.name:'Grave-gold spills out','main',x?x.desc:'');A.s('victory');G.flash=.7;G.flashC=d.col;G.save=Math.max(G.save,6);
  G.enemies.forEach(e=>{if(e.tier===T.wings[w.key].tier)e.dead=true;});G.pickups=G.pickups.filter(p=>!p.hoard);if(d.opensDoor)openDoor(false);qEvent('done','wing');saveRun();}
