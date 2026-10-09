/* ================= FOES =================
   Every foe has a job on the table (swarm, thief, hunter, possess, ritual, wall, duel, gate), a visible wind-up
   and a shot that answers it. A table lists its foes in content.foes; the jobs are played here. */
import {G,T,bolt,burst,float,focusBall,later} from '../core/state.js';
import {PI,clamp,lerp,pick,rand,shuffle} from '../core/util.js';
import {hitCircle} from '../physics/physics.js';
import {strikeBoss} from './bosses.js';
import {guardStruck,interceptor,liveGuards} from './party.js';
import {consecrate,endPower,explode} from './powers.js';
import {qEvent} from './quests.js';
import {charge,gold,heal,hurt,score,shot,xp} from './score.js';
import {endCast,spellCast,spellOn,spellVal} from './spells.js';
import {wingProg} from './wings.js';
import {ENEMY,WINGS} from '../table/content.js';
import {CX,NM,TY,tierOf} from '../table/layout.js';
import {A} from '../ui/audio.js';

/* ---------- enemies ---------- */
/* ---------- foes: every one has a job on the table ----------
   swarm: rises at the top and shambles down to the slingshot line, then strikes. thief: hops after loose loot or your purse and runs for an outlane with it.
   hunter: prowls a lane and lunges at the ball, batting it toward the outlanes. possess: sits on a bumper and deadens it until you shoot it through.
   ritual: chants at a ramp mouth; the ramp breaks the ritual. wall: holds an orbit entrance; weak hits bounce off. duel: guards the statue; weak hits are parried
   and answered. gate: holds a scoop and punts the ball; a hard hit staggers it. */
export function foePosts(tier){const P=T.posts||(T.posts={});if(P[tier])return P[tier];const y=TY[tier],main=tier<NM,cx=CX[tier],near=(l,x,yy)=>l.reduce((a,q)=>!a||Math.hypot(q.x-x,q.y-yy)<Math.hypot(a.x-x,a.y-yy)?q:a,null);
  const o={cx,line:main?y+690:y+430,
    rise:main?[[cx-120,y+400],[cx,y+392],[cx+120,y+400],[cx-60,y+372],[cx+60,y+372]]:T.spawn[tier].map(q=>q.slice()),
    mouths:T.mouths.filter(m=>tierOf(m.y)===tier).map(m=>({x:m.x-m.dx*30,y:m.y-m.dy*30,rail:m.rail})),
    orbits:T.sens.filter(q=>q.kind==='orbit'&&q.tier===tier).map(q=>({x:q.x+(q.x<cx?36:-36),y:q.y+170})), // in front of the lane, never inside it: a ball coming down the orbit must be able to get past
    outs:T.sens.filter(q=>q.kind==='outlane'&&q.tier===tier).map(q=>({x:q.x,y:q.y-34})),
    holes:Object.values(T.holes).filter(h=>h.tier===tier&&h.id!=='rise').map(h=>({x:h.x,y:h.y+36,id:h.id})),
    bumps:T.bumps.filter(b=>b.tier===tier&&!b.bell),near};
  return P[tier]=o;}
export function stepTo(e,x,y,max){const dx=x-e.x,dy=y-e.y,l=Math.hypot(dx,dy);return l<=max?[x,y]:[e.x+dx/l*max,e.y+dy/l*max];}
export function spawnEnemy(type,tier,quest,minion){const def=ENEMY[type],r=G.run,P=foePosts(tier),taken=(x,y,d)=>G.enemies.some(e=>!e.dead&&Math.hypot(e.ax-x,e.ay-y)<(d||50)),free=l=>shuffle(l).find(q=>!taken(q.x,q.y,40));
  let p=null,post=null;
  if(def.job==='swarm'){const c=shuffle(P.rise).find(q=>!taken(q[0],q[1],34));if(c)p=c;}
  else if(def.job==='possess'){const b=shuffle(P.bumps).find(b=>!b.poss||b.poss.dead);if(b)post={kind:'bump',b};}
  else if(def.job==='ritual'){const m=free(P.mouths);if(m)post={kind:'mouth',x:m.x,y:m.y,rail:m.rail};}
  else if(def.job==='wall'){const m=free(P.orbits);if(m)post={kind:'orbit',x:m.x,y:m.y};}
  else if(def.job==='duel'){const st=G.statues.find(q=>q.tier===tier),bo=G.boss&&G.boss.alive&&G.boss.tier===tier?G.boss:null,q=bo?{x:bo.x,y:bo.y+bo.r+34}:st?{x:st.x,y:st.y+st.r+30}:null;if(q&&!taken(q.x,q.y,30))post={kind:'guard',x:q.x,y:q.y};}
  else if(def.job==='gate'){const h=free(P.holes);if(h)post={kind:'hole',x:h.x,y:h.y,id:h.id};}
  if(!p&&post&&post.kind!=='bump')p=[post.x,post.y];
  const bz=G.boss&&G.boss.alive&&G.boss.tier===tier?G.boss:null;if(p&&bz&&Math.hypot(p[0]-bz.x,p[1]-bz.y)<bz.r+34)p=null;
  if(!p)for(const c of shuffle(T.spawn[tier])){if(taken(c[0],c[1],50))continue;if(bz&&Math.hypot(c[0]-bz.x,c[1]-bz.y)<bz.r+40)continue;if(G.pickups.some(q=>Math.hypot(q.x-c[0],q.y-c[1])<40))continue;if(G.balls.some(b=>b.st==='live'&&Math.hypot(b.x-c[0],b.y-c[1])<70))continue;p=c;break;}
  if(!p)return null;const th=1+.4*(r.threat-1);
  const e={type,def,job:def.job,tier,x:p[0],y:p[1],ax:p[0],ay:p[1],r:def.r,hr:def.r,hp:def.hp*th,maxHp:def.hp*th,armor:def.armor||0,spawn:.7,hitCd:0,wind:0,stun:0,ripCd:0,
    castT:def.cast?def.cast+rand(2):0,atk:rand(def.rate?def.rate[0]:9,def.rate?def.rate[1]:14),t:rand(9),flash:0,quest:quest||null,minion:!!minion,hopT:rand(2,3.5),hop:1,post,state:post&&post.kind==='bump'?'drift':'idle',goal:null,want:null,loot:null,lunge:0,lungeCd:rand(2,4),dead:false};
  if(def.prowl)e.ax=clamp(p[0],P.cx-110,P.cx+110);
  G.enemies.push(e);burst(e.x,e.y,8,'#7dffb0',120,.8);return e;}
export function foeEscape(e){e.dead=true;float(e.x,e.y-30,'GOT AWAY'+(e.loot&&e.loot.gold?' WITH '+e.loot.gold+' GOLD':''),'#ffd24a',13);A.s('deny');burst(e.x,e.y,8,'#6f9a4a',120,.6);if(G.boss&&e.minion)G.boss.minions--;}
export function foeStrike(e,fb){const d=e.def,r=G.run,th=1+.4*(r.threat-1);
  if(e.tgt&&e.tgt.hp>0){guardStruck(e.tgt,d.dmg*th,e);burst(e.x,e.y+20,8,'#ff5a5a',200,.5);return;}if(!fb)return;
  if(spellOn('smoke')||spellOn('cloak')){float(fb.x,fb.y-26,'LOST IN THE SMOKE','#b08cff',12);return;}
  if(spellOn('shieldWall')){const k=spellVal('shieldWall','ref'),st=spellVal('shieldWall','stun');bolt(fb,e);float(fb.x,fb.y-26,'BLOCKED','#8fb0d8',13);A.s('clank');if(st){e.wind=0;e.stun=Math.max(e.stun,st);}damageEnemy(e,d.dmg*th*k,false);return;}
  {const cb=spellCast('barrier');if(cb&&e.job!=='thief'){cb.hits--;float(fb.x,fb.y-26,cb.hits>0?'ABSORBED ('+cb.hits+')':'BARRIER BREAKS','#9fe8ff',13);A.s('ward');if(cb.hits<=0){cb.broke=true;const k=spellVal('barrier','boom');for(const q of G.enemies){if(q.dead||q.spawn>0||q.tier!==fb.tier||Math.hypot(q.x-fb.x,q.y-fb.y)>150+q.r)continue;q.wind=0;q.stun=Math.max(q.stun,1);damageEnemy(q,G.mods.pow*2*k,false);}G.booms.push({x:fb.x,y:fb.y,r:150,t:0,c:'#9fe8ff'});endCast(cb);}return;}}
  {const t=interceptor();if(t&&e.job!=='thief'){t.ready=12;guardStruck(t,d.dmg*th*.7,e);float(fb.x,fb.y-26,'INTERCEPTED','#8fb0d8',13);A.s('clank');return;}}
  if(G.zones.some(z=>!z.fire&&!z.pyre&&Math.hypot(fb.x-z.x,fb.y-z.y)<z.r+fb.r)||G.buffs.hallow>0||(G.mods.phaseWard&&G.phase>0)){float(fb.x,fb.y-26,'WARDED','#ffe0a0',13);A.s('ward');return;}
  bolt(e,fb);burst(fb.x,fb.y,8,'#ff5a5a',200,.5);
  if(e.job==='thief'){const n=Math.min(r.gold,4+r.level*2);if(n>0){r.gold-=n;e.loot={kind:'gold',gold:n};e.hopT=0;float(e.x,e.y-36,'-'+n+' GOLD STOLEN','#ffd24a',13);A.s('deny');G.dirty=true;return;}}
  hurt(d.dmg*th);float(e.x,e.y-36,d.name.toUpperCase()+' STRIKES','#ff8a8a',12);}
export function ritualBroken(e){if(e.dead||e.spawn>0)return;e.castT=e.def.cast+1;e.stun=Math.max(e.stun,3);float(e.x,e.y-40,'RITUAL BROKEN','#9fe8ff',14);A.s('interrupt');score(3000,e.x,e.y);charge(2,'hit');damageEnemy(e,G.mods.pow*1.5,false);}
export function updateEnemies(dt){const fb=focusBall(),live=G.balls.filter(b=>b.st==='live'),act=G.balls.length&&!G.fallen&&!G.hidden&&!G.inGrave,r=G.run,th=1+.4*(r.threat-1);
  for(const e of G.enemies){if(e.dead)continue;e.t+=dt;if(e.spawn>0){e.spawn-=dt;continue;}if(e.hitCd>0)e.hitCd-=dt;if(e.ripCd>0)e.ripCd-=dt;if(e.flash>0)e.flash-=dt*4;if(e.stun>0){e.stun-=dt;e.wind=0;}
    const d=e.def,P=foePosts(e.tier),onT=act&&e.tier===G.focusTier;e.moving=false;
    if(e.marked>0)e.marked-=dt;if(e.poison>0){e.poison-=dt;e.dot=(e.dot||0)+dt;if(e.dot>=1){e.dot=0;damageEnemy(e,G.mods.pow*.35,false);if(e.dead)continue;}}
    if(G.mods.toll&&e.job==='swarm'&&e.state==='hold'&&onT){e.tollT=(e.tollT||0)+dt;if(e.tollT>=1){e.tollT=0;damageEnemy(e,G.mods.pow*G.mods.toll,false);if(e.dead)continue;}}
    if(e.stun<=0)switch(e.job){
    case 'swarm':{if(spellOn('smoke')&&spellVal('smoke','lost')){e.state='hold';break;}const gs=liveGuards(e.tier);let g=null,gd=1e9;for(const q of gs){const dd=Math.hypot(q.p.x-e.x,q.p.y-e.y);if(dd<gd){gd=dd;g=q;}}e.tgt=g?g.c:null;
      const tx=g?g.p.x:e.ax,ty=g?g.p.y-g.p.r-e.r-4:P.line,sp=d.speed*(1+.15*(r.threat-1));
      if(e.y<ty-2||(g&&Math.abs(e.x-tx)>3)){e.y=Math.min(ty,e.y+sp*dt);e.x+=clamp(tx-e.x,-sp*dt,sp*dt);e.moving=true;e.state='walk';}else e.state='hold';break;}
    case 'hunter':{if(e.lunge>0){e.lunge-=dt;const k=1-Math.max(0,e.lunge)/.4,hb=live.find(b=>b.tier===e.tier&&Math.hypot(b.x-e.tx,b.y-e.ty)<160);if(hb){e.tx=clamp(hb.x,40,600);e.ty=clamp(hb.y,TY[e.tier]+300,P.line+60);}e.x=lerp(e.lx,e.tx,k);e.y=lerp(e.ly,e.ty,k);e.moving=true;e.state='lunge';
        const bite=live.find(b=>b.tier===e.tier&&Math.hypot(b.x-e.x,b.y-e.y)<b.r+e.r+(e.lunge<=0?30:6));
        if(e.lunge<=0||bite){e.lunge=0;e.lungeCd=e.frenzy?rand(1.5,2.5):rand(5,7);e.state='prowl';e.ax=clamp(e.x-Math.sin(e.t*.9)*88,P.cx-110,P.cx+110);e.ay=clamp(e.y-Math.sin(e.t*1.9)*12,TY[e.tier]+330,P.line);
          for(const b of live){if(b!==bite)continue;const o=P.near(P.outs,b.x,b.y),sx=o?(Math.sign(o.x-b.x)||1):(b.x<P.cx?-1:1);
            b.vx=sx*rand(230,310);b.vy=Math.max(b.vy,0)+rand(170,250);burst(b.x,b.y,10,'#ff5a5a',220,.5);hurt(d.dmg*th);float(e.x,e.y-36,'BATTED','#ff8a8a',13);break;}}}
      else{e.lungeCd-=dt;e.x=e.ax+Math.sin(e.t*.9)*88;e.y=e.ay+Math.sin(e.t*1.9)*12;e.state='prowl';e.moving=true;
        if(onT&&e.lungeCd<=0){const b=live.find(b=>b.tier===e.tier&&Math.hypot(b.x-e.x,b.y-e.y)<(e.frenzy?270:150));if(b){e.lunge=.4;e.lx=e.x;e.ly=e.y;e.tx=clamp(b.x+b.vx*.22,40,600);e.ty=clamp(b.y+b.vy*.22,TY[e.tier]+300,P.line+40);float(e.x,e.y-34,'LUNGE','#ff8a8a',12);A.s('kick');}}}break;}
    case 'thief':{if(e.hop<1){e.hop=Math.min(1,e.hop+dt*3.5);e.x=lerp(e.fx,e.ax,e.hop);e.y=lerp(e.fy,e.ay,e.hop)-Math.sin(e.hop*PI)*18;e.moving=true;e.state='hop';
        if(e.hop>=1){if(e.goal==='loot'){const q=e.want;if(q&&G.pickups.includes(q)&&Math.hypot(q.x-e.x,q.y-e.y)<30){G.pickups=G.pickups.filter(x=>x!==q);e.loot={kind:q.kind,gold:0};float(e.x,e.y-34,'SNATCHED','#ffd24a',13);A.s('pickup');}e.goal=null;}
          else if(e.goal==='flee'){const o=e.want;if(o&&Math.hypot(o.x-e.x,o.y-e.y)<30)foeEscape(e);}}}
      else{e.hopT-=dt;e.state='idle';if(e.hopT<=0){let c=null;
          if(e.loot){e.goal='flee';e.hopT=rand(.6,1);const o=P.near(P.outs,e.x,e.y);if(o){e.want=o;c=stepTo(e,o.x,o.y,110);}}
          else{const q=G.pickups.filter(q=>q.tier===e.tier&&!q.quest&&!q.hoard&&q.t>.5).sort((a,b)=>Math.hypot(a.x-e.x,a.y-e.y)-Math.hypot(b.x-e.x,b.y-e.y))[0];
            if(q){e.goal='loot';e.want=q;e.hopT=rand(.6,1);c=stepTo(e,q.x,q.y,110);}else{e.goal=null;e.hopT=rand(2.4,3.6);const q2=pick(T.spawn[e.tier]);if(!G.enemies.some(o=>o!==e&&!o.dead&&Math.hypot(o.ax-q2[0],o.ay-q2[1])<50))c=q2;}}
          if(c){e.fx=e.x;e.fy=e.y;e.ax=c[0];e.ay=c[1];e.hop=0;}}}break;}
    case 'possess':{const b=e.post&&e.post.b;if(b&&(!b.poss||b.poss===e)){if(e.state!=='sit'){const dx=b.x-e.x,dy=b.y-e.y,l=Math.hypot(dx,dy);if(l<3){e.state='sit';b.poss=e;e.ax=b.x;e.ay=b.y;e.hr=b.r+13;float(b.x,b.y-30,'POSSESSED','#9be8e0',12);}else{const sp=Math.min(l,70*dt);e.x+=dx/l*sp;e.y+=dy/l*sp;e.moving=true;e.state='drift';}}
        else{e.x=b.x+Math.sin(e.t*2)*3;e.y=b.y+Math.cos(e.t*1.6)*3;}}
      else{e.x=e.ax+Math.sin(e.t*.7)*44;e.y=e.ay+Math.cos(e.t*.5)*28;e.state='float';}break;}
    case 'gate':e.x=e.ax+Math.sin(e.t*.5)*(e.post?8:30);e.state='hold';break;
    case 'ritual':e.state=e.castT<d.cast*.85?'chant':'hold';break;
    default:e.state='hold';}
    // the wind-up: a strike you can see coming, and stop
    const busy=e.state==='walk'||e.state==='hop'||e.state==='drift'||e.state==='lunge'||(e.job==='thief'&&e.loot);
    if(d.wind&&onT&&e.stun<=0&&!busy){if(e.wind>0){e.wind-=dt*((G.mods.lantern&&r.cls==='cleric'||spellOn('warcry'))&&fb&&Math.hypot(fb.x-e.x,fb.y-e.y)<170?.55:1);if(e.wind<=0)foeStrike(e,fb);}else{e.atk-=dt;if(e.atk<=0){e.atk=rand(d.rate[0],d.rate[1]);e.wind=d.wind;A.s('clank');}}}
    else if(e.wind>0)e.wind=0;
    if(d.cast&&onT&&e.stun<=0){e.castT-=dt;if(e.castT<=0){e.castT=d.cast;bolt(e,fb);hurt(10*th);G.curse[pick(['dark','weak','hex'])]=10;float(e.x,e.y-34,'CURSED','#c08cff',13);A.s('curse');}}}
  if(G.enemies.some(e=>e.dead)){for(const e of G.enemies)if(e.dead){if(e.post&&e.post.b&&e.post.b.poss===e)e.post.b.poss=null;if(e.wave&&!e.wc){e.wc=1;e.wave.left--;}}G.enemies=G.enemies.filter(e=>!e.dead);}
  for(const q of G.statues){if(q.flash>0)q.flash-=dt*4;if(q.cool>0)q.cool-=dt;}}
export function damageEnemy(e,dmg,crit){if(e.dead||e.spawn>0)return false;e.hp-=dmg;e.flash=1;float(e.x,e.y-e.r-6,(crit?'CRIT ':'')+Math.round(dmg),crit?'#ffb040':'#ffffff',crit?15:12);
  if(e.hp<=0){killEnemy(e);return true;}return false;}
export function strikeEnemy(e,b,imp,sure){const r=G.run,m=G.mods,pw=b&&b.pow?r.cls:null,th=1+.4*(r.threat-1);
  if(e.job==='duel'&&!pw&&e.stun<=0&&imp<430&&!sure){A.s('clank');float(e.x,e.y-26,'PARRIED','#cfd8e0',12);if(b){b.vx*=1.35;b.vy*=1.35;}if(e.ripCd<=0&&e.tier===G.focusTier){e.ripCd=1.5;hurt(6*th);float(e.x,e.y-42,'RIPOSTE','#ff8a8a',13);}return false;}
  if(e.wind>0){e.wind=0;e.stun=Math.max(e.stun,1.2);float(e.x,e.y-40,'STAGGERED','#9fe8ff',13);score(500);charge(1,'hit');}
  else if(e.job==='gate'&&imp>700&&e.stun<=0){e.stun=4;float(e.x,e.y-40,'STAGGERED','#9fe8ff',14);A.s('slam');}
  if(pw){e.armor=0;if(pw==='mage'){endPower(b);explode(e.x,e.y);if(e.dead)return true;}else if(pw==='cleric'){endPower(b);consecrate(e.x,e.y);}}
  if(e.armor>0){if(m.pierce){e.armor=0;float(e.x,e.y-26,'ARMOR SHATTERED','#cfd8e0',12);}
    else if(imp>500){e.armor--;e.flash=1;A.s('clank');float(e.x,e.y-26,e.armor?'ARMOR CRACKED':'ARMOR BROKEN','#cfd8e0',12);burst(e.x,e.y,6,'#cfd8e0',200,.5);charge(1,'hit');return false;}
    else{A.s('clank');float(e.x,e.y-26,'CLANG','#8a96a3',11);return false;}}
  const crit=sure||pw==='rogue'||G.buffs.stealth>0||e.marked>0||b&&(b.party==='dps'||b.spell==='markedPrey')||spellOn('markedPrey')||(sure&&spellVal('cloak','crit')>0)||Math.random()<m.crit+spellVal('smoke','crit')||(r.cls==='rogue'&&G.combo>1&&G.comboT>0);
  if(sure&&spellOn('cloak')&&spellVal('cloak','gold'))gold(spellVal('cloak','gold'),e.x,e.y);
  if(b&&(b.spell==='warcry'||b.spell==='shieldWall')){e.wind=0;e.stun=Math.max(e.stun,.8);}
  if(spellOn('warcry')){e.wind=0;e.stun=Math.max(e.stun,spellVal('warcry','stun'));const ck=spellVal('warcry','crack');if(ck&&e.armor>0){e.armor=Math.max(0,e.armor-ck);float(e.x,e.y-26,'ARMOR CRACKED','#cfd8e0',12);}}
  if(spellOn('markedPrey'))e.marked=Math.max(e.marked||0,spellVal('markedPrey','mark'));
  if(spellOn('radiance')){heal(3);if(spellVal('radiance','cleanse'))for(const k in G.curse)if(G.curse[k]>0){G.curse[k]=0;break;}}
  let dmg=m.pow*clamp(imp/800,.55,1.6);if(e.def.undead&&r.cls==='cleric')dmg*=m.smite?2:1.5;if(sure&&m.cutpurse){gold(m.cutpurse,e.x,e.y);}if(m.stagger&&r.cls==='knight'){e.wind=0;e.stun=Math.max(e.stun,.8);}
  if(pw==='knight'){dmg*=2.5;if(++b.pow.hits>=4)endPower(b);const tr=spellVal('charge','stun');if(tr){e.wind=0;e.stun=Math.max(e.stun,tr);}}else if(pw==='rogue'){dmg*=1.5;G.buffs.stealth=Math.max(G.buffs.stealth||0,.1);endPower(b);float(e.x,e.y-44,'BACKSTAB','#c9a6ff',14);if(m.marked)e.marked=m.marked;}if(G.buffs.sharp>0)dmg*=1.25;
  if(e.def.cast&&e.castT<e.def.cast*.6){e.castT=e.def.cast+1;float(e.x,e.y-40,'SPELL INTERRUPTED','#9fe8ff',13);A.s('interrupt');if(r.cls==='mage')dmg*=3;score(2000);}
  if(crit)dmg*=2;if(e.stun>0)dmg*=1.5;A.s('hit');charge(1,'hit');score(300);if(e.atk<3.5)e.atk=3.5;if(crit){if(m.critCharge)r.charge=Math.min(100,r.charge+m.critCharge);if(m.poison)e.poison=m.poison;}return damageEnemy(e,dmg,crit);}
export function killEnemy(e){const r=G.run;e.dead=true;r.kills++;if(r.bb)r.bb.kills++;if(e.marked>0&&spellOn('markedPrey')&&spellVal('markedPrey','refund'))r.charge=Math.min(100,r.charge+spellVal('markedPrey','refund'));if(G.mods.deathWish)r.charge=Math.min(100,r.charge+G.mods.deathWish);if(e.loot){if(e.loot.gold){r.gold+=e.loot.gold;float(e.x,e.y-48,'+'+e.loot.gold+' GOLD RECOVERED','#ffd24a',13);}else G.pickups.push({x:e.x,y:e.y,tier:e.tier,kind:e.loot.kind,t:0,quest:null});}if(e.post&&e.post.b&&e.post.b.poss===e)e.post.b.poss=null;score(1000*r.level,e.x,e.y);xp(e.def.xp);gold(e.def.gold*(1+G.mods.killGold),e.x,e.y);if(G.mods.healKill)heal(G.mods.healKill);
  charge(1,'kill');A.s('kill');burst(e.x,e.y,16,e.def.undead?'#9dffc8':'#ff8a6a',260,.9);if(G.boss&&e.minion)G.boss.minions--;
  if(Math.random()<.12)later(.05,()=>{G.pickups.push({x:e.x,y:e.y,tier:e.tier,kind:'heart',t:0,quest:null});});
  if(e.pack&&r.wing.key&&WINGS[r.wing.key].rule==='kills'&&!r.wing.done&&T.wings[r.wing.key].seal[0].on)wingProg(8,e.x,e.y);
  G.qxy={x:e.x,y:e.y};qEvent('kill',e.type,e.tier);G.qxy=null;}
export function collideActors(b){
  for(const e of G.enemies){if(e.spawn>0||e.dead||Math.abs(e.y-b.y)>60)continue;if(e.job==='gate'&&b.noHole>0)continue; // a ball leaving a scoop slips past the troll that holds it
    if(e.def.ghost||G.phase>0||b.phased){const dx=b.x-e.x,dy=b.y-e.y,rr=b.r+(e.hr||e.r);if(dx*dx+dy*dy<rr*rr&&e.hitCd<=0){e.hitCd=.45;strikeEnemy(e,b,Math.hypot(b.vx,b.vy),G.phase>0);}continue;}
    const pvx=b.vx,pvy=b.vy,imp=hitCircle(b,e,e.r,.35);
    if(imp>30&&e.hitCd<=0){e.hitCd=.12;const plow=b.pow&&G.run.cls==='knight';if(strikeEnemy(e,b,imp)||plow){b.vx=pvx*(plow?.94:.82);b.vy=pvy*(plow?.94:.82);}else{const k=e.def.kick&&e.stun<=0?420:e.job==='wall'?220:90;b.vx+=b._nx*k;b.vy+=b._ny*k;if(e.def.kick&&e.stun<=0)A.s('kick');}}}
  const bo=G.boss;if(bo&&bo.alive&&Math.abs(bo.y-b.y)<90){const imp=hitCircle(b,bo,bo.r,b.y>bo.y?.14:.3);if(imp>30&&bo.hitCd<=0){bo.hitCd=.15;strikeBoss(bo,b,imp);}}
  for(const s of G.statues){if(!s.on||Math.abs(s.y-b.y)>50)continue;const imp=hitCircle(b,s,s.r,.5);if(imp>60&&s.cool<=0){s.cool=.2;s.flash=1;score(600);A.s('target');charge(1,'hit');shot(s.id,s.x,s.y);}}}
