/* Starfall: the content. No enemies, no bosses, no side quests: a table that leaves those out does not have them.
   What is here is the ladder of goals (docs/PINBALL.md, section 5), written as data so the engine tracks it, lights
   it and shows it, and this table's words. */
const campaigns={
  mission:{name:'Starfall',
    intro:'Get her off the ground, twice round the Slingshot, two balls through the Airlock, and home to the Dock.',
    // small things you do without trying: two of these, in any order
    preflight:[
      {t:'done',id:'beacons',n:1,text:'Light all three Beacons'},
      {t:'done',id:'hull',n:1,text:'Knock down the Hull Plates'},
      {t:'shot',id:'rocks',n:8,text:'Clear the Asteroids'},
      {t:'shot',id:'gyro',n:20,text:'Spin up the Gyro'}],
    win:'Touchdown. Everybody walks away.'}
};
// how the ladder is assembled: small things, a feature, the multiball, the long shot, the last shot
const plan=[
  {shuffle:'preflight',n:2,stage:'Pre-flight'},
  {step:{t:'shot',id:'loop',n:2,text:'Two laps of the Slingshot'},stage:'Lift-off'},
  {step:{t:'done',id:'sensors',n:1,text:'Wake the Sensors: they light the Airlock'},stage:'Approach'},
  {step:{t:'shot',id:'airlock',n:2,text:'Two balls into the Airlock'},stage:'Docking'},
  {step:{t:'shot',id:'loop',n:3,text:'Three laps, at speed'},stage:'Slingshot'},
  {step:{t:'shot',id:'dock',n:1,text:'Bring her home: the Dock'},stage:'Touchdown'}
];

const help=[
  ['The table','One playfield, three balls. Flashing gold lights are the mission: shoot them in order and the run ends in a landing. Everything else scores, and most of it helps.'],
  ['What lights what','Beacons (the three lanes at the top): the multiplier goes up one. Hull Plates: the kickback is relit and the ball save runs for 10 seconds. Sensors: the Airlock lock is lit, and scoring is doubled for 20 seconds. Thrusters: the cargo doubles. The multiplier, the ball save, the kickback and the lock are all shown as lamps in the floor.'],
  ['Cargo','Every lap of the Slingshot and every Asteroid adds to the cargo. The Dock pays it out and empties it. Bank it early and often, or let it ride: it is lost with the ball.'],
  ['Multiball','With the lock lit, two balls into the Airlock start multiball. During multiball the Slingshot and the orbits pay jackpots that grow.']
];

export const content={campaigns,plan,help,
  text:{title:'Starfall',titleSmall:'a plain pinball table',eyebrow:'pinballsauce',version:'Starfall',
    hintFresh:'Three balls. Light the Beacons, fly the Slingshot, lock two at the Airlock.',
    quiet:'All quiet.',lost:'She did not make it down.',noMain:'Mission complete.',
    mainHead:'Mission',mainDone:'Mission Complete',campHead:'Mission',
    overWon:'Touchdown',overLost:'Out of balls',nameAsk:'Sign the log',noScores:'No scores yet. The first line in the log is yours.',
    lockMb:'Airlock',
    buffs:{moon:'Double scoring'},
    endlessNote:'Endless: a new mission starts after each landing, instead of the run ending',
    controlsNote:'Flashing gold lights are the mission. Steady lights are things worth shooting. The lamps up the middle of the table are your multiplier.'}};
