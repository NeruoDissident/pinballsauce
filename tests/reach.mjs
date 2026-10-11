/* The reach test for a table's LAYOUT: which shots can each flipper actually make?

     node tests/reach.mjs [--table test-bench] [--field west] [--feel fast]

   For every flipper on every field a ball is rolled down the bat and flipped, at every timing from "far too early"
   to "far too late" and at three rolling speeds, with nothing else on the table. What the ball reaches is written
   down: the first thing it strikes or enters, and any spinner, rollover or orbit it passes through on the way.
   That is the fan of shots the flipper has. Physics only: no foes, no bot, no luck. It is a floor, not a ceiling:
   the ball always starts by rolling down the bat and the button is always held, so shots off a bounce, a held ball,
   a tap or a pass are not found. With the real flipper stroke those are half the game: a shot this test does not
   find is a question for a person at the table, not a verdict.

   Read the report like this:
     under each flipper   the shots it reaches, with how many of the trials reached each one. A shot with a
                          handful of hits out of several hundred is there, but it is a hard shot.
     NOT REACHED          a shot on that field no flipper of the field reached. It is not always a fault: a
                          lane set under the arch is fed by an orbit or the plunger, a scoop may be fed by a ramp.
                          If nothing is meant to feed it, it is a dead shot: move it, or move a flipper.
     nothing              a flipper that reaches no shot at all is standing in the wrong place.
   Exits 1 on a page error, or if a field has a flipper that reaches nothing. */
import {chromium} from 'playwright';
import path from 'path';
import {fileURLToPath} from 'url';
import {serve, local} from './serve.mjs';
import {init} from './scenarios.mjs';
const here = path.dirname(fileURLToPath(import.meta.url)),
  args = process.argv.slice(2);
const opt = n => {
  const i = args.indexOf('--' + n);
  return i < 0 ? null : args[i + 1];
};
const table = opt('table') || 'gravebound',
  only = opt('field'),
  feel = opt('feel'); // try the table on another feel preset without editing it

const run = only => {
  const P = window.__pb.api,
    G = P.G,
    T = P.T,
    F = P.fields;
  P.hold(true);
  P.setQuality('low', true);
  window.__rng.seed(1);
  P.UI.menu(null);
  P.startRun('knight', null);
  G.auto = false;
  // listen to the table through its own rule hooks
  const R = P.rules,
    keep = R.on;
  let log = null;
  const idOf = {
    bump: o => o.group,
    captive: o => o.id,
    target: o => o.bank,
    drop: o => o.bank,
    lane: o => o.set,
    spin: o => o.id,
    rampIn: o => o.id,
    hole: o => o.id,
    orbit: o => 'orbit' + (o.side < 0 ? 'L' : 'R') + o.tier
  };
  // a spinner, a rollover and an orbit let the ball carry on to what is behind them; anything else ends the shot
  const THROUGH = {spin: 1, lane: 1, orbit: 1};
  let ended = false;
  R.on = {};
  for (const k in idOf)
    R.on[k] = what => {
      const id = idOf[k](what);
      if (!log || ended || !id) return;
      if (!log.includes(id)) log.push(id);
      if (!THROUGH[k]) ended = true;
    };
  const out = [],
    err = [];
  const flips = T.flips.filter(f => f.tier < F.length && (!only || F[f.tier].id === only));
  try {
    for (const f of flips) {
      const hits = {},
        ca = Math.cos(f.rest),
        sa = Math.sin(f.rest),
        ax = f.dir * ca, // along the bat at rest, pivot to tip
        ay = sa;
      let trials = 0;
      for (const speed of [90, 220, 380])
        for (let wait = 0; wait < 0.62; wait += 0.012) {
          trials++;
          for (const g of T.flips) {
            g.on = false;
            g.a = g.rest;
            g.w = 0;
          }
          for (const id in T.banks) for (const s of T.banks[id].segs) s.on = true;
          for (const id in T.holes) T.holes[id].busy = 0;
          for (const q of T.sens) if (q.kind === 'spin') q.rate = 0; // a spinner still turning from the last flip is not a hit
          for (const id in T.rails) T.rails[id].closed = false;
          // Qualifiable shots are probed with their physical barriers open.
          for (const m of Object.values(T.mechanisms || {})) {
            if (m.leaves) {
              m.open = true;
              m.position = 1;
              m.leaves.forEach(l => {
                l.a = l.open;
                l.w = 0;
              });
            }
          }
          for (const h of Object.values(T.holes)) if ('closed' in h) h.closed = false;
          G.enemies = [];
          G.tilt = 0;
          // the ball starts a little down the bat from the pivot, resting on it, rolling toward the tip
          const b = P.newBall(
            f.x + ax * f.L * 0.15 + ay * f.dir * 20,
            f.y + ay * f.L * 0.15 - ca * 20,
            ax * speed,
            ay * speed
          );
          G.balls = [b];
          log = [];
          ended = false;
          for (let t = 0; t < 2.4 && !ended; t += 1 / 120) {
            const on = t >= wait && t < wait + 0.3;
            for (const g of T.flips) if (g.side === f.side) g.on = on;
            P.physics(1 / 120);
            if (b.st !== 'live') break; // on a ramp or in a scoop: the hook has already said which
            if (t > wait + 0.3 && b.y > f.y + 30 && b.vy > 0) break; // fell away below the flipper
          }
          for (const id of log) hits[id] = (hits[id] || 0) + 1;
        }
      out.push({
        field: F[f.tier].id,
        x: Math.round(f.x - F[f.tier].x),
        y: Math.round(f.y - F[f.tier].y),
        side: f.side,
        L: f.L,
        trials,
        hits
      });
    }
  } catch (e) {
    err.push(e.message + ' | ' + (e.stack || '').split('\n').slice(1, 4).join(' | '));
  }
  log = null;
  R.on = keep;
  const shots = [];
  for (const id in T.shots) {
    const s = T.shots[id];
    if (s.tier < F.length && s.id === id) shots.push({id, field: F[s.tier].id});
  }
  return {out, err, shots, fields: F.map(f => f.id)};
};

const srv = await serve(path.join(here, '..'));
const br = await chromium.launch({
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist']
});
const pg = await (await br.newContext({viewport: {width: 640, height: 400}})).newPage(),
  logs = [];
pg.on('pageerror', e =>
  logs.push('PAGE ERROR ' + e.message + ' ' + (e.stack || '').split('\n').slice(1, 4).join(' | '))
);
await local(pg, table, feel && {feel});
await pg.addInitScript(init, 4242);
await pg.goto(srv.url + '/tables/' + table + '/index.html');
let r;
try {
  await pg.waitForFunction(() => window.__pb && window.__pb.ready(), null, {timeout: 180000, polling: 300});
  r = await pg.evaluate(run, only);
} catch (e) {
  console.log('The table did not load.\n' + logs.join('\n') + '\n' + e.message);
  await br.close();
  srv.server.close();
  process.exit(1);
}
await br.close();
srv.server.close();
logs.push(...r.err);

const SIZE = L => (L === 58 ? 'mini' : L === 82 ? 'standard' : L === 92 ? 'long' : L + ' long');
let idle = 0;
for (const fid of r.fields) {
  const fl = r.out.filter(o => o.field === fid);
  if (!fl.length) continue;
  console.log('\n' + fid.toUpperCase());
  const got = new Set();
  for (const o of fl) {
    const list = Object.keys(o.hits).sort((a, b) => o.hits[b] - o.hits[a]);
    list.forEach(id => got.add(id));
    if (!list.length) idle++;
    console.log(
      '  ' +
        (o.side < 0 ? 'left ' : 'right') +
        ' flipper at (' +
        o.x +
        ', ' +
        o.y +
        '), ' +
        SIZE(o.L) +
        ':  ' +
        (list.map(id => id + ' ' + o.hits[id]).join(', ') || 'nothing') +
        '   (of ' +
        o.trials +
        ' flips)'
    );
  }
  const miss = r.shots.filter(s => s.field === fid && !got.has(s.id)).map(s => s.id);
  console.log('  NOT REACHED from a flipper: ' + (miss.join(', ') || '(none)'));
}
if (logs.length) console.log('\n' + logs.slice(0, 10).join('\n'));
const fail = logs.length || idle;
console.log(
  fail
    ? '\nFAILED: ' +
        [logs.length && logs.length + ' error(s)', idle && idle + ' flipper(s) that reach no shot']
          .filter(Boolean)
          .join(', ')
    : '\nPASSED: every flipper reaches a shot.'
);
process.exit(fail ? 1 : 0);
