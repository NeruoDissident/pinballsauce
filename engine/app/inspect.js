/* ================= INSPECT MODE =================
   A way to look at a table the way its layout file describes it, and to point at things in it.
   Top-down (or tilted) camera you can pan and zoom, a coordinate grid in the same numbers the layout file uses,
   the true collision geometry drawn over the art, a label on every piece saying what it is and where it lives in
   layout.js, and a button that saves what you see as a PNG. Press I, or use the Inspect button on the title and
   pause menus, or open the table with ?inspect in the address.

   Nothing here changes the table or the game: the simulation is frozen while it is open. */
import {$,clamp,mkCanvas} from '../core/util.js';
import {G,T} from '../core/state.js';
import {TY,FY,CX,NM,GT,WT0,NW,NT,H,GY,HW,WLEN,TIER_NAME,tierOf} from '../table/layout.js';
import {DEF} from '../table/content.js';
import {R3} from '../render/core.js';
import {E,ZX,ZZ,elev} from '../render/world.js';
import {project3D,pxPerUnit} from '../render/camera.js';
import {frame3D} from '../render/frame.js';
import {UI} from '../ui/ui.js';
import {drawOverlay} from './shell.js';

export const INS={on:false,tier:0,x:320,y:0,span:1100,tilt:false,cur:null,was:null,
  layers:{grid:true,ids:true,walls:true,collision:true,inserts:false,spots:false}};
const LAYERS=[['grid','Grid'],['ids','Labels'],['collision','Collision'],['walls','Wall IDs'],['inserts','Inserts'],['spots','Spawn points']];
const COL={wall:'#cfd8e0',gate:'#62d8ff',sling:'#ffb050',target:'#ffd24a',drop:'#7dffb0',seal:'#c9a6ff'};
// the band of table y a tier covers, and its name in the layout file
const tierTop=t=>TY[t],tierBot=t=>t<NM?(t<NM-1?TY[t+1]:H+60):t===GT?HW+60:TY[t]+WLEN+60;
const tierId=t=>t<NM?DEF.layout.fields[t].id:t===GT?'grave':DEF.layout.wings[t-WT0].key;
const local=(x,y)=>{const t=tierOf(y);return {t,x:Math.round(x),y:Math.round(y-TY[t])};};

function css(){if($('insCss'))return;const st=document.createElement('style');st.id='insCss';st.textContent=`
#insBar{position:absolute;left:0;right:0;top:0;z-index:60;display:flex;flex-wrap:wrap;gap:6px;align-items:center;padding:8px calc(8px + env(safe-area-inset-right)) 8px calc(8px + env(safe-area-inset-left));background:rgba(6,6,10,.88);border-bottom:1px solid #3a3650;font:600 13px/1 system-ui,sans-serif;color:#ece4cf}
#insBar button,#insBar select,#insBar summary{font:inherit;color:inherit;background:#201d2d;border:1px solid #3a3650;border-radius:4px;padding:0 10px;height:34px;box-sizing:border-box;cursor:pointer;white-space:nowrap;text-transform:none;letter-spacing:0;width:auto;margin:0}
#insBar summary{list-style:none;display:inline-flex;align-items:center}#insBar summary::-webkit-details-marker{display:none}
#insBar button.on{background:#d9a441;color:#14131c;border-color:#d9a441}
#insBar button:focus-visible,#insBar select:focus-visible,#insBar summary:focus-visible{outline:2px solid #62d8ff;outline-offset:1px}
#insBar details{position:relative}
#insBar details>div{position:absolute;top:calc(100% + 6px);left:0;z-index:2;display:grid;gap:2px;padding:8px;background:#14131c;border:1px solid #3a3650;border-radius:4px;min-width:170px}
#insBar details label{display:flex;gap:8px;align-items:center;padding:7px 6px;cursor:pointer;white-space:nowrap}
#insBar input{margin:0;width:16px;height:16px}
#insBar .gap{flex:1 1 0}
#insRead{position:absolute;left:8px;bottom:calc(8px + env(safe-area-inset-bottom));z-index:60;background:rgba(6,6,10,.88);border:1px solid #3a3650;border-radius:4px;padding:7px 9px;font:600 12px/1.4 ui-monospace,Menlo,monospace;color:#ece4cf;max-width:calc(100% - 16px);pointer-events:none;white-space:pre-wrap}
#insPad{position:absolute;inset:0;z-index:55;touch-action:none;cursor:grab}
#app.inspecting #hud,#app.inspecting #touch,#app.inspecting #pauseBtn,#app.inspecting #gfx,#app.inspecting #banner,#app.inspecting #bonus{display:none!important}`;document.head.appendChild(st);}

function build(){css();const stage=$('stage');
  const pad=document.createElement('div');pad.id='insPad';stage.appendChild(pad);
  const bar=document.createElement('div');bar.id='insBar';bar.setAttribute('role','toolbar');bar.setAttribute('aria-label','Inspect mode');stage.appendChild(bar);
  const read=document.createElement('div');read.id='insRead';stage.appendChild(read);
  const btn=(label,fn,id,aria)=>{const b=document.createElement('button');b.type='button';b.textContent=label;if(id)b.dataset.k=id;if(aria)b.setAttribute('aria-label',aria);b.addEventListener('click',e=>{fn();sync();e.currentTarget.blur();});bar.appendChild(b);return b;};
  // which field or room
  const sel=document.createElement('select');sel.id='insTier';sel.setAttribute('aria-label','Field or room');for(let t=0;t<NT;t++){const o=document.createElement('option');o.value=t;o.textContent=(t+1)+'  '+TIER_NAME[t];sel.appendChild(o);}
  sel.addEventListener('change',()=>{goTier(+sel.value);sync();sel.blur();});bar.appendChild(sel);
  btn('Top-down',()=>{INS.tilt=!INS.tilt;},'view');btn('+',()=>zoom(1/1.3),null,'Zoom in');btn('−',()=>zoom(1.3),null,'Zoom out');
  const det=document.createElement('details'),sum=document.createElement('summary'),box=document.createElement('div');sum.textContent='Layers';det.appendChild(sum);det.appendChild(box);bar.appendChild(det);
  for(const [k,name] of LAYERS){const l=document.createElement('label'),c=document.createElement('input');c.type='checkbox';c.checked=INS.layers[k];c.addEventListener('change',()=>{INS.layers[k]=c.checked;});l.appendChild(c);l.appendChild(document.createTextNode(name));box.appendChild(l);}
  const gap=document.createElement('span');gap.className='gap';bar.appendChild(gap);
  btn('Save screenshot',shoot);btn('Close',closeInspect);
  // drag to pan, wheel or pinch to zoom
  const pts=new Map();let pinch=0;
  pad.addEventListener('pointerdown',e=>{det.open=false;pad.setPointerCapture(e.pointerId);pts.set(e.pointerId,[e.clientX,e.clientY]);pad.style.cursor='grabbing';if(pts.size===2){const v=[...pts.values()];pinch=Math.hypot(v[0][0]-v[1][0],v[0][1]-v[1][1]);}});
  pad.addEventListener('pointermove',e=>{const r=pad.getBoundingClientRect();INS.cur=[e.clientX-r.left,e.clientY-r.top];const p=pts.get(e.pointerId);if(!p)return;
    if(pts.size===1){const u=unitPx();INS.x-=(e.clientX-p[0])/u;INS.y-=(e.clientY-p[1])/(u*(INS.tilt?.77:1));bound();sync();}
    pts.set(e.pointerId,[e.clientX,e.clientY]);
    if(pts.size===2){const v=[...pts.values()],d=Math.hypot(v[0][0]-v[1][0],v[0][1]-v[1][1]);if(pinch>0&&d>0)zoom(pinch/d);pinch=d;}});
  const up=e=>{pts.delete(e.pointerId);pinch=0;if(!pts.size)pad.style.cursor='grab';};pad.addEventListener('pointerup',up);pad.addEventListener('pointercancel',up);
  pad.addEventListener('wheel',e=>{e.preventDefault();zoom(Math.pow(1.0015,e.deltaY));},{passive:false});}
function sync(){const bar=$('insBar');if(!bar)return;const v=bar.querySelector('button[data-k=view]');v.textContent=INS.tilt?'Tilted':'Top-down';v.setAttribute('aria-label','View: '+v.textContent+'. Press to switch');const sel=$('insTier');if(+sel.value!==INS.tier)sel.value=INS.tier;}
const unitPx=()=>R3.h/INS.span; // screen pixels per table unit at the centre of the view
function bound(){INS.x=clamp(INS.x,-200,840);INS.y=clamp(INS.y,TY[0]-200,TY[NT-1]+WLEN+300);INS.tier=tierOf(INS.y);}
function zoom(k){INS.span=clamp(INS.span*k,120,2600);}
function goTier(t){const top=tierTop(t)-20,bot=t<NM?FY[t]+150:tierBot(t),bar=barH()+10,free=Math.max(120,R3.h-bar-56); // the tier, fitted between the toolbar and the readout
  INS.tier=t;INS.x=CX[t];INS.span=Math.max((bot-top)*R3.h/free,700*R3.h/Math.max(120,R3.w));INS.y=(top+bot)/2-(bar-56)/2*INS.span/R3.h;}
const barH=()=>{const b=$('insBar');return b&&!b.hidden?b.offsetHeight:0;};

export function openInspect(){if(INS.on||!R3.ready)return;INS.on=true;INS.was={menu:UI.cur,paused:G.paused,fog:R3.scene.fog.density,far:R3.camera.far};
  if(!$('insBar'))build();for(const id of ['insBar','insPad','insRead'])$(id).hidden=false;$('app').classList.add('inspecting');
  UI.menu(null);R3.freeze=true;R3.scene.fog.density=0;R3.camera.far=60000;R3.camera.updateProjectionMatrix();
  const b=G.balls.find(q=>q.st==='live'||q.st==='held');goTier(b&&G.mode==='play'&&!G.demo?b.tier:G.focusTier);sync();}
export function closeInspect(){if(!INS.on)return;INS.on=false;for(const id of ['insBar','insPad','insRead'])$(id).hidden=true;$('app').classList.remove('inspecting');
  R3.freeze=false;R3.dbg=null;R3.scene.fog.density=INS.was.fog;R3.camera.far=INS.was.far;R3.camera.updateProjectionMatrix();
  if(INS.was.menu)UI.menu(INS.was.menu);}
// keys while it is open; returns true when the key was used
export function inspectKey(e){const typing=e.target&&e.target.tagName==='INPUT'&&e.target.type==='text';if(typing)return false;
  if(e.code==='KeyI'&&!e.repeat&&!G.choice&&UI.cur!=='over'&&UI.cur!=='class'&&UI.cur!=='party'){if(INS.on)closeInspect();else openInspect();e.preventDefault();return true;}
  if(!INS.on)return false;const step=INS.span*.08;
  if(e.code==='Escape')closeInspect();else if(e.code==='ArrowLeft')INS.x-=step;else if(e.code==='ArrowRight')INS.x+=step;else if(e.code==='ArrowUp')INS.y-=step;else if(e.code==='ArrowDown')INS.y+=step;
  else if(e.code==='Equal'||e.code==='NumpadAdd')zoom(1/1.25);else if(e.code==='Minus'||e.code==='NumpadSubtract')zoom(1.25);else if(e.code==='KeyT')INS.tilt=!INS.tilt;
  else if(e.code==='KeyS'&&!e.repeat)shoot();else if(/^Digit[1-9]$/.test(e.code)&&+e.code[5]<=NT)goTier(+e.code[5]-1);
  bound();sync();e.preventDefault();return true;}

// the camera: called every frame before the scene is drawn
export function inspectCam(){if(!INS.on)return;INS.tier=tierOf(INS.y);const tx=INS.x-320+ZX(INS.y),tz=INS.y+ZZ(INS.y),ty=INS.tier<NM?elev(clamp(INS.y,tierTop(INS.tier),FY[INS.tier])):E[INS.tier],fov=20,D=INS.span/2/Math.tan(fov*Math.PI/360);
  const a=(INS.tilt?50:88.9)*Math.PI/180;R3.dbg={fov,p:[tx,ty+D*Math.sin(a),tz+D*Math.cos(a)],t:[tx,ty,tz]};}

const _a={x:0,y:0,ok:false},_b={x:0,y:0,ok:false};
// what the pointer is over, in table coordinates: a ray from the camera to the floor of the tier in view
function under(px,py){const v=new THREE.Vector3(px/R3.w*2-1,-(py/R3.h*2-1),.5).unproject(R3.camera),o=R3.camera.position,d=v.sub(o),y0=E[INS.tier]!==undefined&&INS.tier>=NM?E[INS.tier]:elev(INS.y);
  if(Math.abs(d.y)<1e-6)return null;const k=(y0-o.y)/d.y,wx=o.x+d.x*k,wz=o.z+d.z*k;return {x:wx+320-ZX(INS.y),y:wz-ZZ(INS.y)};}

// drawn on the flat overlay, after the game's own overlay
export function drawInspect(){if(!INS.on)return;const cv=$('fx'),c=cv.getContext('2d'),s=UI.fxS||1,L=INS.layers,t=INS.tier,y0=tierTop(t),y1=tierBot(t);
  c.setTransform(s,0,0,s,0,0);c.lineCap='round';c.lineJoin='round';c.textBaseline='middle';
  const line=(x1,ya,x2,yb,h)=>{project3D(x1,ya,h||1,_a);project3D(x2,yb,h||1,_b);if(!_a.ok||!_b.ok)return false;c.beginPath();c.moveTo(_a.x,_a.y);c.lineTo(_b.x,_b.y);c.stroke();return true;};
  const ring=(x,y,r)=>{project3D(x,y,1,_a);if(!_a.ok)return;const u=pxPerUnit(x,y,1);c.beginPath();c.ellipse(_a.x,_a.y,r*u,r*u*(INS.tilt?.77:1),0,0,Math.PI*2);c.stroke();};
  // labels are placed in the order they are asked for; one that would cover another slides down, or is left out until you zoom in
  const placed=[],top=barH()+4,hit=(X,Y,w)=>placed.some(q=>X<q[0]+q[2]+2&&X+w+2>q[0]&&Y<q[1]+17&&Y+17>q[1]);
  const tag=(x,y,text,col,dy)=>{project3D(x,y,2,_a);if(!_a.ok||_a.x<-60||_a.x>R3.w+60||_a.y<top||_a.y>R3.h+20)return;c.font='600 11px ui-monospace,Menlo,monospace';const w=c.measureText(text).width+8,X=_a.x-w/2;let Y=_a.y+(dy||0)-8,k=0;
    while(hit(X,Y,w)&&k<3){Y+=17;k++;}if(hit(X,Y,w))return;placed.push([X,Y,w]);
    c.strokeStyle=col;c.lineWidth=1;c.globalAlpha=.7;c.beginPath();c.moveTo(_a.x,_a.y);c.lineTo(_a.x,Y+8);c.stroke();c.globalAlpha=1;
    c.fillStyle='rgba(6,6,10,.86)';c.fillRect(X,Y,w,16);c.strokeRect(X+.5,Y+.5,w-1,15);c.fillStyle=col;c.textAlign='center';c.fillText(text,_a.x,Y+8.5);};
  const here=q=>q.tier===t||(q.y!==undefined&&q.tier===undefined&&tierOf(q.y)===t),xy=(x,y)=>'('+Math.round(x)+','+Math.round(y-TY[tierOf(y)])+')';
  // the grid: every 100 units, numbered the way layout.js counts (x across, y down from the top of this field or room)
  if(L.grid){const fine=unitPx()>.9;c.lineWidth=1;
    for(let x=0;x<=640;x+=fine?20:100){const major=x%100===0;c.strokeStyle=major?'rgba(98,216,255,.42)':'rgba(98,216,255,.13)';for(let y=y0;y<y1;y+=80)line(x,y,x,Math.min(y1,y+80));}
    for(let y=y0;y<=y1;y+=fine?20:100){const major=(y-y0)%100===0;c.strokeStyle=major?'rgba(98,216,255,.42)':'rgba(98,216,255,.13)';line(0,y,640,y);}
    c.font='600 10px ui-monospace,Menlo,monospace';c.fillStyle='#9fe8ff';
    for(let x=0;x<=640;x+=100){project3D(x,y1,1,_a);if(_a.ok){c.textAlign='center';c.fillText('x'+x,_a.x,Math.min(R3.h-48,_a.y+12));}}
    for(let y=y0;y<=y1;y+=100){project3D(0,y,1,_a);if(_a.ok){c.textAlign='right';c.fillText('y'+(y-y0),Math.max(34,_a.x-6),_a.y);}}}
  // the collision geometry the ball really meets
  if(L.collision){c.lineWidth=1.6;for(const g of T.segs){if(Math.max(g.y1,g.y2)<y0-40||Math.min(g.y1,g.y2)>y1+40)continue;c.strokeStyle=COL[g.kind]||COL.wall;c.globalAlpha=g.on?1:.35;c.setLineDash(g.kind==='gate'?[4,4]:[]);line(g.x1,g.y1,g.x2,g.y2,2);}
    c.setLineDash([]);c.globalAlpha=1;c.strokeStyle='#ff8a6a';for(const b of T.bumps)if(b.tier===t)ring(b.x,b.y,b.r);
    c.strokeStyle='#ffe9b0';for(const id in T.holes)if(T.holes[id].tier===t)ring(T.holes[id].x,T.holes[id].y,T.holes[id].r);
    c.strokeStyle='rgba(183,156,255,.9)';for(const q of T.sens)if(q.tier===t)ring(q.x,q.y,q.r);
    c.strokeStyle='#62d8ff';c.lineWidth=2;for(const id in T.rails){const r=T.rails[id];for(let i=0;i<r.n-4;i+=4){if(r.y[i]<y0-60||r.y[i]>y1+60)continue;line(r.x[i],r.y[i],r.x[i+4],r.y[i+4],2);}}
    c.strokeStyle='#fff';c.lineWidth=2.5;for(const f of T.flips)if(f.tier===t)line(f.x,f.y,f.x+f.dir*f.L*Math.cos(f.a),f.y+f.L*Math.sin(f.a),3);}
  if(L.ids){
    for(const id in T.holes){const h=T.holes[id];if(h.tier===t)tag(h.x,h.y,'scoop '+id+' '+xy(h.x,h.y),'#ffe9b0',16);}
    for(const id in T.banks){const B=T.banks[id];if(B.tier!==t)continue;const a=B.segs[0],z=B.segs[B.segs.length-1];tag((a.x1+z.x2)/2,(a.y1+z.y2)/2,'bank '+id+' ('+B.kind+' ×'+B.segs.length+')',B.kind==='drop'?'#7dffb0':'#ffd24a',-14);}
    for(const q of T.sens)if(q.tier===t&&q.kind==='spin')tag(q.x,q.y,'spinner '+q.id+' '+xy(q.x,q.y),'#b79cff',16);
    for(const m of T.mouths)if(tierOf(m.y)===t)tag(m.x,m.y,'ramp '+m.rail,'#62d8ff',16);
    for(const b of T.bumps)if(b.tier===t)tag(b.x,b.y,'bumper '+b.group+' '+xy(b.x,b.y),'#ff8a6a',-b.r*unitPx()-10);
    for(const id in T.sets)if(T.sets[id].tier===t){const l=T.sets[id].lanes,m=l[l.length>>1];tag(m.x,m.y,'lanes '+id+' ×'+l.length,'#b79cff',16);}
    for(const q of T.sens){if(q.tier!==t)continue;if(q.kind==='kick')tag(q.x,q.y,'kickback '+xy(q.x,q.y),'#62d8ff',16);else if(q.kind==='orbit')tag(q.x,q.y,'orbit'+(q.side<0?'L':'R')+t,'#b79cff');}
    for(const b of T.blocks)if(b.name&&b.tier===t){const cx=b.pts.reduce((a,p)=>a+p[0],0)/b.pts.length,cy=b.pts.reduce((a,p)=>a+p[1],0)/b.pts.length;tag(cx,cy,'block '+b.name,'#a39cb2');}}
  if(L.spots){c.fillStyle='rgba(125,255,176,.9)';for(const p of T.spawn[t]||[]){project3D(p[0],p[1],2,_a);if(_a.ok){c.beginPath();c.arc(_a.x,_a.y,3.5,0,Math.PI*2);c.fill();}}
    if(T.bossSpot[t])tag(T.bossSpot[t].x,T.bossSpot[t].y,'boss '+xy(T.bossSpot[t].x,T.bossSpot[t].y),'#ff6070');for(const st of G.statues)if(st.tier===t)tag(st.x,st.y,'statue '+st.id+' '+xy(st.x,st.y),'#cfeef2');
    for(const p of T.spawn[t]||[])tag(p[0],p[1],'spawn '+xy(p[0],p[1]),'#7dffb0',14);}
  if(L.inserts)for(const id in T.shots){const q=T.shots[id];if(q.tier===t&&q.id===id)tag(q.x,q.y,'shot '+id+' '+xy(q.x,q.y),'#e8a8ff',-14);}
  if(L.walls)for(const w of T.wallPaths){if(!w.src||w.style==='gate')continue;const p=w.pts[w.pts.length>>1],q=w.pts[(w.pts.length>>1)-1]||p,mx=(p[0]+q[0])/2,my=(p[1]+q[1])/2;if(tierOf(my)!==t||/ (frame|orbits|floor|room)$|^grave$/.test(w.src))continue;tag(mx,my,w.src.replace(/^.*\.pieces/,'pieces')+' wall','#cfd8e0');}
  // where the pointer is, in the layout file's numbers
  const R=$('insRead');let txt=DEF.id+' / '+tierId(t)+'   centre x '+Math.round(INS.x)+'  y '+Math.round(INS.y-TY[t])+'   view '+Math.round(INS.span)+' units'+(INS.tilt?'  tilted':'  top-down');
  if(INS.cur){const u=under(INS.cur[0],INS.cur[1]);if(u){const l=local(u.x,u.y);txt+='\npointer  x '+l.x+'  y '+l.y+'  in '+tierId(l.t)+'   (whole-table y '+Math.round(u.y)+')';}}
  if(R.textContent!==txt)R.textContent=txt;}

// one PNG of exactly what is on screen: the 3D view, the overlay, and a caption saying which table and where
export function shoot(){frame3D(0);drawOverlay();const gl=$('gl'),fx=$('fx'),k=gl.height/R3.h,cap=Math.round(40*k),cv=mkCanvas(gl.width,gl.height+cap),c=cv.getContext('2d');
  c.drawImage(gl,0,0);c.drawImage(fx,0,0,gl.width,gl.height);c.fillStyle='#07070b';c.fillRect(0,gl.height,cv.width,cap);
  c.fillStyle='#ece4cf';c.font='600 '+Math.round(11*k)+'px ui-monospace,Menlo,monospace';c.textBaseline='middle';
  c.fillText(DEF.id+' / '+tierId(INS.tier)+'   centre x '+Math.round(INS.x)+' y '+Math.round(INS.y-TY[INS.tier])+'   view '+Math.round(INS.span)+(INS.tilt?' tilted':' top-down'),8*k,gl.height+12*k);
  c.fillStyle='#9a9aa8';c.fillText('grid lines every 100; numbers as in tables/'+DEF.id+'/layout.js',8*k,gl.height+28*k);
  const name=DEF.id+'-'+tierId(INS.tier)+'-x'+Math.round(INS.x)+'-y'+Math.round(INS.y-TY[INS.tier])+'.png';
  cv.toBlob(b=>{if(!b)return;const url=URL.createObjectURL(b),a=document.createElement('a');a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();shown(url,name);},'image/png');return cv;}
// The picture just taken, shown over the table. Some viewers (an embedded page, some phone apps) refuse downloads without
// saying so; from here it can still be saved by pressing and holding it, or by a screenshot of the screen.
function shown(url,name){let p=$('insShot');if(p)p.remove();p=document.createElement('div');p.id='insShot';
  p.style.cssText='position:absolute;inset:0;z-index:70;display:grid;grid-template-rows:auto minmax(0,1fr) auto;gap:10px;justify-items:center;padding:calc(14px + env(safe-area-inset-top)) 16px calc(14px + env(safe-area-inset-bottom));background:rgba(4,4,8,.92);font:600 13px/1.4 system-ui,sans-serif;color:#ece4cf';
  const t=document.createElement('div');t.textContent=name;const im=document.createElement('img');im.src=url;im.alt='Screenshot of the table in inspect mode';im.style.cssText='max-width:100%;max-height:100%;min-height:0;object-fit:contain;border:1px solid #3a3650;-webkit-touch-callout:default;-webkit-user-select:auto;user-select:auto';
  const row=document.createElement('div');row.style.cssText='display:flex;flex-wrap:wrap;gap:10px;align-items:center;justify-content:center;text-align:center';
  const note=document.createElement('span');note.textContent='Saved to your downloads. If nothing was saved, press and hold the picture to save it.';note.style.cssText='color:#a39cb2;font-weight:400';
  const b=document.createElement('button');b.type='button';b.textContent='Done';b.style.cssText='font:inherit;color:inherit;background:#201d2d;border:1px solid #3a3650;border-radius:4px;padding:0 16px;height:36px;cursor:pointer;width:auto;margin:0;text-transform:none;letter-spacing:0';
  b.addEventListener('click',()=>{p.remove();URL.revokeObjectURL(url);});row.append(note,b);p.append(t,im,row);$('stage').appendChild(p);b.focus();}
