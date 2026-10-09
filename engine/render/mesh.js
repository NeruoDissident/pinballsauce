/* ================= MESH BUILDING =================
   MB merges static geometry into a few draw calls; strip() and prism() follow the terrain. */
import {SLOPES,UP,elev,inSlope} from './world.js';

/* ---------- mesh builder: merges everything static into a few draw calls ---------- */
export class MB{constructor(){this.p=[];this.n=[];this.u=[];this.hint=null;}
  tri(a,b,c,ua,ub,uc){const ux=b[0]-a[0],uy=b[1]-a[1],uz=b[2]-a[2],vx=c[0]-a[0],vy=c[1]-a[1],vz=c[2]-a[2];
    let nx=uy*vz-uz*vy,ny=uz*vx-ux*vz,nz=ux*vy-uy*vx;const l=Math.hypot(nx,ny,nz);if(l<1e-9)return;nx/=l;ny/=l;nz/=l;
    const h=this.hint;if(h&&nx*h[0]+ny*h[1]+nz*h[2]<0){const t=b;b=c;c=t;const tu=ub;ub=uc;uc=tu;nx=-nx;ny=-ny;nz=-nz;}
    this.p.push(a[0],a[1],a[2],b[0],b[1],b[2],c[0],c[1],c[2]);this.n.push(nx,ny,nz,nx,ny,nz,nx,ny,nz);this.u.push(ua[0],ua[1],ub[0],ub[1],uc[0],uc[1]);}
  quad(a,b,c,d,ua,ub,uc,ud){this.tri(a,b,c,ua,ub,uc);this.tri(a,c,d,ua,uc,ud);}
  add(g,m){const src=g.index?g.toNonIndexed():g,P=src.attributes.position,N=src.attributes.normal,U=src.attributes.uv,v=new THREE.Vector3(),nm=new THREE.Matrix3().getNormalMatrix(m);
    for(let i=0;i<P.count;i++){v.fromBufferAttribute(P,i).applyMatrix4(m);this.p.push(v.x,v.y,v.z);v.fromBufferAttribute(N,i).applyMatrix3(nm).normalize();this.n.push(v.x,v.y,v.z);this.u.push(U?U.getX(i):0,U?U.getY(i):0);}
    if(src!==g)src.dispose();return this;}
  geo(){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(this.p,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(this.n,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(this.u,2));return g;}
  mesh(mat,o){o=o||{};const m=new THREE.Mesh(this.geo(),mat);m.castShadow=o.cast!==false;m.receiveShadow=o.receive!==false;m.matrixAutoUpdate=false;return m;}}
export const GEO={};
export function ugeo(k){if(GEO[k])return GEO[k];const n=+k.slice(1);
  return GEO[k]=k==='box'?new THREE.BoxGeometry(1,1,1):k[0]==='c'?new THREE.CylinderGeometry(1,1,1,n):k[0]==='k'?new THREE.ConeGeometry(1,1,n):new THREE.SphereGeometry(1,n,Math.max(6,n*.7|0));}
export function at(x,y,h,ry,s){const q=new THREE.Quaternion();if(ry)q.setFromAxisAngle(UP,ry);const sc=s===undefined?[1,1,1]:typeof s==='number'?[s,s,s]:s;
  return new THREE.Matrix4().compose(new THREE.Vector3(x-320,elev(y)+(h||0),y),q,new THREE.Vector3(sc[0],sc[1],sc[2]));}
export const cyl=(mb,x,y,r,h0,h1,n,r2)=>mb.add(r2===undefined?ugeo('c'+(n||10)):new THREE.CylinderGeometry(r2,r,1,n||10),at(x,y,(h0+h1)/2,0,r2===undefined?[r,h1-h0,r]:[1,h1-h0,1]));
export const box=(mb,x,y,h0,h1,sx,sz,ry)=>mb.add(ugeo('box'),at(x,y,(h0+h1)/2,ry||0,[sx,h1-h0,sz]));
export const cone=(mb,x,y,r,h0,h1,n)=>mb.add(ugeo('k'+(n||8)),at(x,y,(h0+h1)/2,0,[r,h1-h0,r]));
export function subSlope(pts,closed){const o=[],n=pts.length;
  for(let i=0;i<n-(closed?0:1);i++){const a=pts[i],b=pts[(i+1)%n],d=Math.hypot(b[0]-a[0],b[1]-a[1]),k=inSlope(a[1],b[1])?Math.max(1,Math.ceil(d/14)):1;
    for(let j=0;j<k;j++)o.push([a[0]+(b[0]-a[0])*j/k,a[1]+(b[1]-a[1])*j/k]);}
  if(!closed)o.push(pts[n-1]);return o;}
export function offsets(pts,hw,closed){const n=pts.length,L=[],Rr=[];
  for(let i=0;i<n;i++){const a=pts[closed?(i-1+n)%n:Math.max(0,i-1)],p=pts[i],b=pts[closed?(i+1)%n:Math.min(n-1,i+1)];
    let ax=p[0]-a[0],ay=p[1]-a[1],bx=b[0]-p[0],by=b[1]-p[1],al=Math.hypot(ax,ay),bl=Math.hypot(bx,by);
    if(al<1e-6){ax=bx;ay=by;al=bl;}if(bl<1e-6){bx=ax;by=ay;bl=al;}ax/=al;ay/=al;bx/=bl;by/=bl;
    let mx=-(ay+by),my=ax+bx;const ml=Math.hypot(mx,my);if(ml<1e-6){mx=-ay;my=ax;}else{mx/=ml;my/=ml;}
    const k=hw/Math.max(.45,mx*-ay+my*ax);L.push([p[0]+mx*k,p[1]+my*k]);Rr.push([p[0]-mx*k,p[1]-my*k]);}
  return [L,Rr];}
// a wall of constant width following a polyline and the terrain under it
export function strip(mb,pts,hw,h,o){o=o||{};const depth=o.depth===undefined?12:o.depth,us=o.us||64,base=o.h0;
  pts=subSlope(pts);const n=pts.length;if(n<2)return;const LR=offsets(pts,hw,false),L=LR[0],Rr=LR[1];
  const top=q=>[q[0]-320,elev(q[1])+h,q[1]],bot=q=>[q[0]-320,elev(q[1])+(base===undefined?-depth:base),q[1]],vh=(h+depth)/us;let u=0;
  for(let i=0;i<n-1;i++){const d=Math.hypot(pts[i+1][0]-pts[i][0],pts[i+1][1]-pts[i][1]),u1=u+d/us;
    mb.hint=[0,1,0];mb.quad(top(L[i]),top(Rr[i]),top(Rr[i+1]),top(L[i+1]),[L[i][0]/us,L[i][1]/us],[Rr[i][0]/us,Rr[i][1]/us],[Rr[i+1][0]/us,Rr[i+1][1]/us],[L[i+1][0]/us,L[i+1][1]/us]);
    mb.hint=[L[i][0]-Rr[i][0],0,L[i][1]-Rr[i][1]];mb.quad(bot(L[i]),top(L[i]),top(L[i+1]),bot(L[i+1]),[u,0],[u,vh],[u1,vh],[u1,0]);
    mb.hint=[Rr[i][0]-L[i][0],0,Rr[i][1]-L[i][1]];mb.quad(bot(Rr[i+1]),top(Rr[i+1]),top(Rr[i]),bot(Rr[i]),[u1,0],[u1,vh],[u,vh],[u,0]);u=u1;}
  mb.hint=[pts[0][0]-pts[1][0],0,pts[0][1]-pts[1][1]];mb.quad(bot(Rr[0]),top(Rr[0]),top(L[0]),bot(L[0]),[0,0],[0,vh],[.1,vh],[.1,0]);
  mb.hint=[pts[n-1][0]-pts[n-2][0],0,pts[n-1][1]-pts[n-2][1]];mb.quad(bot(L[n-1]),top(L[n-1]),top(Rr[n-1]),bot(Rr[n-1]),[0,0],[0,vh],[.1,vh],[.1,0]);
  mb.hint=null;
  if(o.caps!==false&&hw>=1.5)for(const q of [pts[0],pts[n-1]])cyl(mb,q[0],q[1],hw+(o.capGrow||0),base===undefined?-depth:base,h+(o.capRise||0),10);}
// keep the part of a polygon on one side of a horizontal line (sg=1: y>=yc, sg=-1: y<=yc)
export function clipY(pts,yc,sg){const o=[],n=pts.length;for(let i=0;i<n;i++){const a=pts[i],b=pts[(i+1)%n],ia=(a[1]-yc)*sg>=0,ib=(b[1]-yc)*sg>=0;
    if(ia)o.push(a);if(ia!==ib){const t=(yc-a[1])/(b[1]-a[1]);o.push([a[0]+(b[0]-a[0])*t,yc]);}}
  const r=[];for(const q of o){const l=r[r.length-1];if(!l||Math.abs(l[0]-q[0])>1e-4||Math.abs(l[1]-q[1])>1e-4)r.push(q);}
  if(r.length>1&&Math.abs(r[0][0]-r[r.length-1][0])<1e-4&&Math.abs(r[0][1]-r[r.length-1][1])<1e-4)r.pop();return r;}
// a solid block: polygon footprint, top following the terrain (or flat), sides down into the floor
export function prism(mb,pts,h,o){o=o||{};const depth=o.depth===undefined?12:o.depth,us=o.us||64;
  pts=subSlope(pts,true);const n=pts.length;let area=0;for(let i=0;i<n;i++){const a=pts[i],b=pts[(i+1)%n];area+=a[0]*b[1]-b[0]*a[1];}
  const top=q=>[q[0]-320,o.flat!==undefined?o.flat:elev(q[1])+h,q[1]],bot=q=>[q[0]-320,o.base!==undefined?o.base:elev(q[1])-depth,q[1]];
  let lo=1e9,hi=-1e9;for(const q of pts){lo=Math.min(lo,q[1]);hi=Math.max(hi,q[1]);}
  const cuts=[lo-1];if(o.flat===undefined)for(const z of SLOPES)if(hi>z[0]&&lo<z[1])for(let y=z[0];y<=z[1]+.01;y+=12)if(y>lo&&y<hi)cuts.push(y);cuts.push(hi+1);
  mb.hint=[0,1,0];
  for(let k=0;k<cuts.length-1;k++){const band=cuts.length===2?pts:clipY(clipY(pts,cuts[k],1),cuts[k+1],-1);if(band.length<3)continue;
    const tris=THREE.ShapeUtils.triangulateShape(band.map(p=>new THREE.Vector2(p[0],p[1])),[]);
    for(const t of tris){const a=band[t[0]],b=band[t[1]],c=band[t[2]];mb.tri(top(a),top(b),top(c),[a[0]/us,a[1]/us],[b[0]/us,b[1]/us],[c[0]/us,c[1]/us]);}}
  let u=0;const sg=area>0?1:-1;
  for(let i=0;i<n;i++){const a=pts[i],b=pts[(i+1)%n],dx=b[0]-a[0],dy=b[1]-a[1],d=Math.hypot(dx,dy);if(d<1e-6)continue;const u1=u+d/us,ta=top(a),tb=top(b),ba=bot(a),bb=bot(b);
    mb.hint=[dy*sg,0,-dx*sg];mb.quad(ba,ta,tb,bb,[u,ba[1]/us],[u,ta[1]/us],[u1,tb[1]/us],[u1,bb[1]/us]);u=u1;}
  mb.hint=null;}
