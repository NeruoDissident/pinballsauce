/* ================= TABLE GEOMETRY =================
   The primitives a table is made of: wall segments, one-way gates, blocks, bumpers, sensors, scoops (holes), shot
   inserts, target banks, ramp mouths and rails. Each adds itself to T. Used by table/parts.js and table/build.js. */
import {T} from '../core/state.js';
import {PI,clamp} from '../core/util.js';
import {TY} from './layout.js';

export function seg(x1,y1,x2,y2,o){const dx=x2-x1,dy=y2-y1,len=Math.hypot(dx,dy)||1;
  const s=Object.assign({x1,y1,x2,y2,dx,dy,len,l2:len*len,e:.45,w:0,kind:'wall',on:true,flash:0,cool:0},o||{});T.segs.push(s);return s;}
export function poly(pts,o,style){for(let i=0;i<pts.length-1;i++)seg(pts[i][0],pts[i][1],pts[i+1][0],pts[i+1][1],o);
  if(style!=='none')T.wallPaths.push({pts,style:style||'rail',w:(o&&o.w)||0});}
export function gseg(a,b,cx,cy){ // one-way: solid only for balls on the (cx,cy) side
  const s=seg(a[0],a[1],b[0],b[1],{kind:'gate',e:.3,ow:true});let nx=-s.dy/s.len,ny=s.dx/s.len;
  if((cx-a[0])*nx+(cy-a[1])*ny<0){nx=-nx;ny=-ny;}s.onx=nx;s.ony=ny;return s;}
export function gpoly(pts,cx,cy){for(let i=0;i<pts.length-1;i++)gseg(pts[i],pts[i+1],cx,cy);T.wallPaths.push({pts,style:'gate'});}
export function arcPts(cx,cy,r,a0,a1,n){const p=[];for(let i=0;i<=n;i++){const a=a0+(a1-a0)*i/n;p.push([cx+r*Math.cos(a),cy+r*Math.sin(a)]);}return p;}
export function block(pts,o){poly(pts.concat([pts[0]]),{},'none');T.blocks.push(Object.assign({pts},o||{}));}
export function bumper(x,y,r,group,tier,o){const b=Object.assign({x,y,r,group,tier,kick:470,flash:0,cool:0,ward:false},o||{});T.bumps.push(b);return b;}
export function sensor(x,y,r,o){const s=Object.assign({x,y,r,cool:0,lit:false,flash:0},o);T.sens.push(s);return s;}
export function hole(id,x,y,r,tier,name){T.holes[id]={id,x,y,r,tier,name,glow:0,busy:0};}
export function shotDef(id,name,tier,x,y,ang,kind){T.shots[id]={id,name,tier,x,y:y+TY[tier],ang:ang===undefined?-PI/2:ang,kind:kind||'arrow'};}
export function bank(id,tier,p0,p1,n,kind,o){o=o||{};
  const B=T.banks[id]||(T.banks[id]={id,tier,kind,segs:[],reset:0,name:o.name||id});
  const dx=p1[0]-p0[0],dy=p1[1]-p0[1],len=Math.hypot(dx,dy);let nx=-dy/len,ny=dx/len;if(ny<0){nx=-nx;ny=-ny;}
  const pad=o.pad||0,off=kind==='target'?4.5:0,g=.05;
  for(let k=0;k<n;k++){const t0=pad+(1-2*pad)*(k+g)/n,t1=pad+(1-2*pad)*(k+1-g)/n;
    B.segs.push(seg(p0[0]+dx*t0+nx*off,p0[1]+dy*t0+ny*off,p0[0]+dx*t1+nx*off,p0[1]+dy*t1+ny*off,
      {kind,bank:id,tier,w:kind==='drop'?3:2.5,e:.3,lit:false,nx,ny}));}
  return B;}
export function mouthGeo(px,py,sx){const dx=sx*.38,dy=sx?-.925:-1,qx=sx?.925:1,qy=sx*.38;
  const lb=[px-qx*28,py-qy*28],rb=[px+qx*28,py+qy*28]; // a funnel: 56 wide at the lip, 38 at the throat
  return {d:[dx,dy],lb,rb,lt:[px+dx*70-qx*19,py+dy*70-qy*19],rt:[px+dx*70+qx*19,py+dy*70+qy*19],c0:[px+dx*36,py+dy*36],c1:[px+dx*100,py+dy*100],p:[px,py]};}
export function catmull(P,n){const o=[];for(let i=0;i<P.length-1;i++){const p0=P[Math.max(0,i-1)],p1=P[i],p2=P[i+1],p3=P[Math.min(P.length-1,i+2)];
  for(let j=0;j<n;j++){const t=j/n,t2=t*t,t3=t2*t,q=[0,0];
    for(let k=0;k<2;k++)q[k]=.5*((2*p1[k])+(-p0[k]+p2[k])*t+(2*p0[k]-5*p1[k]+4*p2[k]-p3[k])*t2+(-p0[k]+3*p1[k]-3*p2[k]+p3[k])*t3);o.push(q);}}
  o.push(P[P.length-1]);return o;}
export function resample(pts,ds){const x=[pts[0][0]],y=[pts[0][1]];let acc=0;
  for(let i=1;i<pts.length;i++){let ax=pts[i-1][0],ay=pts[i-1][1];const bx=pts[i][0],by=pts[i][1];let d=Math.hypot(bx-ax,by-ay);
    while(acc+d>=ds){const t=(ds-acc)/d;ax+=(bx-ax)*t;ay+=(by-ay)*t;x.push(ax);y.push(ay);d=Math.hypot(bx-ax,by-ay);acc=0;}acc+=d;}
  return {x,y,n:x.length,len:(x.length-1)*ds,ds};}
export function rail(id,name,mouth,pts,o){const r=Object.assign(resample(catmull([mouth.c0,mouth.c1].concat(pts),14),6),{id,name,k:.2,exitV:520},o||{});
  T.rails[id]=r;T.mouths.push({rail:id,x:mouth.c0[0],y:mouth.c0[1],dx:mouth.d[0],dy:mouth.d[1],r:21});return r;}
export function railPos(r,s,out){const f=clamp(s/r.ds,0,r.n-1.001),i=f|0,t=f-i;out.x=r.x[i]+(r.x[i+1]-r.x[i])*t;out.y=r.y[i]+(r.y[i+1]-r.y[i])*t;
  out.tx=(r.x[i+1]-r.x[i])/r.ds;out.ty=(r.y[i+1]-r.y[i])/r.ds;return out;}
