/* Neon Descent: the content. Foes, bosses, the campaign, gigs and words. Data, read by the engine.
   See docs/TABLE_FORMAT.md, "Content". The rules are the engine's; only the names and the numbers here are this
   table's. Every foe is one of the engine's stock figures, recoloured. */

/* Foes. job is what it does on the table (the engine plays the job): swarm | thief | hunter | possess | ritual |
   wall | duel | gate. figure: which stock figure stands in for it. tint: its colours. undead: here, "a machine"
   (the Signal Witch burns those). cost: what it takes out of a wave's budget. */
const foes={
  drone:{figure:'skeleton',tint:{bone:'#7f8fa3',eyeG:'#43e7ed',rust:'#f6c85f'},cost:1,name:'Scrap Drone',job:'swarm',hp:18,r:14,xp:8,gold:3,undead:1,dmg:7,speed:26,wind:1.6,rate:[5,8]},
  pickpocket:{figure:'goblin',tint:{gob:'#c94f8a',gobD:'#6a2b52',eyeY:'#43e7ed',sack:'#2a3144'},cost:1,name:'Pickpocket',job:'thief',hp:14,r:13,xp:7,gold:6,hop:1,dmg:5,wind:1.2,rate:[6,9]},
  hound:{figure:'wolf',tint:{fur:'#8a96a8',mane:'#3a4252',belly:'#c2cadf',eyeY:'#ff4c6a'},cost:1.5,name:'Chrome Hound',job:'hunter',hp:24,r:15,xp:10,gold:3,prowl:1,beast:1,dmg:6},
  glitch:{figure:'spirit',tint:{ghost:'#ff4c9a',eyeC:'#ffffff'},cost:1,name:'Glitch',job:'possess',hp:12,r:15,xp:9,gold:2,ghost:1,undead:1,dmg:5,wind:2.2,rate:[8,11]},
  netjacker:{figure:'cultist',tint:{robe:'#16283a',trim:'#43e7ed',eyeV:'#43e7ed',staff:'#43e7ed'},cost:2,name:'Netjacker',job:'ritual',hp:20,r:14,xp:12,gold:6,cast:9},
  riot:{figure:'revenant',tint:{bone:'#3a4252',plate:'#54637a',eyeG:'#ff4c6a'},cost:2.5,name:'Riot Shield',job:'wall',hp:32,r:16,xp:16,gold:8,armor:2,dmg:9,wind:2,rate:[8,12]},
  enforcer:{figure:'knight',tint:{plate:'#2a3144',cape:'#b9a0ff',eyeR:'#b9a0ff'},cost:3.5,name:'Corp Enforcer',job:'duel',hp:58,r:17,xp:24,gold:12,armor:1,dmg:12,wind:1.8,rate:[9,13]},
  mech:{figure:'troll',tint:{troll:'#c9a13a',tbelly:'#54637a',eyeO:'#ff4c6a',bone:'#8795a7'},cost:5,name:'Loader Mech',job:'gate',hp:105,r:26,xp:40,gold:25,kick:1,undead:1,dmg:14,wind:2.4,rate:[10,14]}
};

/* Bosses: one warden per district, bottom to top. seq is the order of phases, looped: shield | open | summon | cast |
   frenzy. A cast is broken by any of its `shots`. tier is the field the boss stands on (its `boss` spot in the layout). */
const bosses={
  reaper:{name:'TOLL REAPER',short:'The Reaper',tier:3,frenzyFrom:'hideout',hp:250,r:36,color:'#f6c85f',seq:['shield','open','summon','open','cast','open'],
    summon:'riot',nSum:2,cast:{name:'Road Closed',time:11,dmg:22,curse:'weak',shots:['fwyKabuki','sewer','hideout'],closes:'fwyCathedral',note:'The Cathedral Freeway is barred'},xp:120,gold:80,relic:'key'},
  static:{name:'MADAME STATIC',short:'Madame Static',tier:2,frenzyFrom:'fixer',hp:330,r:34,color:'#ff4c9a',moving:true,seq:['open','summon','open','cast','frenzy','open'],
    summon:'glitch',nSum:3,cast:{name:'White Noise',time:10,dmg:24,curse:'dark',shots:['rooftop','pachinko','fixer'],frenzy:'hound',note:'The hounds are off the leash'},xp:180,gold:120,relic:'pelt'},
  choir:{name:'THE CHOIR',short:'The Choir',tier:1,frenzyFrom:'confessional',undead:true,hp:400,r:34,color:'#43e7ed',seq:['shield','open','summon','cast','open','frenzy'],wardBy:'netjacker',
    summon:'drone',nSum:3,cast:{name:'Hymn of Deletion',time:10,dmg:26,curse:'dark',shots:['cloister','confessional','archive']},xp:240,gold:160,relic:'hymnal'},
  helix:{name:'HELIX / GOD-MACHINE',short:'Helix',tier:0,frenzyFrom:'coreVault',undead:true,hp:540,r:40,color:'#b9a0ff',seq:['shield','open','cast','summon','open','frenzy'],
    summon:'enforcer',nSum:2,cast:{name:'System Purge',time:10,dmg:30,curse:'burn',shots:['spiral','coreVault','elevator'],fire:{x:320,y:505,r:125},note:'The floor is live'},xp:340,gold:260,relic:'scale'}
};

/* The campaign: one run up the arcology. `plan` says how the main quest is assembled from the pools.
   A step is {t:'shot', id, n} | {t:'done', id, n} | {t:'kill', e, tier, n} | {t:'boss', boss} | {t:'collect', tier, item}. */
const campaigns={
  descent:{name:'Neon Descent',threat:'the God-Machine',boss:'helix',foes:['drone','pickpocket','hound','glitch','netjacker','riot','enforcer','mech'],
    intro:'Four districts, four wardens. The machine at the top signs every eviction in the city. Go up and turn it off.',
    undercity:[{t:'shot',id:'grid',n:8,text:'Brown out the block. Strike the Power Grid'},
      {t:'kill',e:'drone',tier:3,n:3,text:'Scrap the patrol drones in the Undercity'},
      {t:'done',id:'signal',n:1,text:'Run all three Signal Lights'},
      {t:'done',id:'toll',n:1,text:'Smash through the Toll Booth'},
      {t:'shot',id:'turnstile',n:20,text:'Jump the Turnstile. Spin it'}],
    kabuki:[{t:'done',id:'curtain',n:1,text:'Bring down the Curtain'},
      {t:'kill',e:'pickpocket',tier:2,n:3,text:'Run the pickpockets out of Kabuki'},
      {t:'shot',id:'lanterns',n:10,text:'Light the paper Lanterns'},
      {t:'shot',id:'rooftop',n:2,text:'Run the Kabuki Rooftops twice'}],
    cathedral:[{t:'done',id:'mainframe',n:1,text:'Crack the Mainframe'},
      {t:'kill',e:'netjacker',tier:1,n:2,text:'Unplug the netjackers in the Cathedral'},
      {t:'shot',id:'wheel',n:20,text:'Turn the Prayer Wheel'},
      {t:'done',id:'hymn',n:1,text:'Light all four Hymn Lines'}],
    citadel:[{t:'done',id:'firewall',n:1,text:'Break the Firewall'},
      {t:'kill',e:'enforcer',tier:0,n:1,text:'Put down the Corp Enforcer'},
      {t:'shot',id:'spiral',n:2,text:'Ride the Helix Spiral twice'}],
    win:'The God-Machine goes dark. Somewhere below, every door in the city unlocks.'}
};
const plan=[
  {shuffle:'undercity',n:2,stage:'Street Level'},
  {boss:'reaper',text:'Take down the TOLL REAPER',stage:'The Toll'},
  {step:{t:'shot',id:'fwyKabuki',n:1,text:'Take the Kabuki Freeway uptown'},stage:'Uptown'},
  {pick:'kabuki',stage:'The Aftermarket'},
  {boss:'static',text:'Silence MADAME STATIC',stage:'Static'},
  {step:{t:'shot',id:'backstage',n:1,text:'Break the Stage Door and slip Backstage'},stage:'The Back Way'},
  {pick:'cathedral',stage:'The Cathedral'},
  {boss:'choir',text:'Mute THE CHOIR',stage:'The Choir'},
  {step:{t:'shot',id:'ascent',n:1,text:'Climb the Citadel Ascent'},stage:'The Climb'},
  {pick:'citadel',stage:'The Citadel'},
  {boss:'$boss',text:'Shut down HELIX, the God-Machine',stage:'God-Machine'}
];

/* Gigs (side quests): handed out by the scoops this table's rules give that job to (the Hideout, the Fixer). */
const side=[
  {id:'rats',name:'Rats in the Walls',giver:'Mama Okoro, noodle bar',text:'Pickpockets work my queue every night. Make them stop.',
    steps:[{t:'kill',e:'pickpocket',tier:3,n:3,text:'Clear the pickpockets out of the Undercity'},{t:'shot',id:'hideout',n:1,text:'Report back at the Hideout'}],rw:{gold:40,xp:30}},
  {id:'deck',name:'The Stolen Deck',giver:'Juno, ripperdoc',text:'Somebody fenced my cyberdeck in Kabuki. I cannot work without it.',
    steps:[{t:'collect',tier:2,n:1,item:'deck',text:'Find the deck somewhere in Kabuki'},{t:'shot',id:'chop',n:2,text:'Return it. Strike the Chop Shop targets'}],rw:{gold:30,xp:40,relic:1}},
  {id:'blackout',name:'Lights Out',giver:'A grid tech on strike',text:'Run the signals red and take the freeway. They will get the message.',
    steps:[{t:'done',id:'signal',n:1,text:'Run all three Signal Lights'},{t:'shot',id:'fwyCathedral',n:2,text:'Take the Cathedral Freeway twice'}],rw:{xp:45,heal:40}},
  {id:'courier',name:'Hot Package',giver:'A bleeding courier',text:'They took the case and my bike. Up the Kabuki freeway, not far.',
    steps:[{t:'shot',id:'fwyKabuki',n:1,text:'Chase them up the Kabuki Freeway'},{t:'kill',e:'pickpocket',tier:2,n:3,text:'Run them down in Kabuki'}],rw:{gold:70,xp:40}},
  {id:'reels',name:"The Fixer's Favour",giver:'The Fixer',text:'Spin the Reel thirty times and I will owe you. I hate owing.',
    steps:[{t:'shot',id:'reel',n:30,text:'Spin the Reel'},{t:'shot',id:'fixer',n:1,text:'Go back to the Fixer'}],rw:{xp:40,relic:1}},
  {id:'hounds',name:'Hound Bounty',giver:'Kabuki night watch',text:'Fifty a head. Bring me four.',
    steps:[{t:'kill',e:'hound',tier:2,n:4,text:'Put down chrome hounds in Kabuki'}],rw:{gold:90,xp:35}},
  {id:'maps',name:'The Back Way In',giver:'Fenwick, urban explorer',text:'I need two ways in marked. I am not going down there myself.',
    steps:[{t:'shot',id:'pachinko',n:1,text:'Case the Pachinko Parlor'},{t:'done',id:'stageDoor',n:1,text:'Break the Stage Door in Kabuki'},{t:'shot',id:'backstage',n:1,text:'Slip Backstage'}],rw:{gold:60,xp:70}},
  {id:'gyro',name:'Spin Cycle',giver:'A citadel janitor',text:'That gyro has not turned since the machine woke up. Turn it for me.',
    steps:[{t:'shot',id:'gyro',n:20,text:'Spin the Gyro in the Citadel'}],rw:{xp:60,gold:40}},
  {id:'extract',name:'Extraction',giver:'Dame Isolde, ex-corp',text:'My apprentice is in a holding cell up top. Get her out by the service elevator.',
    steps:[{t:'kill',e:'riot',tier:0,n:2,text:'Drop her guards in the Citadel'},{t:'shot',id:'elevator',n:1,text:'Ride the Service Elevator down'},{t:'shot',id:'hideout',n:1,text:'Bring her to the Hideout'}],rw:{gold:80,xp:80,relic:1}},
  {id:'ghosts',name:'Ghosts in the Grid',giver:'A sleepless sysop',text:'They drift through my racks at night. Four of them. I counted.',
    steps:[{t:'kill',e:'glitch',tier:3,n:4,text:'Purge the glitches from the Undercity'}],rw:{gold:35,xp:40}},
  {id:'tithe',name:'A Tithe from the Top',giver:'A hooded stranger',text:'The machine hoards. Lighten its vault.',
    steps:[{t:'done',id:'firewall',n:1,text:'Break the Firewall'},{t:'shot',id:'coreVault',n:1,text:'Loot the Core Vault'}],rw:{gold:160,xp:50}},
  {id:'pipes',name:'Out of Tune',giver:'The last organist',text:'The pipes are out of tune. Strike them until they hum.',
    steps:[{t:'shot',id:'pipes',n:12,text:'Strike the Organ Pipes'},{t:'shot',id:'orbitR1',n:1,text:'Walk the Ambulatory'}],rw:{xp:60,heal:30}},
  {id:'hold',name:'Hold the Line',giver:'Block captain Bryce',text:'They are coming down the ramp. Hold for half a minute.',
    steps:[{t:'kill',e:'drone',tier:3,n:5,time:45,text:'Scrap 5 drones before the line breaks'}],rw:{gold:60,xp:60}},
  {id:'patrol',name:'Night Shift',giver:'The ring road crew',text:'Drive it both ways. Shout if anything moves.',
    steps:[{t:'shot',id:'orbitL3',n:2,text:'Patrol the Ring Road, west'},{t:'shot',id:'orbitR3',n:1,text:'Patrol the Ring Road, east'}],rw:{gold:30,xp:35}},
  {id:'ice',name:'Ice for the Street',giver:'Quartermaster Pell',text:'The Citadel has black ICE to spare and nobody down here has any.',
    steps:[{t:'done',id:'ice',n:1,text:'Raid the Black ICE in the Citadel'},{t:'shot',id:'hideout',n:1,text:'Deliver it to the Hideout'}],rw:{gold:50,xp:60,relic:1}},
  {id:'spiral',name:'Three Times Round',giver:'A mad astrologer',text:'Three times round the spire and the satellites line up. Trust me.',
    steps:[{t:'shot',id:'spiral',n:3,text:'Ride the Helix Spiral three times'}],rw:{xp:90,gold:40}}
];

const help=[
  ['The table','Four districts stacked up an arcology: the Undercity at the bottom, then Kabuki Aftermarket, the Data Cathedral and Helix Citadel. Ramps are roads: most climb one district, the Cathedral Freeway and the Helix Express leave the cabinet and skip one. The gap between the flippers of an upper district drops you to the one below. Each district has a warden, and they fall in order, bottom to top. Under the Undercity is Flatline.'],
  ['Hardware','Flippers: every left flipper on the table moves together, and every right one. Slingshots kick the ball back up. Rollover lanes (top, inlanes, outlanes) score as you pass. Spinners score per turn. Drop targets fall when hit and a bank is complete when all are down; standup targets light. Pop bumpers score and feed your meter. Scoops hold the ball, pay out and eject it; some are tunnels to another district. Orbits are the loops around the outside. The kickback on the left outlane fires once, then has to be relit.'],
  ['Scoring','Your multiplier (1x to 6x) multiplies everything; run the three Signal Lights in the Undercity to raise it, or ask the Fixer. It resets each ball. Combos: shots made quickly after one another pay more. Bring down the Curtain in Kabuki to light the lock at the Pachinko Parlor; lock two balls for multiball, where ramps and orbits pay jackpots. The end-of-ball bonus counts that ball\'s foes, gigs and ramps, times your multiplier. Tilt (too many nudges) kills the flippers and forfeits the bonus.'],
  ['Your runner','The ball is the runner. Hits fill the power meter. Nudge (Space) fires your class nudge power. Hold the ball still on a raised flipper (cradle) for about a second with one bar of meter to arm your class shot: the next flip fires it and spends the bar. Cradle a full meter for a second and a half to Rally the crew. Level up and you unlock or level one of your four programs; each is run by completing its goal on the table (a bank, two ramps, two orbits or twenty spins, three lanes then a scoop) and lasts a while. Two unlocked programs can run at once.'],
  ['Security','Every foe has a job on the table and a wind-up you can see (a red arc) before it strikes. Hit it during the wind-up and the strike never lands. Scrap Drones march down to the slingshots or to your guard. Pickpockets steal creds or loose pickups and run for an outlane. Chrome Hounds lunge at the ball and bat it toward the drain. Glitches sit on a bumper and deaden it until you shoot through them. Netjackers chant at a ramp mouth: shoot that ramp. Riot Shields hold an orbit entrance and shrug off soft hits. The Corp Enforcer guards the statue and parries. Loader Mechs hold a scoop and punt the ball. Foes come in waves; clearing one pays a bounty and buys quiet.'],
  ['Wardens','One per district. Warded: strike the lit bumpers (or drop the netjackers). Casting: hit a flashing red shot to break it before it lands. Open: hit the warden. Wardens use the table: the Reaper bars the Cathedral Freeway, Madame Static lets the hounds off the leash, Helix makes the floor live in front of the Core Vault.'],
  ['The crew','A companion guards the bottom drain of the Undercity: a ball that would go out bounces off them, at a cost to their health, and a ball off their post fires their perk. Swarms go for them. At zero they are down and the drain stands open until you complete a bank. The Hideout hires recruits for creds: a class with one program each. Rally (cradle a full meter) brings the whole crew out as balls for twenty seconds. The camera stays on your own ball; losing it ends the Rally and the ball.'],
  ['Flatline','Lose a ball with Flatline armed (strike the Power Grid) and it drops into the black instead of draining: a timed room where throwing both dead switches opens the way back up. An armed Flatline always takes the ball, tilted or not.'],
  ['Lights','Every arrow on the table has a state. Flashing: do this now. Steady: worth shooting. Dim: collected. Colours: gold is the main job, blue a gig, green a lock, pink-violet a program goal, white a feature that is open, red a warden\'s cast to break. The row of lamps above the flippers reads the table: 1x to 6x is your multiplier, LOCK 1 and LOCK 2 the Pachinko locks, BALL SAVE, KICKBACK, LEVEL UP (shoot any scoop), RALLY (cradle the ball) and COMBO while your combo timer runs.']
];

/* The engine's classes, programs, crew and relics, in this city's words. Only words and colours change: what each
   one does is the shared rule set (docs/RULESET.md). */
const names={
  classes:{
    knight:{name:'Street Titan',tag:'Break the machine. Keep rolling.',color:'#f6c85f',glow:'#ffd98a',
      pass:'Heavy ball. Bumpers barely move it. Takes 30% less damage.',nudge:'Shockwave',nudgeText:'Staggers foes near the ball and delays their strikes.',
      shot:'Wrecking Ball',shotText:'Plows through foes, shatters armor and flattens whole drop banks.',abil:'Faraday Shell',abilText:'A shell saves your next lost ball. Half damage for 12 seconds.'},
    rogue:{name:'Chrome Ronin',tag:'A moving storm of monofilament.',color:'#ff4c9a',glow:'#ff8fc0',
      pass:'Small, fast ball. Combo shots always crit. Opens the Stage Door in one hit.',nudge:'Afterimage',nudgeText:'Cloaks the ball. It slips through foes and cuts each one.',
      shot:'Monowire',shotText:'No foe can strike while it is armed. The first hit is a triple crit for double creds.',abil:'Razor Halo',abilText:'12 seconds of guaranteed crits and double creds.'},
    mage:{name:'Netrunner',tag:'Turn the city against itself.',color:'#43e7ed',glow:'#8ff3f7',
      pass:'Lightning arcs to foes you pass. The Lanterns and the Organ Pipes strike for you.',nudge:'Spike',nudgeText:'Bolts the nearest foe and breaks its cast.',
      shot:'Logic Bomb',shotText:'Explodes on impact and burns every foe nearby.',abil:'System Rupture',abilText:'Lightning strikes every foe in the district. A mirror ball splits off.'},
    cleric:{name:'Signal Witch',tag:'Haunt the network in living color.',color:'#b9a0ff',glow:'#d6c8ff',
      pass:'A carrier wave burns nearby machines. Flatline arms twice as fast.',nudge:'Ward Pulse',nudgeText:'Heals a little, lifts one curse and scorches nearby machines.',
      shot:'Dead Zone',shotText:'Jams the ground it hits. Foes there burn, and you heal inside it.',abil:'Neon Seance',abilText:'Heal 35, lift curses, smite the machines, relight the kickback.'}},
  spells:{
    charge:{name:'Wrecking Field'},aegis:{name:'Faraday Shell'},warcry:{name:'Siege Horn'},shieldWall:{name:'Convoy'},
    cloak:{name:'Ghost Protocol'},smoke:{name:'Chaff'},markedPrey:{name:'Painted Target'},knives:{name:'Razor Halo'},
    frostNova:{name:'Black Ice'},barrier:{name:'Firewall'},meteor:{name:'Satellite Rain'},blink:{name:'Daemon Swarm'},
    consecration:{name:'Dead Zone'},sanctuary:{name:'Time Bloom'},judgement:{name:'Neon Seance'},radiance:{name:'Carrier Wave'}},
  companions:{tank:{name:'BRICK'},healer:{name:'PATCH'},dps:{name:'RAZOR'}},
  relics:{key:{name:"Reaper's Transponder"},pelt:{name:'Static Veil'},hymnal:{name:'Choir Codec'},scale:{name:'God-Machine Shard'},
    moonstone:{name:'Lucky Chip'},finger:{name:"Medic's Thumb"},spade:{name:"Scrapper's Magnet",desc:'Killing blows drop double creds.'},ember:{name:'Hot Cell'},coin:{name:'Loaded Die',desc:'+10% crit chance and +25% creds.'},handbell:{name:'Feedback Loop'},whet:{name:'Monofilament Edge'}},
  perks:{hourglass:{desc:'Ball save lasts twice as long.'},bargain:{name:'Hazard Pay',desc:'Every lost ball pays 25 creds on the way down.'},
    tithe:{name:'Loose Change',desc:'Bumpers and slingshots shake loose creds.'},hallowed:{name:'Clean Lanes'},harvest:{name:'Salvage',desc:'Every kill restores 5 health.'},fortune:{desc:'+60% creds from every source.'},breaker:{name:'Can Opener'}}
};

export const content={foes,bosses,campaigns,plan,side,help,names,
  noPerks:['bellRinger'], // boons that need a part this table does not have
  // the grid browns out: every fourth hit on a bumper that arms Flatline calls one of these
  graveStir:{foe:'drone',every:4},
  // lamps: how to get from the district the ball is in to the district a quest step is in
  ways:{up:{3:['fwyKabuki','sewer'],2:['backstage','express'],1:['ascent','archive']},down:{0:['elevator']}},
  // what the spinners call onto their field every 18 turns
  spinCalls:{gyro:{camp:2,text:'THE GYRO WAKES SOMETHING'},wheel:{foes:['netjacker'],text:'THE WHEEL CALLS THE FAITHFUL'},reel:{foes:['hound','hound'],text:'THE REEL CALLS THE HOUNDS'},turnstile:{camp:2,text:'SOMEBODY JUMPED THE TURNSTILE'}},
  text:{
    title:'Neon Descent',titleSmall:'Pinball',eyebrow:'Four districts, one machine',version:'Neon Descent 0.1 on the engine',
    hintFresh:'Four districts, a flatline and one job. Flippers and a nudge are all you get.',
    quiet:'The street is quiet. For now.',lost:'The city keeps what it is given.',
    noMain:'The city hums. Something else is already moving.',noSide:'No gigs. The Hideout always has work.',alone:'You run alone. The Hideout has company.',
    tavern:'The Hideout',tavernWaits:'The Hideout waits',lockMb:'Jackpot Parlor',coin:'creds',coinMark:'c',graveChip:'Flatline',
    wave:['Security Sweep','They are coming for the ball'],bell:['Alarm','Every camera in the district heard that'],
    graveOpen:['Flatline Armed','Your next lost ball drops into the black. Jack back out'],graveCount:'FLATLINE',
    graveIn:['Flatline','Throw both dead switches, then hit Reboot before the line goes flat'],
    graveObjNails:'Throw both dead switches at the head of the room',graveObjLight:'The switches are thrown. Hit Reboot',
    graveLost:['Flatlined','The city keeps what it is given'],graveLid:['Switches Thrown','Hit Reboot'],graveClosed:['Flat Line','The flippers go dead'],
    risen:['Rebooted','Back on the street'],graveStir:'THE GRID BROWNS OUT',watch:'THE BLOCK HOLDS +12s',followed:'SOMETHING TAILED YOU ROUND',
    explain:{stageDoor:'The Stage Door is the pair of drop targets at the top centre of Kabuki; the Chrome Ronin opens it in one hit, everyone else knocks both down.'}
  }
};
