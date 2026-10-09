import {G,RECRUIT_MAX,T,TAVERN_RECRUITS,callFoes,campFoes,drawTavern,enterWing,float,gold,heal,later,lockBall,newSide,pick,popup,recruitCost,relight,score,spawnEnemy,spawnPickup,startMultiball,tavernOpen,waveJoin,wingReady,xp} from '../../engine/api.js';

/* Gravebound Pinball: the table's own rules.
   The engine runs the pinball, the classes, the foes, the bosses and the quests. What is written here is what THIS
   table's features do when they are completed or shot: one function per bank or lane set (onComplete), one per scoop
   (onScoop), the lamps that belong to this table's features, and its timers. Everything used here comes from
   engine/api.js. See docs/TABLE_FORMAT.md, "Rules". */
export const rules={
  // once, when the table loads
  init(){G.hutT=40;},
  // a new run: this table's own flags on the run
  newRun(r){r.hoardLit=false;r.hutLit=true;},
  // every step
  tick(dt,r){if(!r.hutLit){G.hutT-=dt;if(G.hutT<=0){r.hutLit=true;G.hutT=40;relight();}}},
  // the lamps of this table's features. add(shotId, colour, state): colour main|side|lock|gold|soft|danger|spell, state flash|lit|done
  lamps(add,r){
    if(r.lockLit)add('catacombs','lock',r.locks>0?'flash':'lit');else if(r.locks>0)add('catacombs','lock','done');if(r.hoardLit)add('sanctum','gold');if(r.hutLit)add('hut','soft','lit');else if(G.hutT>0)add('hut','soft','done');
    if(r.side.length<2||(TAVERN_RECRUITS&&tavernOpen()))add('tavern','soft','lit');
    if(G.doorT>0)add('secret','gold');else if(T.banks.door.segs.some(x=>!x.on))add('secret','soft','lit');},

  /* ---------- a bank knocked down, or a lane set lit ---------- */
  onComplete:{
    candles(x,y,r){r.mult=Math.min(6,r.mult+1);heal(r.cls==='cleric'?14:6);popup('Candles Lit','Multiplier '+r.mult+'x','good');},
    moon(x,y,r){G.buffs.moon=20;r.hutLit=true;popup('Moonlight','Double scoring for 20 seconds','good');},
    townGate(x,y,r){r.kickback=true;callFoes(2,campFoes(2),'THE GATE OPENS BOTH WAYS',x,y);heal(5);popup('Gate Watch Roused','Kickback lit','good');},
    smithy(x,y,r){G.buffs.sharp=30;r.kickback=true;popup('Sharpened','+25% damage for 30 seconds','good');},
    chapel(x,y,r){heal(r.cls==='cleric'?30:18);G.curse={};callFoes(2,['spirit','spirit'],'THE BELLS WAKE THE RESTLESS',x,y);popup('Blessed','Healed and cleansed','good');},
    camp(x,y,r){r.lockLit=true;callFoes(1,['goblin','goblin','goblin'],'THE CAMP EMPTIES',x,y);popup('Camp Razed','The Catacomb lock is lit','good');},
    guard(x,y,r){r.guard=(r.guard||0)+1;callFoes(0,['knight'],'THE KING SENDS HIS CHAMPION',x,y);if(G.hoardDone){heal(6);gold(10,x,y);}else if(r.guard>=2){r.guard=0;r.hoardLit=true;popup('Guard Broken',"The King's hoard lies open in the Sanctum",'good');}else popup('Guard Reeling','Break the Royal Guard once more','good');},
    armory(x,y,r){G.buffs.aegis=30;callFoes(0,['revenant'],'THE ARMORY STIRS',x,y);popup('Armored','Half damage for 30 seconds','good');}
  },

  /* ---------- a ball in a scoop. h is the scoop, b the ball, hd how it is held: hd.plan 'eject' | 'tunnel' | 'wait', hd.delay seconds ---------- */
  onScoop:{
    // the Tavern: side quests, and recruits for the party
    tavern(h,b,hd,r){let got=false;if(r.side.length<2){newSide();got=true;}
      if(TAVERN_RECRUITS&&!G.demo&&tavernOpen()&&!G.pending.includes('tavern')){r.tavern=drawTavern(3);hd.plan='wait';G.pending.push('tavern');}else if(!got){float(h.x,h.y-36,r.recruits.length>=RECRUIT_MAX?'The Lantern: your band is full':'The Lantern: '+recruitCost()+' gold to hire','#ffd9a0',12);gold(5,h.x,h.y);}hd.delay=1.2;},
    crypt(h,b,hd,r){hd.plan='tunnel';hd.delay=.6;float(h.x,h.y-32,'CRYPT STAIR','#9dffc8',13);},
    oubliette(h,b,hd,r){hd.plan='tunnel';hd.delay=.6;float(h.x,h.y-32,'DOWN THE OUBLIETTE','#ff9a7a',13);},
    // the Secret Passage: the way into the Hoard once that wing is open, a stair to the Keep otherwise
    secret(h,b,hd,r){if(wingReady('secret')){enterWing(hd);return;}hd.plan='tunnel';hd.delay=.6;score(10000);if(!r.secret){r.secret=1;xp(12);popup('Secret Found','A hidden stair climbs into the Keep','good');}else float(h.x,h.y-32,'SECRET STAIR','#ffd24a',13);},
    // the Catacombs: the way into the Crypt, or the multiball lock, or a few coins and something that follows you out
    catacombs(h,b,hd,r){if(wingReady('catacombs'))enterWing(hd);else if(r.lockLit&&!G.mb&&!G.fallen)lockBall(b);else{gold(5,h.x,h.y);if(!G.enemies.some(e=>e.type==='revenant'&&e.tier===1))later(.9,()=>{const e=spawnEnemy('revenant',1);if(e){float(e.x,e.y-40,'SOMETHING FOLLOWED YOU OUT','#cfd8e0',12);waveJoin(e,1);}});}},
    // the Witch's Hut: the way into the Den, side quests, and a boon when it is lit
    hut(h,b,hd,r){if(wingReady('hut')){enterWing(hd);return;}if(r.side.length<2&&Math.random()<.7)newSide();
      if(r.hutLit){r.hutLit=false;G.hutT=40;const f=pick([()=>{gold(30,h.x,h.y);return 'A purse of grave-silver';},()=>{heal(40);return 'A bitter draught. +40 health';},
        ()=>{r.charge=100;return 'Your power surges. Cradle the ball to release it';},()=>{r.lockLit=true;return 'The Catacomb lock is lit';},
        ()=>{r.mult=Math.min(6,r.mult+1);return 'Multiplier '+r.mult+'x';},()=>{G.buffs.moon=20;return 'Moonlight. Double scoring';}]);popup("Witch's Boon",f(),'good');}
      hd.delay=1.2;},
    // the Sanctum: the King's Hoard multiball once the Royal Guard is broken twice
    sanctum(h,b,hd,r){if(r.hoardLit){r.hoardLit=false;G.hoardDone=true;hd.delay=1.5;startMultiball("King's Hoard",1,'sanctum');for(let i=0;i<8;i++)later(.3+i*.25,()=>spawnPickup(0,'gold'));gold(40,h.x,h.y);}else gold(8,h.x,h.y);}
  }
};

