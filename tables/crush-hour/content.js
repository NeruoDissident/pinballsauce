/* Crush Hour: the content. Rivals, the people to win over, the three routes, favours and words. Data, read by the
   engine. See docs/TABLE_FORMAT.md, "Content". The rules are the engine's; only the names and the numbers here are
   this table's.

   How the shared systems read on this table:
     health      = confidence. Rivals embarrass you; at zero you are mortified and the flippers go quiet
     foes        = rivals and nerves: gossips, note snatchers, butterflies. A "kill" sends one off, won over
     bosses      = the people standing between you and your crush, and last of all the crush
     a campaign  = one crush's route. There are three, and a run plays one
     the party   = your friends. The Rally is the whole squad turning up
     the Grave   = the Friend Zone
     gold        = bucks */

/* Rivals. job is what it does on the table (the engine plays the job): swarm | thief | hunter | possess | ritual |
   wall | duel | gate. Six are this table's own figures (theme/figures.js); the corgi and the butterflies are stock
   figures, recoloured. undead: here, "nerves and rumours" (the Sweetheart's glow melts those). */
const foes = {
  gossip: {name: 'Gossip', job: 'swarm', cost: 1, hp: 18, r: 14, xp: 8, gold: 3, undead: 1, dmg: 7, speed: 26, wind: 1.6, rate: [5, 8]},
  snatcher: {name: 'Note Snatcher', job: 'thief', cost: 1, hp: 14, r: 13, xp: 7, gold: 6, hop: 1, dmg: 5, wind: 1.2, rate: [6, 9]},
  corgi: {
    figure: 'wolf',
    tint: {fur: '#f0a860', mane: '#fff1dc', belly: '#fff1dc', eyeY: '#ff7eb6'},
    name: 'Loose Corgi',
    job: 'hunter',
    cost: 1.5,
    hp: 24,
    r: 15,
    xp: 10,
    gold: 3,
    prowl: 1,
    beast: 1,
    dmg: 6
  },
  jitters: {
    figure: 'spirit',
    tint: {ghost: '#ff9ac8', eyeC: '#ffffff'},
    name: 'Butterflies',
    job: 'possess',
    cost: 1,
    hp: 12,
    r: 15,
    xp: 9,
    gold: 2,
    ghost: 1,
    undead: 1,
    dmg: 5,
    wind: 2.2,
    rate: [8, 11]
  },
  poet: {name: 'Rival Poet', job: 'ritual', cost: 2, hp: 20, r: 14, xp: 12, gold: 6, cast: 9},
  chaperone: {name: 'Chaperone', job: 'wall', cost: 2.5, hp: 32, r: 16, xp: 16, gold: 8, armor: 2, dmg: 9, wind: 2, rate: [8, 12]},
  captain: {name: 'Kendo Captain', job: 'duel', cost: 3.5, hp: 58, r: 17, xp: 24, gold: 12, armor: 1, dmg: 12, wind: 1.8, rate: [9, 13]},
  mascot: {name: 'School Mascot', job: 'gate', cost: 5, hp: 105, r: 26, xp: 40, gold: 25, kick: 1, dmg: 14, wind: 2.4, rate: [10, 14]}
};

/* The people to win over. One stands on each playfield and they are met in the same order on every route; the
   last is the route's own crush. seq is the order of phases, looped: shield | open | summon | cast | frenzy. A cast
   is broken by any of its `shots`. tier is the playfield (its `boss` spot in the layout). */
const bosses = {
  dad: {
    name: 'DAD AT THE DOOR',
    short: 'Dad',
    tier: 'home',
    frenzyFrom: 'cafe',
    hp: 250,
    r: 36,
    color: '#ffb86b',
    seq: ['shield', 'open', 'summon', 'open', 'cast', 'open'],
    summon: 'chaperone',
    nSum: 2,
    cast: {
      name: 'Curfew',
      time: 11,
      dmg: 22,
      curse: 'weak',
      shots: ['schoolRun', 'busStop', 'cafe'],
      closes: 'plazaLine',
      note: 'The Plaza Line is closed'
    },
    xp: 120,
    gold: 80,
    relic: 'key'
  },
  monitor: {
    name: 'THE HALL MONITOR',
    short: 'The Hall Monitor',
    tier: 'school',
    frenzyFrom: 'nurse',
    hp: 330,
    r: 34,
    color: '#7fd4ff',
    moving: true,
    seq: ['open', 'summon', 'open', 'cast', 'frenzy', 'open'],
    summon: 'gossip',
    nSum: 3,
    cast: {
      name: 'Detention',
      time: 10,
      dmg: 24,
      curse: 'dark',
      shots: ['track', 'lockers', 'nurse'],
      frenzy: 'corgi',
      note: 'The corgis are loose'
    },
    xp: 180,
    gold: 120,
    relic: 'pelt'
  },
  queen: {
    name: 'THE QUEEN BEE',
    short: 'The Queen Bee',
    tier: 'plaza',
    frenzyFrom: 'photo',
    hp: 400,
    r: 34,
    color: '#ffd24a',
    seq: ['shield', 'open', 'summon', 'cast', 'open', 'frenzy'],
    wardBy: 'poet',
    summon: 'snatcher',
    nSum: 3,
    cast: {name: 'Cold Shoulder', time: 10, dmg: 26, curse: 'dark', shots: ['coaster', 'photo', 'fountain']},
    xp: 240,
    gold: 160,
    relic: 'hymnal'
  },
  // the three crushes: each is the last step of their own route, on their own playfield
  momo: {
    name: 'MOMO',
    short: 'Momo',
    tier: 'home',
    frenzyFrom: 'cafe',
    hp: 520,
    r: 36,
    color: '#ff9ac8',
    seq: ['shield', 'open', 'cast', 'summon', 'open', 'frenzy'],
    summon: 'jitters',
    nSum: 3,
    cast: {name: 'Awkward Silence', time: 10, dmg: 26, curse: 'hex', shots: ['cafe', 'schoolRun', 'plazaLine'], note: 'Say something'},
    xp: 340,
    gold: 260,
    relic: 'scale'
  },
  hana: {
    name: 'HANA',
    short: 'Hana',
    tier: 'school',
    frenzyFrom: 'lockers',
    hp: 520,
    r: 36,
    color: '#b8a0ff',
    seq: ['shield', 'open', 'cast', 'summon', 'open', 'frenzy'],
    summon: 'captain',
    nSum: 2,
    cast: {name: 'Pop Quiz', time: 10, dmg: 28, curse: 'weak', shots: ['track', 'lockers', 'skywalk'], note: 'She is testing you'},
    xp: 340,
    gold: 260,
    relic: 'scale'
  },
  riku: {
    name: 'RIKU',
    short: 'Riku',
    tier: 'plaza',
    frenzyFrom: 'fountain',
    hp: 520,
    r: 36,
    color: '#8ff0c8',
    seq: ['shield', 'open', 'cast', 'summon', 'open', 'frenzy'],
    summon: 'mascot',
    nSum: 1,
    cast: {name: 'High Score', time: 10, dmg: 28, curse: 'hex', shots: ['coaster', 'photo', 'promenade'], note: 'Beat it or he will not look up'},
    xp: 340,
    gold: 260,
    relic: 'scale'
  }
};

/* The routes. A run is one of them. The three share the pools of steps for each playfield and differ in who the
   crush is, the date, the last playfield and the rivals in their waves. `plan` says how a route is assembled.
   A step is {t:'shot', id, n} | {t:'done', id, n} | {t:'kill', e, tier, n} | {t:'boss', boss} | {t:'collect', tier, item}. */
const street = [
  {t: 'shot', id: 'hearts', n: 8, text: 'Get your heart racing. Hit the Heartbeats'},
  {t: 'kill', e: 'gossip', tier: 'home', n: 3, text: 'Shush the gossips on Maple Street'},
  {t: 'done', id: 'porch', n: 1, text: 'Light all three Porch Lights'},
  {t: 'done', id: 'gate', n: 1, text: 'Open the Garden Gate'},
  {t: 'shot', id: 'pinwheel', n: 20, text: 'Spin the Pinwheel'}
];
const school = [
  {t: 'done', id: 'desks', n: 1, text: 'Clear the Desks in the Club Room'},
  {t: 'kill', e: 'snatcher', tier: 'school', n: 3, text: 'Catch the note snatchers at Sakura High'},
  {t: 'shot', id: 'bells', n: 10, text: 'Ring the School Bells'},
  {t: 'shot', id: 'track', n: 2, text: 'Run two laps of the Track'}
];
const plaza = [
  {t: 'done', id: 'crepe', n: 1, text: 'Order at the Crepe Stand'},
  {t: 'kill', e: 'poet', tier: 'plaza', n: 2, text: 'Out-rhyme the rival poets at the Plaza'},
  {t: 'shot', id: 'ferris', n: 20, text: 'Ride the Ferris Wheel. Spin it'},
  {t: 'done', id: 'strings', n: 1, text: 'Light all four String Lights'}
];
const campaigns = {
  momo: {
    name: "Momo's Route",
    boss: 'momo',
    foes: ['gossip', 'snatcher', 'corgi', 'jitters', 'chaperone', 'mascot'],
    intro: 'Momo has lived next door since you were six. This is the year you tell her.',
    street,
    school,
    plaza,
    date: {t: 'shot', id: 'cafe', n: 2, text: 'Share a boba with Momo at the Cafe, twice'},
    win: 'Momo laughs, then goes quiet, then says she was waiting for you to ask.'
  },
  hana: {
    name: "Hana's Route",
    boss: 'hana',
    foes: ['gossip', 'poet', 'chaperone', 'captain', 'jitters', 'snatcher'],
    intro: 'Hana runs the student council and has never once looked up from her clipboard. Make her look up.',
    street,
    school,
    plaza,
    date: {t: 'shot', id: 'rooftop', n: 1, text: 'Meet Hana on the Rooftop. Open the Clubroom Door first'},
    win: 'Hana puts the clipboard down. For the first time all year, it stays down.'
  },
  riku: {
    name: "Riku's Route",
    boss: 'riku',
    foes: ['snatcher', 'corgi', 'jitters', 'captain', 'mascot', 'gossip'],
    intro: 'Riku holds every high score at the Plaza arcade. There is one he has not seen coming.',
    street,
    school,
    plaza,
    date: {t: 'shot', id: 'coaster', n: 2, text: 'Ride the Coaster with Riku, twice'},
    win: 'Riku loses a game on purpose. You both know it. Neither of you says so.'
  }
};
const plan = [
  {shuffle: 'street', n: 2, stage: 'Maple Street'},
  {boss: 'dad', text: 'Win over DAD AT THE DOOR', stage: 'Curfew'},
  {step: {t: 'shot', id: 'schoolRun', n: 1, text: 'Catch the School Run to Sakura High'}, stage: 'First Bell'},
  {pick: 'school', stage: 'Sakura High'},
  {boss: 'monitor', text: 'Get past THE HALL MONITOR', stage: 'Hall Pass'},
  {step: {t: 'shot', id: 'skywalk', n: 1, text: 'Cross the Sky Bridge to the Plaza'}, stage: 'After School'},
  {pick: 'plaza', stage: 'Starlight Plaza'},
  {boss: 'queen', text: 'Outshine THE QUEEN BEE', stage: 'Queen Bee'},
  {use: 'date', stage: 'The Date'},
  {boss: '$boss', text: 'Tell them how you feel', stage: 'The Confession'}
];

/* Favours (side quests): handed out by the Boba Cafe and the Photo Booth. */
const side = [
  {
    id: 'cat',
    name: 'Mr. Whiskers',
    giver: 'Mrs. Alder, number 12',
    text: 'He got out again. He answers to nothing, but he likes the cafe.',
    steps: [
      {t: 'collect', tier: 'home', n: 1, item: 'cat', text: 'Find Mr. Whiskers somewhere on Maple Street'},
      {t: 'shot', id: 'cafe', n: 1, text: 'Bring him to the Boba Cafe'}
    ],
    rw: {gold: 40, xp: 30}
  },
  {
    id: 'rumour',
    name: 'Rumour Mill',
    giver: 'Your best friend',
    text: 'They are saying things about you on your own street. Go and be louder.',
    steps: [
      {t: 'kill', e: 'gossip', tier: 'home', n: 3, text: 'Shush the gossips on Maple Street'},
      {t: 'shot', id: 'cafe', n: 1, text: 'Report back at the Boba Cafe'}
    ],
    rw: {gold: 40, xp: 30}
  },
  {
    id: 'note',
    name: 'Pass It On',
    giver: 'Yuki, second row',
    text: 'Can you get this to locker 114 without anyone reading it? Anyone.',
    steps: [
      {t: 'done', id: 'desks', n: 1, text: 'Clear the Desks so nobody sees'},
      {t: 'shot', id: 'lockers', n: 1, text: 'Slip the note into the Lockers'}
    ],
    rw: {xp: 45, heal: 40}
  },
  {
    id: 'lunch',
    name: 'Lunch on the Roof',
    giver: 'The art club',
    text: 'The roof is the only quiet place in school and the door is always shut.',
    steps: [
      {t: 'done', id: 'clubDoor', n: 1, text: 'Open the Clubroom Door'},
      {t: 'shot', id: 'rooftop', n: 1, text: 'Take the stair to the Rooftop'}
    ],
    rw: {gold: 60, xp: 70}
  },
  {
    id: 'laps',
    name: 'Track Tryouts',
    giver: 'Coach Tanaka',
    text: 'Three laps. I am not timing you. I am absolutely timing you.',
    steps: [{t: 'shot', id: 'track', n: 3, text: 'Run three laps of the Track'}],
    rw: {xp: 90, gold: 40}
  },
  {
    id: 'plush',
    name: 'The Big Plush',
    giver: 'A kid at the claw machines',
    text: 'It has been in there for a year. The claw is rigged. Everyone knows the claw is rigged.',
    steps: [
      {t: 'shot', id: 'claws', n: 12, text: 'Work the Claw Machines'},
      {t: 'shot', id: 'photo', n: 1, text: 'Take a picture with it at the Photo Booth'}
    ],
    rw: {xp: 60, heal: 30}
  },
  {
    id: 'corgis',
    name: 'Dog Walker',
    giver: 'The pet shop',
    text: 'Four of them slipped their leads. They are friendly. That is the problem.',
    steps: [{t: 'kill', e: 'corgi', tier: 'plaza', n: 4, text: 'Round up the corgis at the Plaza'}],
    rw: {gold: 90, xp: 35}
  },
  {
    id: 'wheel',
    name: 'Top of the Wheel',
    giver: 'A nervous couple',
    text: 'It stopped with us at the bottom. We wanted the top. Could you keep it turning?',
    steps: [
      {t: 'shot', id: 'ferris', n: 30, text: 'Spin the Ferris Wheel'},
      {t: 'shot', id: 'fountain', n: 1, text: 'Toss a coin in the Wishing Fountain for them'}
    ],
    rw: {xp: 40, relic: 1}
  },
  {
    id: 'delivery',
    name: 'Sweet Delivery',
    giver: 'The Sweet Shop',
    text: 'One box for the Plaza, and it has to get there before the icing gives up.',
    steps: [
      {t: 'done', id: 'sweets', n: 1, text: 'Pick up the order at the Sweet Shop'},
      {t: 'shot', id: 'plazaLine', n: 2, text: 'Take the Plaza Line twice'}
    ],
    rw: {xp: 45, heal: 40}
  },
  {
    id: 'umbrella',
    name: 'Shared Umbrella',
    giver: 'Someone caught in the rain',
    text: 'I only have the one umbrella and I am going your way. Probably.',
    steps: [
      {t: 'shot', id: 'schoolRun', n: 1, text: 'Walk them up the School Run'},
      {t: 'kill', e: 'jitters', tier: 'school', n: 3, text: 'Calm the butterflies at Sakura High'}
    ],
    rw: {gold: 70, xp: 40}
  },
  {
    id: 'festival',
    name: 'Festival Prep',
    giver: 'The student council',
    text: 'The lights are not up and half the committee has no hall pass. We open at six.',
    steps: [
      {t: 'done', id: 'strings', n: 1, text: 'Hang the String Lights at the Plaza'},
      {t: 'done', id: 'passes', n: 1, text: 'Collect the Hall Passes at Sakura High'}
    ],
    rw: {gold: 60, xp: 60, relic: 1}
  },
  {
    id: 'stand',
    name: 'Stand Up To Them',
    giver: 'A shy first-year',
    text: 'They follow me home and they never stop talking. I just want one quiet walk.',
    steps: [{t: 'kill', e: 'gossip', tier: 'home', n: 5, time: 45, text: 'Shush 5 gossips before the streetlights come on'}],
    rw: {gold: 60, xp: 60}
  },
  {
    id: 'walk',
    name: 'Evening Walk',
    giver: 'Grandpa Sato',
    text: 'Twice round the block and a stop at the pinwheel. Doctor says. Keep me company.',
    steps: [
      {t: 'shot', id: 'orbitL2', n: 2, text: 'Walk the Block twice'},
      {t: 'shot', id: 'pinwheel', n: 10, text: 'Stop and spin the Pinwheel'}
    ],
    rw: {gold: 30, xp: 35}
  },
  {
    id: 'globe',
    name: 'Spin the Globe',
    giver: 'The geography teacher',
    text: 'Wherever it stops, that is where the class trip goes. It has to look fair.',
    steps: [{t: 'shot', id: 'globe', n: 20, text: 'Spin the Globe at Sakura High'}],
    rw: {xp: 60, gold: 40}
  }
];

const help = [
  [
    'The table',
    'Three playfields standing as a heart. Maple Street is the point at the bottom, with the plunger and the only real drain. Sakura High is the left lobe and Starlight Plaza the right. The School Run and the Plaza Line climb from Maple Street to the two lobes; the Sky Bridge and the Promenade cross between them over the top of the heart. Lose the ball on a lobe and it only slides back down to Maple Street. Under Maple Street is the Friend Zone.'
  ],
  [
    'Hardware',
    'Flippers: every left flipper on the table moves together, and every right one. Slingshots kick the ball back up. Rollover lanes (top, inlanes, outlanes) score as you pass. Spinners score per turn. Drop targets fall when hit and a bank is complete when all are down; standup targets light. Pop bumpers score and fill your meter. Scoops hold the ball, pay out and send it back; some are short cuts to another playfield. Orbits are the loops round the outside. The kickback on the left outlane fires once, then has to be relit.'
  ],
  [
    'Scoring',
    'Your multiplier (1x to 6x) multiplies everything; light the three Porch Lights on Maple Street to raise it, or try the Photo Booth. It resets each ball. Combos: shots made quickly after one another pay more. Clear the Desks at Sakura High to light the Lockers; lock two love letters there for multiball, where ramps and orbits pay jackpots. The end-of-ball bonus counts that ball\'s rivals, favours, ramps and perfect days, times your multiplier. Too many nudges and you have overdone it: the flippers go quiet and the bonus is gone.'
  ],
  [
    'The Perfect Day',
    'Three stops, one on each playfield: a boba at the Cafe on Maple Street, lunch on the Rooftop at Sakura High (behind the Clubroom Door) and a picture at the Photo Booth in the Plaza. The three small lamps above the flippers on Maple Street show which you have. Make all three on one ball for the Perfect Day: a big payout, the kickback relit and thirty seconds of double scoring. Lose the ball first and the day is over: the stops go out.'
  ],
  [
    'You',
    'The ball is you. Hits fill the meter. Nudge (Space) uses your nudge power. Hold the ball still on a raised flipper (cradle) for about a second with one bar of meter to arm your big shot: the next flip fires it and spends the bar. Cradle a full meter for a second and a half to call the whole squad. Glow up (level up) and you learn or improve one of your four moves; each is set off by finishing its goal on the table (a bank, two ramps, two orbits or twenty spins, three lanes then a scoop) and lasts a while. Two moves can run at once.'
  ],
  [
    'Rivals',
    'Every rival has a job on the table and a wind-up you can see (a red arc) before they act. Hit them during the wind-up and it never lands. Gossips march down to the slingshots or to your friend at the drain. Note Snatchers grab bucks or loose pickups and run for an outlane. Loose Corgis jump at the ball and bat it toward the drain. Butterflies settle on a bumper and deaden it until you shoot through them. Rival Poets recite at a ramp mouth: shoot that ramp. Chaperones hold an orbit entrance and shrug off soft hits. The Kendo Captain guards the statue and parries. The School Mascot holds a scoop and punts the ball. Rivals come in waves; clearing one pays and buys quiet. Their hits cost confidence; at zero you are mortified and the flippers stop.'
  ],
  [
    'Winning people over',
    'One stands on each playfield and they are met in order: Dad at the Door on Maple Street, the Hall Monitor at Sakura High, the Queen Bee at the Plaza, and last your crush on their own playfield. Guarded: hit the lit bumpers (or send off the poets). Starting something: hit a flashing red shot to stop it before it lands. Listening: hit them. They use the table: Dad closes the Plaza Line, the Hall Monitor lets the corgis loose.'
  ],
  [
    'Your friends',
    'A friend stands at the bottom drain of Maple Street: a ball that would go out bounces off them, at a cost to their confidence, and a ball off their post sets off their perk. Gossips go for them. At zero they head home and the drain stands open until you complete a bank. The Boba Cafe has more friends for bucks. Cradle a full meter and the whole squad comes out as balls for twenty seconds. The camera stays on your own ball; losing it ends the squad and the ball.'
  ],
  [
    'The Friend Zone',
    'Lose a ball with the Friend Zone open (hit the Heartbeats to open it) and it drops in instead of draining: a timed room where clearing up both Mixed Signals opens One More Chance, the way back up. An open Friend Zone always takes the ball, overdone or not.'
  ],
  [
    'Lights',
    'Every arrow on the table has a state. Flashing: do this now. Steady: worth shooting. Dim: collected. Colours: gold is your plan, blue a favour, green the lock, pink a move\'s goal, amber a payout waiting, white a feature that is open, red something to stop. The lamps in the floor of Maple Street read the table: 2x to 6x is your multiplier, BALL SAVE, KICK, SQUAD (cradle the ball), ZONE (the Friend Zone is open) and the three stops of the Perfect Day. The lock has its own lamps beside the Lockers, and the Fountain has one for a wish.'
  ]
];

/* The engine's classes, moves, friends, relics and boons in this table's words. Only words and colours change:
   what each one does is the shared rule set (docs/RULESET.md). */
const names = {
  classes: {
    knight: {
      name: 'Varsity Star',
      tag: 'Big heart. Hard to knock over.',
      color: '#ffb86b',
      glow: '#ffd9a8',
      pass: 'Heavy ball. Bumpers barely move it. Loses 30% less confidence.',
      nudge: 'Pep Rally',
      nudgeText: 'Flusters rivals near the ball and delays their moves.',
      shot: 'Touchdown',
      shotText: 'Plows through rivals, cracks composure and flattens whole drop banks.',
      abil: 'Letterman Jacket',
      abilText: 'The jacket saves your next lost ball. Half the embarrassment for 12 seconds.'
    },
    rogue: {
      name: 'Smooth Talker',
      tag: 'In, out, and they are still smiling.',
      color: '#ff7eb6',
      glow: '#ffb3d4',
      pass: 'Small, fast ball. Combo shots always swoon. Opens the Clubroom Door in one hit.',
      nudge: 'Wink',
      nudgeText: 'The ball slips through rivals and charms each one on the way.',
      shot: 'Pickup Line',
      shotText: 'No rival can act while it is armed. The first hit is a triple swoon for double bucks.',
      abil: 'On a Roll',
      abilText: '12 seconds of guaranteed swoons and double bucks.'
    },
    mage: {
      name: 'Drama Star',
      tag: 'Every room is a stage.',
      color: '#7fd4ff',
      glow: '#b8e8ff',
      pass: 'Sparks fly to rivals you pass. The School Bells and the Claw Machines strike for you.',
      nudge: 'Spotlight',
      nudgeText: 'Zaps the nearest rival and breaks their concentration.',
      shot: 'Showstopper',
      shotText: 'Bursts on impact and dazzles every rival nearby.',
      abil: 'Standing Ovation',
      abilText: 'Sparks hit every rival on the playfield. A mirror ball splits off.'
    },
    cleric: {
      name: 'Sweetheart',
      tag: 'Kindness is a superpower.',
      color: '#c9a8ff',
      glow: '#e0d0ff',
      pass: 'A warm glow melts gossip and butterflies nearby. The Friend Zone opens twice as fast.',
      nudge: 'Kind Word',
      nudgeText: 'Cheers you up a little, lifts one hang-up and melts nearby nerves.',
      shot: 'Safe Space',
      shotText: 'Warms the ground it hits. Rivals there wilt, and you recover inside it.',
      abil: 'Group Hug',
      abilText: 'Recover 35 confidence, lift hang-ups, melt the nerves, relight the kickback.'
    }
  },
  spells: {
    charge: {name: 'Fight Song'},
    aegis: {name: 'Letterman Jacket'},
    warcry: {name: 'Pep Talk'},
    shieldWall: {name: 'Huddle'},
    cloak: {name: 'Play It Cool'},
    smoke: {name: 'Change the Subject'},
    markedPrey: {name: 'Eye Contact'},
    knives: {name: 'On a Roll'},
    frostNova: {name: 'Cold Open'},
    barrier: {name: 'Fourth Wall'},
    meteor: {name: 'Confetti Cannon'},
    blink: {name: 'Quick Change'},
    consecration: {name: 'Safe Space'},
    sanctuary: {name: 'Slow Dance'},
    judgement: {name: 'Group Hug'},
    radiance: {name: 'Warm Glow'}
  },
  companions: {tank: {name: 'Bestie'}, healer: {name: 'Big Sis'}, dps: {name: 'Wingman'}},
  relics: {
    key: {name: "Dad's Blessing"},
    pelt: {name: 'Hall Pass for Life'},
    hymnal: {name: 'The Invite List'},
    scale: {name: 'Matching Charm'},
    moonstone: {name: 'Lucky Eraser'},
    spade: {name: 'Piggy Bank', desc: 'Sending a rival off drops double bucks.'},
    coin: {name: 'Arcade Token', desc: '+10% swoon chance and +25% bucks.'}
  },
  perks: {
    bargain: {name: 'Bus Fare', desc: 'Every lost ball pays 25 bucks on the way down.'},
    tithe: {name: 'Loose Change', desc: 'Bumpers and slingshots shake loose bucks.'},
    harvest: {name: 'Good Mood', desc: 'Every rival sent off restores 5 confidence.'},
    fortune: {desc: '+60% bucks from every source.'}
  }
};

export const content = {
  foes,
  bosses,
  campaigns,
  plan,
  side,
  help,
  names,
  noPerks: ['bellRinger'], // boons that need a part this table does not have
  // your heart skips: every fourth hit on a bumper that opens the Friend Zone calls one of these
  graveStir: {foe: 'jitters', every: 4},
  // what the spinners call onto their playfield every 18 turns
  spinCalls: {
    globe: {foes: ['gossip', 'gossip'], text: 'THE WHOLE CLASS IS TALKING'},
    ferris: {foes: ['corgi', 'corgi'], text: 'WHO LET THE DOGS OUT'},
    pinwheel: {camp: 2, text: 'THE NEIGHBOURS ARE WATCHING'}
  },
  text: {
    title: 'Crush Hour',
    titleSmall: 'Pinball',
    eyebrow: 'Three playfields, one heart',
    version: 'Crush Hour 0.1',
    hintFresh: 'Three crushes, three playfields, one confession. Flippers and a nudge are all you get.',
    quiet: 'All quiet on Maple Street. For now.',
    lost: 'Maybe next semester.',
    noMain: 'Nothing planned. Something will come up.',
    noSide: 'No favours. The Cafe always has some.',
    alone: 'You are on your own. The Cafe has company.',
    tavern: 'The Boba Cafe',
    tavernWaits: 'The Cafe is open',
    lockMb: 'Love Letter',
    coin: 'bucks',
    coinMark: '$',
    graveChip: 'Friend Zone',
    wave: ['Here They Come', 'Rivals on the floor'],
    bell: ['Recess', 'Everybody heard that'],
    barred: 'CLOSED',
    feel: 'THEY FELT THAT',
    graveOpen: ['The Friend Zone Opens', 'Your next lost ball lands in it. Talk your way back out'],
    graveCount: 'FRIEND ZONE',
    graveIn: ['The Friend Zone', 'Clear up both Mixed Signals, then take One More Chance before the moment passes'],
    graveObjNails: 'Clear up both Mixed Signals at the head of the room',
    graveObjLight: 'Signals cleared. Take One More Chance',
    graveLost: ['Just Friends', 'Maybe next semester'],
    graveLid: ['Signals Cleared', 'Take One More Chance'],
    graveClosed: ['The Moment Passes', 'The flippers go quiet'],
    risen: ['Back In It', 'Out of the Friend Zone'],
    graveStir: 'YOUR HEART SKIPS',
    watch: 'YOUR FRIENDS HOLD +12s',
    followed: 'SOMEONE FOLLOWED YOU ROUND',
    mainHead: 'The Plan',
    mainDone: 'They Said Yes',
    sideHead: 'Favours',
    heroHead: 'You',
    campHead: 'Route',
    overWon: 'Happily ever after school',
    overLost: 'The last bell rings',
    nameAsk: 'Sign the yearbook',
    noScores: 'No scores yet. The first page of the yearbook is yours.',
    buffs: {sharp: 'Confident', stealth: 'Smooth', aegis: 'Sugar Rush', moon: 'Golden Hour 2x'},
    endlessNote: 'Endless: a new crush comes along after every route, instead of the run ending',
    controlsNote:
      'Flashing gold arrows are your plan. Blue ones are favours. Ramps climb to the two upper playfields; lose the ball up there and it only slides back to Maple Street.',
    explain: {
      clubDoor:
        'The Clubroom Door is the pair of drop targets at the top centre of Sakura High; the Smooth Talker opens it in one hit, everyone else knocks both down.'
    },
    // the shared code's own wording, and this table's (docs/TABLE_FORMAT.md, "Words")
    words: {
      'Boss Awakened': 'Face to Face',
      'Boss Slain': 'Won Over',
      'Level Up': 'Glow Up',
      'Quest Accepted': 'New Plan',
      'Quest Complete': 'It Worked',
      'Quest Failed': 'Missed It',
      Rally: 'Squad Up',
      'The party is coming. Keep your own ball alive': 'Your friends are coming. Keep your own ball alive',
      'The Party Withdraws': 'Your Friends Head Home',
      'No One Answers': 'Nobody Picks Up',
      'You ride alone. Nothing comes to the call': 'You have no friends along yet. The Cafe has some',
      Tilt: 'Too Much',
      'The table goes dead': 'You overdid it. The flippers go quiet',
      Fallen: 'Mortified',
      'Your hero collapses. The flippers go dead': 'You cannot even look up. The flippers go quiet',
      'Wave Cleared': 'All Clear',
      'Spell Interrupted': 'Moment Saved',
      'SPELL INTERRUPTED': 'MOMENT SAVED',
      'Wards Broken': 'Guard Down',
      'WARDS BROKEN': 'GUARD DOWN',
      'A New Shadow Rises': 'A New Crush Appears',
      'The Grave Opens': 'The Friend Zone Opens',
      'Your next lost ball falls into it': 'Your next lost ball lands in it',
      'Relic claimed: ': 'Keepsake: ',
      STAGGERED: 'FLUSTERED',
      'CRIT ': 'SWOON ',
      BACKSTAB: 'SURPRISE',
      CURSED: 'TONGUE-TIED',
      POSSESSED: 'BUTTERFLIES',
      'RITUAL BROKEN': 'POEM INTERRUPTED',
      ARMOR: 'COMPOSURE',
      LUNGE: 'POUNCE',
      WARDED: 'UNBOTHERED',
      'WARDED. Strike the lit bumpers': 'GUARDED. Hit the lit bumpers',
      'WARDED. Slay the ': 'GUARDED. Send off the ',
      'Strike ': 'Hit ',
      CONSECRATED: 'SAFE SPACE',
      'SOMETHING IS COMING': 'SOMEONE IS COMING',
      'Warded. Strike the lit bumpers': 'Guarded. Hit the lit bumpers',
      'Exposed. Strike the boss': 'Listening. Go on',
      'Staggered. Double damage': 'Flustered. Double charm',
      'Summoning. Slay the minions': 'Calling backup. Send them off',
      'Casting ': 'Starting ',
      Frenzy: 'Showdown',
      'Wakes with the main quest. Next: ': 'Turns up as your plan goes on. Next: ',
      'Rising. ': 'On the way. '
    }
  }
};
