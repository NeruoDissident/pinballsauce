/* ================= RECRUITS =================
   Balls for hire: a class with one of its abilities. A table decides which scoop sells them (rules.onScoop). */
import {G} from '../core/state.js';
import {TAU,mkCanvas,pick} from '../core/util.js';
import {R} from '../render/draw2d.js';
import {CLASSES} from './classes.js';
import {SPELLS,spellDef} from './spells.js';
import {TEXT} from '../table/content.js';
import {A} from '../ui/audio.js';
import {popup} from '../ui/ui.js';

/* ---------- the Tavern: balls for hire ----------
   Three random recruits a visit: a class and one of its four abilities, with a price. A recruit rides with you for
   the run and comes out in every Rally as a ball of its class with that ability running. */
export const RECRUIT_MAX=6;
export const RECRUIT_RETURNS=['aegis','sanctuary','barrier','smoke'];
// the guard abilities bring a drained recruit back once
export function recruitCost(){return 40+15*((G.run.recruits||[]).length);}
export function tavernOpen(){const r=G.run;return !!(r&&r.recruits&&r.recruits.length<RECRUIT_MAX&&r.gold>=recruitCost());}
export function drawTavern(n){const out=[],seen=new Set();let guard=0;while(out.length<n&&guard++<60){const cls=pick(Object.keys(CLASSES)),ids=Object.keys(SPELLS[cls]),spell=pick(ids),k=cls+':'+spell;if(seen.has(k))continue;seen.add(k);out.push({cls,spell});}return out;}
export function tavernChoice(){const r=G.run,cost=recruitCost();
  const opts=r.tavern.map(q=>{const cc=CLASSES[q.cls],sp=spellDef(q.spell);return {name:sp.name,desc:sp.text,tag:cc.name+' \u00b7 '+cost+' gold',cost,orb:[cc.color,cc.glow],face:[q.cls,q.spell],
    act:()=>{r.recruits.push({cls:q.cls,spell:q.spell});r.tavern=r.tavern.filter(x=>x!==q);popup('A '+cc.name+' Joins You',sp.name+' rides out with the next Rally','good');A.s('questDone');G.dirty=true;}};});
  return {kind:'tavern',title:TEXT.tavern,sub:'Balls for hire. '+r.gold+' gold in your purse, '+(RECRUIT_MAX-r.recruits.length)+' seats in the band',opts:opts.concat([{name:'Leave',desc:'Keep your coin and get back to it.',tag:'',act:()=>{}}])};}
export function armRecruit(b,spell,T0){b.spell=spell;b.cast={id:spell,t:T0,max:T0,tick:0,hits:0};if(spell==='cloak')b.phased=true;if(spell==='shieldWall'||spell==='charge'){b.kx=.6;}if(spell==='charge')b.arm=9;}
// a portrait for the hiring board: the ball as the person, a hooded figure in the class colour, the ability's colour on the hood
export function portrait(cls,spell){const key=cls+':'+spell;portrait.cache=portrait.cache||{};if(portrait.cache[key])return portrait.cache[key];
  const cl=CLASSES[cls],d=spellDef(spell),col=d?{breaker:'#ffb050',guard:'#9fe8ff',striker:'#ff6a6a',pressure:'#c9a6ff'}[d.slot]:cl.glow,cv=mkCanvas(96,112),c=cv.getContext('2d');
  let g=c.createRadialGradient(48,56,8,48,56,64);g.addColorStop(0,'#2a2838');g.addColorStop(1,'#0a0a12');c.fillStyle=g;c.fillRect(0,0,96,112);
  c.fillStyle=col;c.globalAlpha=.16;c.beginPath();c.arc(48,54,40,0,TAU);c.fill();c.globalAlpha=1;
  g=c.createLinearGradient(0,40,0,112);g.addColorStop(0,'#3a3850');g.addColorStop(1,'#1a1926');c.fillStyle=g;c.beginPath();c.moveTo(10,112);c.quadraticCurveTo(14,66,48,62);c.quadraticCurveTo(82,66,86,112);c.closePath();c.fill();
  c.fillStyle='#2c2a40';c.beginPath();c.moveTo(22,70);c.quadraticCurveTo(26,18,48,16);c.quadraticCurveTo(70,18,74,70);c.quadraticCurveTo(48,58,22,70);c.closePath();c.fill();
  c.strokeStyle=col;c.lineWidth=1.5;c.globalAlpha=.75;c.beginPath();c.moveTo(24,70);c.quadraticCurveTo(28,22,48,20);c.quadraticCurveTo(68,22,72,70);c.stroke();c.globalAlpha=1;
  g=c.createRadialGradient(48,46,4,48,46,34);g.addColorStop(0,cl.glow);g.addColorStop(1,'rgba(0,0,0,0)');c.fillStyle=g;c.globalAlpha=.6;c.fillRect(8,8,80,80);c.globalAlpha=1;
  const sp=R.spr['ball_'+cls];if(sp){c.drawImage(sp,16,14,64,64);c.globalCompositeOperation='lighter';c.globalAlpha=.35;c.drawImage(sp,16,14,64,64);c.globalCompositeOperation='source-over';c.globalAlpha=1;}
  c.strokeStyle='rgba(0,0,0,.6)';c.lineWidth=2;c.strokeRect(1,1,94,110);return portrait.cache[key]=cv.toDataURL();}
