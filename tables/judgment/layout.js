/* Three joined terraces, ONE ascent ramp. Earth launches; Hell owns the final drain.
   Heaven: open, long sight lines to a high central gate. Earth: asymmetric ramp / chapel.
   Hell: staggered fire, a central jaw and a low side escape. Travel down is a physical fall.
   All coordinates are local. No field borrows another table's layout. */
const lamp=(x,y,show,label,col='#efd38c')=>({t:'lamp',x,y,show,label,col});
const shot=(id,name,tier,x,y,ang=-Math.PI/2,kind)=>({id,name,tier,x,y,ang,kind});
const state=(cx)=>[
  ...[2,3,4,5,6].map((n,i)=>lamp(cx,805-i*30,'mult'+n,n+'x')),
  lamp(cx,853,'save','SAVE','#edf7ff'),
  lamp(cx-82,760,'soul1','CANDLE'),lamp(cx-82,804,'soul2','BELL'),lamp(cx-82,848,'soul3','SOUL'),
  lamp(cx+82,760,'gate','GATES'),lamp(cx+82,804,'grace','GRACE','#aeeaff'),
  lamp(cx+82,848,'beast','BEAST','#ff7358')
];
export const layout={
  fields:[
    {id:'heaven',name:'HEAVEN',short:'Heaven',pieces:[
      {t:'lanes',id:'virtues',name:'Faith · Hope · Love',y:118,r:13,xs:[284,320,356],posts:{xs:[266,302,338,374],y0:92,y1:142,w:4}},
      {t:'bumper',x:180,y:240,r:25,group:'choir',bell:true},
      {t:'bumper',x:460,y:240,r:25,group:'choir',bell:true},
      {t:'centerScoop',x:320,w:35},
      {t:'hole',id:'gates',name:'Pearly Gates',x:320,y:444,r:16,eject:'R'},
      {t:'bank',id:'trumpets',name:'The Trumpets',kind:'target',from:[116,445],to:[167,404],n:3},
      {t:'block',name:'trumpets',pts:[[116,445],[167,404],[147,370],[66,330],[66,465]]},
      {t:'spinner',id:'halo',x:484,y:512,r:20,rot:-.4},
      {t:'bank',id:'mercy',name:'Mercy',kind:'drop',from:[460,607],to:[514,643],n:3},
      {t:'block',name:'mercy',pts:[[460,601],[514,637],[550,613],[535,568],[485,565]]},
      ...state(320),lamp(270,527,'lockLit','LOCK','#b4eeef'),lamp(370,527,'lock1','ONE HELD','#b4eeef')
    ],torches:[[28,520,'#dceeff',170],[612,520,'#dceeff',170],[320,28,'#fff3c7',230]]},
    {id:'earth',name:'EARTH',short:'Earth',shooter:true,pieces:[
      {t:'lanes',id:'candles',name:'Light the Candles',y:118,r:13,xs:[284,320,356],posts:{xs:[266,302,338,374],y0:92,y1:142,w:4},skill:true,ballReset:true},
      {t:'gate',pts:[[91,107],[126,136]],solid:[150,95]},
      {t:'bumper',x:278,y:240,r:24,group:'bells',bell:true},
      {t:'bumper',x:379,y:292,r:24,group:'bells',bell:true},
      {t:'mouth',id:'ascension',x:172,y:480,side:-1},
      {t:'block',name:'stair',pts:[[66,390],'@ascension.lt','@ascension.lb',[72,520],[66,500]]},
      {t:'wall',w:3,pts:['@ascension.rb','@ascension.rt']},
      {t:'spinner',id:'prayer',x:195,y:540,r:20,rot:Math.atan2(.925,.38)-Math.PI/2},
      {t:'bank',id:'crosses',name:'The Crosses',kind:'drop',from:[207,363],to:[270,335],n:3},
      {t:'block',name:'crosses',pts:[[205,357],[270,329],[251,295],[204,310]]},
      {t:'centerScoop',x:322,w:29},
      {t:'hole',id:'sanctuary',name:'Sanctuary',x:322,y:444,r:15,eject:'L'},
      {t:'bank',id:'vigil',name:'Keep the Vigil',kind:'target',from:[432,365],to:[492,399],n:3},
      {t:'block',name:'vigil',pts:[[432,359],[492,393],[540,370],[524,315],[460,320]]},
      {t:'block',name:'descent',pts:[[480,467],[540,436],[540,640],['notch',505,602],[470,640],[470,540]]},
      {t:'hole',id:'descent',name:'Into the Abyss',x:505,y:622,r:13,eject:'R'},
      ...state(303),lamp(248,590,'bellProgress','BELLS'),
      {t:'post',x:303,y:972,r:8},{t:'shooter'}
    ],torches:[[30,640,'#dfa260',110],[576,640,'#dfa260',110],[320,35,'#a4c6f1',150]]},
    {id:'hell',name:'HELL',short:'Hell',pieces:[
      {t:'lanes',id:'embers',name:'Brimstone',y:118,r:13,xs:[284,320,356],posts:{xs:[266,302,338,374],y0:92,y1:142,w:4}},
      {t:'bumper',x:248,y:241,r:27,group:'fire'},
      {t:'bumper',x:399,y:292,r:27,group:'fire'},
      {t:'centerScoop',x:346,w:32},
      {t:'hole',id:'beast',name:'The Beast',x:346,y:444,r:16,eject:'L'},
      {t:'block',name:'redemption',pts:[[66,295],[144,330],[175,398],[170,528],['notch',112,490],[66,528]]},
      {t:'hole',id:'redemption',name:'Redemption',x:112,y:510,r:14,eject:'R'},
      {t:'bank',id:'chains',name:'Break the Chains',kind:'drop',from:[463,462],to:[529,511],n:3},
      {t:'block',name:'chains',pts:[[463,456],[529,505],[574,474],[574,350],[491,413]]},
      {t:'bank',id:'serpent',name:'The Serpent',kind:'target',from:[92,656],to:[141,617],n:2},
      {t:'block',name:'serpent',pts:[[92,650],[141,611],[122,580],[75,612],[67,657]]},
      {t:'spinner',id:'torment',x:440,y:600,r:19,rot:-.6},
      ...state(320),lamp(41,850,'kickback','MERCY','#ffa96b'),
      lamp(283,530,'chain','CHAINS','#ff9767'),
      ...[1,2,3].map((n,i)=>lamp(313+i*34,576,'wound'+n,''+n,'#ff674f')),
      {t:'kickback',x:41,y:935,r:17},{t:'post',x:320,y:972,r:8}
    ],torches:[[28,420,'#ff381f',125],[612,420,'#ff381f',125],[320,28,'#ff8235',180]]}
  ],
  ramps:[{id:'ascension',name:'Ascension',from:'earth',to:'heaven',k:.12,drag:.04,exitV:620,col:'#e7ce87',
    path:[['#earth',104,300],['#earth',70,180],['#earth',46,60],['#earth',40,-80],['#earth',40,-220],['#earth',42,-320],['#earth',52,-364],['#earth',68,-378],['#earth',80,-364],['#heaven',81,712]]}],
  tunnels:[{from:'redemption',to:'sanctuary',via:[['#hell',-30,440],['#earth',-30,520]]},
    {from:'descent',to:'beast',via:[['#earth',650,730],['#hell',650,330]]}],
  shots:[
    shot('virtues','FAITH · HOPE · LOVE','heaven',320,176,0,'dot'),shot('choir','THE CHOIR','heaven',460,302,0,'dot'),
    shot('gates','PEARLY GATES','heaven',320,502),shot('trumpets','TRUMPETS','heaven',183,462,-2.2),
    shot('halo','HALO','heaven',470,553,0,'dot'),shot('mercy','MERCY','heaven',439,658,-1),
    shot('candles','CANDLES','earth',320,174,0,'dot'),shot('bells','RING SIX BELLS','earth',371,345,0,'dot'),
    shot('ascension','ASCENSION','earth',198,577,-1.96),shot('prayer','PRAYER','earth',171,568,0,'dot'),
    shot('crosses','CROSSES','earth',251,401,-1.95),shot('sanctuary','RESCUE A SOUL','earth',322,506),
    shot('vigil','VIGIL','earth',428,421,-1),shot('descent','INTO THE ABYSS','earth',505,673),
    shot('embers','BRIMSTONE','hell',320,175,0,'dot'),shot('fire','HELLFIRE','hell',250,305,0,'dot'),
    shot('beast','THE BEAST','hell',346,500),shot('redemption','REDEMPTION','hell',205,557,-2.67),
    shot('chains','BREAK THE CHAINS','hell',476,553,-1.1),shot('serpent','SERPENT','hell',160,670,-2.2),
    shot('torment','TORMENT','hell',434,643,0,'dot'),
    ...['heaven','earth','hell'].flatMap((f,i)=>[shot('orbitL'+i,'LEFT ORBIT',f,43,552),shot('orbitR'+i,'RIGHT ORBIT',f,i===1?563:597,552)])
  ]
};
