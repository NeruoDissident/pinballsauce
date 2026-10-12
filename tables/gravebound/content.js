/* Gravebound Pinball: the content. Foes, bosses, campaigns, side quests, wings and words. Data, read by the engine.
   See docs/TABLE_FORMAT.md, "Content". */

/* Foes. `job` is what it does on the table (the engine plays the job): swarm | thief | hunter | possess | ritual |
   wall | duel | gate. wind: seconds of visible wind-up before a strike; a hit in that window staggers it.
   cost: what it takes out of a wave's budget. */
const foes={ // job: what it does on the table. wind: seconds of visible wind-up before a strike; a hit in that window staggers it
  skeleton:{cost:1,name:'Skeleton',job:'swarm',hp:18,r:14,xp:8,gold:3,undead:1,dmg:7,speed:26,wind:1.6,rate:[5,8]},
  goblin:{cost:1,name:'Goblin',job:'thief',hp:14,r:13,xp:7,gold:6,hop:1,dmg:5,wind:1.2,rate:[6,9]},
  wolf:{cost:1.5,name:'Dire Wolf',job:'hunter',hp:24,r:15,xp:10,gold:3,prowl:1,beast:1,dmg:6},
  spirit:{cost:1,name:'Spirit',job:'possess',hp:12,r:15,xp:9,gold:2,ghost:1,undead:1,dmg:5,wind:2.2,rate:[8,11]},
  cultist:{cost:2,name:'Cultist',job:'ritual',hp:20,r:14,xp:12,gold:6,cast:9},
  revenant:{cost:2.5,name:'Armored Dead',job:'wall',hp:32,r:16,xp:16,gold:8,armor:2,undead:1,dmg:9,wind:2,rate:[8,12]},
  knight:{cost:3.5,name:'Corrupted Knight',job:'duel',hp:58,r:17,xp:24,gold:12,armor:1,dmg:12,wind:1.8,rate:[9,13]},
  troll:{cost:5,name:'Grave Troll',job:'gate',hp:105,r:26,xp:40,gold:25,kick:1,beast:1,dmg:14,wind:2.4,rate:[10,14]}
};

/* Bosses. seq is the order of phases, looped: shield | open | summon | cast | frenzy. A cast is broken by any of
   its `shots`. tier is the field the boss stands on (its `boss` spot in the layout). */
const bosses={
  warden:{name:'The Warden of the Ruined Gate',short:'The Warden',tier:1,frenzyFrom:'hut',hp:270,r:36,color:'#9fc0dc',seq:['shield','open','summon','open','cast','open'],
    summon:'revenant',nSum:2,cast:{name:'Portcullis Slam',time:11,dmg:22,curse:'weak',shots:['rampRuin','catacombs','hut'],closes:'rampWolf',note:'The Wolf Run is barred'},xp:120,gold:80,relic:'key'},
  necro:{name:'Vael the Hollow',short:'Vael',tier:0,frenzyFrom:'sanctum',undead:true,hp:430,r:34,color:'#7dffb0',seq:['shield','open','summon','cast','open','frenzy'],
    summon:'skeleton',nSum:4,cast:{name:'Death Knell',time:10,dmg:26,curse:'dark',shots:['rampTower','sanctum','bell']},xp:300,gold:200,relic:'hymnal'},
  beast:{name:'Moonfang, Lord of Beasts',short:'Moonfang',tier:0,frenzyFrom:'sanctum',hp:470,r:34,color:'#cfe6ff',moving:true,seq:['open','summon','open','cast','frenzy','open'],
    summon:'wolf',nSum:3,cast:{name:'Blood Howl',time:9,dmg:24,curse:'weak',shots:['rampTower','bell','oubliette'],frenzy:'wolf',note:'The pack goes wild'},xp:300,gold:200,relic:'pelt'},
  dragon:{name:'Ashmaw, the Grave Dragon',short:'Ashmaw',tier:0,frenzyFrom:'sanctum',hp:540,r:40,color:'#ff8a4a',seq:['shield','open','cast','summon','open','frenzy'],wardBy:'cultist',
    summon:'cultist',nSum:3,cast:{name:'Gravefire',time:10,dmg:30,curse:'burn',shots:['bell','sanctum','rampTower'],fire:{x:320,y:505,r:125},note:'The floor burns'},xp:340,gold:260,relic:'scale'}
};

/* Campaigns: a run is one of these. `plan` (below) says how its main quest is assembled from these pools.
   A step is {t:'shot', id, n} | {t:'done', id, n} | {t:'kill', e, tier, n} | {t:'boss', boss} | {t:'collect', tier, item}. */
const campaigns={
  necro:{name:'The Hollow Choir',threat:'a necromancer',boss:'necro',foes:['skeleton','spirit','cultist'],
    wing:{key:'crypt',name:'The Crypt',text:"The Warden's key fits the Catacombs. Go down, break the seal and open the Sarcophagus"},
    intro:'The dead will not stay buried. Something beneath the Keep is singing them awake.',
    omens:[{t:'shot',id:'graves',n:8,text:'The graves are stirring. Strike the Gravestones'},
      {t:'kill',e:'skeleton',tier:2,n:3,text:'Put down the risen dead in Grave Hollow'},
      {t:'done',id:'candles',n:1,text:'Light all three Vigil Candles'},
      {t:'done',id:'townGate',n:1,text:'Rouse the watch. Drop the Town Gate targets'}],
    trail:{t:'shot',id:'rampForest',n:1,text:'Follow the corpse-lights up the Forest Road'},
    wilds:[{t:'kill',e:'cultist',tier:1,n:2,text:'Break the ritual. Slay the cultists in the Wilds'},
      {t:'shot',id:'catacombs',n:1,text:'Search the Catacombs for the choir hymnal'},
      {t:'kill',e:'spirit',tier:1,n:4,text:'Lay the wandering spirits to rest'}],
    reveal:[{t:'shot',id:'bell',n:3,text:'Ring the Keep bell to crack the wards'},
      {t:'kill',e:'revenant',tier:0,n:2,text:'Cut down the Armored Dead in the Keep'}],
    win:'The choir falls silent. Vael is dust.'},
  beast:{name:'The Moonfang Hunt',threat:'a beast lord',boss:'beast',foes:['wolf','goblin','troll'],
    wing:{key:'den',name:'The Den',text:"The Warden's key opens the hunting door behind the Witch's Hut. Go down and break the pack"},
    intro:'Livestock torn apart, hunters gone missing, and a howl that carries from the Keep on moonless nights.',
    omens:[{t:'kill',e:'wolf',tier:2,n:2,text:'Wolves at the gate. Drive them from Grave Hollow'},
      {t:'shot',id:'smithy',n:3,text:'Arm the militia. Strike the Smithy targets'},
      {t:'shot',id:'orbitL2',n:2,text:'Track the pack along the Night Road'},
      {t:'shot',id:'vane',n:20,text:'Read the wind. Spin the Weathervane'}],
    trail:{t:'shot',id:'rampForest',n:1,text:'Follow the blood trail up the Forest Road'},
    wilds:[{t:'kill',e:'wolf',tier:1,n:4,text:'Thin the pack in the Wilds'},
      {t:'shot',id:'rampWolf',n:2,text:'Run the pack down on the Wolf Run'},
      {t:'done',id:'moon',n:1,text:'Light all four Moon Phases'}],
    reveal:[{t:'shot',id:'orbitL0',n:2,text:'Stalk the ramparts of the Keep'},
      {t:'kill',e:'troll',tier:0,n:1,text:'Bring down the Grave Troll in the Keep'}],
    win:'Moonfang lies still. The howling stops.'},
  dragon:{name:'Ashes of the Grave Dragon',threat:'a dragon',boss:'dragon',foes:['goblin','cultist','knight'],
    wing:{key:'hoard',name:'The Hoard',text:"The Warden's key turns the Sealed Door. Take the Secret Passage down to the Hoard and rob the wyrm"},
    intro:'Ash falls on the Hollow like snow. Cultists say the old wyrm under the Keep has opened one eye.',
    omens:[{t:'shot',id:'chapel',n:3,text:'Seek counsel. Strike the Chapel targets'},
      {t:'kill',e:'goblin',tier:2,n:3,text:'Goblin looters in Grave Hollow. Scatter them'},
      {t:'shot',id:'rampChapel',n:2,text:'Carry the warning up the Chapel Stair'},
      {t:'shot',id:'graves',n:8,text:'Ash on the tombs. Strike the Gravestones'}],
    trail:{t:'shot',id:'crypt',n:1,text:'Take the Crypt Stair beneath the hill'},
    wilds:[{t:'done',id:'camp',n:1,text:'Raze the Goblin Camp'},
      {t:'kill',e:'cultist',tier:1,n:2,text:'Silence the dragon cult in the Wilds'},
      {t:'shot',id:'stones',n:10,text:'Wake the Standing Stones'}],
    reveal:[{t:'done',id:'guard',n:1,text:'Break the Royal Guard'},
      {t:'kill',e:'knight',tier:0,n:1,text:'Defeat the Corrupted Knight'}],
    win:'Ashmaw crashes from its perch. The ash stops falling.'}
};
// the wave banner each campaign was written to show (the engine shows text.wave: see STATUS.md, "Found on the way")
const waveNames={necro:['The Choir Stirs','The dead claw up through the floor'],beast:['The Pack Hunts','Howls from every shadow'],dragon:['Cultists Gather','Ash on the wind. They come for the ball']};

/* How a main quest is put together, in order. shuffle: take n from a pool; pick: one from a pool; use: a fixed step. */
const plan=[
  {shuffle:'omens',n:2,stage:'Omens'},
  {use:'trail',stage:'The Trail'},
  {pick:'wilds',stage:'The Wilds'},
  {boss:'warden',text:'Defeat the Warden of the Ruined Gate',stage:'The Ruined Gate'},
  {wing:true},
  {step:{t:'shot',id:'rampRuin',n:1,text:'Climb the Ruin Stair into the Black Keep'},stage:'The Climb'},
  {pick:'reveal',stage:'The Keep'},
  {boss:'$boss',stage:'The Reckoning'}
];
const stages=['Omens','Omens','The Trail','The Wilds','The Ruined Gate','The Climb','The Keep','The Reckoning'];

/* Side quests: handed out by the scoops this table's rules give that job to (the Tavern, the Witch's Hut). */
const side=[
  {id:'rats',name:'Teeth in the Cellar',giver:'Innkeeper Morwen',text:'Something with too many teeth has moved into my cellar.',
    steps:[{t:'kill',e:'goblin',tier:2,n:3,text:'Clear the goblins out of Grave Hollow'},{t:'shot',id:'tavern',n:1,text:'Report back at the Tavern'}],rw:{gold:40,xp:30}},
  {id:'hammer',name:"The Smith's Lost Hammer",giver:'Odrin the Smith',text:'Goblins took my hammer into the Wilds. I cannot work without it.',
    steps:[{t:'collect',tier:1,n:1,item:'hammer',text:'Find the hammer somewhere in the Wilds'},{t:'shot',id:'smithy',n:2,text:'Return it. Strike the Smithy targets'}],rw:{gold:30,xp:40,relic:1}},
  {id:'vigil',name:'Vigil for the Fallen',giver:'Sister Aldith',text:'Light the candles and walk the stair. The dead should not be alone.',
    steps:[{t:'done',id:'candles',n:1,text:'Light all three Vigil Candles'},{t:'shot',id:'rampChapel',n:2,text:'Climb the Chapel Stair twice'}],rw:{xp:45,heal:40}},
  {id:'bandits',name:'Bandits on the Road',giver:'A bleeding courier',text:'They took the mail and my horse. Up the forest road, not far.',
    steps:[{t:'shot',id:'rampForest',n:1,text:'Chase the bandits up the Forest Road'},{t:'kill',e:'goblin',tier:1,n:3,text:'Rout the bandits in the Wilds'}],rw:{gold:70,xp:40}},
  {id:'bargain',name:"The Witch's Bargain",giver:'The Hut Witch',text:'Turn my mill thirty times and I will owe you. I do not like owing.',
    steps:[{t:'shot',id:'windmill',n:30,text:'Spin the Windmill'},{t:'shot',id:'hut',n:1,text:"Return to the Witch's Hut"}],rw:{xp:40,relic:1}},
  {id:'bounty',name:'Wolf Bounty',giver:'The Reeve',text:'A silver a pelt. Bring me four.',
    steps:[{t:'kill',e:'wolf',tier:1,n:4,text:'Hunt dire wolves in the Wilds'}],rw:{gold:90,xp:35}},
  {id:'maps',name:'The Catacomb Cartographer',giver:'Fenwick, mapmaker',text:'I need two entrances marked. I am not going down there myself.',
    steps:[{t:'shot',id:'catacombs',n:1,text:'Chart the Catacombs'},{t:'done',id:'door',n:1,text:'Break the Sealed Door in the Wilds'},{t:'shot',id:'secret',n:1,text:'Enter the Secret Passage'}],rw:{gold:60,xp:70}},
  {id:'silent',name:'The Silent Bell',giver:'An old ringer',text:'That bell has not rung since the King went dark. Ring it for me.',
    steps:[{t:'shot',id:'bell',n:3,text:'Ring the bell in the Black Keep'}],rw:{xp:60,gold:40}},
  {id:'squire',name:'Rescue the Squire',giver:'Dame Isolde',text:'My squire was dragged into the Keep. Get him out by the low road.',
    steps:[{t:'kill',e:'revenant',tier:0,n:2,text:'Slay his jailers in the Keep'},{t:'shot',id:'oubliette',n:1,text:'Escape down the Oubliette'},{t:'shot',id:'tavern',n:1,text:'Bring him to the Tavern'}],rw:{gold:80,xp:80,relic:1}},
  {id:'mill',name:'Spirits of the Hollow',giver:'A sleepless miller',text:'They drift through my walls at night. Four of them. I counted.',
    steps:[{t:'kill',e:'spirit',tier:2,n:4,text:'Banish the spirits of Grave Hollow'}],rw:{gold:35,xp:40}},
  {id:'tithe',name:'A Tithe from the Crown',giver:'A hooded stranger',text:'The King is dead and still hoards. Lighten his vault.',
    steps:[{t:'done',id:'guard',n:1,text:'Break the Royal Guard'},{t:'shot',id:'sanctum',n:1,text:'Loot the Sanctum'}],rw:{gold:160,xp:50}},
  {id:'runes',name:'Runestone Attunement',giver:'Hedge-druid Carrow',text:'The stones are out of tune. Strike them until they hum.',
    steps:[{t:'shot',id:'stones',n:12,text:'Strike the Standing Stones'},{t:'shot',id:'orbitR1',n:1,text:'Walk the Moon Path'}],rw:{xp:60,heal:30}},
  {id:'hold',name:'Hold the Gate',giver:'Captain Bryce',text:'They are coming over the wall. Hold for half a minute.',
    steps:[{t:'kill',e:'skeleton',tier:2,n:5,time:45,text:'Slay 5 skeletons before the gate falls'}],rw:{gold:60,xp:60}},
  {id:'patrol',name:'Night Patrol',giver:'The gatewatch',text:'Walk the road both ways. Shout if anything moves.',
    steps:[{t:'shot',id:'orbitL2',n:2,text:'Patrol the Night Road, west'},{t:'shot',id:'orbitR2',n:1,text:'Patrol the Night Road, east'}],rw:{gold:30,xp:35}},
  {id:'armory',name:'Steel for the Hollow',giver:'Quartermaster Pell',text:'The Keep armory is full and nobody alive is using it.',
    steps:[{t:'done',id:'armory',n:1,text:'Raid the Keep Armory'},{t:'shot',id:'tavern',n:1,text:'Deliver the steel to the Tavern'}],rw:{gold:50,xp:60,relic:1}},
  {id:'tower',name:'The Throne Road',giver:'A mad astronomer',text:'Three times round the keep and the stars line up. Trust me.',
    steps:[{t:'shot',id:'rampTower',n:3,text:'Ride the Throne Road three times'}],rw:{xp:90,gold:40}}
];

/* Wings: three rooms, one rule each. rule 'targets': light the wing's target bank. 'kills': slay `need` of `foe`.
   'coins': roll over `need` coins. Meeting the rule breaks the seal on the room's scoop; shooting the scoop wins the
   wing. A clock runs while you are inside; draining or running out of time carries the ball back out, not out of play.
   gate: the scoop on the main table that leads in. out: the scoop the ball comes back to. */
const wings={
  crypt:{name:'The Crypt',gate:'catacombs',out:'catacombs',time:80,rule:'targets',bank:'sigils',lamps:['sigils','sigilsR'],sealCol:'#b8b49a',light:.62,backTitle:'Back to the Wilds',col:'#d8f070',label:'SARCOPHAGUS',
    enter:'Light the four sigils to break the seal, then shoot the Sarcophagus',note:'The dead give you eighty seconds. Every sigil buys a little more.',
    sealed:()=>'Light the four sigils on the walls to break the seal',open:'The seal is broken. Shoot the Sarcophagus',broke:['The Seal Breaks','Shoot the Sarcophagus'],
    clock:'The crypt seals in ',late:['The Crypt Seals','The flippers go dead. The dead carry you out'],back:'The Catacombs stay open',won:'The Sarcophagus Opens'},
  den:{name:'The Den',gate:'hut',out:'hut',time:80,need:3,rule:'kills',foe:'wolf',sealCol:'#9aa6b8',light:.26,pool:['24','0c','1c'],backTitle:'Back to the Wilds',col:'#cfe6ff',label:'THE LAIR',
    enter:'Slay three of the pack, then shoot the Lair',note:'Eighty seconds before the pack closes in. Every kill buys more.',
    sealed:n=>'Slay three of the pack ('+n+'/3)',open:'The pack is broken. Shoot the Lair',broke:['The Pack Breaks','Shoot the Lair'],
    clock:'The pack closes in ',late:['The Pack Closes In','The flippers go dead. You are dragged out'],back:'The hunting door stays open',won:'The Lair Is Yours'},
  hoard:{name:'The Hoard',gate:'secret',out:'catacombs',time:80,need:6,rule:'coins',opensDoor:true,sealCol:'#c9983f',light:.5,backTitle:'Back to the Wilds',col:'#ffb050',label:'THE VAULT',
    enter:'Roll the ball over six dragon coins, then shoot the Vault',note:'Eighty seconds before the wyrm stirs. Every coin buys more.',
    sealed:n=>'Roll over the dragon coins ('+n+'/6)',open:'The vault is unbarred. Shoot it',broke:['The Vault Unbars','Shoot the Vault'],
    clock:'The wyrm stirs in ',late:['The Wyrm Stirs','The flippers go dead. Run'],back:'The Sealed Door stays open',won:'The Vault Is Yours'}};

const help=[
  ['The table','Three levels stacked up a hill: Grave Hollow at the bottom, the Wilds, then the Black Keep. Ramps climb to the level above; the gap between the upper flippers of a level drops you to the one below. Each level plays its own way: the Hollow has shots at every depth, from the Smithy and the mausoleum low down to the Town Gate and the Chapel high up; the Wilds has the Goblin Camp high under the stone ring and the Mill lane feeding it; the Keep has the Throne Road, a centre ramp between the Royal Guard. Below the Hollow is the Grave, and off to the sides are the campaign wings (the Crypt, the Den, the Hoard), reached through scoops once the Warden is beaten.'],
  ['Hardware','Flippers: every left flipper on the table moves together, and every right one. Slingshots kick the ball back up. Rollover lanes (top, inlanes, outlanes) score as you pass. Spinners score per turn. Drop targets fall when hit and a bank is complete when all are down; standup targets light. Pop bumpers (braziers, standing stones, gravestones) score and feed your meter. Scoops hold the ball, pay out and eject it. Orbits are the loops around the outside. Ramps carry the ball up a rail. The kickback on the left outlane fires once, then has to be relit.'],
  ['Scoring','Pinball is a high-score game. Your multiplier (1x to 6x) multiplies everything; light the three Vigil Candles on the Hollow to raise it, or ask the Witch. It resets each ball. Combos: shots made quickly after one another pay more. Lock two balls at the Goblin Camp for multiball, where ramps and orbits pay jackpots. The end-of-ball bonus counts that ball\'s foes, side quests and ramps, times your multiplier. Tilt (too many nudges) kills the flippers and forfeits the bonus.'],
  ['Your hero','The ball is the hero. Hits fill the power meter. Nudge (Space) fires your class nudge power. Hold the ball still on a raised flipper (cradle) for about a second with one bar of meter to arm your class shot: the next flip fires it and spends the bar. Arming is free; if you never flip it, nothing is spent. Cradle a full meter for a second and a half to Rally the party. Level up and you unlock or level one of your four spellbook abilities; each is cast by completing its goal on the table (a bank, two ramps, two orbits or twenty spins, three lanes then a scoop) and lasts a while. Two unlocked abilities can run at once.'],
  ['Foes','Every foe has a job on the table and a wind-up you can see (a red arc) before it strikes. Hit it during the wind-up and the strike never lands. Skeletons shamble down to the slingshots or to your guard. Goblins steal gold or loose pickups and run for an outlane. Wolves lunge at the ball and bat it toward the drain. Spirits sit on a bumper and deaden it until you shoot through them. Cultists chant at a ramp mouth: shoot that ramp. Armored Dead hold an orbit entrance and shrug off soft hits. The Corrupted Knight guards the statue and parries. Trolls hold a scoop and punt the ball. Foes come in waves; clearing one pays a bounty and buys quiet.'],
  ['Bosses','The Warden waits in the Wilds, the campaign boss in the Keep. Warded: strike the lit bumpers (or slay the cultists). Casting: hit a flashing red shot to break the spell before it lands. Open: hit the boss. Bosses use the table: the Warden bars the Wolf Run, Moonfang drives the wolves wild, Ashmaw burns the floor in front of the Sanctum.'],
  ['The party','A companion guards the bottom drain of the Hollow: a ball that would go out bounces off them, at a cost to their health, and a ball off their post fires their perk. Swarms go for them. At zero they are wounded and the drain stands open until you complete a bank. The Tavern scoop hires recruits for gold: a class with one ability each. Rally (cradle a full meter) brings the whole party out as multiball. The camera follows the lowest ball, and play continues until the last ball drains. The survivor keeps its class; your leveled-up hero returns on the next launch. Party pulses and recruit abilities last twenty seconds.'],
  ['The Grave','Lose a ball with the Grave open (strike the Gravestones) and it falls into the Grave instead of draining: a timed room where driving both coffin nails at the head of the coffin opens the way back up. An open Grave always takes the ball, tilted or not.'],
  ['Lights','Every arrow on the table has a state. Flashing: do this now. Steady: worth shooting, it is available. Dim: collected, and still showing it. Colours: gold is the main quest, blue a side quest, green a lock, pink-violet a spellbook goal, white a feature that is open (the Tavern, the Witch, a scoop with a level-up or boon waiting), red a boss spell to break. When two of three lanes are lit, the last one blinks. The row of lamps above the flippers reads the table: 1x to 6x is your multiplier, LOCK 1 and LOCK 2 the Goblin Camp locks, BALL SAVE, KICKBACK, LEVEL UP (shoot any scoop), RALLY (cradle the ball) and COMBO while your combo timer runs. Progress on a quest shot is called out on the table where you made it.']
];

export const content={foes,bosses,campaigns,waveNames,plan,stages,side,wings,help,
  // the gravestones stir: every fourth hit on a bumper that opens the Grave raises one of these
  graveStir:{foe:'skeleton',every:4},
  // lamps: how to get from the field the ball is on to the field a quest step is on
  ways:{up:{2:['rampForest','crypt'],1:['rampRuin','secret']},down:{0:['oubliette']}},
  // what the spinners call onto their field every 18 turns
  spinCalls:{chains:{camp:2,text:'THE WIND CARRIES SOMETHING'},windmill:{foes:['wolf','wolf'],text:'THE MILL CALLS THE PACK'},vane:{camp:2,text:'THE WIND CARRIES SOMETHING'}},
  text:{
    title:'Gravebound',titleSmall:'Pinball',eyebrow:'A cursed kingdom on one table',version:'Gravebound 3D 0.21 on the engine',
    hintFresh:'Three levels, a grave and one campaign. Flippers and a nudge are all you get.',
    quiet:'The Hollow is quiet. For now.',lost:'The Hollow keeps its dead.',
    noMain:'The kingdom breathes. Something else is already stirring.',noSide:'No errands. The Tavern always has work.',alone:'You ride alone. The Tavern has company.',
    tavern:'The Drowned Lantern',tavernWaits:'The Lantern waits',
    explain:{wing:'The campaign wing is reached through the lit scoop in the Wilds once the Warden is beaten.',
      door:'The Sealed Door is the pair of drop targets at the top centre of the Wilds; the Rogue opens it in one hit, everyone else knocks both down.'}
  }
};

