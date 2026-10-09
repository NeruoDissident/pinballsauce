/* ================= BUILDING A TABLE FROM ITS LAYOUT =================
   Reads the `layout` part of a table definition (see docs/TABLE_FORMAT.md) and fills T: walls, flippers, bumpers,
   sensors, scoops, banks, ramps, tunnels and shot inserts. The order things are built in is the order the ball is
   tested against them, so it is fixed: frames and orbits, floors, each field's pieces as listed, the Grave, the
   wings, ramps, tunnels, inserts, torches. */
import {PI,lerp,rand} from '../core/util.js';
import {T} from '../core/state.js';
import {TY,FY,CX,XR,NM,BT,GT,WT0,NW,NT,H,GY,HW,WB,WLEN,BR,CELL,GRAV} from './layout.js';
import {seg,poly,gseg,block,bumper,sensor,hole,shotDef,bank,mouthGeo,catmull,resample,rail} from './geometry.js';
import {buildFrame,buildFloor,buildOrbits,centerScoop,sideScoopBlock} from './parts.js';
import {WINGS} from './content.js';

const RESERVED=new Set(['t','x','y','r','group','at','id','name','pts','kind','from','to','n','pad','w','style','eject','xs','posts','mouth','side','xg','topY','rot','door']);
const extra=p=>{const o={};for(const k in p)if(!RESERVED.has(k))o[k]=p[k];return o;};

// one piece of a field or a wing. C carries the room's origin, its tier and the ramp mouths met so far.
function piece(p,C){const y=C.y,tier=C.tier,m=C.m;
  const ref=s=>{const q=s.slice(1).split('.'),g=m[q[0]];if(!g||!g[q[1]])throw new Error('layout: unknown mouth point '+s);return g[q[1]];};
  const P=q=>typeof q==='string'?ref(q):Array.isArray(q)?(typeof q[0]==='string'?[ref(q[0])[0]+q[1],ref(q[0])[1]+q[2]]:[q[0],q[1]+y]):[m[q.along].p[0]+m[q.along].d[0]*q.d,m[q.along].p[1]+m[q.along].d[1]*q.d];
  const PTS=l=>{const o=[];for(const q of l){if(Array.isArray(q)&&q[0]==='notch'){const c=q[1],b=q[2];for(const n of [[c+20,b+38],[c+20,b+12],[c+10,b],[c-10,b],[c-20,b+12],[c-20,b+38]])o.push([n[0],n[1]+y]);}else o.push(P(q));}return o;};
  switch(p.t){
  case 'bumper':{const q=p.at?P(p.at):[p.x,y+p.y];bumper(q[0],q[1],p.r,p.group,tier,extra(p));break;}
  case 'mouth':m[p.id]=mouthGeo(p.x,y+p.y,p.side);break;
  case 'block':block(PTS(p.pts),{name:p.name,tier});break;
  case 'hole':hole(p.id,p.x,y+p.y,p.r,tier,p.name);Object.assign(T.holes[p.id],extra(p));if(p.eject)C.aims.push([p.id,tier,p.eject==='L'?-1:1]);break;
  case 'bank':{const B=bank(p.id,tier,P(p.from),P(p.to),p.n,p.kind,{pad:p.pad,name:p.name});if(p.door){B.door=true;B.doorTime=p.door.time;B.doorPopup=p.door.popup;T.door=B;}Object.assign(B,extra(p));break;}
  case 'wall':poly(PTS(p.pts),p.w===undefined?{}:{w:p.w},p.style);break;
  case 'spinner':{const s=sensor(p.x,y+p.y,p.r,Object.assign({kind:'spin',id:p.id,tier,rate:0,ang:0},p.rot===undefined?{}:{rot:p.rot},extra(p)));const sc=C.def.content.spinCalls;if(sc&&sc[p.id])s.calls=sc[p.id];break;}
  case 'lanes':{const ls=[];if(p.posts)p.posts.xs.forEach(x=>poly([[x,p.posts.y0+y],[x,p.posts.y1+y]],{w:p.posts.w},'post'));
    p.xs.forEach(x=>ls.push(sensor(x,y+p.y,p.r,{kind:'lane',set:p.id,tier})));T.sets[p.id]=Object.assign({id:p.id,tier,lanes:ls,name:p.name},extra(p));break;}
  case 'floorSet':{const ls=T.sens.filter(s=>s.tier===tier&&(s.kind==='inlane'||s.kind==='outlane'));ls.sort((a,b)=>a.x-b.x);ls.forEach(s=>s.set=p.id);T.sets[p.id]=Object.assign({id:p.id,tier,lanes:ls,name:p.name},extra(p));break;}
  case 'scoopBlock':sideScoopBlock(m[p.mouth],p.side,y,p.xg,p.topY,p.name,tier);break;
  case 'centerScoop':centerScoop(p.x,y,p.w);break;
  case 'shooter': // the plunger lane up the right side of the bottom field
    poly([[586,y+335],[586,H+80]],{w:2});gseg([586,y+335],[620,y+288],480,y+200);T.wallPaths.push({pts:[[586,y+335],[620,y+288]],style:'flap'});
    seg(586,y+992,620,y+992,{e:.1});T.shooter={x:603,y:y+980};break;
  case 'kickback':sensor(p.x,y+p.y,p.r,{kind:'kick',tier});break;
  default:throw new Error('layout: unknown piece type '+p.t);}}

// the Grave: a coffin with its own flippers, two nails over the way out, two bumpers. A standard part: tables only name it.
function buildGrave(g,C){const y=GY,o=p=>[p[0],p[1]+y],tier=GT;
  T.coffin=[[217,641],[62,210],[62,150],[196,24],[444,24],[578,150],[578,210],[423,641]].map(o);
  poly(T.coffin,{},'none');
  for(const sd of [-1,1]){T.flips.push({x:320+sd*100,y:y+650,side:sd,dir:-sd,tier,L:82,rest:.5,up:-.44,a:.5,w:0,on:false});
    poly([o([320+sd*100,663]),o([320+sd*46,HW-GY+60])],{},'none');}
  centerScoop(320,y-250);hole('rise',320,y+194,14,tier,g.light||'The Light');T.holes.rise.ev=[0,200];
  bank('nails',tier,o([300,214]),o([320,208]),1,'drop',{name:g.nails||'Coffin Nails'});bank('nails',tier,o([320,208]),o([340,214]),1,'drop');
  bumper(150,y+300,22,'bones',tier);bumper(490,y+300,22,'bones',tier);
  T.graveIn={x:258,y:y+330};
  shotDef('rise',g.light||'The Light',tier,320,262);T.shots.nails=T.shots.rise;
  const tc=g.torches||['#7dffb0','#7dffb0','#eaffd0'];
  [[110,170],[530,170],[320,60]].forEach((q,k)=>T.torches.push({x:q[0],y:q[1]+y,c:tc[k],r:k===2?170:120,ph:rand(9)}));}

// a wing: a small room with its own flippers, a sealed scoop at its head (the goal) and a scoop the ball arrives in
function buildWing(wd,k,C){const tier=WT0+k,y=TY[tier],o=p=>[p[0],p[1]+y],w=T.wings[wd.key]={key:wd.key,tier,y,outline:wd.outline.map(o),goal:wd.goal.id,inHole:wd.entry.id,seal:[]};
  poly(w.outline,{},'none');
  for(const sd of [-1,1]){T.flips.push({x:320+sd*100,y:y+570,side:sd,dir:-sd,tier,L:82,rest:.5,up:-.44,a:.5,w:0,on:false});poly([o([320+sd*100,583]),o([320+sd*46,WLEN+60])],{},'none');}
  centerScoop(320,y-280);hole(wd.goal.id,320,y+164,14,tier,wd.goal.name);T.holes[wd.goal.id].ev=[0,200];
  w.seal=[seg(300,y+184,320,y+178,{kind:'seal',w:3,e:.3,tier}),seg(320,y+178,340,y+184,{kind:'seal',w:3,e:.3,tier})];
  hole(wd.entry.id,wd.entry.x,y+wd.entry.y,13,tier,wd.entry.name);shotDef(wd.goal.id,wd.goal.name,tier,320,236);
  C.aims.push([wd.entry.id,tier,-1]);T.holes[wd.goal.id].wingGoal=wd.key;T.holes[wd.entry.id].wingIn=wd.key;
  const WC={y,tier,m:C.m,aims:C.aims,def:C.def};for(const p of wd.pieces||[])piece(p,WC);
  if(wd.coins)w.coins=wd.coins.map(o);
  T.spawn[tier]=(wd.spawn||[]).map(o);
  for(const s of wd.shots||[])shotDef(s.id,s.name,tier,s.x,s.y,s.ang,s.kind);
  if(wd.torch)wd.torch.spots.forEach((q,i)=>T.torches.push({x:q[0],y:q[1]+y,c:wd.torch.col,r:i===2?170:120,ph:rand(9),fix:{x:q[0],y:q[1]+y,h:46}}));}

export function buildTable(def){const L=def.layout,C={m:{},aims:[],def};
  Object.assign(T,{segs:[],grid:[],flips:[],bumps:[],sens:[],holes:{},rails:{},mouths:[],shots:{},banks:{},sets:{},slings:[],spawn:[],torches:[],wallPaths:[],blocks:[],chans:[],bossSpot:[],statueSpot:[],tunnels:{},posts:[],gposts:null,wings:{},door:null,shooter:null,statues:[]});
  for(let t=0;t<NT;t++)T.spawn.push([]);
  poly([[20,TY[0]+300],[20,H+80]],{},'none');poly([[620,TY[0]+300],[620,H+80]],{},'none');
  for(let i=0;i<NM;i++){buildFrame(i);buildOrbits(i);}
  for(let i=0;i<NM;i++)buildFloor(i,20,XR[i],CX[i]);
  for(let i=0;i<NM;i++){const f=L.fields[i],y=TY[i],o=p=>[p[0],p[1]+y];
    for(const p of f.pieces||[])piece(p,{y,tier:i,m:C.m,aims:C.aims,def});
    if(f.statue){T.statueSpot[i]={x:f.statue.x,y:y+f.statue.y};T.statues.push({x:f.statue.x,y:y+f.statue.y,r:f.statue.r,tier:i,id:f.statue.id});}
    if(f.boss)T.bossSpot[i]={x:f.boss.x,y:y+f.boss.y};
    T.spawn[i]=(f.spawn||[]).map(o);}
  if(!T.shooter)throw new Error('layout: the bottom field needs a {t:"shooter"} piece');
  buildGrave(L.grave,C);
  (L.wings||[]).forEach((wd,k)=>buildWing(wd,k,C));
  for(const r of L.ramps||[]){const o={from:r.from,to:r.to};if(r.up)o.up=true;rail(r.id,r.name,C.m[r.mouth||r.id],r.path,o);}
  T.mouthGeo=C.m;
  for(const k in WINGS)if(WINGS[k].rule==='targets'){if(!T.banks[WINGS[k].bank])throw new Error('content: wing '+k+' names a bank the layout does not have');T.banks[WINGS[k].bank].wing=k;}
  // tunnels: scoop to scoop
  const H_=T.holes,tun=(a,b,mid)=>{const r=resample(catmull([[H_[a].x,H_[a].y]].concat(mid,[[H_[b].x,H_[b].y]]),14),6);T.tunnels[a]=Object.assign(r,{to:b});};
  for(const t of L.tunnels||[])tun(t.from,t.to,t.via);
  // short hops between the main table and a wing: a straight run the camera follows, about a second long
  const hop=(a,b,key)=>{const A_=typeof a==='string'?[H_[a].x,H_[a].y]:a,B_=[H_[b].x,H_[b].y],x=[],yy=[],n=26;for(let i=0;i<n;i++){x.push(lerp(A_[0],B_[0],i/(n-1)));yy.push(lerp(A_[1],B_[1],i/(n-1)));}
    T.tunnels[key]={x,y:yy,n,ds:40,len:(n-1)*40,to:b,zone:true};};
  for(const k in WINGS){const d=WINGS[k],w=T.wings[k];if(!w)throw new Error('content: wing '+k+' has no room in the layout');hop(d.gate,w.inHole,'in_'+k);hop(w.goal,d.out,w.goal);hop([320,w.y+WLEN+24],d.out,'out_'+k);}
  // where each scoop spits the ball: at the tip of a flipper on its own level
  const fl=(t,sd)=>T.flips.find(f=>f.tier===t&&f.side===sd);
  const aim=(id,f)=>{const h=H_[id],tx=f.x+f.dir*46,ty=f.y-8,vy=260,dy=ty-h.y,t=(-vy+Math.sqrt(vy*vy+2*GRAV*dy))/GRAV;h.ev=[(tx-h.x)/t,vy];};
  for(const a of C.aims)aim(a[0],fl(a[1],a[2]));
  for(const s of L.shots||[]){if(s.alias)T.shots[s.alias]=T.shots[s.of];else shotDef(s.id,s.name,s.tier,s.x,s.y,s.ang,s.kind);}
  for(let i=0;i<NM;i++)for(const q of L.fields[i].torches||[])T.torches.push({x:q[0],y:q[1]+TY[i],c:q[2],r:q[3],ph:rand(9)});
  // the grid: which walls can touch a ball in each 80-unit band of y
  const rows=Math.ceil(((NW?WB[NW-1]+WLEN:HW)+200)/CELL);for(let r=0;r<rows;r++)T.grid.push([]);
  for(const s of T.segs){const a=Math.max(0,Math.floor((Math.min(s.y1,s.y2)-BR-8)/CELL)),b=Math.min(rows-1,Math.floor((Math.max(s.y1,s.y2)+BR+8)/CELL));for(let r=a;r<=b;r++)T.grid[r].push(s);}
}

