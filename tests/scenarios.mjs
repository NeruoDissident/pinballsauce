/* Replay scenarios. A scenario is a class, a companion, a seed and a fixed script of pushes (dev keys, gold, nudges,
   manual flips, menu picks, saves). The same inputs must give the same game, step for step: that is the engine's
   regression test (tests/replay.mjs). The Gravebound golden trace was recorded from the ORIGINAL Gravebound 0.21
   with exactly this file, so do not change the digest or the scripts without re-recording on purpose. */
export const SCEN=[
  {name:'knight-tank-dev',cls:'knight',comp:'tank',seed:101,dev:true,endless:true},
  {name:'rogue-dps-dev',cls:'rogue',comp:'dps',seed:202,dev:true,endless:true},
  {name:'mage-healer-dev',cls:'mage',comp:'healer',seed:303,dev:true,endless:true},
  {name:'cleric-alone-dev',cls:'cleric',comp:null,seed:404,dev:true,endless:true},
  {name:'knight-natural',cls:'knight',comp:'healer',seed:505,dev:false,endless:false},
  {name:'mage-natural',cls:'mage',comp:null,seed:606,dev:false,endless:false},
  {name:'rogue-health',cls:'rogue',comp:'tank',seed:707,dev:true,endless:true,hp:true},
  {name:'cleric-manual',cls:'cleric',comp:'dps',seed:808,dev:true,endless:true,manual:true},
  {name:'mage-rich',cls:'mage',comp:'dps',seed:909,dev:true,endless:true,rich:true},
  {name:'knight-rich-pick',cls:'knight',comp:'healer',seed:1010,dev:true,endless:false,rich:true,autoPick:true},
  {name:'rogue-tilt',cls:'rogue',comp:null,seed:1111,dev:true,endless:true,tilt:true,rich:true},
  {name:'cleric-rich',cls:'cleric',comp:'tank',seed:1212,dev:true,endless:true,rich:true,hp:true},
  {name:'knight-choose',cls:'knight',comp:'dps',seed:1313,dev:true,endless:true,rich:true,choose:true,interrupt:true},
  {name:'mage-interrupt',cls:'mage',comp:'tank',seed:1414,dev:true,endless:true,interrupt:true,hp:true},
  {name:'rogue-resume',cls:'rogue',comp:'healer',seed:1515,dev:true,endless:true,resume:true,rich:true,choose:true},
  {name:'cleric-interrupt',cls:'cleric',comp:'healer',seed:1616,dev:true,endless:false,interrupt:true,rich:true},
  {name:'knight-boss',cls:'knight',comp:'tank',seed:1717,dev:true,soft:true,endless:true,interrupt:true,rich:true},
  {name:'rogue-boss',cls:'rogue',comp:'dps',seed:1818,dev:true,soft:true,endless:true,interrupt:true,hp:true},
  {name:'mage-boss',cls:'mage',comp:'healer',seed:1919,dev:true,soft:true,endless:true,rich:true},
  {name:'cleric-boss',cls:'cleric',comp:null,seed:2020,dev:true,soft:true,endless:true,interrupt:true,rich:true,choose:true}
];
// runs before the page's own scripts: the frame loop never starts, and random numbers are seeded and counted
export const init=seed=>{window.requestAnimationFrame=()=>0;let s=seed>>>0;window.__rng={calls:0,seed(v){s=v>>>0;this.calls=0;}};
  Math.random=()=>{window.__rng.calls++;s=(s+0x6D2B79F5)>>>0;let t=s;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return ((t^(t>>>14))>>>0)/4294967296;};};
// runs in the page: plays the scenario and returns a digest of the simulation every `every` steps
export const run=([sc,mins,every,win])=>{
  const P=window.__pb.api;
  const G_=P.G;P.hold(true);P.setQuality('low',true);
  const boot=window.__rng.calls;window.__rng.seed(sc.seed);if(G_.t!==0)throw new Error('the frame loop ran before the test: G.t='+G_.t);
  G_.opt.endless=!!sc.endless;G_.opt.autoPick=!!sc.autoPick;G_.playerHp=sc.hp?true:undefined;
  const bot=()=>({hl:0,hr:0,tl:30,tr:30,pl:0,plT:.7});
  const begin=()=>{P.UI.menu(null);P.startRun(sc.cls,sc.comp);G_.auto=!sc.choose;P.DEV.on=true;if(!sc.manual)G_.bot=bot();if(sc.rich)G_.run.gold+=400;};
  begin();G_.stuck=[];
  const samples=[],err=[];let runs=1,full=null;
  const num=v=>typeof v==='number'?v.toString():String(v);
  const digest=()=>{const a=[],r=G_.run;
    a.push(window.__rng.calls,G_.t,r.score,r.hp,r.charge,r.xp,r.level,r.gold,r.mult,r.kills,r.ballsLeft,G_.tilt>0?1:0,G_.save,G_.combo,G_.focusTier,G_.balls.length,G_.enemies.length,G_.pickups.length,G_.zones.length,G_.casts.length,G_.queue.length,G_.pending.length,(r.recruits||[]).length,(r.perks||[]).join('+'),(r.relics||[]).join('+'),r.main?r.main.si:-1,r.questsDone);
    for(const b of G_.balls)a.push(b.x,b.y,b.vx,b.vy,b.st,b.rs||0,b.rv||0,b.tier,b.arm||0,b.cr||0,b.party||'');
    for(const e of G_.enemies)a.push(e.type,e.x,e.y,e.hp,e.state,e.wind,e.stun);
    const bo=G_.boss;if(bo)a.push(bo.key,bo.hp,bo.phase,bo.pt,bo.x,bo.y);
    for(const c of r.party||[])a.push(c.id,c.hp);for(const c of G_.casts)a.push(c.id,c.t);
    for(const f of P.T.flips)a.push(f.a);
    const str=a.map(num).join(',');let h1=0x811c9dc5,h2=0x1b873593;for(let i=0;i<str.length;i++){const c=str.charCodeAt(i);h1=Math.imul(h1^c,16777619);h2=Math.imul(h2^c,0x85ebca6b)+c|0;}
    return {h:(h1>>>0).toString(16)+(h2>>>0).toString(16),str};};
  const n=Math.round(mins*60*120);
  try{for(let i=0;i<n;i++){
      if(i%180===0){const k=i/180; // every 1.5 s of game time: the same pushes the original soak test makes
        if(G_.mode==='over'){begin();runs++;}
        if(sc.dev){const mq=G_.run.main,ms=mq&&mq.steps[mq.si];if(k%20===10&&!(sc.soft&&ms&&ms.t==='boss'))P.devKey('dn');if(k%47===30)P.devKey('dg');if(k%61===40)P.devKey('db');if(k%83===70)P.devKey('d'+(1+k%3));if(k%71===50)P.devKey('d'+(5+(k/71|0)%3));if(k%9===4)G_.run.charge=100;}
        if(sc.rich&&k%40===7)G_.run.gold+=120;
        if(sc.tilt&&k%53===20){for(let q=0;q<5;q++)P.nudge();}
        if(sc.interrupt){const bo=G_.boss,b=G_.balls.find(q=>q.st==='live');if(bo&&bo.alive&&bo.phase==='cast'&&bo.tier===G_.focusTier&&b&&k%2===0){const id=bo.def.cast.shots.find(q=>P.T.holes[q]);if(id){const h=P.T.holes[id];b.x=h.x;b.y=h.y;b.vx=b.vy=0;b.noHole=0;}}}
        if(sc.resume&&k%97===60&&G_.mode==='play'&&!G_.sub&&!G_.choice){P.saveRun();P.continueRun();G_.auto=!sc.choose;if(!sc.manual)G_.bot=bot();}}
      if(sc.choose&&G_.choice){const c=G_.choice,j=(i+c.opts.length*7)%c.opts.length;P.choose(i%5===0?j:c.opts.length-1-(i%c.opts.length));}
      if(sc.manual){ // a fixed input script instead of the bot: flips, holds (cradles), nudges and the plunger
        const t=i%600;P.setFlip(-1,(t>40&&t<70)||(t>300&&t<520));P.setFlip(1,(t>120&&t<150)||(t>200&&t<215)||(t>560&&t<590));
        if(i%977===500){G_.in.n=true;P.nudge();}else if(i%977===505)G_.in.n=false;
        if(G_.plunge.ready){const q=i%240;G_.in.n=q<90;}else if(i%977>505)G_.in.n=false;}
      else if(sc.dev&&i%1319===700)P.nudge();
      P.gameStep(1/120);
      if(i%every===every-1){const d=digest();samples.push(d.h);if(win&&i>=win[0]&&i<=win[1])(full=full||{})[i]=d.str;}
    }}catch(e){err.push(e.message+' @ '+(e.stack||'').split('\n').slice(1,5).join(' | '));}
  const r=G_.run;
  return {samples,err,runs,boot,calls:window.__rng.calls,score:r.score,level:r.level,kills:r.kills,bosses:r.bossKills,quests:r.questsDone,recruits:(r.recruits||[]).length,stuck:G_.stuck.length,t:G_.t,full};};
