/* ================= LAMPS =================
   Which shot inserts are lit, in what colour and state. Recomputed from the game state by relight(); the renderer
   only reads G.lit and G.lampS. */
import {G,T} from '../core/state.js';
import {qCur,quests} from './quests.js';
import {SLOTS_ORDER,spellOf,spellOn,spellRank} from './spells.js';
import {wingOfTier} from './wings.js';
import {BOSSES,DEF,RULES,WINGS} from '../table/content.js';
import {GT,NM} from '../table/layout.js';

/* Every insert has a state as well as a colour. flash: do this now (a quest step, a boss spell, a jackpot).
   lit: worth shooting, available (the way to the quest's level, a lit lock, a spell goal, a boon waiting).
   done: collected and still showing it (a running spell's goals, a used boon, lock 1 of 2). */
export const LAMP_RANK={done:1,lit:2,flash:3};
export function relight(){const L={},S={},add=(id,c,st)=>{(L[id]||(L[id]=[])).push(c);st=st||'flash';if(!S[id]||LAMP_RANK[st]>LAMP_RANK[S[id]])S[id]=st;},r=G.run;G.lit=L;G.lampS=S;if(!r)return;G.dirty=true;const ft0=G.focusTier;
  if(G.inGrave){add('rise',T.banks.nails.segs.some(x=>x.on)?'main':'gold');return;}
  if(G.focusTier>GT){const tw=wingOfTier(G.focusTier);if(!tw.seal[0].on)add(tw.goal,'gold');else if(WINGS[tw.key].lamps)WINGS[tw.key].lamps.forEach(id=>add(id,'main'));return;}
  if(ft0<NM&&r.book)for(const sl of SLOTS_ORDER){const d=spellOf(r.cls,sl);if(!d||spellRank(d.id)<0)continue;const g=(r.goal||{})[sl]||0,st=spellOn(d.id)?'done':'lit';
    if(sl==='breaker')for(const id in T.banks)if(T.banks[id].tier===ft0&&T.shots[id])add(id,'spell',st);
    if(sl==='striker')for(const id in T.rails)if(T.rails[id].from===ft0)add(id,'spell',st);
    if(sl==='pressure'){add('orbitL'+ft0,'spell',st);add('orbitR'+ft0,'spell',st);for(const q of T.sens)if(q.kind==='spin'&&T.shots[q.id]&&T.shots[q.id].tier===ft0)add(q.id,'spell',st);}
    if(sl==='guard'&&(g>=3||st==='done'))for(const id in T.holes)if(T.holes[id].tier===ft0)add(id,'spell',st);}
  const ft=G.focusTier,ways=DEF.content.ways||{},way=(tier,c)=>{if(ft>tier)((ways.up||{})[ft]||[]).forEach(id=>add(id,c,'lit'));else if(ft<tier)((ways.down||{})[ft]||[]).forEach(id=>add(id,c,'lit'));};
  for(const q of quests()){const o=qCur(q);if(!o)continue;const c=q.main?'main':'side';
    if(o.id==='wing'){const gt=T.holes[WINGS[r.wing.key].gate].tier;if(ft===gt)add(WINGS[r.wing.key].gate,c);else way(gt,c);}
    else if(o.t==='shot'||o.t==='done'){add(o.id,c);const s=T.shots[o.id];if(s)way(s.tier,c);}
    else if(o.t==='boss')way(BOSSES[o.boss].tier,c);else way(o.tier,c);}
  if(RULES.lamps)RULES.lamps(add,r); // the table's own features
  if(G.pending.length)for(const id in T.holes)if(T.holes[id].tier===ft0&&ft0<NM)add(id,'gold','lit');
  const bo=G.boss;if(bo&&bo.alive&&bo.phase==='cast')bo.def.cast.shots.forEach(id=>add(id,'danger'));
  if(G.mb)for(const id in T.rails)add(id,'gold');}
