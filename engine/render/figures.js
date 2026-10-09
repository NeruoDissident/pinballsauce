/* ================= JOINTED FIGURES =================
   Foes and the party as small figures posed from the game state. The theme supplies a builder per foe type. */
import {FIGURES,FIGURE_POSE} from './figurekit.js';
import {G,focusBall} from '../core/state.js';
import {PI,clamp} from '../core/util.js';
import {M,R3,SM,hdr,lin} from './core.js';
import {elev,zshift} from './world.js';
import {COMPANIONS,guardPosts} from '../rules/party.js';
import {ENEMY,THEME} from '../table/content.js';
import {NM} from '../table/layout.js';

/* ================= FOES AS FIGURES =================
   Each enemy type is a small jointed figure built from primitives, posed every frame from the game's own state:
   it walks when the rules move it, draws its arm back through the wind-up, swings on the strike, reels when
   staggered, and falls when it dies. Units are table pixels; a figure stands on the floor at its enemy's spot
   and faces the ball. Bosses are still the painted billboards (see actors3d.js). */
export const FOE3={};
export function foeMats(){if(FOE3.m)return FOE3.m;const S=SM,glow=c=>new THREE.MeshBasicMaterial({color:hdr(c,2.2)});
  return FOE3.m={bone:S({color:'#d9d2bd',roughness:.65,envMapIntensity:.4}),dark:S({color:'#2a2a3a',roughness:.95}),gob:S({color:'#7fae52',roughness:.8}),gobD:S({color:'#4f6e34',roughness:.9}),sack:S({color:'#7a5a3a',roughness:.95}),
    robe:S({color:'#4a2e66',roughness:.9}),trim:S({color:'#8a6aa8',roughness:.8}),fur:S({color:'#6f7a8a',roughness:.95}),belly:S({color:'#aab2bd',roughness:.95}),mane:S({color:'#4a525e',roughness:1}),
    rust:S({color:'#6c7786',metalness:.75,roughness:.5,envMapIntensity:.9}),plate:S({color:'#8a94a8',metalness:.8,roughness:.4,envMapIntensity:1.2}),cape:S({color:'#8a2038',roughness:.9,side:THREE.DoubleSide}),
    skin:S({color:'#d8b090',roughness:.8}),blue:S({color:'#4a6a9a',roughness:.85}),white:S({color:'#e8e2d0',roughness:.85}),gold:S({color:'#d9a441',metalness:.9,roughness:.35,envMapIntensity:1.4}),leather:S({color:'#3a2e2a',roughness:.95}),violet:S({color:'#5a3f8a',roughness:.85}),lamp:new THREE.MeshBasicMaterial({color:hdr('#ffe0a0',2)}),
    troll:S({color:'#5f7f62',roughness:.9}),tbelly:S({color:'#8aa882',roughness:.9}),wood:M.wood,iron:M.iron,
    ghost:new THREE.MeshBasicMaterial({color:hdr('#9be8e0',.75),transparent:true,opacity:.5,blending:THREE.AdditiveBlending,depthWrite:false}),
    eyeG:glow('#7dffb0'),eyeY:glow('#ffd24a'),eyeR:glow('#ff3040'),eyeV:glow('#c08cff'),eyeC:glow('#9be8e0'),eyeO:glow('#ffb050'),staff:glow('#c08cff')};}
// geometry helpers: a limb hangs from its pivot, so rotating the pivot swings it
export const limbG=(r0,r1,len,seg)=>new THREE.CylinderGeometry(r0,r1,len,seg||6).translate(0,-len/2,0);
export function foePart(parent,geo,mat,x,y,z){const m=new THREE.Mesh(geo,mat);m.position.set(x,y,z);m.castShadow=true;parent.add(m);return m;}
export function foePivot(parent,x,y,z){const g=new THREE.Group();g.position.set(x,y,z);parent.add(g);return g;}
export function foeEyes(head,mat,dx,y,z,r){for(const sx of [-1,1])foePart(head,new THREE.SphereGeometry(r||2,6,5),mat,sx*dx,y,z);}
// a two-legged frame with a hip, a torso, shoulders and a head; every biped builder dresses one of these
export function biped(g,o){const P={};P.hip=foePivot(g,0,o.hip,0);
  P.legL=foePivot(g,-o.stance,o.hip,0);P.legR=foePivot(g,o.stance,o.hip,0);foePart(P.legL,limbG(o.leg,o.leg*.8,o.hip),o.legM);foePart(P.legR,limbG(o.leg,o.leg*.8,o.hip),o.legM);
  P.body=foePivot(P.hip,0,0,0);foePart(P.body,o.torsoG,o.torsoM,0,o.torso/2,0);
  P.armL=foePivot(P.body,-o.shoulder,o.torso-2,0);P.armR=foePivot(P.body,o.shoulder,o.torso-2,0);foePart(P.armL,limbG(o.arm,o.arm*.8,o.armLen),o.armM);foePart(P.armR,limbG(o.arm,o.arm*.8,o.armLen),o.armM);
  P.head=foePivot(P.body,0,o.torso+o.headR*.9,0);return P;}
// the party: four role figures, unarmed of eyes that glow, armed with a prop each
export const ALLY_BUILD={
  ally_tank(g,m){const P=biped(g,{hip:19,stance:5,leg:2.4,legM:m.plate,torso:16,torsoG:new THREE.BoxGeometry(14,16,8),torsoM:m.plate,shoulder:10.5,arm:2.2,armLen:15,armM:m.blue,headR:6.5});
    foePart(P.head,new THREE.SphereGeometry(6,10,8),m.skin,0,0,0);foePart(P.head,new THREE.CylinderGeometry(6.4,6.6,6,10),m.plate,0,3,0);foePart(P.head,new THREE.BoxGeometry(2,6,2),m.plate,0,0,6);
    for(const sx of [-1,1])foePart(P.body,new THREE.SphereGeometry(5,7,6),m.plate,sx*10,15,0);
    P.shield=foePart(P.armL,new THREE.CylinderGeometry(12,12,1.8,16).rotateX(PI/2),m.blue,-2,-9,4);foePart(P.shield,new THREE.SphereGeometry(3,6,5),m.gold,0,0,1.2);
    P.weapon=foePart(P.armR,new THREE.BoxGeometry(2.4,28,1.2),m.rust,0,-15,9);P.weapon.rotation.x=-PI/2;foePart(P.armR,new THREE.BoxGeometry(8,1.8,1.8),m.gold,0,-15,-1);return {P,h:50,eyes:null};},
  ally_healer(g,m){const P={};P.hip=foePivot(g,0,8,0);P.body=foePivot(P.hip,0,0,0);foePart(P.body,new THREE.ConeGeometry(9,30,8).translate(0,15-8,0),m.white,0,0,0);foePart(P.body,new THREE.TorusGeometry(6,1,5,12).rotateX(PI/2),m.gold,0,14,0);
    P.armL=foePivot(P.body,-7,19,0);P.armR=foePivot(P.body,7,19,0);foePart(P.armL,limbG(2,1.5,12),m.white);foePart(P.armR,limbG(2,1.5,12),m.white);
    P.head=foePivot(P.body,0,26,0);foePart(P.head,new THREE.SphereGeometry(5.5,9,8),m.skin,0,0,0);foePart(P.head,new THREE.ConeGeometry(6,9,8),m.white,0,5,-1);
    const staff=foePart(P.armR,new THREE.CylinderGeometry(.9,.9,36,5),m.wood,0,-12,4);P.tip=foePart(staff,new THREE.OctahedronGeometry(3,0),m.lamp,0,19,0);P.weapon=staff;P.robed=true;return {P,h:38,eyes:null};},
  ally_dps(g,m){const P=biped(g,{hip:17,stance:4,leg:1.8,legM:m.leather,torso:13,torsoG:new THREE.BoxGeometry(9,13,5),torsoM:m.leather,shoulder:7,arm:1.5,armLen:13,armM:m.leather,headR:6});
    foePart(P.head,new THREE.SphereGeometry(5.5,9,8),m.skin,0,0,0);foePart(P.head,new THREE.ConeGeometry(6.4,9,8),m.leather,0,4,-1.5);foePart(P.body,new THREE.BoxGeometry(11,2,6),m.rust,0,2,0);
    for(const a of [P.armL,P.armR]){const k=foePart(a,new THREE.ConeGeometry(1.3,11,4).rotateX(PI/2),m.rust,0,-13,6);if(a===P.armL)P.weapon=k;}return {P,h:41,eyes:null};},
  ally_support(g,m){const P=biped(g,{hip:17,stance:4.5,leg:2,legM:m.violet,torso:13,torsoG:new THREE.BoxGeometry(11,13,6),torsoM:m.violet,shoulder:7.5,arm:1.6,armLen:13,armM:m.violet,headR:6});
    foePart(P.head,new THREE.SphereGeometry(5.5,9,8),m.skin,0,0,0);foePart(P.head,new THREE.CylinderGeometry(6,6.5,4,10),m.violet,0,4,0);
    P.drum=foePart(P.body,new THREE.CylinderGeometry(6,6,8,12).rotateX(PI/2),m.wood,0,5,7);foePart(P.drum,new THREE.CylinderGeometry(6.1,6.1,1,12).rotateX(PI/2),m.white,0,0,4);
    P.weapon=foePart(P.armR,new THREE.CylinderGeometry(.8,.8,12,5),m.wood,0,-13,4);return {P,h:41,eyes:null};}
};
// which builder a type uses: the party's own, the theme's own for that foe, or a stock figure (content.foes[type].figure)
function figureFor(type){const d=ENEMY[type]||{};return ALLY_BUILD[type]||(THEME.figures&&THEME.figures[type])||FIGURES[d.figure||type]||FIGURES.skeleton;}
export function foeRig(type){const m=Object.assign({},foeMats());for(const k in m)if(k.startsWith('eye'))m[k]=m[k].clone();
  {const tint=(ENEMY[type]||{}).tint;for(const k in tint||{})if(m[k]){m[k]=m[k].clone();m[k].color.copy(/^(eye|staff|lamp)/.test(k)?hdr(tint[k],2.2):lin(tint[k]));}}const pool=FOE3.pool||(FOE3.pool={}),free=pool[type]||(pool[type]=[]);if(free.length){const r=free.pop();r.g.visible=true;r.g.rotation.set(0,0,0);FOE3.rigs.push(r);return r;}
  const g=new THREE.Group(),b=figureFor(type)(g,m),rig=Object.assign({type,g,walk:0,strikeT:0,prevWind:0,dieT:0,yaw:0,px:0,pz:0,e:null},b);if(rig.eyes)rig.eye0=rig.eyes.color.clone();R3.scene.add(g);(FOE3.rigs||(FOE3.rigs=[])).push(rig);return rig;}
export function foeRelease(rig){rig.g.visible=false;rig.e=null;rig.dieT=0;FOE3.pool[rig.type].push(rig);FOE3.rigs.splice(FOE3.rigs.indexOf(rig),1);}
export function poseFoe(rig,e,dt){const P=rig.P,g=rig.g,t=e.t,d=e.def,spawnK=e.spawn>0?clamp(1-e.spawn/.7,0,1):1;
  // where it stands and which way it faces
  const wx=e.x-320,wz=e.y,gy=elev(e.y);let yaw=rig.yaw;
  const fb=focusBall(),dx=fb&&fb.tier===e.tier?fb.x-e.x:0,dz=fb&&fb.tier===e.tier?fb.y-e.y:0,watch=fb&&fb.tier===e.tier&&Math.hypot(dx,dz)<420&&e.state!=='walk'&&e.state!=='hop';
  const mvx=wx-rig.px,mvz=wz-rig.pz,mov=Math.hypot(mvx,mvz);
  if(watch)yaw=Math.atan2(dx,dz);else if(mov>.05)yaw=Math.atan2(mvx,mvz);
  let da=yaw-rig.yaw;da=Math.atan2(Math.sin(da),Math.cos(da));rig.yaw+=da*Math.min(1,dt*8);rig.px=wx;rig.pz=wz;
  g.position.set(wx,gy-rig.h*1.25*(1-spawnK)*(rig.ghost?0:1),wz);g.rotation.set(0,rig.yaw,0);g.scale.setScalar(1.25*(rig.ghost?spawnK:1)*(1+Math.max(0,e.flash)*.12));
  // limbs
  const moving=e.moving&&e.stun<=0,gait=moving?Math.min(1,mov/(dt*20+1e-6)):0;rig.walk+=dt*(moving?9:0);
  const sw=Math.sin(rig.walk)*.6*(moving?1:0),bob=moving?Math.abs(Math.cos(rig.walk))*1.6:Math.sin(t*3)*.7;
  P.hip.position.y=(P.hip.userData.y0===undefined?(P.hip.userData.y0=P.hip.position.y):P.hip.userData.y0)+bob;
  if(P.legL){P.legL.rotation.x=sw;P.legR.rotation.x=-sw;}
  if(P.legs)for(let i=0;i<4;i++)P.legs[i].rotation.x=Math.sin(rig.walk+(i%2?PI:0)+(i<2?0:.6))*.7*(moving?1:0);
  if(P.armL&&!rig.ghost)P.armL.rotation.x=-sw*.6;if(P.armR)P.armR.rotation.x=sw*.6;
  P.body.rotation.set(rig.hunch||0,0,0);P.head.rotation.set(0,0,0);g.rotation.z=0;g.rotation.x=0;
  // the wind-up and the swing
  if(e.wind>0&&d.wind){const f=1-e.wind/d.wind;if(P.armR)P.armR.rotation.x=-.5-2*f;P.body.rotation.x=(rig.hunch||0)-.3*f;if(rig.eyes)rig.eyes.color.set(hdr('#ff3040',2.2));}
  else if(rig.eyes&&rig.prevWind>0&&rig.eye0)rig.eyes.color.copy(rig.eye0);
  if(rig.prevWind>0&&e.wind<=0&&e.stun<=0)rig.strikeT=.35;rig.prevWind=e.wind;
  if(rig.strikeT>0){rig.strikeT-=dt;const k=1-rig.strikeT/.35;if(P.armR)P.armR.rotation.x=1.4*Math.sin(k*PI)-.2;P.body.rotation.x=(rig.hunch||0)+.35*Math.sin(k*PI);g.position.z+=Math.cos(rig.yaw)*12*Math.sin(k*PI);g.position.x+=Math.sin(rig.yaw)*12*Math.sin(k*PI);}
  if(e.stun>0){g.rotation.z=Math.sin(t*25)*.12;P.body.rotation.x=(rig.hunch||0)+.4;P.head.rotation.x=.5;}
  // jobs with a look of their own
  {const fp=(THEME.foePose&&THEME.foePose[e.type])||FIGURE_POSE[d.figure||e.type];if(fp)fp(rig,e,t,d,P);} // a figure's own flourishes
  if(rig.ghost){g.position.y+=8+Math.sin(t*2.2)*4;P.body.rotation.y=Math.sin(t*1.3)*.2;P.armL.rotation.x=-.9+Math.sin(t*2)*.25;P.armR.rotation.x=-.9-Math.sin(t*2)*.25;}
  zshift(g);}
export function frameFoes(dt){const rigs=FOE3.rigs||[];
  for(const e of G.enemies){if(e.dead)continue;let rig=e._rig;if(!rig||rig.e!==e||rig.type!==e.type){if(rig&&rig.e===e)foeRelease(rig);rig=e._rig=foeRig(e.type);rig.e=e;rig.px=e.x-320;rig.pz=e.y;rig.yaw=0;rig.prevWind=0;rig.strikeT=0;}rig.seen=true;poseFoe(rig,e,dt);}
  for(let i=rigs.length-1;i>=0;i--){const rig=rigs[i];if(rig.ally)continue;if(rig.seen){rig.seen=false;continue;}
    if(!rig.dieT){rig.dieT=1e-6;rig.e=null;}rig.dieT+=dt;const k=Math.min(1,rig.dieT/.7);const g=rig.g;g.rotation.x=-1.5*Math.min(1,k*1.6);g.position.y-=dt*(k>.5?60:0);
    if(k>=1)foeRelease(rig);}}
/* ---------- the party on its posts ---------- */
export function frameAllies(dt){const r=G.run,A=FOE3.allies||(FOE3.allies={}),seen={};const tier=G.focusTier;
  if(r&&r.party&&tier<NM&&G.mode!=='title')for(const c of r.party){const post=guardPosts(tier).find(p=>p.slot===c.slot);if(!post)continue;const d=COMPANIONS[c.id],type='ally_'+d.role;
    let rig=A[c.slot];if(!rig||rig.type!==type){if(rig)foeRelease(rig);rig=A[c.slot]=foeRig(type);rig.ally=true;rig.px=post.x-320;rig.pz=post.y;rig.yaw=PI;rig.walk=0;}
    rig.seen=true;seen[c.slot]=1;const t=G.t,P=rig.P,g=rig.g,wounded=c.hp<=0,fb=focusBall();
    // stand on the post facing up the table; turn toward the ball when it is near
    let yaw=PI;if(fb&&fb.tier===tier&&Math.hypot(fb.x-post.x,fb.y-post.y)<300)yaw=Math.atan2(fb.x-post.x,fb.y-post.y);let da=yaw-rig.yaw;da=Math.atan2(Math.sin(da),Math.cos(da));rig.yaw+=da*Math.min(1,dt*6);
    g.position.set(post.x-320,elev(post.y),post.y);g.rotation.set(0,rig.yaw,0);g.scale.setScalar(1.25*(1+Math.max(0,c.flash||0)*.15));
    const bob=Math.sin(t*2.5+post.x)*0.8;P.hip.position.y=(P.hip.userData.y0===undefined?(P.hip.userData.y0=P.hip.position.y):P.hip.userData.y0)+bob;
    if(P.legL){P.legL.rotation.x=0;P.legR.rotation.x=0;}if(P.armL&&!rig.robed)P.armL.rotation.x=-.2;if(P.armR)P.armR.rotation.x=.2;P.body.rotation.set(0,0,0);P.head.rotation.set(0,0,0);
    if(wounded){P.body.rotation.x=.9;P.head.rotation.x=.4;g.position.y-=rig.h*.35;if(P.legL){P.legL.rotation.x=-1.2;P.legR.rotation.x=.3;}}
    else if(c.flash>0){P.body.rotation.x=-.25*c.flash;if(P.shield)P.armL.rotation.x=-1.2;}
    if(P.shield&&!wounded)P.armL.rotation.x=-.9;if(P.tip)P.tip.material.color.set(hdr('#ffe0a0',wounded?.3:1.6+.6*Math.sin(t*3)));if(P.drum&&!wounded)P.armR.rotation.x=.6+Math.sin(t*9)*.5;}
  for(const sl in A){if(!seen[sl]){foeRelease(A[sl]);delete A[sl];}else A[sl].seen=false;}}
