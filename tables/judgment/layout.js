/* Three joined terraces, mechanical landmarks and distinct shot routes. Earth launches; Hell owns the final drain.
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
      {t:'centerScoop',x:320,w:40},
      {t:'hole',id:'gates',name:'Pearly Gates',x:320,y:432,r:16,eject:'R',rail:'haloLoop'},
      {t:'bank',id:'trumpets',name:'The Trumpets',kind:'target',from:[116,445],to:[167,404],n:3},
      {t:'block',height:12,name:'trumpets',pts:[[116,445],[167,404],[147,370],[66,330],[66,465]]},
      {t:'spinner',id:'halo',x:484,y:512,r:20,rot:-.4},
      {t:'bank',id:'mercy',name:'Mercy',kind:'drop',from:[460,607],to:[514,643],n:3},
      {t:'block',height:12,name:'mercy',pts:[[460,601],[514,637],[550,613],[535,568],[485,565]]},
      ...state(320),lamp(270,527,'lockLit','LOCK','#b4eeef'),lamp(370,527,'lock1','ONE HELD','#b4eeef')
    ],torches:[[28,520,'#dceeff',170],[612,520,'#dceeff',170],[320,28,'#fff3c7',230]]},
    {id:'earth',name:'EARTH',short:'Earth',shooter:true,pieces:[
      {t:'lanes',id:'candles',name:'Light the Candles',y:118,r:13,xs:[284,320,356],posts:{xs:[266,302,338,374],y0:92,y1:142,w:4},skill:true,ballReset:true},
      {t:'gate',pts:[[91,107],[126,136]],solid:[150,95]},
      {t:'bumper',x:278,y:240,r:24,group:'bells',bell:true},
      {t:'bumper',x:379,y:292,r:24,group:'bells',bell:true},
      {t:'mouth',id:'ascension',x:185,y:390,angle:-2.74},
      {t:'wall',w:3,pts:['@ascension.lt','@ascension.lb']},
      {t:'wall',w:3,pts:['@ascension.rb','@ascension.rt']},
      {t:'spinner',id:'prayer',x:224,y:380,r:19,rot:-1.05},
      {t:'bank',id:'crosses',name:'The Crosses',kind:'drop',from:[104,587],to:[160,548],n:3},
      {t:'wall',w:3,pts:[[98,580],[142,525],[165,545]]},
      {t:'wall',w:3,style:'scoop',pts:[[270,610],[268,580],[284,563],[300,560],[316,563],[332,580],[330,610]]},
      {t:'hole',id:'sanctuary',name:'Sanctuary',x:300,y:587,r:15,eject:'L'},
      {t:'bank',id:'vigil',name:'Keep the Vigil',kind:'target',from:[432,365],to:[492,399],n:3},
      {t:'wall',w:3,pts:[[432,359],[460,320],[524,315],[540,370],[492,393]]},
      {t:'wall',w:3,style:'scoop',pts:[[480,644],[485,603],[505,588],[525,603],[530,644]]},
      {t:'hole',id:'descent',name:'Into the Abyss',x:505,y:622,r:13,eject:'R',rail:'abyss'},
      {t:'flipper',x:508,y:520,side:1,size:76,rest:.42,up:-.58},
      {t:'mouth',id:'orbitFeed',x:563,y:330,angle:Math.PI/2},
      {t:'mouth',id:'pilgrimage',x:396,y:675,side:0},
      {t:'wall',w:3,pts:['@pilgrimage.lb','@pilgrimage.lt']},
      {t:'wall',w:3,pts:['@pilgrimage.rb','@pilgrimage.rt']},
      {t:'wall',w:2,pts:[[348,421],[348,367],[362,350],[376,367],[376,421]]},
      ...state(303),lamp(360,464,'bellProgress','BELL'),lamp(446,576,'comboReady','COMBO','#aeeaff'),
      {t:'post',x:303,y:972,r:8},{t:'shooter'}
    ],torches:[[30,640,'#dfa260',110],[576,640,'#dfa260',110],[320,35,'#a4c6f1',150]]},
    {id:'hell',name:'HELL',short:'Hell',pieces:[
      {t:'lanes',id:'embers',name:'Brimstone',y:118,r:13,xs:[284,320,356],posts:{xs:[266,302,338,374],y0:92,y1:142,w:4}},
      {t:'bumper',x:248,y:241,r:27,group:'fire'},
      {t:'bumper',x:399,y:292,r:27,group:'fire'},
      {t:'centerScoop',x:346,w:32},
      {t:'hole',id:'beast',name:'The Beast',x:346,y:444,r:16,eject:'L'},
      {t:'block',height:12,name:'redemption',pts:[[66,295],[144,330],[175,398],[170,528],['notch',112,490],[66,528]]},
      {t:'hole',id:'redemption',name:'Redemption',x:112,y:510,r:14,eject:'R',rail:'redemptionRise'},
      {t:'bank',id:'chains',name:'Break the Chains',kind:'drop',from:[463,462],to:[529,511],n:3},
      {t:'block',height:12,name:'chains',pts:[[463,456],[529,505],[574,474],[574,350],[491,413]]},
      {t:'bank',id:'serpent',name:'The Serpent',kind:'target',from:[92,656],to:[141,617],n:2},
      {t:'block',height:12,name:'serpent',pts:[[92,650],[141,611],[122,580],[75,612],[67,657]]},
      {t:'spinner',id:'torment',x:440,y:600,r:19,rot:-.6},
      ...state(320),lamp(41,850,'kickback','MERCY','#ffa96b'),
      lamp(283,530,'chain','CHAINS','#ff9767'),
      ...[1,2,3].map((n,i)=>lamp(313+i*34,576,'wound'+n,''+n,'#ff674f')),
      {t:'kickback',x:41,y:935,r:17},{t:'post',x:320,y:972,r:8}
    ],torches:[[28,420,'#ff381f',125],[612,420,'#ff381f',125],[320,28,'#ff8235',180]]}
  ],
  mechanisms:[
    {id:'pearlyGates',kind:'gate',field:'heaven',x:280,y:467,height:65,speed:1.4,
      leaves:[{length:40,closed:0,open:-Math.PI/2},{x:80,length:40,closed:Math.PI,open:Math.PI*1.5}]},
    {id:'beastJaw',kind:'shutter',field:'hell',x:309,y:474,height:29,lift:58,speed:1.2,color:'#71322f',scoop:'beast',
      leaves:[{length:74,closed:0,open:0}]},
    {id:'cathedralBell',kind:'captive',field:'earth',x:362,y:406,radius:10,travel:40,strike:70}
  ],
  ramps:[
    {id:'ascension',name:'Ascension',from:'earth',to:'heaven',k:.08,drag:.025,exitV:520,col:'#e7ce87',
      path:[['#earth',64,245],['#earth',38,100],['#earth',36,-180],['#heaven',48,628],['#heaven',80,655],['#heaven',81,748]]},
    {id:'orbitFeed',name:'Upper Flipper Feed',from:'earth',to:'earth',k:.12,drag:.04,exitV:330,col:'#b2d9ec',
      path:[['#earth',557,450],['#earth',520,475],['#earth',475,506]]},
    {id:'pilgrimage',name:'Pilgrimage',from:'earth',to:'earth',k:.12,drag:.025,exitV:430,lift:32,col:'#b6cfee',
      path:[['#earth',396,460],['#earth',410,243],['#earth',360,167],['#earth',235,175],['#earth',159,263],['#earth',115,467],['#earth',81,660],['#earth',81,750]]},
    {id:'haloLoop',name:'Crown of Heaven',from:'heaven',to:'heaven',entry:['#heaven',320,432],k:.05,drag:.02,
      feedSpeed:720,minSpeed:300,exitV:650,lift:36,col:'#fff0aa',hold:{at:.5,duration:1.1,releaseSpeed:680},
      next:'haloReturn',branch:'apocalypse',endHeight:82,
      path:[['#heaven',320,322],['#heaven',253,270],['#heaven',227,181],['#heaven',288,115],['#heaven',390,123],['#heaven',434,197],['#heaven',395,270],['#heaven',360,315],['#heaven',430,387],['#heaven',490,540]]},
    {id:'haloReturn',name:'Grace Return',from:'heaven',to:'heaven',entry:['#heaven',490,540],startHeight:82,k:.1,drag:.05,
      minSpeed:250,exitV:380,col:'#fff0aa',path:[['#heaven',521,615],['#heaven',555,667],['#heaven',559,748]]},
    {id:'apocalypse',name:'The Fall',from:'heaven',to:'hell',entry:['#heaven',490,540],startHeight:82,k:.03,drag:.08,
      minSpeed:420,exitV:400,col:'#ff835b',path:[['#heaven',635,625],['#heaven',654,900],['#earth',654,300],['#earth',654,770],['#hell',632,235],['#hell',570,450],['#hell',555,700],['#hell',559,750]]},
    {id:'abyss',name:'Into the Abyss',from:'earth',to:'hell',entry:['#earth',505,622],k:.03,drag:.06,feedSpeed:700,minSpeed:300,exitV:370,
      col:'#db8065',path:[['#earth',578,674],['#earth',611,810],['#hell',603,180],['#hell',546,370],['#hell',510,630],['#hell',530,696]]},
    {id:'redemptionRise',name:'Redemption',from:'hell',to:'earth',entry:['#hell',112,510],k:.02,drag:.025,feedSpeed:950,minSpeed:540,exitV:400,
      col:'#aeeaff',path:[['#hell',56,415],['#hell',-5,220],['#hell',-10,-120],['#earth',-10,640],['#earth',24,588],['#earth',78,633],['#earth',81,750]]}
  ],
  tunnels:[],
  shots:[
    shot('virtues','FAITH · HOPE · LOVE','heaven',320,176,0,'dot'),shot('choir','THE CHOIR','heaven',460,302,0,'dot'),
    shot('gates','PEARLY GATES','heaven',320,520),shot('trumpets','TRUMPETS','heaven',183,462,-2.2),
    shot('halo','HALO','heaven',470,553,0,'dot'),shot('mercy','MERCY','heaven',439,658,-1),
    shot('candles','CANDLES','earth',320,174,0,'dot'),shot('bells','BELLS','earth',278,295,0,'dot'),shot('cathedralBell','CATHEDRAL BELL','earth',362,466),
    shot('ascension','ASCENSION','earth',237,404,-2.6),shot('prayer','PRAYER','earth',241,414,0,'dot'),
    shot('crosses','CROSSES','earth',169,611,-2.2),shot('sanctuary','RESCUE A SOUL','earth',300,650),
    shot('vigil','VIGIL','earth',428,421,-1),shot('descent','INTO THE ABYSS','earth',505,673),
    shot('pilgrimage','PILGRIMAGE','earth',383,707,-1.18),shot('orbitFeed','UPPER FLIPPER','earth',550,471),
    shot('haloLoop','CROWN OF HEAVEN','heaven',320,357),shot('haloReturn','GRACE RETURN','heaven',542,658),
    shot('apocalypse','THE FALL','heaven',520,586),shot('abyss','ABYSS','earth',544,699),shot('redemptionRise','RISE','hell',82,438),
    shot('embers','BRIMSTONE','hell',320,175,0,'dot'),shot('fire','HELLFIRE','hell',250,305,0,'dot'),
    shot('beast','THE BEAST','hell',346,500),shot('redemption','REDEMPTION','hell',205,557,-2.67),
    shot('chains','BREAK THE CHAINS','hell',476,553,-1.1),shot('serpent','SERPENT','hell',160,670,-2.2),
    shot('torment','TORMENT','hell',434,643,0,'dot'),
    ...['heaven','earth','hell'].flatMap((f,i)=>[shot('orbitL'+i,'LEFT ORBIT',f,43,552),shot('orbitR'+i,'RIGHT ORBIT',f,i===1?563:597,552)])
  ]
};
