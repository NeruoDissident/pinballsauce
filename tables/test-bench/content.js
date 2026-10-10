/* Test Bench: the content. Just enough of a game to drive every field: three foes, one boss, one short campaign,
   three errands. Fields are named by id wherever a `tier` is wanted. No `ways`: the engine works out which shots
   lead from one field to another from the ramps and tunnels. See docs/TABLE_FORMAT.md, "Content". */
const foes={
  walker:{figure:'skeleton',cost:1,name:'Walker',job:'swarm',hp:18,r:14,xp:8,gold:3,undead:1,dmg:7,speed:26,wind:1.6,rate:[5,8]},
  snatch:{figure:'goblin',cost:1,name:'Snatch',job:'thief',hp:14,r:13,xp:7,gold:6,hop:1,dmg:5,wind:1.2,rate:[6,9]},
  hound:{figure:'wolf',cost:1.5,name:'Hound',job:'hunter',hp:24,r:15,xp:10,gold:3,prowl:1,beast:1,dmg:6}
};

const bosses={
  foreman:{name:'THE FOREMAN',short:'The Foreman',tier:'home',frenzyFrom:'den',hp:260,r:36,color:'#ffc060',seq:['shield','open','summon','open','cast','open'],
    summon:'walker',nSum:2,cast:{name:'Shutdown',time:11,dmg:20,curse:'weak',shots:['westway','eastway','den']},xp:120,gold:80,relic:'key'}
};

const campaigns={
  bench:{name:'Shakedown',threat:'the Foreman',boss:'foreman',foes:['walker','snatch','hound'],
    intro:'Five fields, one of everything. Run the bench and see what falls off.',
    low:[{t:'shot',id:'core',n:6,text:'Strike the Core bumpers'},
      {t:'done',id:'guard',n:1,text:'Knock down the Guard'},
      {t:'kill',e:'walker',tier:'home',n:3,text:'Clear the walkers off Home'}],
    wings:[{t:'shot',id:'pit',n:1,text:'Drop into the Pit in the West Wing'},
      {t:'shot',id:'bridge',n:1,text:'Cross the Bridge from the East Wing'},
      {t:'kill',e:'hound',tier:'east',n:2,text:'Run the hounds out of the East Wing'}],
    high:[{t:'shot',id:'whip',n:2,text:'Crack the Whip on the Crown, twice'},
      {t:'done',id:'bars',n:1,text:'Break the Bars on the Apex'},
      {t:'shot',id:'pops',n:8,text:'Strike the Pops on the Crown'}],
    win:'The bench holds. Everything that was meant to move, moved.'}
};
const plan=[
  {shuffle:'low',n:2,stage:'Home'},
  {pick:'wings',stage:'The Wings'},
  {pick:'high',stage:'Up Top'},
  {boss:'$boss',text:'Send THE FOREMAN home',stage:'The Foreman'}
];

const side=[
  {id:'sweep',name:'Sweep Up',giver:'The night shift',text:'Something is loose on the floor again.',
    steps:[{t:'kill',e:'snatch',tier:'home',n:2,text:'Catch the snatches on Home'},{t:'shot',id:'den',n:1,text:'Report to the Den'}],rw:{gold:40,xp:30}},
  {id:'rounds',name:'The Rounds',giver:'The inspector',text:'Every field, once. Sign the sheet when you are done.',
    steps:[{t:'shot',id:'westway',n:1,text:'Take the West Way'},{t:'shot',id:'stair',n:1,text:'Climb the Stair to the Apex'},{t:'shot',id:'climb',n:1,text:'Make the Climb to the Crown'}],rw:{gold:60,xp:70}},
  {id:'turn',name:'A Good Turn',giver:'The fitter',text:'That spinner has been stiff all week.',
    steps:[{t:'shot',id:'spin',n:15,text:'Spin the Spinner on the Apex'}],rw:{xp:50,heal:30}}
];

const help=[
  ['What this is','A test table. Five fields on a grid: Home at the bottom, the West and East Wings above it to either side, the Apex above them and the Crown on top. It is here to prove the engine, so it is plain.'],
  ['Getting about','From Home the West Way and the East Way climb to the wings. From the West Wing the Stair climbs to the Apex; from the Apex the Climb goes to the Crown. The Bridge crosses from the East Wing to the West. Lose the ball from the Crown and it falls to the Apex; from the Apex a chute carries it to the East Wing; from either wing a chute carries it Home. Only Home has a real drain.'],
  ['Lamps','Up the middle of Home: the multiplier, 2x to 6x. Between the flippers: the ball save. By the left outlane: the kickback. By the Hatch: the lock. In the West Wing, the lamp marked HOOKS lights for a while each time a ball comes down a chute.']
];

export const content={foes,bosses,campaigns,plan,side,help,
  noPerks:['bellRinger'],
  text:{title:'Test Bench',titleSmall:'an engine test table',eyebrow:'pinballsauce',version:'Test Bench',
    lockMb:'Bench',coin:'gold',coinMark:'g'}};
