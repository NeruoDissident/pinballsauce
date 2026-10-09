import {E,FY,H,HW,M,MB,PI,PITS,R3,SM,TAU,TY,WALL_H,at,box,clamp,cone,ctex,cyl,elev,groundY,hash,hdr,mkCanvas,pitDist,prism,tierOf} from '../../../engine/api.js';
import {rose} from './art.js';

export function texRose(){const cv=mkCanvas(256,256),c=cv.getContext('2d');c.fillStyle='#000';c.fillRect(0,0,256,256);rose(c,128,128,116,['#ff3b55','#ffc04a','#4f86ff','#b04ad0']);return cv;}
export function buildScenery(){const sc=R3.scene,frame=new MB(),iron=new MB(),roof=new MB(),dark=new MB(),s0=new MB();
  // the land the table stands in
  {const gt=M.ground.map;const mb=new MB();mb.hint=[0,1,0];const xs=[-1500,-1100,-800,-560,-390];
    for(const sd of [-1,1])for(let i=0;i<xs.length-1;i++)for(let y=-900;y<HW+500;y+=90){const xa=320+sd*-xs[i+1]*1,xb=320+sd*-xs[i],x0=Math.min(xa,xb),x1=Math.max(xa,xb),y2=y+90;
      if(PITS.some(p=>p.sd===sd&&y>=p.z0-.5&&y2<=p.z1+.5))continue; // a wing's court is cut out of the land here; wing3d.js lays the ground around it
      const P=(x,yy)=>[x-320,groundY(x,yy),yy];mb.quad(P(x0,y),P(x1,y),P(x1,y2),P(x0,y2),[x0/220,y/220],[x1/220,y/220],[x1/220,y2/220],[x0/220,y2/220]);}
    // land behind the Keep and the skirt under the outer walls
    for(let x=-70;x<710;x+=130)for(let y=-900;y<-70;y+=90){const P=(xx,yy)=>[xx-320,groundY(xx,yy),yy];mb.quad(P(x,y),P(x+130,y),P(x+130,y+90),P(x,y+90),[x/220,y/220],[(x+130)/220,y/220],[(x+130)/220,(y+90)/220],[x/220,(y+90)/220]);}
    const g=mb.mesh(M.ground,{cast:false});sc.add(g);}
  // outer wall skirts so the table reads as a built thing
  prism(dark,[[-74,-74],[-70,-74],[-70,H+34],[-74,H+34]],30,{depth:60});prism(dark,[[710,-74],[714,-74],[714,H+34],[710,H+34]],30,{depth:60});
  // The Black Keep: curtain walls, towers, battlements, the rose window
  const y1=FY[0]+90;
  prism(s0,[[-70,-70],[-26,-70],[-26,y1],[-70,y1]],88);prism(s0,[[666,-70],[710,-70],[710,y1],[666,y1]],88);
  prism(s0,[[-150,-150],[790,-150],[790,-66],[-150,-66]],150);
  for(let x=-140;x<790;x+=44)box(s0,x+11,-80,150,170,24,26);
  for(const sx of [-48,688])for(let y=-50;y<y1;y+=44)box(s0,sx,y,88,104,42,24);
  for(const tx of [-112,752]){cyl(s0,tx,-112,62,-40,250,14);cyl(s0,tx,-112,70,250,268,14);cone(roof,tx,-112,76,268,390,14);
    for(let k=0;k<14;k+=2){const a=k*TAU/14;box(s0,tx+Math.cos(a)*64,-112+Math.sin(a)*64,268,286,18,18,-a);}}
  box(s0,320,-108,150,196,230,84);cone(roof,320,-108,150,196,300,4);
  {const rose=new THREE.Mesh(new THREE.CircleGeometry(74,40),new THREE.MeshBasicMaterial({map:ctex(texRose()),color:new THREE.Color(1.7,1.7,1.7)}));rose.position.set(0,E[0]+92,-65.5);sc.add(rose);
    const fr=new THREE.Mesh(new THREE.TorusGeometry(76,5,8,40),M.stone[0]);fr.position.copy(rose.position);sc.add(fr);
    const beam=new THREE.Sprite(new THREE.SpriteMaterial({map:R3.glowTex,color:hdr('#ff6080',.8),transparent:true,opacity:.3,blending:THREE.AdditiveBlending,depthWrite:false}));beam.position.set(0,E[0]+92,-50);beam.scale.set(420,420,1);sc.add(beam);}
  for(const sx of [-25,665])for(let k=0;k<5;k++){const b=new THREE.Mesh(new THREE.PlaneGeometry(30,62),SM({color:'#8a1428',emissive:hdr('#c0283c'),emissiveIntensity:.18,roughness:.9,side:THREE.DoubleSide}));
    b.position.set(sx-320,E[0]+52,120+k*190);b.rotation.y=sx<0?PI/2:-PI/2;sc.add(b);}
  // gateway arches over the chutes between levels
  for(let i=1;i<3;i++){const y=TY[i]-14,top=E[i-1]-E[i]+30;for(const x of [262,378])box(frame,x,y,WALL_H-4,top,14,14);box(frame,320,y,top,top+16,150,18);
    for(let k=-3;k<=3;k++)box(frame,320+k*22,y,top+16,top+(k%2?24:30),12,18);}
  // wrought iron along the Hollow, graves beyond it
  for(const x of [-8,648]){for(let y=TY[2]+60;y<H+30;y+=13){cyl(iron,x,y,.9,34,54,5);cone(iron,x,y,1.8,54,60,5);}
    for(const h of [39,50])box(iron,x,(TY[2]+60+H+30)/2,h,h+1.4,1.4,H-30-TY[2]);}
  const add=(mb,mat,o)=>{if(mb.p.length)sc.add(mb.mesh(mat,o));};add(frame,M.frame);add(iron,M.iron);add(roof,M.roof);add(dark,M.dark);add(s0,M.stone[0]);
  // instanced scenery: pines by the Wilds, graves and dead trees by the Hollow
  const dm=new THREE.Object3D(),inst=(geo,mat,list)=>{const im=new THREE.InstancedMesh(geo,mat,list.length);list.forEach((q,i)=>{dm.position.set(q[0]-320,q[2]===undefined?groundY(q[0],q[1]):q[2],q[1]);dm.rotation.set(q[5]||0,q[4]||0,0);dm.scale.setScalar(q[3]||1);dm.updateMatrix();im.setMatrixAt(i,dm.matrix);});im.castShadow=true;im.receiveShadow=true;sc.add(im);return im;},clear=l=>l.filter(q=>q[2]!==undefined||pitDist(q[0],q[1])>30);
  const pineG=(()=>{const mb=new MB(),I=new THREE.Matrix4();for(let k=0;k<4;k++)mb.add(new THREE.ConeGeometry(.42-k*.08,.42,7),I.clone().makeTranslation(0,.3+k*.2,0));return mb.geo();})();
  const trunkG=new THREE.CylinderGeometry(.035,.05,.3,5).translate(0,.1,0);
  const pines=[];for(let k=0;k<150;k++){const sd=hash(k*1.7)>.5?1:-1,far=hash(k*3.3),x=320+sd*(k<26?352+hash(k)*18:500+far*far*780),y=k<26?TY[1]+hash(k*5.1)*900:TY[1]-260+hash(k*5.1)*1300,sz=k<26?44+hash(k*2)*30:90+hash(k*7.7)*110;
    pines.push([x,y,k<26?elev(y)+34:undefined,sz,hash(k)*6]);}
  {const keep=clear(pines);inst(pineG,M.pine,keep);inst(trunkG,M.bark,keep);}
  const tombG=(()=>{const sh=new THREE.Shape();sh.moveTo(-.5,0);sh.lineTo(-.5,.7);sh.absarc(0,.7,.5,PI,0,true);sh.lineTo(.5,0);sh.closePath();return new THREE.ExtrudeGeometry(sh,{depth:.26,bevelEnabled:false,curveSegments:6}).translate(0,0,-.13);})();
  const crossG=(()=>{const mb=new MB(),I=new THREE.Matrix4();mb.add(new THREE.BoxGeometry(.24,1.5,.2),I.clone().makeTranslation(0,.75,0));mb.add(new THREE.BoxGeometry(.9,.22,.2),I.clone().makeTranslation(0,1.05,0));return mb.geo();})();
  const tombs=[],crosses=[];for(let k=0;k<120;k++){const sd=hash(k*2.9)>.5?1:-1,x=320+sd*(k<20?344+hash(k)*22:420+Math.pow(hash(k*4.1),1.5)*520),y=TY[2]-80+hash(k*6.3)*1320,q=[x,y,k<20?elev(y)+34:undefined,k<20?13+hash(k)*6:16+hash(k*1.3)*14,(hash(k*8.8)-.5)*.9,(hash(k*3.7)-.5)*.2];
    (hash(k*9.9)>.35?tombs:crosses).push(q);}
  const tm=SM({map:M.stone[2].map,color:0x5e6a86,roughness:.92,envMapIntensity:.25});inst(tombG,tm,clear(tombs));inst(crossG,tm,clear(crosses));
  const deadG=(()=>{const mb=new MB();const br=(m,l,w,d)=>{mb.add(new THREE.CylinderGeometry(w*.6,w,l,5).translate(0,l/2,0),m);if(d>0)for(const s of [-1,1]){const k=hash(l*7+d+s);
        br(m.clone().multiply(new THREE.Matrix4().makeTranslation(0,l*.92,0)).multiply(new THREE.Matrix4().makeRotationY(k*5)).multiply(new THREE.Matrix4().makeRotationZ(s*(.45+k*.4))),l*.66,w*.6,d-1);}};
      br(new THREE.Matrix4(),.34,.05,3);return mb.geo();})();
  const dead=[];for(let k=0;k<22;k++){const sd=k%2?1:-1,x=320+sd*(430+hash(k*3.1)*520),y=TY[2]-200+hash(k*7.7)*1500;dead.push([x,y,undefined,100+hash(k)*80,hash(k)*6]);}
  for(let k=0;k<8;k++){const sd=k%2?1:-1,x=320+sd*(440+hash(k*5.3)*300),y=TY[0]+hash(k*2.1)*900;dead.push([x,y,undefined,90+hash(k)*70,hash(k)*6]);}
  inst(deadG,M.bark,clear(dead));
  // the chapel by the Hollow
  {const cx=1090,cy=TY[2]+330,g0=groundY(cx,cy)-elev(cy)-6,mb=new MB();box(mb,cx,cy,g0,g0+120,130,220);box(mb,cx,cy-150,g0,g0+250,70,70);
    const rf=new MB();rf.add(new THREE.CylinderGeometry(1,1,1,3).rotateZ(PI/2).rotateY(PI/2),at(cx,cy,g0+152,0,[84,64,222]));cone(rf,cx,cy-150,54,g0+250,g0+370,4);sc.add(mb.mesh(tm));sc.add(rf.mesh(M.roof));
    const wm=new THREE.MeshBasicMaterial({color:hdr('#ffb050',1.15)});for(let k=0;k<4;k++){const w=new THREE.Mesh(new THREE.PlaneGeometry(16,46),wm);w.position.set(cx-320-65.6,elev(cy)+g0+62,cy-78+k*52);w.rotation.y=-PI/2;sc.add(w);}
    const w2=new THREE.Mesh(new THREE.CircleGeometry(15,16),wm);w2.position.set(cx-320-35.6,elev(cy)+g0+190,cy-150);w2.rotation.y=-PI/2;sc.add(w2);}
  // far lanterns
  for(let k=0;k<16;k++){const sd=k%2?1:-1,x=320+sd*(420+hash(k*4.7)*420),y=TY[0]+hash(k*9.3)*3000,t=tierOf(clamp(y,TY[0],H-10)),col=['#ff6a3c','#7fe0c0','#ffb050'][t];if(pitDist(x,y)<30)continue;
    const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:R3.glowTex,color:hdr(col,1.2),transparent:true,opacity:.6,blending:THREE.AdditiveBlending,depthWrite:false}));sp.position.set(x-320,groundY(x,y)+34,y);sp.scale.set(40,40,1);sc.add(sp);
    const p=new THREE.Mesh(new THREE.CylinderGeometry(1.4,1.8,32,5),M.iron);p.position.set(x-320,groundY(x,y)+16,y);sc.add(p);}
}
