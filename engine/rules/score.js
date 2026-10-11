/* ================= SCORE, GOLD, XP, HEALTH, THE METER ================= */
import {G, flash, float, focusBall, shake, xpNeed} from '../core/state.js';
import {fmt} from '../core/util.js';
import {interruptBoss} from './bosses.js';
import {CLASSES} from './classes.js';
import {qEvent} from './quests.js';
import {recalc} from './run.js';
import {PTS, TEXT, TUNE, USE} from '../table/content.js';
import {heroBalls} from './spells.js';
import {A} from '../ui/audio.js';
import {popup} from '../ui/ui.js';

/* ---------- score / stats ---------- */
export function score(n, x, y, label) {
  const r = G.run;
  let v = n * r.mult;
  if (G.curse.hex > 0) v *= 0.5;
  if (G.buffs.moon > 0) v *= 2;
  v = Math.round(v / 10) * 10;
  r.score += v;
  G.dirty = true;
  if (x !== undefined && v >= 1000)
    float(x, y, (label ? label + ' ' : '') + fmt(v), label ? '#ffd24a' : '#ffe9b0', v >= 20000 ? 17 : 12);
  return v;
}
export function gold(n, x, y) {
  if (n <= 0 || !USE.gold) return;
  const r = G.run,
    v = Math.ceil(n * G.mods.gold * (G.buffs.stealth > 0 ? 2 : 1));
  r.gold += v;
  G.dirty = true;
  if (x !== undefined) float(x + 10, y - 16, '+' + v + TEXT.coinMark, '#ffd24a', 12);
}
export function xp(n) {
  if (!USE.levels) return;
  const r = G.run;
  r.xp += n * G.mods.xp;
  G.dirty = true;
  while (r.xp >= xpNeed(r.level)) {
    r.xp -= xpNeed(r.level);
    r.level++;
    recalc();
    heal(20);
    r.shop = true;
    G.pending.push('book');
    popup('Level Up', 'You are now level ' + r.level, 'level');
    A.s('level');
  }
}
export function heal(n) {
  const r = G.run;
  r.hp = Math.min(G.mods.maxHp, r.hp + n);
  G.dirty = true;
}
// The ball is your life. Player health is switched off while we find whether it fits: a strike still lands (shake, sound,
// and a Death Wish still drains the meter) but nothing can make you fall.
export const PLAYER_HP = () => USE.health && G.playerHp !== false;
// health is on and tuned way down: foes hit for 30% of their old damage
export function hurt(n) {
  const r = G.run;
  if (G.fallen || !G.balls.length) return;
  G.struck = (G.struck || 0) + n;
  if (!PLAYER_HP()) {
    if (G.mods.deathWish) r.charge = Math.max(0, r.charge - G.mods.deathWish);
    G.hurtT = 0.4;
    shake(6, 'hurt');
    A.s('hurt');
    G.dirty = true;
    return;
  }
  let v = n * (G.playerHp === true ? 1 : TUNE.healthScale) * (1 - G.mods.dr);
  if (G.buffs.aegis > 0) v *= G.mods.aegisK;
  if (G.buffs.aegisK) v *= G.buffs.aegisK;
  v = Math.max(1, Math.ceil(v));
  r.hp -= v;
  if (G.mods.deathWish) r.charge = Math.max(0, r.charge - G.mods.deathWish);
  G.hurtT = 0.6;
  shake(8, 'hurt');
  A.s('hurt');
  const b = focusBall();
  if (b) float(b.x, b.y - 22, '-' + v, '#ff5a5a', 16);
  G.dirty = true;
  if (r.hp <= 0 && G.mods.martyr && !G.martyrUsed) {
    G.martyrUsed = true;
    r.hp = 40;
    G.curse = {};
    popup("Martyr's Light", 'You stand. 40 health', 'good');
    A.s('ward');
    flash(0.5, '#ffe0a0', 'martyr');
    return;
  }
  if (r.hp <= 0) {
    r.hp = 0;
    G.fallen = true;
    G.tilt = 1e9;
    G.save = 0;
    r.shield = false;
    popup('Fallen', 'Your hero collapses. The flippers go dead', 'bad');
    A.s('tilt');
  }
}
export function charge(n, src) {
  const r = G.run,
    k = CLASSES[r.cls].ch[src];
  if (!k || G.fallen || !USE.meter) return;
  const was = r.charge;
  r.charge = Math.min(100, r.charge + (k * n * G.mods.charge) / Math.max(1, heroBalls().length));
  G.dirty = true;
  if (was < 100 && r.charge >= 100) {
    A.s('ward');
    const b = focusBall();
    if (b) float(b.x, b.y - 34, CLASSES[r.cls].abil.toUpperCase() + ' READY', CLASSES[r.cls].glow, 14);
  }
}
export function major(x, y) {
  const r = G.run;
  if (G.comboT > 0) G.combo++;
  else G.combo = 1;
  G.comboT = G.mods.combo;
  if (G.combo > r.stat.bestCombo) r.stat.bestCombo = G.combo;
  if (G.combo > 1) float(x, y - 34, G.combo + 'x COMBO', '#c9a6ff', 15);
  charge(G.combo > 1 ? 1.6 : 1, 'shot');
}
export function shot(id, x, y) {
  (G.tally || (G.tally = {}))[id] = (G.tally[id] || 0) + 1;
  G.qxy = x === undefined ? null : {x, y};
  qEvent('shot', id);
  G.qxy = null;
  const bo = G.boss;
  if (bo && bo.alive && bo.phase === 'cast' && bo.def.cast.shots.includes(id)) interruptBoss(bo);
}
export function jackpot(x, y) {
  const m = G.mb;
  if (!m) return;
  score(m.jackpot * G.mods.jackpot, x, y, 'JACKPOT');
  m.jackpot = Math.min(PTS.jackpotMax, m.jackpot + PTS.jackpotStep);
  G.run.stat.jackpots++;
  A.s('jackpot');
  flash(0.35, '#ffd24a', 'jackpot');
}
