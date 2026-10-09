/* ================= THE BOSS CIRCLE ================= */
import {G} from '../core/state.js';
import {PI,TAU,mkCanvas} from '../core/util.js';
import {R3,ctex} from './core.js';
import {elev} from './world.js';
import {wakeInfo} from '../rules/bosses.js';
import {CX,NM,TY} from '../table/layout.js';

/* ---------- THE CIRCLE: twelve runes round each level's summoning circle ----------
   Dormant: the runes light one by one as the main quest closes in on that level's boss, pulsing faster as it fills.
   Rising and awake: the whole ring burns red. Slain: the ring turns gold and stays lit. */
export function runeTex(k){const cv=mkCanvas(64,64),c=cv.getContext('2d');c.translate(32,32);
  // a disc of glass with the rune cut through it: the glass takes the state colour dimly, the rune burns bright
  const g=c.createRadialGradient(0,-6,4,0,0,31);g.addColorStop(0,'rgba(170,170,170,1)');g.addColorStop(1,'rgba(95,95,95,1)');c.fillStyle=g;c.beginPath();c.arc(0,0,31,0,TAU);c.fill();
  c.strokeStyle='#fff';c.lineWidth=6;c.lineCap='round';c.lineJoin='round';
  const G2=[[[-10,-14],[10,14]],[[-12,0],[12,0]],[[0,-15],[0,15]],[[-10,14],[0,-14],[10,14]],[[-10,-12],[10,-12],[-10,12],[10,12]],[[0,-15],[12,0],[0,15],[-12,0],[0,-15]]][k%6];
  c.beginPath();G2.forEach((p,i)=>i?c.lineTo(p[0],p[1]):c.moveTo(p[0],p[1]));c.stroke();if(k>5){c.beginPath();c.arc(0,0,5,0,TAU);c.stroke();}
  if(k%2){c.beginPath();c.moveTo(-14,-14);c.lineTo(-8,-8);c.stroke();}return ctex(cv);}
/* ---------- THE CIRCLE: twelve rune inserts set into each level's summoning circle ----------
   They sit in sockets painted into the floor and light like the other inserts: dark glass when off.
   Dormant: violet, one by one as the main quest closes in, the next one blinking. Rising: all red, strobing.
   Awake: red, steady pulse. Slain: gold. */
export function buildRunes(){const sc=R3.scene,D=R3.dyn,tex=[];for(let k=0;k<12;k++)tex.push(runeTex(k));D.runes=[];
  const ringG=new THREE.RingGeometry(92,100,96).rotateX(-PI/2);
  for(let t=0;t<NM;t++){const cx=CX[t],cy=TY[t]+650,ring=[];
    for(let k=0;k<12;k++){const a=-PI/2+k*TAU/12,x=cx+Math.cos(a)*96,y=cy+Math.sin(a)*96;
      const mat=new THREE.MeshBasicMaterial({map:tex[k],transparent:true,alphaTest:.05,depthWrite:false,color:0x060608,polygonOffset:true,polygonOffsetFactor:-3,polygonOffsetUnits:-3});
      const m=new THREE.Mesh(new THREE.CircleGeometry(10,24).rotateX(-PI/2),mat);
      m.geometry.attributes.uv.array.forEach((v,i,arr)=>{});m.position.set(x-320,elev(y)+.42,y);m.rotation.y=-a-PI/2;m.renderOrder=2;sc.add(m);ring.push(mat);}
    const glow=new THREE.Mesh(ringG,new THREE.MeshBasicMaterial({transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,color:0x000000,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2}));
    glow.position.set(cx-320,elev(cy)+.38,cy);glow.renderOrder=2;sc.add(glow);D.runes.push({tier:t,ring,glow:glow.material});}}
export function frameRunes(t){const D=R3.dyn,tc=R3.tmpC,bo=G.boss;if(!D.runes)return;
  for(const o of D.runes){const wk=G.run?wakeInfo(o.tier):null,alive=bo&&bo.alive&&bo.tier===o.tier,rising=alive&&bo.rise>0;
    let lit=0,col='#c39bff',pulse=1,glow=0,next=-1;
    if(alive){lit=12;col='#ff3a4a';pulse=rising?(t*14|0)%2?1.25:.35:.8+.2*Math.sin(t*4);glow=rising?.5+.5*Math.sin(t*22):.22+.08*Math.sin(t*4);}
    else if(wk&&wk.state==='dead'){lit=12;col='#ffd24a';glow=.1;}
    else if(wk){lit=Math.floor(wk.fill*12+1e-6);next=lit<12?lit:-1;pulse=.85+.15*Math.sin(t*(2+wk.fill*8));glow=wk.fill>=1?.25:0;}
    tc.set(col).convertSRGBToLinear();
    o.ring.forEach((m,k)=>{let b=0;if(k<lit)b=1.9*pulse;else if(k===next)b=(t*3|0)%2?.9:.15;
      if(b<=0)m.color.setRGB(.035,.035,.045);else m.color.setRGB(tc.r*b,tc.g*b,tc.b*b);});
    o.glow.color.setRGB(tc.r*glow,tc.g*glow,tc.b*glow);}}
