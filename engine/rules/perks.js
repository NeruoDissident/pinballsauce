/* ================= BOONS AND RELICS =================
   The cards drawn after a boss kill, and the relics quests and bosses hand out. Each is a small change to the run's
   modifiers (see recalc in rules/run.js). */
import {G} from '../core/state.js';
import {heal} from './score.js';

/* Boons: the cards offered on a level-up. Every pick shows one card of your class, one that changes what the table gives
   you, and one plain stat (or, rarely, a keystone that defines the run). kind: class | table | stat | key. */
export const PERKS=[
  // the table
  {id:'laneKeeper',kind:'table',name:'Lane Keeper',desc:'Lighting all the lanes relights the kickback.',max:1,f:m=>m.laneKick=true},
  {id:'rampRunner',kind:'table',name:'Ramp Runner',desc:'Every ramp fills 10 power and pays 2,000 more. Rank 2 doubles both.',max:2,f:m=>{m.rampCharge+=10;m.rampScore+=2000;}},
  {id:'bellRinger',kind:'table',name:'Bell Ringer',desc:'The Keep bell heals 10 and wards you from the next strike.',max:1,f:m=>m.bellHeal=10},
  {id:'ironFlip',kind:'table',name:'Iron Flippers',desc:'Every flipper hit on the ball wounds foes near it.',max:2,f:m=>m.ironFlip+=.5},
  {id:'chance',kind:'table',name:'Second Chance',desc:'Once per ball, an outlane gives the ball back.',max:1,f:m=>m.outSave=true},
  {id:'bargain',kind:'table',name:'Grave Bargain',desc:'Every lost ball pays 25 gold on the way down.',max:1,f:m=>m.bargain=25},
  {id:'tollgate',kind:'table',name:'Tollgate',desc:'Foes that reach the slingshot line take a toll every second they stand there.',max:2,f:m=>m.toll+=.5},
  {id:'hallowed',kind:'table',name:'Hallowed Lanes',desc:'Rolling a top lane or an inlane wards you from strikes for 4 seconds.',max:1,f:m=>m.laneWard=4},
  {id:'momentum',kind:'table',name:'Momentum',desc:'Combos last 3 seconds longer and pay double.',max:2,f:m=>{m.combo+=3;m.comboPay+=1;}},
  {id:'tithe',kind:'table',name:'Grave Tithe',desc:'Bumpers and slingshots shake loose gold.',max:1,f:m=>m.bumpGold=1},
  {id:'ward',kind:'table',name:'Kickback Ward',desc:'The left kickback relights itself every 30 seconds.',max:1,f:m=>m.kickRelight=true},
  // plain stats
  {id:'edge',kind:'stat',name:'Keen Edge',desc:'+30% damage to foes and bosses.',max:3,f:m=>m.dmg+=.3},
  {id:'will',kind:'stat',name:'Iron Will',desc:'+40 max health, and heal 40 now.',max:3,f:m=>m.hp+=40,now:()=>heal(40)},
  {id:'fortune',kind:'stat',name:"Fortune's Favor",desc:'+60% gold from every source.',max:2,f:m=>m.gold+=.6},
  {id:'guardian',kind:'stat',name:'Guardian Spirit',desc:'Ball save lasts 8 seconds longer.',max:2,f:m=>m.save+=8},
  {id:'breaker',kind:'stat',name:'Bone Breaker',desc:'Armor shatters in a single blow.',max:1,f:m=>m.pierce=true},
  {id:'harvest',kind:'stat',name:'Soul Harvest',desc:'Every kill restores 5 health.',max:2,f:m=>m.healKill+=5},
  {id:'mark',kind:'stat',name:"Hunter's Mark",desc:'+20% critical hit chance.',max:2,f:m=>m.crit+=.2},
  {id:'zeal',kind:'stat',name:'Zeal',desc:'Your power meter fills 50% faster.',max:2,f:m=>m.charge+=.5},
  {id:'second',kind:'stat',name:'Second Wind',desc:'Gain an extra ball.',max:1,rare:true,f:m=>{},now:()=>{G.run.ballsLeft++;}},
  // keystones: one per run
  {id:'bloodPact',kind:'key',name:'Blood Pact',desc:'Double damage. Half your health.',max:1,f:m=>{m.dmgMul*=2;m.hpK=.5;}},
  {id:'twinSoul',kind:'key',name:'Twin Soul',desc:'The party answers the Rally for twice as long.',max:1,f:m=>m.twin=true},
  {id:'hourglass',kind:'key',name:'The Hourglass',desc:'Wing clocks run for twice as long. Ball save lasts twice as long.',max:1,f:m=>{m.hour=2;m.saveK=2;}},
  {id:'deathWish',kind:'key',name:'Death Wish',desc:'Every kill fills 10 power. Every wound drains 10.',max:1,f:m=>m.deathWish=10}
];
export const RELICS=[
  {id:'moonstone',name:'Moonstone',desc:'Your multiplier never drops below 2x.',f:m=>m.multMin=2},
  {id:'finger',name:"Saint's Finger",desc:'Every lane heals 3 health.',f:m=>m.laneHeal+=3},
  {id:'spade',name:"Gravedigger's Spade",desc:'Killing blows drop double gold.',f:m=>m.killGold+=1},
  {id:'ember',name:'Ember Heart',desc:'+20% damage. Ramps heal 2 health.',f:m=>{m.dmg+=.2;m.rampHeal+=2;}},
  {id:'coin',name:"Hanged Man's Coin",desc:'+10% crit chance and +25% gold.',f:m=>{m.crit+=.1;m.gold+=.25;}},
  {id:'pelt',name:'Moonfang Pelt',desc:'Take 20% less damage.',f:m=>m.dr+=.2},
  {id:'handbell',name:'Cracked Hand-Bell',desc:'Bumper hits wound the nearest foe.',f:m=>m.bumpDmg=1},
  {id:'hymnal',name:'Hollow Hymnal',desc:'Jackpots are worth double.',f:m=>m.jackpot+=1},
  {id:'key',name:"Warden's Key",desc:'Ball save lasts 5 seconds longer. The lock stays lit.',f:m=>{m.save+=5;m.lockKeep=true;}},
  {id:'scale',name:'Grave Dragon Scale',desc:'+40 max health.',f:m=>m.hp+=40},
  {id:'whet',name:'Whetstone',desc:'+10% damage.',stack:true,f:m=>m.dmg+=.1}
];
