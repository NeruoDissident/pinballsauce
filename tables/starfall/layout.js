/* Starfall: the layout. Pure data. See docs/TABLE_FORMAT.md, and docs/PINBALL.md for why each thing is here.

   One playfield. No room under it, no side rooms: a ball that drains is lost. This is the plain table: everything
   on it is pinball and nothing else. What it has, shot by shot:

     from the RIGHT flipper   the Slingshot (a ramp: once round the top and back to the right inlane, so it can be
                              shot again straight away), the Gyro (a spinner in front of it), the Hull Plates (drop
                              targets above it), the Thrusters (standups low on the left), the left orbit
     from the LEFT flipper    the Airlock (the scoop that locks balls), the Sensors (standups, upper right), the
                              right orbit, the Asteroids (bumpers)
     from either              the Dock (the centre scoop: the sure shot)
     off the plunger          the Beacons (three lanes under the arch; the flashing one is the skill shot)

   Lights: an insert at every shot (`shots` below), and the state of the game set into the floor as lamps: the
   multiplier up the middle, the ball save above the flippers, the kickback in the left outlane, the lock by the
   Airlock, the cargo by the Dock. */
const aL=Math.atan2(-.925,-.38);
const BLUE='#7ad0ff';

export const layout={
  fields:[
    {id:'deck',name:'Flight Deck',short:'the Deck',shooter:true,
      pieces:[
        {t:'lanes',id:'beacons',name:'Beacons',y:118,r:13,xs:[284,320,356],posts:{xs:[266,302,338,374],y0:92,y1:142,w:4},skill:true,ballReset:true},
        // a fair launch: a one-way gate across the head of the left orbit. A plunged ball coming round the arch meets it
        // and drops among the Beacons and Asteroids instead of running on down the orbit and past the flippers. A ball
        // shot up the left orbit from a flipper goes straight through it.
        {t:'gate',pts:[[91,107],[126,136]],solid:[150,95]},
        {t:'bumper',x:258,y:234,r:24,group:'rocks'},{t:'bumper',x:382,y:234,r:24,group:'rocks'},{t:'bumper',x:320,y:304,r:24,group:'rocks'},
        // the Slingshot's mouth, the wedge beside it, and the Hull Plates above it
        {t:'mouth',id:'loop',x:172,y:480,side:-1},
        {t:'bank',id:'hull',name:'Hull Plates',kind:'drop',from:[192,336],to:[254,310],n:3},
        {t:'block',name:'hull',pts:[[190,330],[252,304],[236,270],[190,282]]},
        {t:'block',name:'wedge',pts:[[66,390],'@loop.lt','@loop.lb',[72,520],[66,500]]},
        {t:'wall',w:3,pts:['@loop.rb','@loop.rt']},
        {t:'spinner',id:'gyro',x:195,y:540,r:20,rot:Math.atan2(.925,.38)-Math.PI/2},
        // the Thrusters: two standups low on the left
        {t:'bank',id:'thrusters',name:'Thrusters',kind:'target',from:[70,640],to:[112,604],n:2,pad:.1},
        {t:'block',name:'thrusters',pts:[[70,640],[112,604],[96,584],[66,576],[66,636]]},
        // the Dock: dead centre, with a wide mouth
        {t:'centerScoop',x:303,w:28},
        {t:'hole',id:'dock',name:'Dock',x:303,y:444,r:14,eject:'L'},
        // the Sensors, high on the right; under them the block with the Airlock in its base
        {t:'bank',id:'sensors',name:'Sensors',kind:'target',from:[412,298],to:[482,323],n:3,pad:.05},
        {t:'block',name:'sensors',pts:[[412,298],[482,323],[540,300],[540,250],[446,262]]},
        {t:'block',name:'airlock',pts:[[478,422],[540,390],[540,640],['notch',505,602],[470,640],[470,540],[460,491]]},
        {t:'hole',id:'airlock',name:'Airlock',x:505,y:622,r:13,eject:'R'},
        // the state of the game, in the floor
        {t:'lamp',x:303,y:800,show:'mult2',label:'2x'},{t:'lamp',x:303,y:770,show:'mult3',label:'3x'},{t:'lamp',x:303,y:740,show:'mult4',label:'4x'},
        {t:'lamp',x:303,y:710,show:'mult5',label:'5x'},{t:'lamp',x:303,y:680,show:'mult6',label:'6x'},
        {t:'lamp',x:303,y:846,r:10,show:'save',label:'ball save',col:'#ffffff'},
        {t:'lamp',x:41,y:850,show:'kickback',label:'kick',col:'#ffd24a'},
        {t:'lamp',x:470,y:668,show:'lockLit',label:'lock',col:'#7dffb0'},
        {t:'lamp',x:470,y:700,show:'lock1',label:'1 locked',col:'#7dffb0'},
        {t:'lamp',x:303,y:590,r:10,show:'mb',label:'multiball',col:'#ffd24a'},
        {t:'lamp',x:250,y:520,show:'cargo',label:'cargo',col:'#ffb050'},
        // a post under the gap between the flippers: a ball dropping straight down the middle has a chance
        {t:'post',x:303,y:972,r:8},
        {t:'shooter'},
        {t:'kickback',x:41,y:935,r:17}
      ],
      torches:[[30,640,BLUE,110],[576,640,BLUE,110],[96,452,BLUE,110],[510,452,BLUE,110],[320,40,'#e0f0ff',150],[150,150,BLUE,110],[490,150,BLUE,110]]}
  ],

  /* One ramp. It leaves the mouth, goes once round the top of the playfield and comes down to the right inlane, which
     feeds the right flipper, which is the flipper that shoots it. It lets the ball out faster than a standard ramp
     so that laps can be strung together. */
  ramps:[
    {id:'loop',name:'The Slingshot',from:'deck',to:'deck',exitV:700,drag:.05,
      path:[['#deck',104,300],['#deck',80,220],['#deck',110,142],['#deck',200,86],['#deck',303,66],['#deck',410,86],['#deck',480,142],['#deck',510,220],['#deck',524,420],['#deck',525,680],['#deck',525,716]]}
  ],

  /* An insert at every shot, so every goal has a light. */
  shots:[
    {id:'orbitL0',name:'Left Orbit',tier:'deck',x:43,y:545},{id:'thrusters',name:'Thrusters',tier:'deck',x:138,y:648,ang:Math.atan2(-.77,-.64)},
    {id:'loop',name:'Slingshot',tier:'deck',x:198,y:574,ang:aL},{id:'gyro',name:'Gyro',tier:'deck',x:168,y:566,ang:0,kind:'dot'},
    {id:'hull',name:'Hull Plates',tier:'deck',x:236,y:372,ang:Math.atan2(-.92,-.39)},{id:'dock',name:'Dock',tier:'deck',x:303,y:505},
    {id:'rocks',name:'Asteroids',tier:'deck',x:320,y:268,ang:0,kind:'dot'},{id:'sensors',name:'Sensors',tier:'deck',x:430,y:356,ang:Math.atan2(-.942,.336)},
    {id:'airlock',name:'Airlock',tier:'deck',x:505,y:668},{id:'orbitR0',name:'Right Orbit',tier:'deck',x:563,y:545},
    {id:'beacons',name:'Beacons',tier:'deck',x:320,y:172,ang:0,kind:'dot'}
  ]
};
