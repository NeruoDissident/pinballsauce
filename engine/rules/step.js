/* ================= ONE STEP OF THE GAME =================
   gameStep(dt) is the whole simulation: plunger, physics, balls, powers, foes, boss, pickups, rules, effects.
   Also the attract-mode bot. */
import {G,T,focusBall} from '../core/state.js';
import {clamp,lerp,rand} from '../core/util.js';
import {physics} from '../physics/physics.js';
import {setFlip,updateBalls,updatePlunger} from './ball.js';
import {updateBoss} from './bosses.js';
import {openChoice} from './choices.js';
import {openDoor} from './events.js';
import {updateEnemies} from './foes.js';
import {relight} from './lamps.js';
import {updateParty} from './party.js';
import {updatePowers} from './powers.js';
import {qFail} from './quests.js';
import {updateRally} from './rally.js';
import {startDemo} from './run.js';
import {hurt} from './score.js';
import {updateSpells} from './spells.js';
import {manageSpawns,updatePickups} from './waves.js';
import {wingHoldsDoor} from './wings.js';
import {RULES,TEXT,WINGS,WING_KEYS} from '../table/content.js';
import {FY,GT,H,HW,WT0,tierOf} from '../table/layout.js';
import {A} from '../ui/audio.js';
import {popup} from '../ui/ui.js';

/* ---------- per-frame ---------- */
export function updateRules(dt){const r=G.run;r.time+=dt;
  if(G.save>0&&!G.plunge.ready){G.save-=dt;if(G.save<=0)G.dirty=true;}
  for(const k in G.buffs)if(G.buffs[k]>0){G.buffs[k]-=dt;if(G.buffs[k]<=0)G.dirty=true;}
  for(const k in G.curse)if(G.curse[k]>0){G.curse[k]-=dt;if(G.curse[k]<=0)G.dirty=true;}
  if(G.curse.burn>0){G.burnAcc=(G.burnAcc||0)+dt;if(G.burnAcc>=1){G.burnAcc=0;hurt(3);}}
  G.flipPow=G.mods.flip*(G.curse.weak>0?.84:1);
  if(G.comboT>0){G.comboT-=dt;if(G.comboT<=0)G.combo=0;}if(G.lampShow>0)G.lampShow-=dt;if(G.demo&&G.mode==='title'&&(G.demoT-=dt)<=0)startDemo();
  if(G.mods.kickRelight&&!r.kickback){G.kickT-=dt;if(G.kickT<=0){r.kickback=true;relight();}}
  if(G.doorT>0){G.doorT-=dt;if(G.doorT<=0){if(wingHoldsDoor())G.doorT=0;else openDoor(false);}}
  if(RULES.tick)RULES.tick(dt,r); // the table's own timers
  for(const id in T.banks){const B=T.banks[id];if(B.reset>0){B.reset-=dt;if(B.reset<=0&&!B.door&&id!=='nails')B.segs.forEach(s=>s.on=true);}}
  if(G.inGrave&&G.graveLive&&G.tilt<=0){G.graveT-=dt;G.dirty=true;if(G.graveT<=0){G.graveT=0;G.tilt=1e9;popup(TEXT.graveClosed[0],TEXT.graveClosed[1],'bad');A.s('tilt');}}
  if(G.focusTier>GT&&G.tilt<=0&&G.balls.some(b=>b.st==='live'&&b.tier===G.focusTier)){G.wingT-=dt;G.dirty=true;if(G.wingT<=0){const d=WINGS[WING_KEYS[G.focusTier-WT0]];G.wingT=0;G.tilt=1e9;popup(d.late[0],d.late[1],'bad');A.s('tilt');}}
  for(const q of r.side.slice())if(q.tl>0&&!G.inGrave&&G.focusTier<=GT){q.tl-=dt;G.dirty=true;if(q.tl<=0)qFail(q);}
  G.spawnT-=dt;if(G.spawnT<=0){G.spawnT=.6;manageSpawns();}updateParty(dt);updateSpells(dt);updateRally(dt);
  const f=focusBall();if(f){const ft=tierOf(f.y);if(ft!==G.focusTier){G.focusTier=ft;relight();}}
  if(G.pending.length&&!G.choice&&!G.sub&&G.mode!=='over'&&!(G.run.main===null&&!G.opt.endless)&&(G.opt.autoPick||G.plunge.ready||G.balls.some(b=>b.st==='held'||b.st==='tunnel')||!G.balls.some(b=>b.st==='live')))openChoice(G.pending.shift());}
export function updateFx(dt){
  for(const p of G.parts){p.life+=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=300*dt;p.vx*=1-dt*2;}
  if(G.parts.length)G.parts=G.parts.filter(p=>p.life<p.max);
  for(const f of G.floats){f.t+=dt;f.y-=28*dt;}if(G.floats.length&&G.floats[0].t>1.3)G.floats=G.floats.filter(f=>f.t<1.3);
  for(const b of G.bolts)b.t+=dt;if(G.bolts.length)G.bolts=G.bolts.filter(b=>b.t<.35);
  for(const b of G.booms)b.t+=dt;if(G.booms.length)G.booms=G.booms.filter(b=>b.t<.5);
  if(G.hurtT>0)G.hurtT-=dt;if(G.flash>0)G.flash-=dt*1.6;if(G.nudgeT>0)G.nudgeT-=dt;}
export function updateCam(dt){const c=G.cam,vh=c.viewH,b=focusBall();
  if(b){let ty=b.y-vh*.52+clamp(b.st==='live'?b.vy*.08:0,-90,110);const tier=tierOf(b.y),yF=FY[tier];
    if((b.st==='live'||b.st==='held')&&b.y<yF+60){const w=clamp((b.y-(yF-640))/260,0,1);ty=lerp(ty,Math.min(yF+125-vh,b.y-vh*.12),w*w*(3-2*w));}
    c.ty=ty;}
  const ty=clamp(c.ty,c.top||0,Math.max(c.top||0,(G.inGrave?HW:H)+12-vh));c.y+=(ty-c.y)*(1-Math.exp(-dt*6.5));if(c.shake>0)c.shake=Math.max(0,c.shake-dt*45);}
export function botStep(dt){const B=G.bot;let l=false,r=false;
  for(const f of T.flips)for(const b of G.balls){if(b.st!=='live')continue;const dx=(b.x-f.x)*f.dir,dy=b.y-f.y;
    if(dx>(f.side<0?B.tl:B.tr)&&dx<90&&dy>-34-b.vy*.02&&dy<30&&b.vy>-150){if(f.side<0)l=true;else r=true;}}
  if(!(B.crT>0)&&G.run.charge>=33&&G.tilt<=0)for(const f of T.flips)for(const b of G.balls){if(b.st!=='live'||b.arm||b.pow)continue;const dx=(b.x-f.x)*f.dir,dy=b.y-f.y;
    if(dx>-14&&dx<34&&dy>-46&&dy<6&&b.vy>0&&Math.hypot(b.vx,b.vy)<430&&Math.random()<.04){B.crT=2.1;B.crS=f.side;}}
  if(l&&B.hl<=0){B.hl=.16;B.tl=rand(12,66);}if(r&&B.hr<=0){B.hr=.16;B.tr=rand(12,66);}
  if(B.crT>0){B.crT-=dt;const up=B.crT>.5||B.crT<.14;if(B.crS<0){B.hl=up?.2:0;}else{B.hr=up?.2:0;}}
  if(B.hl>0)B.hl-=dt;if(B.hr>0)B.hr-=dt;setFlip(-1,B.hl>.03);
  if(G.plunge.ready){B.pl+=dt;G.in.n=B.pl<B.plT;if(B.pl>B.plT+.15){B.pl=0;B.plT=rand(.25,.95);}setFlip(1,false);}
  else{G.in.n=false;B.pl=0;setFlip(1,B.hr>.03);}}
export function gameStep(dt){G.t+=dt;
  if(G.paused||G.choice){updateCam(dt);return;}
  let s=dt;if(G.slow>0){G.slow-=dt;s=dt*.4;}
  if(G.queue.length){const due=[],gen=G.gen;G.queue=G.queue.filter(q=>{q.t-=s;if(q.t<=0){due.push(q);return false;}return true;});for(const q of due)if(G.gen===gen)q.fn();}
  if(G.run&&G.mode!=='over'){
    if(G.bot)botStep(s);
    updatePlunger(s);physics(s);updateBalls(s);updatePowers(s);updateEnemies(s);updateBoss(s);updatePickups(s);updateRules(s);}
  updateFx(s);updateCam(dt);}
