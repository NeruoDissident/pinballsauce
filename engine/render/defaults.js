/* ================= DEFAULT LOOKS =================
   What the engine draws when a table's theme does not say: a plain pop bumper, a plain statue, a plain boss
   billboard, a plain Grave floor. A new table can run with none of its own art and add it piece by piece.
   Each has the same shape as the theme hook it stands in for (theme.bumper, theme.statue, theme.sprites.bosses,
   theme.paintGrave). */
import {PI,TAU} from '../core/util.js';
import {T} from '../core/state.js';
import {GY,HW,W} from '../table/layout.js';
import {PAL} from '../table/content.js';
import {M,R3,SM,hdr} from './core.js';
import {elev} from './world.js';
import {path} from './draw2d.js';

// a pop bumper: a post, a skirt and a lit cap. Returns what frame.js animates: the lit materials, the ring, the ward.
export function defaultBumper(b){const g=new THREE.Group(),p=PAL[b.tier],col=b.bell?'#ffd070':p.glow,r=b.r,o={b,g,mats:[],bell:null,flame:null,t:0};
  const lit=(base,k)=>{const m=SM(Object.assign({emissive:hdr(col),emissiveIntensity:k,roughness:.45,metalness:.3,envMapIntensity:1},base));o.mats.push({m,k});return m;};
  const mesh=(geo,mat,y)=>{const m=new THREE.Mesh(geo,mat);m.position.y=y||0;m.castShadow=true;m.receiveShadow=true;g.add(m);return m;};
  const ringM=new THREE.MeshBasicMaterial({color:hdr(col,.5)});o.ring=ringM;mesh(new THREE.TorusGeometry(r-1.6,1.7,6,28).rotateX(PI/2),ringM,3).castShadow=false;
  mesh(new THREE.CylinderGeometry(r*.93,r*.97,6,24),M.iron,3);mesh(new THREE.CylinderGeometry(r*.5,r*.62,22,20),M.steel,17);
  mesh(new THREE.CylinderGeometry(r*.96,r*.7,7,24),lit({color:p.acc},.5),31);mesh(new THREE.CylinderGeometry(r*.6,r*.96,4,24),lit({color:'#f4f4f8'},.25),36.5);
  {const w=new THREE.Group(),tm=new THREE.MeshBasicMaterial({color:hdr('#9fe8ff',1.8)}),tr=new THREE.Mesh(new THREE.TorusGeometry(r+5,1.6,6,32).rotateX(PI/2),tm);tr.position.y=10;
    const ws=new THREE.Sprite(new THREE.SpriteMaterial({map:R3.glowTex,color:hdr('#62d8ff',1.5),transparent:true,opacity:.6,blending:THREE.AdditiveBlending,depthWrite:false}));ws.position.y=26;ws.scale.set(r*5,r*5,1);w.add(tr,ws);w.visible=false;g.add(w);o.ward=w;o.wardS=ws;o.wardT=tr;}
  g.position.set(b.x-320,elev(b.y),b.y);R3.scene.add(g);return o;}
// a statue: an obelisk on a plinth
export function defaultStatue(s){const g=new THREE.Group(),col=PAL[s.tier].acc2,o={s,g,mats:[]};
  const lit=(base,k)=>{const m=SM(Object.assign({emissive:hdr(col),emissiveIntensity:k,roughness:.6,metalness:.2,envMapIntensity:.8},base));o.mats.push({m,k});return m;};
  const mesh=(geo,mat,y)=>{const m=new THREE.Mesh(geo,mat);m.position.y=y||0;m.castShadow=true;m.receiveShadow=true;g.add(m);return m;};
  mesh(new THREE.CylinderGeometry(s.r-1,s.r,6,20),M.iron,3);mesh(new THREE.CylinderGeometry(6,12,58,4),lit({color:PAL[s.tier].stone},.12),35).rotation.y=PI/4;
  g.position.set(s.x-320,elev(s.y),s.y);R3.scene.add(g);return o;}
// a boss billboard: a hooded shape with two eyes, in the boss's own colour. Drawn in a 160-unit square centred on 0,0.
export function defaultBossSprite(color){return c=>{c.fillStyle='#0b0b12';c.beginPath();c.moveTo(0,-48);c.quadraticCurveTo(42,-26,36,36);c.lineTo(-36,36);c.quadraticCurveTo(-42,-26,0,-48);c.fill();c.strokeStyle=color;c.lineWidth=2;c.stroke();
    c.fillStyle=color;for(const sx of [-1,1]){c.beginPath();c.ellipse(sx*11,-6,6,3.5,sx*.3,0,TAU);c.fill();}c.globalAlpha=.5;c.beginPath();c.arc(0,16,5,0,TAU);c.fill();c.globalAlpha=1;};}
// the Grave's floor: the coffin shape filled in the Grave's own palette
export function defaultPaintGrave(c){const p=PAL[PAL.length>3?T.flips.find(f=>f.y>GY).tier:0],shape=T.coffin.concat([[420,GY+663],[366,HW+70],[274,HW+70],[220,GY+663]]);
  c.save();path(c,shape,1);c.clip();const g=c.createLinearGradient(0,GY,0,GY+700);g.addColorStop(0,p.a);g.addColorStop(1,p.b);c.fillStyle=g;c.fillRect(0,GY-10,W,900);
  const q=c.createRadialGradient(320,GY+150,10,320,GY+150,340);q.addColorStop(0,p.glow+'44');q.addColorStop(1,p.glow+'00');c.fillStyle=q;c.fillRect(0,GY,W,560);c.restore();
  path(c,T.coffin);c.strokeStyle='#030307';c.lineWidth=7;c.stroke();c.strokeStyle=p.glow+'66';c.lineWidth=1.6;c.stroke();}
