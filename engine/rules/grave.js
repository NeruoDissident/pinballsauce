/* ================= THE GRAVE =================
   Every table has one. Hitting the bumpers marked opensGrave opens it; an open Grave always takes the next lost
   ball, tilted or not. The room itself is built in table/build.js. */
import {G, T, float} from '../core/state.js';
import {relight} from './lamps.js';
import {heroBalls} from './spells.js';
import {catmull, resample} from '../table/geometry.js';
import {TEXT, TUNE, USE} from '../table/content.js';
import {GY} from '../table/layout.js';
import {A} from '../ui/audio.js';
import {popup} from '../ui/ui.js';

/* ---------- the Grave ---------- */
export function graveHit(o) {
  const r = G.run,
    g = r.grave;
  if (!USE.grave || g.open || G.inGrave) return;
  g.hits = Math.min(g.need, g.hits + (r.cls === 'cleric' ? 2 : 1));
  G.dirty = true;
  if (g.hits >= g.need) {
    g.open = true;
    popup(TEXT.graveOpen[0], TEXT.graveOpen[1], 'good');
    A.s('summon');
    G.flash = 0.4;
    G.flashC = '#7dffb0';
  } else if (g.hits % 3 === 0 || g.need - g.hits <= 2)
    float(o.x, o.y - 34, TEXT.graveCount + ' ' + g.hits + '/' + g.need, '#9dffc8', 12);
}
export function graveCatch(b) {
  if (!USE.grave) return false;
  const r = G.run,
    g = r.grave,
    ok = !G.fallen && G.tilt <= 0; // an open Grave always takes the ball, tilted or fallen or not
  if (!g.open || heroBalls().length > 1 || G.plunge.auto > 0 || (ok && (G.save > 0 || r.shield))) return false;
  g.open = false;
  g.used++;
  g.hits = 0;
  g.need = TUNE.graveHits + TUNE.graveHitsStep * g.used;
  G.inGrave = true;
  G.graveLive = false;
  G.graveT = TUNE.graveTime;
  G.graveBones = 0;
  G.tilt = 0;
  G.mb = null;
  G.nudges = [];
  if (G.fallen) {
    G.fallen = false;
    r.hp = Math.round(G.mods.maxHp * 0.25);
  }
  T.banks.nails.segs.forEach(s => {
    s.on = true;
  });
  T.banks.nails.reset = 0;
  b.arm = 0;
  b.pow = null;
  b.cr = 0;
  b.tun = Object.assign(
    resample(
      catmull(
        [
          [b.x, b.y],
          [b.x, GY - 40],
          [T.graveIn.x, GY + 150],
          [T.graveIn.x, T.graveIn.y]
        ],
        12
      ),
      6
    ),
    {grave: true}
  );
  b.st = 'tunnel';
  b.rs = 0;
  b.vx = b.vy = 0;
  popup(TEXT.graveIn[0], TEXT.graveIn[1], 'boss');
  A.s('boss');
  G.flash = 0.6;
  G.flashC = '#0a2a14';
  relight();
  G.dirty = true;
  return true;
}
