/* ================= HELP TEXT FROM THE TABLE =================
   The shot glossary and the "what is that?" lines are generated from the built table, so they stay true. */
import {T} from '../core/state.js';
import {ENEMY, TEXT} from '../table/content.js';
import {CX, LEVEL_NAMES, NM, TY} from '../table/layout.js';

export function whereOnTable(x, y, tier) {
  const cx = CX[tier],
    dy = y - TY[tier],
    side = x < cx - 70 ? 'left' : x > cx + 70 ? 'right' : 'centre',
    up = dy < 380 ? 'top' : dy < 560 ? 'middle' : 'bottom';
  return up + ' ' + side + ' of ' + LEVEL_NAMES[tier];
}
// one line for a named shot: what it is, where it is, and what counts
export function explainShot(id) {
  const s = T.shots[id];
  if (!s) return null;
  const h = T.holes[id],
    r = T.rails[id],
    B = T.banks[id],
    bump = T.bumps.filter(b => b.group === id),
    spin = T.sens.find(q => q.kind === 'spin' && q.id === id),
    orbit = /^orbit/.test(id),
    set = T.sets && T.sets[id],
    where = whereOnTable(s.x, s.y, s.tier);
  let what;
  if (h) what = 'a scoop at the ' + where + '. The ball drops in, pays out and is kicked back';
  else if (r)
    what =
      'a ramp, entered at the ' +
      where +
      (r.to !== r.from ? ', climbing to ' + LEVEL_NAMES[r.to] : '') +
      '. It counts when the ball makes it all the way round';
  else if (B)
    what =
      (B.kind === 'drop'
        ? 'a bank of ' + B.segs.length + ' drop targets'
        : 'a bank of ' + B.segs.length + ' standup targets') +
      ' at the ' +
      where +
      '. ' +
      (B.kind === 'drop' ? 'Knock them all down to complete it' : 'Light them all to complete it');
  else if (bump.length)
    what = bump.length + ' bumper' + (bump.length > 1 ? 's' : '') + ' at the ' + where + '. Every hit counts';
  else if (spin) what = 'a spinner at the ' + where + '. Every turn counts, so hit it hard';
  else if (orbit)
    what = 'the loop around the outside of ' + LEVEL_NAMES[s.tier] + ', entered at the ' + where + '. Shoot up into it';
  else if (set) what = 'the three rollover lanes at the ' + where + '. Roll all three';
  else what = 'a shot at the ' + where;
  return s.name + ' is ' + what + '.';
}
export function explainStep(o) {
  if (!o) return '';
  const id = o.id;
  if (o.t === 'kill')
    return (
      (ENEMY[o.e] ? ENEMY[o.e].name + 's' : o.e) +
      ' on ' +
      LEVEL_NAMES[o.tier] +
      '. They come in waves; the quest counts your kills there.'
    );
  if (o.t === 'boss')
    return (
      'Find the boss on ' +
      LEVEL_NAMES[o.tier === undefined ? 0 : o.tier] +
      ' and beat it. Break its wards and its spells as it tells you.'
    );
  if (o.t === 'collect') return 'Something is lying on ' + LEVEL_NAMES[o.tier] + '. Roll over it to pick it up.';
  if (TEXT.explain && TEXT.explain[id]) return TEXT.explain[id];
  if (/^orbit[LR]\d+$/.test(id)) return explainShot(id);
  const e = explainShot(id);
  if (e) return e;
  if (T.banks[id]) {
    const B = T.banks[id];
    return B.name + ' is a bank of ' + B.segs.length + ' targets on ' + LEVEL_NAMES[B.tier] + '.';
  }
  return '';
}
export function glossary() {
  const out = [];
  for (let t = 0; t < NM; t++) {
    const rows = [];
    for (const id in T.shots) {
      const s = T.shots[id];
      if (s.tier !== t || /^orbitR/.test(id)) continue;
      const e = explainShot(id);
      if (e && !rows.some(r => r[0] === s.name)) rows.push([s.name, e]);
    }
    out.push([LEVEL_NAMES[t], rows]);
  }
  return out;
}
