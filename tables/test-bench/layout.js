/* Test Bench: the layout. Pure data, read by engine/table/build.js. See docs/TABLE_FORMAT.md.

   This table exists to exercise the engine, not to be a game. It is drawn in the engine's default look and every
   field is there to prove one thing. Five fields on a grid (`at: [column, row]`), a diamond with a field on top:

        row 0            [ crown ]             column  0     joined above the Apex: its drain falls into the Apex
        row 1            [ apex  ]             column  0     drains into a ramp (the East Chute)
        row 2     [ west ]       [ east ]      columns -0.5 and 0.5; both drain into ramps to Home
        row 3            [ home  ]             column  0     the home field: last listed, the plunger, the real drain

   What each field proves:
     crown   long flippers; a fast loop ramp (exitV, drag, k)
     apex    a field joined under another on a grid; a drain ramp; a ramp up to the field joined above
     west    no arch, no orbits, no slings, no lanes, mini flippers: its shape is all its own pieces (walls, a
             one-way gate, posts, slingshots, rollovers, a third flipper up the field, a scoop with its own kick);
             its own height
     east    a second pair of flippers half way up; a freeway that runs sideways to another field
     home    status lamps; ramps to the two fields above it

   Inside a field's `pieces` a point [x, y] is measured from that field's own top-left corner. Ramp paths and tunnel
   waypoints cross fields, so they are on the whole table: either plain [x, y], or ['#fieldId', x, y] for a point
   inside a field (which is how every path below is written, so nothing here depends on where a field stands). */
const aL=Math.atan2(-.925,-.38),aR=Math.atan2(-.925,.38); // the two directions ramps leave the flippers in
const spots=[[150,585],[225,640],[320,600],[415,640],[490,585],[270,560],[370,560],[320,690]];
const lights=(c,xr)=>[[30,640,c,110],[(xr||620)-10,640,c,110],[96,452,c,110],[(xr||620)-76,452,c,110],[320,60,c,150]];
const topLanes=(id,name,o)=>Object.assign({t:'lanes',id,name,y:118,r:13,xs:[284,320,356],posts:{xs:[266,302,338,374],y0:92,y1:142,w:4}},o||{});

export const layout={
  fields:[
    /* ---------- CROWN: long flippers and the Whip, a loop that hands the ball back fast ---------- */
    {id:'crown',name:'Crown',short:'the Crown',at:[0,0],standard:{flippers:'long'},
      spawn:spots,
      pieces:[
        topLanes('tops','Top Lanes'),
        {t:'bumper',x:258,y:234,r:24,group:'pops'},{t:'bumper',x:382,y:234,r:24,group:'pops'},{t:'bumper',x:320,y:304,r:24,group:'pops'},
        {t:'mouth',id:'whip',x:188,y:480,side:-1},
        {t:'scoopBlock',mouth:'whip',side:-1,xg:66,topY:380,name:'vault'},
        {t:'hole',id:'vault',name:'Vault',x:112,y:488,r:13,eject:'L'},
        {t:'wall',w:3,pts:['@whip.rb','@whip.rt']},
        {t:'bank',id:'crest',name:'Crest',kind:'target',from:[412,298],to:[482,323],n:3,pad:.05},
        {t:'block',name:'crest',pts:[[412,298],[482,323],[540,300],[540,250],[446,262]]}
      ],
      torches:lights('#ff4a5a')},

    /* ---------- APEX: joined under the Crown (the ball arrives through its arch); drains into the East Chute ---------- */
    {id:'apex',name:'Apex',short:'the Apex',at:[0,1],
      spawn:spots,
      pieces:[
        {t:'bumper',x:236,y:300,r:24,group:'jets'},{t:'bumper',x:404,y:300,r:24,group:'jets'},
        {t:'mouth',id:'climb',x:452,y:480,side:1},
        {t:'block',name:'nook',pts:[[66,250],[150,262],[150,340],['notch',112,302],[66,340]]},
        {t:'hole',id:'nook',name:'Nook',x:112,y:322,r:14,eject:'L'},
        {t:'bank',id:'bars',name:'Bars',kind:'drop',from:[236,486],to:[286,464],n:2},
        {t:'bank',id:'bars',kind:'drop',from:[354,464],to:[404,486],n:2},
        {t:'wall',w:3,pts:['@climb.lb','@climb.lt']},
        {t:'scoopBlock',mouth:'climb',side:1,xg:574,topY:380,name:'lift'},
        {t:'hole',id:'lift',name:'Lift',x:528,y:488,r:13,eject:'R'},
        {t:'spinner',id:'spin',x:43,y:455,r:20}
      ],
      torches:lights('#8fe8d0')},

    /* ---------- WEST WING: nothing standard above the flipper shelf. A flat lid, square corners cut by two walls,
       a one-way gate across the top-left corner that feeds a third flipper, posts, its own slingshots and
       rollovers, mini flippers with a post between them, a scoop that kicks where it is told to. ---------- */
    {id:'west',name:'West Wing',short:'the West Wing',at:[-.5,2],height:110,
      standard:{arch:false,slings:false,lanes:false,flippers:'mini'},
      drop:[245,780],
      spawn:[[200,600],[320,640],[230,470],[410,480],[320,330],[500,540]],
      pieces:[
        // the corners
        {t:'wall',w:3,pts:[[20,130],[130,20]]},{t:'wall',w:3,pts:[[620,130],[510,20]]},
        // the pocket: a ball going up the left side passes the gate, cannot come back through it, and rolls down
        // it onto the third flipper
        {t:'gate',pts:[[20,180],[150,300]],solid:[60,120]},
        {t:'flipper',x:150,y:306,side:-1},
        // what the third flipper shoots at: standups under the lid
        {t:'bank',id:'cross',name:'Cross Bank',kind:'target',from:[380,24],to:[480,24],n:3},
        // the middle: a scoop between two posts
        {t:'post',x:255,y:560,r:7},{t:'post',x:385,y:560,r:7},
        {t:'centerScoop',x:320},
        {t:'hole',id:'pit',name:'Pit',x:320,y:444,r:14,eject:[-115,300]},
        // the way up to the Apex, set low: a mini flipper throws about half as far as a standard one
        {t:'mouth',id:'stair',x:440,y:620,side:1},
        {t:'wall',w:3,pts:['@stair.lb','@stair.lt']},{t:'wall',w:3,pts:['@stair.rb','@stair.rt']},
        // slingshots, rollovers, a post between the mini flippers
        {t:'sling',a:[100,650],b:[100,770],c:[175,800]},{t:'sling',a:[540,650],b:[540,770],c:[465,800]},
        {t:'lane',kind:'inlane',x:81,y:810},{t:'lane',kind:'inlane',x:559,y:810},
        {t:'lane',kind:'outlane',x:41,y:900},{t:'lane',kind:'outlane',x:599,y:900},
        {t:'post',x:320,y:940,r:7},
        {t:'lamp',x:320,y:700,show:'bench',label:'hooks'}
      ],
      torches:lights('#ffc060')},

    /* ---------- EAST WING: a second pair of flippers half way up, and the Bridge, a freeway sideways to the West Wing ---------- */
    {id:'east',name:'East Wing',short:'the East Wing',at:[.5,2],
      spawn:[[150,640],[225,690],[320,660],[415,690],[490,640],[320,430],[200,300],[440,300]],
      pieces:[
        topLanes('rails','Rail Lanes'),
        {t:'bumper',x:258,y:234,r:24,group:'coils'},{t:'bumper',x:382,y:234,r:24,group:'coils'},
        {t:'mouth',id:'bridge',x:188,y:480,side:-1},
        {t:'scoopBlock',mouth:'bridge',side:-1,xg:66,topY:380,name:'dock'},
        {t:'hole',id:'dock',name:'Dock',x:112,y:488,r:13,eject:'L'},
        {t:'wall',w:3,pts:['@bridge.rb','@bridge.rt']},
        {t:'flipper',x:236,y:570,side:-1,size:'mini'},{t:'flipper',x:404,y:570,side:1,size:'mini'},
        {t:'bank',id:'stack',name:'Stack',kind:'target',from:[412,298],to:[482,323],n:3,pad:.05},
        {t:'block',name:'stack',pts:[[412,298],[482,323],[540,300],[540,250],[446,262]]},
        {t:'floorSet',id:'floor',name:'Floor Lanes'}
      ],
      torches:lights('#b9a0ff')},

    /* ---------- HOME: the plunger, the real drain, and the status lamps ---------- */
    {id:'home',name:'Home',short:'Home',at:[0,3],shooter:true,boss:{x:303,y:650},
      spawn:[[160,585],[215,640],[303,600],[392,640],[445,600],[255,560],[350,560],[303,690]],
      pieces:[
        topLanes('start','Start Lanes',{skill:true,ballReset:true}),
        {t:'bumper',x:258,y:234,r:24,group:'core',opensGrave:true},{t:'bumper',x:382,y:234,r:24,group:'core',opensGrave:true},{t:'bumper',x:320,y:304,r:24,group:'core',opensGrave:true},
        {t:'mouth',id:'westway',x:172,y:480,side:-1},{t:'mouth',id:'eastway',x:434,y:480,side:1},
        {t:'bank',id:'guard',name:'Guard',kind:'drop',from:[192,336],to:[254,310],n:3},
        {t:'block',name:'guard',pts:[[190,330],[252,304],[236,270],[190,282]]},
        {t:'block',name:'wedge',pts:[[66,390],'@westway.lt','@westway.lb',[72,520],[66,500]]},
        {t:'wall',w:3,pts:['@westway.rb','@westway.rt']},
        {t:'centerScoop',x:303,w:28},
        {t:'hole',id:'den',name:'Den',x:303,y:444,r:14,eject:'L'},
        {t:'wall',w:3,pts:['@eastway.lb','@eastway.lt']},
        {t:'block',name:'house',pts:['@eastway.rt',[540,390],[540,640],['notch',505,602],[470,640],[470,540],'@eastway.rb']},
        {t:'hole',id:'hatch',name:'Hatch',x:505,y:622,r:13,eject:'R'},
        // status lamps: the multiplier up the middle, the ball save above the flippers, the rest where they belong.
        // They keep clear of two things the engine draws on every field: the rune ring (twelve dots on a circle of
        // radius 96 round (cx, 650), so one at (cx, 746)) and the guard post between the home field's flippers
        {t:'lamp',x:303,y:784,show:'mult2',label:'2x'},{t:'lamp',x:303,y:708,show:'mult3',label:'3x'},{t:'lamp',x:303,y:680,show:'mult4',label:'4x'},
        {t:'lamp',x:303,y:652,show:'mult5',label:'5x'},{t:'lamp',x:303,y:624,show:'mult6',label:'6x'},
        {t:'lamp',x:303,y:818,r:10,show:'save',label:'ball save',col:'#62d8ff'},
        {t:'lamp',x:41,y:850,show:'kickback',label:'kick',col:'#62d8ff'},
        {t:'lamp',x:470,y:668,show:'lockLit',label:'lock',col:'#7dffb0'},
        {t:'lamp',x:255,y:640,show:'rally',label:'rally',col:'#ffd24a'},{t:'lamp',x:351,y:640,show:'grave',label:'grave',col:'#9dffc8'},
        {t:'shooter'},
        {t:'kickback',x:41,y:935,r:17}
      ],
      torches:lights('#ff4a5a',586)}
  ],

  grave:{name:'The Pit Below',short:'the Pit',light:'Daylight',nails:'Bolts',torches:['#7dffb0','#7dffb0','#eaffd0']},

  /* ---------- RAMPS. A ramp starts at the mouth of the same id. `drain` ramps have no mouth: they take every ball
     that leaves the foot of the named field. k is how hard gravity pulls along a ramp (0.2 unless given), exitV the
     fastest it lets a ball leave (520), drag the share of its speed a ball loses each second (0.1). ---------- */
  ramps:[
    // the Whip: once round the Crown and back to the right inlane, fast
    {id:'whip',name:'The Whip',from:'crown',to:'crown',k:.1,exitV:1000,drag:.02,
      path:[['#crown',118,310],['#crown',92,220],['#crown',118,142],['#crown',200,86],['#crown',320,66],['#crown',440,86],['#crown',522,142],['#crown',550,220],['#crown',560,420],['#crown',559,680],['#crown',559,716]]},
    // the Climb: Apex to Crown, to the right inlane
    {id:'climb',name:'The Climb',from:'apex',to:'crown',up:true,
      path:[['#apex',528,300],['#apex',566,190],['#apex',592,70],['#crown',600,970],['#crown',600,840],['#crown',598,730],['#crown',590,682],['#crown',574,666],['#crown',560,680],['#crown',559,716]]},
    // the Stair: West Wing to Apex, to the left inlane
    {id:'stair',name:'The Stair',from:'west',to:'apex',up:true,k:.08,
      path:[['#west',520,430],['#west',540,250],['#west',510,90],['#apex',130,1010],['#apex',60,880],['#apex',44,740],['#apex',52,690],['#apex',70,676],['#apex',80,690],['#apex',81,712]]},
    // the Bridge: East Wing to West Wing, sideways and fast; it sets the ball down in the West Wing's pocket
    {id:'bridge',name:'The Bridge',from:'east',to:'west',k:.1,exitV:900,drag:.03,lift:14,
      path:[['#east',95,290],['#east',-5,180],['#west',545,100],['#west',345,64],['#west',165,52],['#west',83,72],['#west',70,105],['#west',70,150]]},
    // the two ways up from Home. They come in over the apron and up the outside edge, so they hide no flipper
    {id:'westway',name:'West Way',from:'home',to:'west',up:true,k:.06,
      path:[['#home',90,280],['#home',10,160],['#home',-100,60],['#west',150,1010],['#west',95,920],['#west',48,830],['#west',36,740],['#west',46,676],['#west',66,656],['#west',80,670],['#west',81,712]]},
    {id:'eastway',name:'East Way',from:'home',to:'east',up:true,k:.06,
      path:[['#home',516,280],['#home',600,160],['#home',760,60],['#east',490,1010],['#east',545,920],['#east',592,830],['#east',604,740],['#east',594,676],['#east',574,656],['#east',560,670],['#east',559,716]]},
    // the three drains that are ramps
    {id:'chuteE',name:'East Chute',drain:'apex',to:'east',
      path:[['#apex',320,1220],['#apex',330,1420],['#east',35,580],['#east',75,640],['#east',81,712]]},
    {id:'chuteW',name:'West Drop',drain:'west',to:'home',
      path:[['#west',320,1180],['#home',-30,440],['#home',20,620],['#home',81,640],['#home',81,712]]},
    {id:'chuteH',name:'East Drop',drain:'east',to:'home',
      path:[['#east',320,1180],['#home',680,440],['#home',600,620],['#home',525,640],['#home',525,716]]}
  ],

  /* ---------- TUNNELS: scoop to scoop, under the table ---------- */
  tunnels:[
    {from:'hatch',to:'dock',via:[['#home',600,400],['#east',200,900],['#east',140,640]]},
    {from:'vault',to:'den',via:[['#crown',40,800],['#apex',-40,500],['#west',600,500],['#home',200,200]]},
    {from:'rise',to:'den',via:[['#home',400,1210],['#home',440,990],['#home',380,640]]}
  ],

  /* ---------- SHOT INSERTS, in field coordinates. A shot id is the id of the ramp, scoop, bank, bumper group,
     spinner, lane set or orbit it stands for (orbits are orbitL<n> and orbitR<n>, n the field's place in the list
     above, counted from 0). The West Wing has no orbits: it has no arch. ---------- */
  shots:[
    {id:'orbitL0',name:'Left Orbit',tier:'crown',x:43,y:545},{id:'vault',name:'Vault',tier:'crown',x:112,y:545},{id:'whip',name:'The Whip',tier:'crown',x:206,y:524,ang:aL},
    {id:'pops',name:'Pops',tier:'crown',x:320,y:268,ang:0,kind:'dot'},{id:'crest',name:'Crest',tier:'crown',x:430,y:356,ang:Math.atan2(-.942,.336)},
    {id:'tops',name:'Top Lanes',tier:'crown',x:320,y:172,ang:0,kind:'dot'},{id:'orbitR0',name:'Right Orbit',tier:'crown',x:597,y:545},

    {id:'orbitL1',name:'Left Orbit',tier:'apex',x:43,y:545},{id:'nook',name:'Nook',tier:'apex',x:112,y:380},{id:'bars',name:'Bars',tier:'apex',x:320,y:528},
    {id:'jets',name:'Jets',tier:'apex',x:320,y:272,ang:0,kind:'dot'},{id:'climb',name:'The Climb',tier:'apex',x:434,y:524,ang:aR},
    {id:'lift',name:'Lift',tier:'apex',x:528,y:545},{id:'orbitR1',name:'Right Orbit',tier:'apex',x:597,y:545},{id:'spin',name:'Spinner',tier:'apex',x:43,y:500,ang:0,kind:'dot'},

    {id:'pit',name:'Pit',tier:'west',x:320,y:505},{id:'stair',name:'The Stair',tier:'west',x:422,y:664,ang:aR},{id:'cross',name:'Cross Bank',tier:'west',x:430,y:70},

    {id:'orbitL3',name:'Left Orbit',tier:'east',x:43,y:545},{id:'dock',name:'Dock',tier:'east',x:112,y:545},{id:'bridge',name:'The Bridge',tier:'east',x:206,y:524,ang:aL},
    {id:'coils',name:'Coils',tier:'east',x:320,y:268,ang:0,kind:'dot'},{id:'stack',name:'Stack',tier:'east',x:430,y:356,ang:Math.atan2(-.942,.336)},
    {id:'rails',name:'Rail Lanes',tier:'east',x:320,y:172,ang:0,kind:'dot'},{id:'floor',name:'Floor Lanes',tier:'east',x:320,y:770,ang:0,kind:'dot'},{id:'orbitR3',name:'Right Orbit',tier:'east',x:597,y:545},

    {id:'orbitL4',name:'Left Orbit',tier:'home',x:43,y:545},{id:'westway',name:'West Way',tier:'home',x:198,y:574,ang:aL},{id:'guard',name:'Guard',tier:'home',x:236,y:372,ang:Math.atan2(-.92,-.39)},
    {id:'den',name:'Den',tier:'home',x:303,y:505},{id:'core',name:'Core',tier:'home',x:320,y:268,ang:0,kind:'dot'},{id:'eastway',name:'East Way',tier:'home',x:416,y:524,ang:aR},
    {id:'hatch',name:'Hatch',tier:'home',x:505,y:668},{id:'orbitR4',name:'Right Orbit',tier:'home',x:563,y:545},{id:'start',name:'Start Lanes',tier:'home',x:320,y:172,ang:0,kind:'dot'}
  ]
};
