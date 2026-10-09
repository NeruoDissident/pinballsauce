/* ================= STANDARD PARTS =================
   What every field is built from, so every table plays like the same manufacturer made it: the arch at the top,
   the two orbits, and the floor (slingshots, flippers, inlanes, outlanes, and the chute to the field below).
   Changing a number here changes every table. */
import {T} from '../core/state.js';
import {PI,TAU} from '../core/util.js';
import {arcPts,block,gpoly,gseg,poly,seg,sensor} from './geometry.js';
import {NM,TY,XR} from './layout.js';

export function buildFrame(i){const yA=TY[i]+300,aF=Math.acos(258/300),aG=Math.asin(36/300);
  const A=(a0,a1,n)=>arcPts(320,yA,300,a0,a1,n);
  if(i===0){poly(A(PI,TAU,60),{},'none');return;}
  gpoly(A(PI,PI+aF,7),320,yA);poly(A(PI+aF,1.5*PI-aG,24),{},'none');gpoly(A(1.5*PI-aG,1.5*PI+aG,4),320,yA);
  poly(A(1.5*PI+aG,TAU-aF,24),{},'none');gpoly(A(TAU-aF,TAU,7),320,yA);}
export function buildFloor(i,xL,xR,cx){const yF=TY[i]+900,nextA=i<NM-1?TY[i+1]+300:0;
  for(const sd of [-1,1]){const X=d=>sd<0?xL+d:xR-d;
    const G0=[X(42),yF-170],G1=[X(42),yF-70],G2=[cx+sd*103,yF-9];
    poly([G0,G1,G2],{w:3});
    const gl=Math.hypot(G2[0]-G1[0],G2[1]-G1[1]),ux=(G2[0]-G1[0])/gl,uy=(G2[1]-G1[1])/gl;let nx=-uy,ny=ux;if(ny>0){nx=-nx;ny=-ny;}
    const ox=G1[0]+nx*37,oy=G1[1]+ny*37,lineY=x=>oy+(x-ox)/ux*uy;
    const A=[X(80),yF-190],B=[X(80),lineY(X(80))],C=[cx+sd*140,lineY(cx+sd*140)];
    poly([A,B,C],{w:2},'none');
    const s=seg(A[0],A[1],C[0],C[1],{kind:'sling',e:.25,w:2,tier:i});let kx=-s.dy/s.len,ky=s.dx/s.len;if(kx*sd>0){kx=-kx;ky=-ky;}s.kx=kx;s.ky=ky;
    T.slings.push({A,B,C,s,tier:i,side:sd});
    const D0=[X(0),yF-262],D1=[X(30),yF-205];gseg(D0,D1,D0[0]-sd*100,D0[1]-100);T.wallPaths.push({pts:[D0,D1],style:'flap'});
    T.flips.push({x:cx+sd*100,y:yF,side:sd,dir:-sd,tier:i,L:82,rest:.5,up:-.44,a:.5,w:0,on:false});
    sensor(X(21),yF-118,14,{kind:'outlane',side:sd,tier:i});sensor(X(61),yF-118,14,{kind:'inlane',side:sd,tier:i});
    if(i<NM-1){
      poly([G1,[X(42),nextA-153]],{w:2});
      poly([[cx+sd*100,yF+13],[320+sd*36,yF+141]],{},'none');
      T.blocks.push({pts:[G1,G2,[cx+sd*100,yF+13],[320+sd*36,yF+141],[X(42),nextA-153]],dead:true,tier:i});
    }else{
      poly([G1,[X(42),yF+150]],{w:2});poly([[cx+sd*100,yF+13],[cx+sd*40,yF+150]],{},'none');
      T.blocks.push({pts:[G1,G2,[cx+sd*100,yF+13],[cx+sd*40,yF+150],[X(42),yF+150]],dead:true,tier:i,apron:true});
    }
  }
  if(i<NM-1){T.chans.push([[220,yF+13],[420,yF+13],[356,yF+143],[284,yF+143]]);
    T.chans.push([[20,yF-70],[62,yF-70],[62,nextA-153],[20,nextA]]);T.chans.push([[620,yF-70],[578,yF-70],[578,nextA-153],[620,nextA]]);}
}
export function buildOrbits(i){const y=TY[i],yA=y+300,rr=254-(620-XR[i]);
  poly([[66,y+500],[66,yA]].concat(arcPts(320,yA,254,PI,PI+.7,8).slice(1)),{w:3});
  poly([[320+rr,y+500],[320+rr,yA]].concat(arcPts(320,yA,rr,TAU,TAU-.7,8).slice(1)),{w:3});
  sensor(43,y+405,21,{kind:'orbit',side:-1,tier:i});sensor(597-(620-XR[i]),y+405,21,{kind:'orbit',side:1,tier:i});}
export function centerScoop(cx,y,w){w=w||20;poly([[cx-w,466],[cx-w-2,438],[cx-13,420],[cx,415],[cx+13,420],[cx+w+2,438],[cx+w,466]].map(p=>[p[0],p[1]+y]),{w:3},'scoop');}
export function sideScoopBlock(m,sx,y,xg,topY,name,tier){ // block between ramp mouth guide and orbit guide, with a scoop notch facing down
  const c=sx<0?112:528,o=p=>[p[0],p[1]+y];
  const notch=[[c+20,508],[c+20,482],[c+10,470],[c-10,470],[c-20,482],[c-20,508]].map(o);
  if(sx<0)block([o([xg,topY]),m.lt,m.lb].concat(notch,[o([xg,505])]),{name,tier});
  else block([m.rt,o([xg,topY]),o([xg,505])].concat(notch,[m.rb]),{name,tier});
  return c;}
