/* Gravebound Pinball: the layout. Pure data, read by engine/table/build.js. See docs/TABLE_FORMAT.md.

   Coordinates. The table is 640 wide. Fields stack top to bottom, 1040 apart, the first at y 40, so here:
   the Black Keep is field 0 (y 40), the Wilds field 1 (y 1080), Grave Hollow field 2 (y 2120).
   Inside a field's `pieces`, a point [x, y] is measured from that field's own top. Ramp paths and tunnel
   waypoints cross fields, so they are in whole-table coordinates.

   A point can also hang off a ramp mouth: '@rampWolf.rb' is a corner of that mouth (lb, rb, lt, rt),
   ['@bell.lb', dx, dy] is a corner plus an offset, {along:'bell', d:116} is 116 up the mouth's own direction,
   and ['notch', cx, y] is the six points of a scoop notch cut into a block. */
const aL=Math.atan2(-.925,-.38),aR=Math.atan2(-.925,.38); // the two directions ramps leave the flippers in

export const layout={
  fields:[
    /* ---------- THE BLACK KEEP (top) ----------
       The castle. The Throne Road is a centre ramp straight up the hall between the two walls of the Royal Guard; it
       rings the keep and comes down to the right inlane. The Sanctum is a pocket in the top-left corner, the Armory a
       bank of standups low on the left, the Bell a dead-end lane up the right, the Oubliette the pocket beside it. */
    {id:'keep',name:'The Black Keep',short:'the Black Keep',
      statue:{id:'throne',x:320,y:205,r:22},boss:{x:320,y:650},
      spawn:[[150,585],[225,640],[320,600],[415,640],[490,585],[270,560],[370,560],[320,690]],
      pieces:[
        {t:'bumper',x:236,y:300,r:24,group:'braziers'},{t:'bumper',x:404,y:300,r:24,group:'braziers'},
        {t:'mouth',id:'rampTower',x:320,y:470,side:0},{t:'mouth',id:'bell',x:452,y:480,side:1},
        // the Sanctum: a pocket in the top-left corner, under the Throne Road's first bend
        {t:'block',name:'sanctum',pts:[[66,250],[150,262],[150,340],['notch',112,302],[66,340]]},
        {t:'hole',id:'sanctum',name:'Sanctum',x:112,y:322,r:14,eject:'L'},
        // the Armory: three standups low on the left
        {t:'bank',id:'armory',name:'Armory',kind:'target',from:[78,546],to:[128,496],n:3,pad:.08},
        {t:'block',name:'armory',pts:[[78,546],[128,496],[112,470],[66,462],[66,540]]},
        // the Royal Guard flank the Throne Road
        {t:'bank',id:'guard',name:'Royal Guard',kind:'drop',from:[236,486],to:[286,464],n:2},
        {t:'bank',id:'guard',kind:'drop',from:[354,464],to:[404,486],n:2},
        {t:'wall',w:3,pts:['@bell.lb',['@bell.lb',38,-92.5]]},
        {t:'bumper',at:{along:'bell',d:116},r:20,group:'bell',kick:520,bell:true},
        {t:'block',name:'oubliette',pts:[['@bell.rb',38,-92.5],[574,372],[574,505],['notch',528,470],'@bell.rb']},
        {t:'wall',w:3,pts:[[574,280],[474,350]]}, // a lid over the pocket behind the bell, so nothing can lodge there
        {t:'hole',id:'oubliette',name:'Oubliette',x:528,y:488,r:13,eject:'R'},
        {t:'spinner',id:'chains',x:43,y:455,r:20}
      ],
      torches:[[30,640,'#ff5a3c',110],[610,640,'#ff5a3c',110],[96,452,'#ff5a3c',110],[544,452,'#ff5a3c',110],[320,40,'#ff3040',150],[150,150,'#ff5a3c',110],[490,150,'#ff5a3c',110]]},

    /* ---------- THE WILDS (middle) ----------
       The forest. The Goblin Camp's palisade stands high in the middle under the stone ring, with the Secret Passage
       behind its door; the Mill is a spinner lane in the centre that feeds the camp's west wall; the corridor between
       the two ramp mouths is wide open, so the whole upper field is in play. The Catacombs and the Witch's Hut keep
       their corners. */
    {id:'wilds',name:'The Wilds',short:'the Wilds',
      statue:{id:'keystone',x:320,y:178,r:20},boss:{x:320,y:650},
      spawn:[[150,585],[225,640],[320,600],[415,640],[490,585],[236,578],[370,560],[320,690]],
      pieces:[
        {t:'bumper',x:236,y:232,r:24,group:'stones',conduit:true},{t:'bumper',x:404,y:232,r:24,group:'stones',conduit:true},{t:'bumper',x:320,y:262,r:24,group:'stones',conduit:true},
        {t:'mouth',id:'rampWolf',x:188,y:480,side:-1},{t:'mouth',id:'rampRuin',x:452,y:480,side:1},
        {t:'scoopBlock',mouth:'rampWolf',side:-1,xg:66,topY:380,name:'catacombs'},
        {t:'hole',id:'catacombs',name:'Catacombs',x:112,y:488,r:13,eject:'L'},
        {t:'wall',w:3,pts:['@rampWolf.rb','@rampWolf.rt']},
        // the camp: two walls of drops either side of the Sealed Door, the Secret Passage scoop behind it
        {t:'bank',id:'camp',name:'Goblin Camp',kind:'drop',from:[248,396],to:[300,372],n:2},
        {t:'bank',id:'camp',kind:'drop',from:[340,372],to:[392,396],n:2},
        {t:'bank',id:'door',name:'Sealed Door',kind:'drop',from:[300,372],to:[320,366],n:1,door:{time:22,popup:['Door Broken','The Secret Passage is open']}},
        {t:'bank',id:'door',kind:'drop',from:[320,366],to:[340,372],n:1},
        {t:'wall',w:3,style:'scoop',pts:[[300,372],[298,346],[308,332],[320,328],[332,332],[342,346],[340,372]]},
        {t:'hole',id:'secret',name:'Secret Passage',x:320,y:352,r:13,eject:'R'},
        // the Mill: a spinner lane left of centre, straight up into the camp's west wall
        {t:'wall',w:3,pts:[[252,548],[252,468]]},{t:'wall',w:3,pts:[[296,548],[296,468]]},
        {t:'spinner',id:'windmill',x:274,y:508,r:20},
        {t:'wall',w:3,pts:['@rampRuin.lb','@rampRuin.lt']},
        {t:'scoopBlock',mouth:'rampRuin',side:1,xg:574,topY:380,name:'hut'},
        {t:'hole',id:'hut',name:"Witch's Hut",x:528,y:488,r:13,eject:'R'},
        {t:'floorSet',id:'moon',name:'Moon Phases',col:'#cfeef2'} // the two inlanes and two outlanes, lit as one set
      ],
      torches:[[30,640,'#7fe0c0',110],[610,640,'#7fe0c0',110],[96,452,'#7fe0c0',110],[544,452,'#7fe0c0',110],[320,40,'#a0e8ff',150],[150,150,'#7fe0c0',110],[490,150,'#7fe0c0',110]]},

    /* ---------- GRAVE HOLLOW (bottom) ----------
       The village. Shots fan out at every depth: the Smithy low on the left and the Crypt's mausoleum low on the right,
       the two ramps and the Tavern across the middle, the Town Gate and the Chapel high up, shot through the gaps beside
       the Gravestones. The Weathervane turns in front of the Forest Road, so every shot up the road spins it. */
    {id:'hollow',name:'Grave Hollow',short:'Grave Hollow',shooter:true,
      spawn:[[160,585],[215,640],[303,600],[392,640],[445,600],[255,560],[350,560],[303,690]],
      pieces:[
        {t:'lanes',id:'candles',name:'Vigil Candles',y:118,r:13,xs:[284,320,356],posts:{xs:[266,302,338,374],y0:92,y1:142,w:4},skill:true,ballReset:true},
        {t:'bumper',x:258,y:234,r:24,group:'graves',opensGrave:true},{t:'bumper',x:382,y:234,r:24,group:'graves',opensGrave:true},{t:'bumper',x:320,y:304,r:24,group:'graves',opensGrave:true},
        {t:'mouth',id:'rampForest',x:172,y:480,side:-1},{t:'mouth',id:'rampChapel',x:434,y:480,side:1},
        // high banks: the Town Gate (drops) above the Forest Road mouth, open to both flippers; the Chapel (standups) up the right
        {t:'bank',id:'townGate',name:'Town Gate',kind:'drop',from:[192,336],to:[254,310],n:3},
        {t:'block',name:'townGate',pts:[[190,330],[252,304],[236,270],[190,282]]},
        {t:'bank',id:'chapel',name:'Chapel',kind:'target',from:[412,298],to:[482,323],n:3,pad:.05},
        {t:'block',name:'chapel',pts:[[412,298],[482,323],[540,300],[540,250],[446,262]]},
        // the left wedge between the orbit guide and the Forest Road mouth
        {t:'block',name:'roadWedge',pts:[[66,390],'@rampForest.lt','@rampForest.lb',[72,520],[66,500]]},
        {t:'wall',w:3,pts:['@rampForest.rb','@rampForest.rt']},
        // the Smithy: two standups low on the left, a cradle shot from the right flipper with the kickback below it
        {t:'bank',id:'smithy',name:'Smithy',kind:'target',from:[70,640],to:[112,604],n:2,pad:.1},
        {t:'block',name:'smithy',pts:[[70,640],[112,604],[96,584],[66,576],[66,636]]},
        // the Tavern: the sure scoop, dead centre, with a wide mouth
        {t:'centerScoop',x:303,w:28},
        {t:'hole',id:'tavern',name:'Tavern',x:303,y:444,r:14,eject:'L'},
        // the Chapel Stair mouth and, hanging below the right orbit guide, the mausoleum with the Crypt Stair in its base
        {t:'wall',w:3,pts:['@rampChapel.lb','@rampChapel.lt']},
        {t:'block',name:'crypt',pts:['@rampChapel.rt',[540,390],[540,640],['notch',505,602],[470,640],[470,540],'@rampChapel.rb']},
        {t:'hole',id:'crypt',name:'Crypt Stair',x:505,y:622,r:13,eject:'R'},
        // the Weathervane spins in the Forest Road's approach
        {t:'spinner',id:'vane',x:195,y:540,r:20,rot:Math.atan2(.925,.38)-Math.PI/2},
        {t:'shooter'},
        {t:'kickback',x:41,y:935,r:17}
      ],
      torches:[[30,640,'#ffb050',110],[576,640,'#ffb050',110],[96,452,'#ffb050',110],[512,452,'#ffb050',110],[320,40,'#ffd070',150],[150,150,'#ffb050',110],[490,150,'#ffb050',110]]}
  ],

  /* ---------- THE GRAVE: a coffin under the bottom field, one way out. The room itself is a standard part. ---------- */
  grave:{name:'The Grave',short:'the Grave',light:'The Light',nails:'Coffin Nails',torches:['#7dffb0','#7dffb0','#eaffd0']},

  /* ---------- CAMPAIGN WINGS: small rooms with their own flippers, each reached through a scoop once it is opened ----------
     `court` is where the room sits in the world beside the main table; in table space wings follow the Grave. */
  wings:[
    // the Crypt: light four sigils on the walls to break the seal on the sarcophagus
    {key:'crypt',name:'The Crypt',short:'the Crypt',
      outline:[[217,561],[120,400],[120,130],[205,40],[435,40],[520,130],[520,400],[423,561]],
      goal:{id:'sarc',name:'Sarcophagus'},entry:{id:'cryptIn',name:'Crypt Stair',x:180,y:120},
      pieces:[
        {t:'bank',id:'sigils',name:'Sigils',kind:'target',from:[124,330],to:[124,220],n:2,pad:.08},
        {t:'bank',id:'sigils',kind:'target',from:[516,220],to:[516,330],n:2,pad:.08},
        {t:'bumper',x:255,y:300,r:22,group:'urns'},{t:'bumper',x:385,y:300,r:22,group:'urns'}],
      spawn:[[200,440],[440,440],[320,410],[320,255],[175,250],[465,250]],
      shots:[{id:'sigils',name:'Sigils',x:162,y:275,ang:Math.PI},{id:'sigilsR',name:'Sigils',x:478,y:275,ang:0},{id:'urns',name:'Urns',x:320,y:300,ang:0,kind:'dot'}],
      torch:{col:'#c8e060',spots:[[104,150],[536,150],[320,22]]},
      court:{x:-800,z:1178,e:-95,side:-1,z0:1080,z1:1980}},
    // the Den: a cave with the pack in it; slay three wolves to clear the way to the lair
    {key:'den',name:'The Den',short:'the Den',
      outline:[[217,561],[128,430],[104,300],[136,170],[214,84],[320,52],[426,84],[504,170],[536,300],[512,430],[423,561]],
      goal:{id:'lair',name:'The Lair'},entry:{id:'denIn',name:'Hunting Door',x:250,y:112},
      pieces:[{t:'bumper',x:196,y:258,r:20,group:'bonepile'},{t:'bumper',x:444,y:258,r:20,group:'bonepile'}],
      spawn:[[320,305],[286,425],[354,425],[320,365]],
      shots:[{id:'bonepile',name:'Bone Piles',x:320,y:330,ang:0,kind:'dot'}],
      torch:{col:'#cfe6ff',spots:[[88,300],[552,300],[320,34]]},
      court:{x:800,z:1178,e:-95,side:1,z0:1080,z1:1980}},
    // the Hoard: six dragon coins lie about the vault floor; roll over them all to unbar the vault
    {key:'hoard',name:'The Hoard',short:'the Hoard',
      outline:[[217,561],[140,440],[108,250],[150,110],[250,44],[390,44],[490,110],[532,250],[500,440],[423,561]],
      goal:{id:'vault',name:'The Vault'},entry:{id:'hoardIn',name:"Smuggler's Crawl",x:246,y:106},
      pieces:[{t:'bumper',x:398,y:268,r:24,group:'pyre'}], // off the centre line, so the straight shot at the vault stays open from both flippers
      coins:[[168,215],[472,215],[162,362],[478,362],[198,468],[442,468]],
      spawn:[[230,300],[440,372],[320,420],[250,250],[318,318]],
      shots:[{id:'pyre',name:'The Pyre',x:398,y:306,ang:0,kind:'dot'}],
      torch:{col:'#ffb050',spots:[[92,250],[548,250],[320,26]]},
      court:{x:800,z:90,e:-20,side:1,z0:0,z1:900}}
  ],

  /* ---------- RAMPS: each starts at the mouth of the same id and follows `path` (whole-table coordinates) ---------- */
  ramps:[
    {id:'rampForest',name:'Forest Road',from:2,to:1,up:true,path:[[104,2420],[70,2300],[46,2180],[40,2040],[40,1900],[42,1800],[52,1756],[68,1742],[80,1756],[81,1792]]},
    {id:'rampChapel',name:'Chapel Stair',from:2,to:2,calls:2,path:[[510,2420],[528,2340],[500,2262],[420,2206],[320,2188],[220,2206],[140,2262],[106,2340],[92,2440],[84,2600],[81,2760],[81,2832]]},
    {id:'rampRuin',name:'Ruin Stair',from:1,to:0,up:true,path:[[528,1380],[566,1270],[592,1150],[600,1010],[600,880],[598,770],[590,722],[574,706],[560,720],[559,756]]},
    {id:'rampWolf',name:'Wolf Run',from:1,to:1,calls:2,path:[[118,1390],[92,1300],[118,1222],[200,1166],[320,1146],[440,1166],[522,1222],[550,1300],[560,1500],[559,1760],[559,1796]]},
    {id:'rampTower',name:'Throne Road',from:0,to:0,calls:2,path:[[300,300],[250,220],[185,160],[130,138],[200,108],[320,92],[430,110],[500,170],[540,260],[558,360],[559,560],[559,754]]}
  ],

  /* ---------- TUNNELS: scoop to scoop, under the table (whole-table coordinates) ---------- */
  tunnels:[
    {from:'crypt',to:'catacombs',via:[[560,2500],[470,2250],[250,2000],[150,1750]]},
    {from:'secret',to:'sanctum',via:[[380,1380],[420,1100],[360,800],[320,600]]},
    {from:'oubliette',to:'crypt',via:[[590,640],[604,1000],[560,1500],[600,2000],[560,2420]]},
    {from:'rise',to:'crypt',via:[[400,3330],[470,3160],[540,2900]]}
  ],

  /* ---------- SHOT INSERTS: the arrows and dots painted on the floor, in field coordinates. A shot id is the id of the
     ramp, scoop, bank, bumper group, spinner, lane set or orbit it stands for; quests and lamps address shots by id. ---------- */
  shots:[
    {id:'orbitL0',name:'Rampart Walk',tier:0,x:43,y:545},{id:'armory',name:'Armory',tier:0,x:136,y:556,ang:Math.atan2(-.7,-.7)},{id:'rampTower',name:'Throne Road',tier:0,x:320,y:540},
    {id:'guard',name:'Royal Guard',tier:0,x:262,y:528},{id:'sanctum',name:'Sanctum',tier:0,x:112,y:380},{id:'braziers',name:'Braziers',tier:0,x:320,y:272,ang:0,kind:'dot'},
    {id:'bell',name:'The Bell',tier:0,x:434,y:524,ang:aR},{id:'oubliette',name:'Oubliette',tier:0,x:528,y:545},{id:'orbitR0',name:'Rampart Walk',tier:0,x:597,y:545},
    {id:'chains',name:'Winch',tier:0,x:43,y:500,ang:0,kind:'dot'},{id:'throne',name:'The Throne',tier:0,x:320,y:238,ang:0,kind:'dot'},
    {id:'orbitL1',name:'Moon Path',tier:1,x:43,y:545},{id:'catacombs',name:'Catacombs',tier:1,x:112,y:545},{id:'rampWolf',name:'Wolf Run',tier:1,x:206,y:524,ang:aL},
    {id:'camp',name:'Goblin Camp',tier:1,x:368,y:436},{id:'secret',name:'Secret Passage',tier:1,x:320,y:444},{alias:'door',of:'secret'},{id:'stones',name:'Standing Stones',tier:1,x:320,y:304,ang:0,kind:'dot'},
    {id:'rampRuin',name:'Ruin Stair',tier:1,x:434,y:524,ang:aR},{id:'hut',name:"Witch's Hut",tier:1,x:528,y:545},{id:'orbitR1',name:'Moon Path',tier:1,x:597,y:545},
    {id:'windmill',name:'Mill',tier:1,x:274,y:532,ang:0,kind:'dot'},{id:'moon',name:'Moon Phases',tier:1,x:320,y:760,ang:0,kind:'dot'},{id:'keystone',name:'Keystone',tier:1,x:320,y:216,ang:0,kind:'dot'},
    {id:'orbitL2',name:'Night Road',tier:2,x:43,y:545},{id:'smithy',name:'Smithy',tier:2,x:138,y:648,ang:Math.atan2(-.77,-.64)},{id:'rampForest',name:'Forest Road',tier:2,x:198,y:574,ang:aL},
    {id:'townGate',name:'Town Gate',tier:2,x:236,y:372,ang:Math.atan2(-.92,-.39)},{id:'tavern',name:'Tavern',tier:2,x:303,y:505},{id:'graves',name:'Gravestones',tier:2,x:320,y:268,ang:0,kind:'dot'},
    {id:'chapel',name:'Chapel',tier:2,x:430,y:356,ang:Math.atan2(-.942,.336)},{id:'rampChapel',name:'Chapel Stair',tier:2,x:416,y:524,ang:aR},{id:'crypt',name:'Crypt Stair',tier:2,x:505,y:668},
    {id:'orbitR2',name:'Night Road',tier:2,x:563,y:545},{id:'vane',name:'Vane',tier:2,x:168,y:566,ang:0,kind:'dot'},{id:'candles',name:'Vigil Candles',tier:2,x:320,y:172,ang:0,kind:'dot'}
  ]
};

