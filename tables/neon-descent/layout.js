/* Neon Descent: the layout. Pure data, read by engine/table/build.js. See docs/TABLE_FORMAT.md.

   Four districts stacked up the arcology, 640 wide and 1040 apart:
     field 0  Helix Citadel        y   40   (top)
     field 1  The Data Cathedral   y 1080
     field 2  Kabuki Aftermarket   y 2120
     field 3  The Undercity        y 3160   (bottom: the plunger and the real drain)
   Inside a field's `pieces` a point [x, y] is measured from that field's own top. Ramp paths and tunnel waypoints
   cross fields, so they are in whole-table coordinates.

   Where the geometry comes from. Every field here is assembled from shot-tested assemblies of the reference table
   (tables/gravebound/layout.js), re-dressed: the Undercity is the Hollow's skeleton, Kabuki and the Cathedral are
   the Wilds' (the Cathedral with its centre mirrored and a closed vault instead of a camp), the Citadel is the
   Keep's left half and centre ramp with the Wilds' right half. What is new is the road network: eight ramps, two of
   them freeways that leave the cabinet and skip a district. */
const aL=Math.atan2(-.925,-.38),aR=Math.atan2(-.925,.38); // the two directions ramps leave the flippers in
const AMBER='#f6c85f',PINK='#ff4c9a',CYAN='#43e7ed',VIOLET='#b9a0ff';
const lamps=(c,c2,xr)=>[[30,640,c,110],[(xr||620)-10,640,c,110],[96,452,c,110],[(xr||620)-76,452,c,110],[320,40,c2,150],[150,150,c,110],[490,150,c,110]];

export const layout={
  fields:[
    /* ---------- HELIX CITADEL (top) ----------
       The God-Machine's own floor. The Helix Spiral is a centre ramp straight up between the two halves of the
       Firewall; it rings the citadel and comes down to the right inlane. The Citadel Overpass leaves the right
       mouth and crosses over the Spiral to the left inlane. The Core Vault is a pocket in the top-left corner, the
       Black ICE a bank of standups low on the left, the Service Elevator the scoop on the right. */
    {id:'helix',name:'Helix Citadel',short:'the Citadel',
      statue:{id:'godhead',x:320,y:205,r:22},boss:{x:320,y:650},
      spawn:[[150,585],[225,640],[320,600],[415,640],[490,585],[270,560],[370,560],[320,690]],
      pieces:[
        {t:'bumper',x:236,y:300,r:24,group:'reactors'},{t:'bumper',x:404,y:300,r:24,group:'reactors'},
        {t:'mouth',id:'spiral',x:320,y:470,side:0},{t:'mouth',id:'overpass',x:452,y:480,side:1},
        // the Core Vault: a pocket in the top-left corner
        {t:'block',name:'coreVault',pts:[[66,250],[150,262],[150,340],['notch',112,302],[66,340]]},
        {t:'hole',id:'coreVault',name:'Core Vault',x:112,y:322,r:14,eject:'L'},
        // Black ICE: three standups low on the left
        {t:'bank',id:'ice',name:'Black ICE',kind:'target',from:[78,546],to:[128,496],n:3,pad:.08},
        {t:'block',name:'ice',pts:[[78,546],[128,496],[112,470],[66,462],[66,540]]},
        // the Firewall flanks the Helix Spiral
        {t:'bank',id:'firewall',name:'Firewall',kind:'drop',from:[236,486],to:[286,464],n:2},
        {t:'bank',id:'firewall',kind:'drop',from:[354,464],to:[404,486],n:2},
        {t:'wall',w:3,pts:['@overpass.lb','@overpass.lt']},
        {t:'scoopBlock',mouth:'overpass',side:1,xg:574,topY:380,name:'elevator'},
        {t:'hole',id:'elevator',name:'Service Elevator',x:528,y:488,r:13,eject:'R'},
        {t:'spinner',id:'gyro',x:43,y:455,r:20}
      ],
      torches:lamps(VIOLET,'#e6dcff')},

    /* ---------- THE DATA CATHEDRAL ----------
       The Vault stands high in the middle under the organ pipes, three Mainframe standups on its underside; the
       Prayer Wheel is a spinner lane right of centre that feeds the Vault's east face. The Cloister Loop leaves the
       left mouth and comes round to the right inlane; the Citadel Ascent leaves the right mouth for the Citadel. */
    {id:'cathedral',name:'The Data Cathedral',short:'the Cathedral',
      statue:{id:'altar',x:320,y:178,r:20},boss:{x:320,y:650},
      spawn:[[150,585],[225,640],[320,600],[415,640],[490,585],[404,578],[270,560],[320,690]],
      pieces:[
        {t:'bumper',x:236,y:232,r:24,group:'pipes',conduit:true},{t:'bumper',x:404,y:232,r:24,group:'pipes',conduit:true},{t:'bumper',x:320,y:262,r:24,group:'pipes',conduit:true},
        {t:'mouth',id:'cloister',x:188,y:480,side:-1},{t:'mouth',id:'ascent',x:452,y:480,side:1},
        {t:'scoopBlock',mouth:'cloister',side:-1,xg:66,topY:380,name:'confessional'},
        {t:'hole',id:'confessional',name:'Confessional',x:112,y:488,r:13,eject:'L'},
        {t:'wall',w:3,pts:['@cloister.rb','@cloister.rt']},
        // the Vault: a closed block with a peaked roof, so nothing rests on it; the Mainframe is its underside
        {t:'block',name:'vault',pts:[[248,396],[300,372],[340,372],[392,396],[372,344],[320,326],[268,344]]},
        {t:'bank',id:'mainframe',name:'Mainframe',kind:'target',from:[248,396],to:[300,372],n:1,pad:.06},
        {t:'bank',id:'mainframe',kind:'target',from:[300,372],to:[340,372],n:1,pad:.04},
        {t:'bank',id:'mainframe',kind:'target',from:[340,372],to:[392,396],n:1,pad:.06},
        // the Prayer Wheel: a spinner lane right of centre, straight up into the Vault's east face
        {t:'wall',w:3,pts:[[344,548],[344,468]]},{t:'wall',w:3,pts:[[388,548],[388,468]]},
        {t:'spinner',id:'wheel',x:366,y:508,r:20},
        {t:'wall',w:3,pts:['@ascent.lb','@ascent.lt']},
        {t:'scoopBlock',mouth:'ascent',side:1,xg:574,topY:380,name:'archive'},
        {t:'hole',id:'archive',name:'Data Archive',x:528,y:488,r:13,eject:'R'},
        {t:'floorSet',id:'hymn',name:'Hymn Lines',col:'#d8fbff'} // the two inlanes and two outlanes, lit as one set
      ],
      torches:lamps(CYAN,'#d8fbff')},

    /* ---------- KABUKI AFTERMARKET ----------
       The Theatre stands high in the middle under the paper lanterns: the Curtain is two walls of drops either side
       of the Stage Door, with Backstage behind it. The Reel is a spinner lane left of centre. The Helix Express
       leaves the left mouth, swings out of the cabinet and skips the Cathedral; the Rooftops loop leaves the right
       mouth and comes round to the left inlane. */
    {id:'kabuki',name:'Kabuki Aftermarket',short:'Kabuki',
      statue:{id:'holo',x:320,y:178,r:20},boss:{x:320,y:650},
      spawn:[[150,585],[225,640],[320,600],[415,640],[490,585],[236,578],[370,560],[320,690]],
      pieces:[
        {t:'bumper',x:236,y:232,r:24,group:'lanterns',conduit:true},{t:'bumper',x:404,y:232,r:24,group:'lanterns',conduit:true},{t:'bumper',x:320,y:262,r:24,group:'lanterns',conduit:true},
        {t:'mouth',id:'express',x:188,y:480,side:-1},{t:'mouth',id:'rooftop',x:452,y:480,side:1},
        {t:'scoopBlock',mouth:'express',side:-1,xg:66,topY:380,name:'pachinko'},
        {t:'hole',id:'pachinko',name:'Pachinko Parlor',x:112,y:488,r:13,eject:'L'},
        {t:'wall',w:3,pts:['@express.rb','@express.rt']},
        // the Theatre: the Curtain either side of the Stage Door, Backstage behind it
        {t:'bank',id:'curtain',name:'The Curtain',kind:'drop',from:[248,396],to:[300,372],n:2},
        {t:'bank',id:'curtain',kind:'drop',from:[340,372],to:[392,396],n:2},
        {t:'bank',id:'stageDoor',name:'Stage Door',kind:'drop',from:[300,372],to:[320,366],n:1,door:{time:22,popup:['Stage Door Open','Backstage is clear']}},
        {t:'bank',id:'stageDoor',kind:'drop',from:[320,366],to:[340,372],n:1},
        {t:'wall',w:3,style:'scoop',pts:[[300,372],[298,346],[308,332],[320,328],[332,332],[342,346],[340,372]]},
        {t:'hole',id:'backstage',name:'Backstage',x:320,y:352,r:13,eject:'R'},
        // the Reel: a spinner lane left of centre, straight up into the Curtain
        {t:'wall',w:3,pts:[[252,548],[252,468]]},{t:'wall',w:3,pts:[[296,548],[296,468]]},
        {t:'spinner',id:'reel',x:274,y:508,r:20},
        {t:'wall',w:3,pts:['@rooftop.lb','@rooftop.lt']},
        {t:'scoopBlock',mouth:'rooftop',side:1,xg:574,topY:380,name:'fixer'},
        {t:'hole',id:'fixer',name:'The Fixer',x:528,y:488,r:13,eject:'R'},
        {t:'floorSet',id:'neon',name:'Neon Signs',col:'#ffd0e6'}
      ],
      torches:lamps(PINK,'#ffd0e6')},

    /* ---------- THE UNDERCITY (bottom) ----------
       Street level. Shots fan out at every depth: the Chop Shop low on the left and the Sewer Grate low on the right,
       the two freeway on-ramps and the Hideout across the middle, the Toll Booth and the Night Market high up, shot
       through the gaps beside the Power Grid. The Turnstile spins in front of the Kabuki Freeway. */
    {id:'undercity',name:'The Undercity',short:'the Undercity',shooter:true,boss:{x:303,y:650},
      spawn:[[160,585],[215,640],[303,600],[392,640],[445,600],[255,560],[350,560],[303,690]],
      pieces:[
        {t:'lanes',id:'signal',name:'Signal Lights',y:118,r:13,xs:[284,320,356],posts:{xs:[266,302,338,374],y0:92,y1:142,w:4},skill:true,ballReset:true},
        {t:'bumper',x:258,y:234,r:24,group:'grid',opensGrave:true},{t:'bumper',x:382,y:234,r:24,group:'grid',opensGrave:true},{t:'bumper',x:320,y:304,r:24,group:'grid',opensGrave:true},
        {t:'mouth',id:'fwyKabuki',x:172,y:480,side:-1},{t:'mouth',id:'fwyCathedral',x:434,y:480,side:1},
        // high banks: the Toll Booth (drops) above the Kabuki on-ramp; the Night Market (standups) up the right
        {t:'bank',id:'toll',name:'Toll Booth',kind:'drop',from:[192,336],to:[254,310],n:3},
        {t:'block',name:'toll',pts:[[190,330],[252,304],[236,270],[190,282]]},
        {t:'bank',id:'market',name:'Night Market',kind:'target',from:[412,298],to:[482,323],n:3,pad:.05},
        {t:'block',name:'market',pts:[[412,298],[482,323],[540,300],[540,250],[446,262]]},
        // the left wedge between the orbit guide and the on-ramp
        {t:'block',name:'onRampWedge',pts:[[66,390],'@fwyKabuki.lt','@fwyKabuki.lb',[72,520],[66,500]]},
        {t:'wall',w:3,pts:['@fwyKabuki.rb','@fwyKabuki.rt']},
        // the Chop Shop: two standups low on the left, with the kickback below it
        {t:'bank',id:'chop',name:'Chop Shop',kind:'target',from:[70,640],to:[112,604],n:2,pad:.1},
        {t:'block',name:'chop',pts:[[70,640],[112,604],[96,584],[66,576],[66,636]]},
        // the Hideout: the sure scoop, dead centre, with a wide mouth
        {t:'centerScoop',x:303,w:28},
        {t:'hole',id:'hideout',name:'Hideout',x:303,y:444,r:14,eject:'L'},
        // the Cathedral on-ramp and, hanging below the right orbit guide, the pump house with the Sewer Grate in its base
        {t:'wall',w:3,pts:['@fwyCathedral.lb','@fwyCathedral.lt']},
        {t:'block',name:'pumpHouse',pts:['@fwyCathedral.rt',[540,390],[540,640],['notch',505,602],[470,640],[470,540],'@fwyCathedral.rb']},
        {t:'hole',id:'sewer',name:'Sewer Grate',x:505,y:622,r:13,eject:'R'},
        {t:'spinner',id:'turnstile',x:195,y:540,r:20,rot:Math.atan2(.925,.38)-Math.PI/2},
        {t:'shooter'},
        {t:'kickback',x:41,y:935,r:17}
      ],
      torches:lamps(AMBER,'#ffe9b0',586)}
  ],

  /* ---------- FLATLINE: this table's Grave. The room itself is a standard part; a table only names it. ---------- */
  grave:{name:'Flatline',short:'Flatline',light:'Reboot',nails:'Dead Switches',torches:['#ff4c6a','#ff4c6a','#e8fff4']},

  /* ---------- RAMPS: each starts at the mouth of the same id and follows `path` (whole-table coordinates).
     lift raises a ramp so two can cross; k is how hard gravity pulls along it (0.2 unless given: the two freeways
     climb two districts, so they are graded like a road, not like a ramp). ---------- */
  ramps:[
    {id:'fwyKabuki',name:'Kabuki Freeway',from:3,to:2,up:true,path:[[104,3460],[70,3340],[46,3220],[40,3080],[40,2940],[42,2840],[52,2796],[68,2782],[80,2796],[81,2832]]},
    {id:'fwyCathedral',name:'Cathedral Freeway',from:3,to:1,up:true,k:.03,drag:.04,lift:22,path:[[512,3452],[564,3352],[622,3270],[664,3170],[682,3040],[686,2700],[686,2300],[686,2000],[680,1900],[660,1820],[628,1768],[594,1746],[572,1746],[560,1760],[559,1796]]},
    {id:'express',name:'Helix Express',from:2,to:0,up:true,k:.06,lift:22,path:[[104,2400],[52,2290],[-4,2190],[-38,2070],[-46,1900],[-46,1500],[-46,1100],[-42,960],[-22,850],[16,768],[48,718],[68,704],[80,718],[81,752]]},
    {id:'rooftop',name:'Kabuki Rooftops',from:2,to:2,calls:2,path:[[522,2430],[548,2340],[522,2262],[440,2206],[320,2186],[200,2206],[118,2262],[90,2340],[80,2540],[81,2800],[81,2836]]},
    {id:'cloister',name:'Cloister Loop',from:1,to:1,calls:2,path:[[118,1390],[92,1300],[118,1222],[200,1166],[320,1146],[440,1166],[522,1222],[550,1300],[560,1500],[559,1760],[559,1796]]},
    {id:'ascent',name:'Citadel Ascent',from:1,to:0,up:true,path:[[528,1380],[566,1270],[592,1150],[600,1010],[600,880],[598,770],[590,722],[574,706],[560,720],[559,756]]},
    {id:'spiral',name:'Helix Spiral',from:0,to:0,calls:2,path:[[300,300],[250,220],[185,160],[130,138],[200,108],[320,92],[430,110],[500,170],[540,260],[558,360],[559,560],[559,754]]},
    {id:'overpass',name:'Citadel Overpass',from:0,to:0,calls:2,lift:30,path:[[522,350],[546,270],[520,200],[440,152],[320,136],[200,152],[124,200],[96,270],[82,460],[81,720],[81,756]]}
  ],

  /* ---------- TUNNELS: scoop to scoop, under the table (whole-table coordinates) ---------- */
  tunnels:[
    {from:'sewer',to:'pachinko',via:[[560,3540],[470,3290],[250,3040],[150,2790]]},
    {from:'backstage',to:'confessional',via:[[380,2420],[420,2140],[330,1900],[200,1720]]},
    {from:'archive',to:'coreVault',via:[[560,1400],[520,1000],[360,640],[200,440]]},
    {from:'elevator',to:'sewer',via:[[590,640],[604,1000],[560,1500],[600,2000],[590,2600],[604,3100],[560,3540]]},
    {from:'rise',to:'sewer',via:[[400,4370],[470,4200],[540,3940]]}
  ],

  /* ---------- SHOT INSERTS: the arrows and dots painted on the floor, in field coordinates. A shot id is the id of the
     ramp, scoop, bank, bumper group, spinner, lane set, statue or orbit it stands for (orbits are orbitL<field> and
     orbitR<field>); quests and lamps address shots by id. ---------- */
  shots:[
    {id:'orbitL0',name:'Outer Ring',tier:0,x:43,y:545},{id:'ice',name:'Black ICE',tier:0,x:136,y:556,ang:Math.atan2(-.7,-.7)},{id:'spiral',name:'Helix Spiral',tier:0,x:320,y:540},
    {id:'firewall',name:'Firewall',tier:0,x:262,y:528},{id:'coreVault',name:'Core Vault',tier:0,x:112,y:380},{id:'reactors',name:'Reactors',tier:0,x:320,y:272,ang:0,kind:'dot'},
    {id:'overpass',name:'Overpass',tier:0,x:434,y:524,ang:aR},{id:'elevator',name:'Elevator',tier:0,x:528,y:545},{id:'orbitR0',name:'Outer Ring',tier:0,x:597,y:545},
    {id:'gyro',name:'Gyro',tier:0,x:43,y:500,ang:0,kind:'dot'},{id:'godhead',name:'The Godhead',tier:0,x:320,y:238,ang:0,kind:'dot'},

    {id:'orbitL1',name:'Ambulatory',tier:1,x:43,y:545},{id:'confessional',name:'Confessional',tier:1,x:112,y:545},{id:'cloister',name:'Cloister Loop',tier:1,x:206,y:524,ang:aL},
    {id:'mainframe',name:'Mainframe',tier:1,x:272,y:436},{id:'pipes',name:'Organ Pipes',tier:1,x:320,y:304,ang:0,kind:'dot'},
    {id:'ascent',name:'Citadel Ascent',tier:1,x:434,y:524,ang:aR},{id:'archive',name:'Data Archive',tier:1,x:528,y:545},{id:'orbitR1',name:'Ambulatory',tier:1,x:597,y:545},
    {id:'wheel',name:'Prayer Wheel',tier:1,x:366,y:532,ang:0,kind:'dot'},{id:'hymn',name:'Hymn Lines',tier:1,x:320,y:760,ang:0,kind:'dot'},{id:'altar',name:'The Altar',tier:1,x:320,y:216,ang:0,kind:'dot'},

    {id:'orbitL2',name:'Back Alley',tier:2,x:43,y:545},{id:'pachinko',name:'Pachinko',tier:2,x:112,y:545},{id:'express',name:'Helix Express',tier:2,x:206,y:524,ang:aL},
    {id:'curtain',name:'The Curtain',tier:2,x:368,y:436},{id:'backstage',name:'Backstage',tier:2,x:320,y:444},{alias:'stageDoor',of:'backstage'},{id:'lanterns',name:'Lanterns',tier:2,x:320,y:304,ang:0,kind:'dot'},
    {id:'rooftop',name:'Rooftops',tier:2,x:434,y:524,ang:aR},{id:'fixer',name:'The Fixer',tier:2,x:528,y:545},{id:'orbitR2',name:'Back Alley',tier:2,x:597,y:545},
    {id:'reel',name:'The Reel',tier:2,x:274,y:532,ang:0,kind:'dot'},{id:'neon',name:'Neon Signs',tier:2,x:320,y:760,ang:0,kind:'dot'},{id:'holo',name:'The Idol',tier:2,x:320,y:216,ang:0,kind:'dot'},

    {id:'orbitL3',name:'Ring Road',tier:3,x:43,y:545},{id:'chop',name:'Chop Shop',tier:3,x:138,y:648,ang:Math.atan2(-.77,-.64)},{id:'fwyKabuki',name:'Kabuki Fwy',tier:3,x:198,y:574,ang:aL},
    {id:'toll',name:'Toll Booth',tier:3,x:236,y:372,ang:Math.atan2(-.92,-.39)},{id:'hideout',name:'Hideout',tier:3,x:303,y:505},{id:'grid',name:'Power Grid',tier:3,x:320,y:268,ang:0,kind:'dot'},
    {id:'market',name:'Night Market',tier:3,x:430,y:356,ang:Math.atan2(-.942,.336)},{id:'fwyCathedral',name:'Cathedral Fwy',tier:3,x:416,y:524,ang:aR},{id:'sewer',name:'Sewer Grate',tier:3,x:505,y:668},
    {id:'orbitR3',name:'Ring Road',tier:3,x:563,y:545},{id:'turnstile',name:'Turnstile',tier:3,x:168,y:566,ang:0,kind:'dot'},{id:'signal',name:'Signal Lights',tier:3,x:320,y:172,ang:0,kind:'dot'}
  ]
};
