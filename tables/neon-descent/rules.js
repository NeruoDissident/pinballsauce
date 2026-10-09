import {G,RECRUIT_MAX,T,TAVERN_RECRUITS,callFoes,campFoes,drawTavern,float,gold,heal,later,lockBall,newSide,pick,popup,recruitCost,relight,score,spawnEnemy,spawnPickup,startMultiball,tavernOpen,waveJoin,xp} from '../../engine/api.js';

/* Neon Descent: the table's own rules.
   The engine runs the pinball, the classes, the foes, the wardens and the quests. What is written here is what THIS
   table's features do when they are completed or shot: one function per bank or lane set (onComplete), one per scoop
   (onScoop), the lamps that belong to this table's features, and its timers. Everything used here comes from
   engine/api.js. See docs/TABLE_FORMAT.md, "Rules".

   The feature set is Gravebound's, re-dressed, so the two tables play by the same book:
     Signal Lights = multiplier      Toll Booth = kickback + company     Night Market = heal + cleanse
     Chop Shop = damage buff         Hideout = gigs + crew for hire      Sewer Grate = tunnel up
     The Curtain = lights the lock   Pachinko = the lock                 Stage Door / Backstage = tunnel up
     The Fixer = a boon on a timer   Neon Signs = double scoring        Mainframe = half damage
     Hymn Lines = heal + ball save   Confessional = cleanse              Data Archive = tunnel up
     Firewall x2 = opens the Core    Core Vault = Core multiball         Black ICE = half damage
     Service Elevator = tunnel down */
export const rules={
  // once, when the table loads
  init(){G.fixT=40;},
  // a new run: this table's own flags on the run
  newRun(r){r.coreLit=false;r.fixLit=true;},
  // every step
  tick(dt,r){if(!r.fixLit){G.fixT-=dt;if(G.fixT<=0){r.fixLit=true;G.fixT=40;relight();}}},
  // the lamps of this table's features. add(shotId, colour, state): colour main|side|lock|gold|soft|danger|spell, state flash|lit|done
  lamps(add,r){
    if(r.lockLit)add('pachinko','lock',r.locks>0?'flash':'lit');else if(r.locks>0)add('pachinko','lock','done');
    if(r.coreLit)add('coreVault','gold');
    if(r.fixLit)add('fixer','soft','lit');else if(G.fixT>0)add('fixer','soft','done');
    if(r.side.length<2||(TAVERN_RECRUITS&&tavernOpen()))add('hideout','soft','lit');
    if(G.doorT>0)add('backstage','gold');else if(T.banks.stageDoor.segs.some(x=>!x.on))add('backstage','soft','lit');},

  /* ---------- a bank knocked down, or a lane set lit ---------- */
  onComplete:{
    // the Undercity
    signal(x,y,r){r.mult=Math.min(6,r.mult+1);heal(r.cls==='cleric'?14:6);popup('Signals Run','Multiplier '+r.mult+'x','good');},
    toll(x,y,r){r.kickback=true;callFoes(3,campFoes(2),'THE BOOTH CALLS IT IN',x,y);heal(5);popup('Toll Booth Down','Kickback lit','good');},
    market(x,y,r){heal(r.cls==='cleric'?30:18);G.curse={};callFoes(3,['glitch','glitch'],'THE STALLS FLICKER',x,y);popup('Patched Up','Healed and cleansed','good');},
    chop(x,y,r){G.buffs.sharp=30;r.kickback=true;popup('Tuned Up','+25% damage for 30 seconds','good');},
    // Kabuki
    curtain(x,y,r){r.lockLit=true;callFoes(2,['pickpocket','pickpocket','pickpocket'],'THE HOUSE EMPTIES',x,y);popup('Curtain Down','The Pachinko lock is lit','good');},
    neon(x,y,r){G.buffs.moon=20;r.fixLit=true;popup('Neon Lit','Double scoring for 20 seconds','good');},
    // the Cathedral
    mainframe(x,y,r){G.buffs.aegis=30;callFoes(1,['netjacker'],'THE MAINFRAME PAGES ITS FAITHFUL',x,y);popup('Mainframe Cracked','Half damage for 30 seconds','good');},
    hymn(x,y,r){heal(12);G.save=Math.max(G.save,10);popup('Hymn Sung','Healed. Ball save for 10 seconds','good');},
    // the Citadel
    firewall(x,y,r){r.wall=(r.wall||0)+1;callFoes(0,['enforcer'],'THE MACHINE SENDS ITS ENFORCER',x,y);if(G.hoardDone){heal(6);gold(10,x,y);}else if(r.wall>=2){r.wall=0;r.coreLit=true;popup('Firewall Down','The Core Vault lies open','good');}else popup('Firewall Reeling','Break the Firewall once more','good');},
    ice(x,y,r){G.buffs.aegis=30;callFoes(0,['riot'],'THE ICE CALLS SECURITY',x,y);popup('Iced','Half damage for 30 seconds','good');}
  },

  /* ---------- a ball in a scoop. h is the scoop, b the ball, hd how it is held: hd.plan 'eject' | 'tunnel' | 'wait', hd.delay seconds ---------- */
  onScoop:{
    // the Hideout: gigs, and recruits for the crew
    hideout(h,b,hd,r){let got=false;if(r.side.length<2){newSide();got=true;}
      if(TAVERN_RECRUITS&&!G.demo&&tavernOpen()&&!G.pending.includes('tavern')){r.tavern=drawTavern(3);hd.plan='wait';G.pending.push('tavern');}else if(!got){float(h.x,h.y-36,r.recruits.length>=RECRUIT_MAX?'The Hideout: your crew is full':'The Hideout: '+recruitCost()+' creds to hire','#ffd9a0',12);gold(5,h.x,h.y);}hd.delay=1.2;},
    sewer(h,b,hd,r){hd.plan='tunnel';hd.delay=.6;float(h.x,h.y-32,'UP THE STORM DRAIN','#ffe2a0',13);},
    // the Pachinko Parlor: the multiball lock, or a few credits and something that follows you out
    pachinko(h,b,hd,r){if(r.lockLit&&!G.mb&&!G.fallen)lockBall(b);else{gold(5,h.x,h.y);if(!G.enemies.some(e=>e.type==='riot'&&e.tier===2))later(.9,()=>{const e=spawnEnemy('riot',2);if(e){float(e.x,e.y-40,'THE BOUNCER FOLLOWED YOU OUT','#ffd0e6',12);waveJoin(e,2);}});}},
    // Backstage: behind the Stage Door, the service stair to the Cathedral
    backstage(h,b,hd,r){hd.plan='tunnel';hd.delay=.6;score(10000);if(!r.secret){r.secret=1;xp(12);popup('Backstage','A service stair climbs to the Cathedral','good');}else float(h.x,h.y-32,'SERVICE STAIR','#ffd24a',13);},
    // the Fixer: gigs, and a favour when the sign is lit
    fixer(h,b,hd,r){if(r.side.length<2&&Math.random()<.7)newSide();
      if(r.fixLit){r.fixLit=false;G.fixT=40;const f=pick([()=>{gold(30,h.x,h.y);return 'A credstick, no questions';},()=>{heal(40);return 'A stim. +40 health';},
        ()=>{r.charge=100;return 'Your power surges. Cradle the ball to release it';},()=>{r.lockLit=true;return 'The Pachinko lock is lit';},
        ()=>{r.mult=Math.min(6,r.mult+1);return 'Multiplier '+r.mult+'x';},()=>{G.buffs.moon=20;return 'Neon. Double scoring';}]);popup("Fixer's Favour",f(),'good');}
      hd.delay=1.2;},
    // the Confessional: lifts curses, a little health
    confessional(h,b,hd,r){const cursed=Object.keys(G.curse).length>0;G.curse={};heal(8);float(h.x,h.y-32,cursed?'ABSOLVED':'CONFESSED','#d8fbff',13);},
    // the Data Archive: the maintenance shaft up to the Core Vault
    archive(h,b,hd,r){hd.plan='tunnel';hd.delay=.6;float(h.x,h.y-32,'MAINTENANCE SHAFT','#d8fbff',13);},
    // the Core Vault: Core multiball once the Firewall is broken twice
    coreVault(h,b,hd,r){if(r.coreLit){r.coreLit=false;G.hoardDone=true;hd.delay=1.5;startMultiball('Core Breach',1,'coreVault');for(let i=0;i<8;i++)later(.3+i*.25,()=>spawnPickup(0,'gold'));gold(40,h.x,h.y);}else gold(8,h.x,h.y);},
    elevator(h,b,hd,r){hd.plan='tunnel';hd.delay=.6;float(h.x,h.y-32,'GOING DOWN','#e6dcff',13);}
  }
};
