/* The soak test for a table's LAYOUT: the bot plays every field for a while and the engine reports where balls got
   stuck, which shots were never made, and whether anything threw.

     node tests/soak.mjs [minutes=8] [--table neon-descent] [--seeds 4]

   Every run uses a fixed seed, so a finding can be reproduced. Every 45 s of game time the ball is dropped on the
   next field in turn, so the upper fields get as much play as the bottom one.
   Read the report like this:
     STUCK   a ball that stopped moving and had to be shaken loose (the engine does that by itself in play). One or
             two in a long soak is normal on any table; the same spot again and again is a pocket in the layout.
             Look at it in inspect mode: tables/<id>/index.html?inspect, then pan to the x, y printed.
     NEVER   a shot the bot never made. The bot only flips, it does not aim, so a NEVER is a hint, not a verdict:
             check the shot is open from a flipper in inspect mode.
     FAIL    a ramp entered too slowly to be climbed. Some is normal; a ramp that fails far more than it is made
             is too long or too steep (give it a smaller k in the layout).
   Exits 1 on a page error, a ball at a non-number position, or a pocket (the same 24-unit cell 4 times or more). */
import {chromium} from 'playwright';
import path from 'path';
import {fileURLToPath} from 'url';
import {serve} from './serve.mjs';
import {init} from './scenarios.mjs';
const here = path.dirname(fileURLToPath(import.meta.url)),
  args = process.argv.slice(2);
const opt = n => {
  const i = args.indexOf('--' + n);
  return i < 0 ? null : args[i + 1];
};
const mins = +(args.find(a => /^\d+(\.\d+)?$/.test(a)) || 8),
  table = opt('table') || 'gravebound',
  nSeeds = +(opt('seeds') || 4);
const srv = await serve(path.join(here, '..'));
const url = srv.url + '/tables/' + table + '/index.html';
const br = await chromium.launch({
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist']
});
const play = ([cls, comp, seed, mins]) => {
  const P = window.__pb.api,
    G = P.G,
    T = P.T;
  P.hold(true);
  P.setQuality('low', true);
  window.__rng.seed(seed);
  G.opt.endless = true;
  G.opt.autoPick = true;
  const bot = () => ({hl: 0, hr: 0, tl: 30, tr: 30, pl: 0, plT: 0.7});
  const begin = () => {
    P.UI.menu(null);
    P.startRun(cls, comp);
    G.auto = true;
    P.DEV.on = true;
    G.bot = bot();
  };
  begin();
  G.stuck = [];
  G.tally = {};
  const nm = T.shooter ? Object.values(T.shots).reduce((a, s) => Math.max(a, s.tier), 0) : 0,
    fields = [];
  for (const id in T.shots) {
    const s = T.shots[id];
    if (!fields.includes(s.tier)) fields.push(s.tier);
  }
  const NM = P.fields.length,
    time = new Array(NM + 2).fill(0),
    err = [];
  let bad = 0,
    runs = 1,
    drops = 0;
  const n = Math.round(mins * 60 * 120);
  try {
    for (let i = 0; i < n; i++) {
      if (i % 180 === 0 && G.mode === 'over') {
        begin();
        runs++;
      }
      if (i > 0 && i % (45 * 120) === 0 && G.mode === 'play' && !G.sub && !G.choice && !G.inGrave) {
        P.devKey('d' + (1 + (drops++ % NM)));
      }
      if (G.choice) P.choose(0);
      P.gameStep(1 / 120);
      time[Math.min(NM + 1, G.focusTier)]++;
      for (const b of G.balls)
        if (!(b.x === b.x && b.y === b.y)) {
          bad++;
          b.x = 320;
          b.y = 100;
          b.vx = b.vy = 0;
        }
    }
  } catch (e) {
    err.push(e.message + ' | ' + (e.stack || '').split('\n').slice(1, 4).join(' | '));
  }
  return {
    stuck: G.stuck,
    tally: G.tally,
    time,
    err,
    bad,
    runs,
    score: G.run.score,
    NM,
    shots: Object.values(T.shots).map(s => ({id: s.id, tier: s.tier})),
    rails: Object.keys(T.rails).filter(id => !T.rails[id].drain),
    chutes: Object.keys(T.rails).filter(id => T.rails[id].drain),
    fields: P.fields,
    holes: Object.keys(T.holes),
    banks: Object.keys(T.banks)
  };
};
const CL = [
    ['knight', 'tank'],
    ['rogue', 'dps'],
    ['mage', 'healer'],
    ['cleric', null]
  ],
  stuck = [],
  tally = {},
  logs = [];
let time = null,
  bad = 0,
  meta = null,
  runs = 0;
for (let k = 0; k < nSeeds; k++) {
  const cx = await br.newContext({viewport: {width: 640, height: 400}}),
    pg = await cx.newPage(),
    t0 = Date.now();
  pg.on('pageerror', e =>
    logs.push('PAGE ERROR ' + e.message + ' ' + (e.stack || '').split('\n').slice(1, 4).join(' | '))
  );
  await pg.route('**/*', r => (/^http:\/\/127\.0\.0\.1/.test(r.request().url()) ? r.continue() : r.abort()));
  await pg.addInitScript(init, 7000 + k * 131);
  await pg.goto(url);
  await pg.waitForFunction(() => window.__pb && window.__pb.ready(), null, {timeout: 180000, polling: 300});
  const r = await pg.evaluate(play, [CL[k % 4][0], CL[k % 4][1], 7000 + k * 131, mins]);
  await cx.close();
  stuck.push(...r.stuck);
  for (const id in r.tally) tally[id] = (tally[id] || 0) + r.tally[id];
  time = time ? time.map((v, i) => v + r.time[i]) : r.time;
  bad += r.bad;
  runs += r.runs;
  meta = r;
  logs.push(...r.err);
  console.log(
    'seed ' +
      (7000 + k * 131) +
      ' ' +
      CL[k % 4][0].padEnd(7) +
      mins +
      ' min, ' +
      r.runs +
      ' run' +
      (r.runs > 1 ? 's' : '') +
      ', ' +
      r.stuck.length +
      ' stuck, score ' +
      r.score +
      '  ' +
      ((Date.now() - t0) / 1000).toFixed(0) +
      's'
  );
}
await br.close();
srv.server.close();
const total = time.reduce((a, b) => a + b, 0),
  F = meta.fields,
  // the field a point of the table is in (or the one it is nearest), so a spot can be given in that field's numbers
  fieldOf = (x, y) => {
    let best = 0,
      bd = 1e18;
    F.forEach((f, i) => {
      const dx = Math.max(f.x - x, 0, x - (f.x + 640)),
        dy = Math.max(f.y - y, 0, y - (f.y + 1040)),
        d = dx * dx + dy * dy;
      if (d < bd) {
        bd = d;
        best = i;
      }
    });
    return best;
  };
console.log(
  '\nTIME BY FIELD  ' +
    time
      .map(
        (v, i) =>
          (i < meta.NM ? F[i].id : i === meta.NM ? 'grave' : 'wings') + ' ' + ((100 * v) / total).toFixed(0) + '%'
      )
      .join('   ')
);
const cells = {};
for (const s of stuck) {
  const k = Math.round(s[0] / 24) + ',' + Math.round(s[1] / 24);
  (cells[k] || (cells[k] = {n: 0, x: 0, y: 0, kinds: {}})).n++;
  cells[k].x += s[0];
  cells[k].y += s[1];
  cells[k].kinds[s[2]] = 1;
}
const list = Object.values(cells)
  .map(c => ({n: c.n, x: Math.round(c.x / c.n), y: Math.round(c.y / c.n), kind: Object.keys(c.kinds).join('/')}))
  .sort((a, b) => b.n - a.n);
console.log(
  '\nSTUCK  ' + stuck.length + ' in ' + (total / 120 / 60).toFixed(0) + ' min of play' + (list.length ? '' : '  (none)')
);
for (const c of list.slice(0, 14)) {
  const t = fieldOf(c.x, c.y);
  console.log(
    '  ' +
      F[t].id.padEnd(10) +
      ' x ' +
      String(c.x - F[t].x).padStart(4) +
      '  y ' +
      String(c.y - F[t].y).padStart(5) +
      '  (whole table ' +
      c.x +
      ', ' +
      c.y +
      ')  ' +
      c.n +
      'x  ' +
      c.kind
  );
}
const never = meta.shots.filter(s => !tally[s.id] && s.tier < meta.NM).map(s => s.id);
console.log(
  '\nSHOTS MADE   ' +
    meta.shots
      .filter((s, i, l) => s.tier < meta.NM && l.findIndex(q => q.id === s.id) === i)
      .map(s => s.id + ' ' + (tally[s.id] || 0))
      .join(', ')
);
console.log('NEVER        ' + (never.join(', ') || '(none)'));
console.log(
  'RAMPS        ' +
    meta.rails.map(id => id + ' made ' + (tally[id] || 0) + ' / failed ' + (tally['fail:' + id] || 0)).join(', ')
);
if (meta.chutes.length)
  console.log('CHUTES       ' + meta.chutes.map(id => id + ' ridden ' + (tally[id] || 0)).join(', '));
const pockets = list.filter(c => c.n >= 4);
if (logs.length) console.log('\n' + logs.slice(0, 10).join('\n'));
const fail = logs.length || bad || pockets.length;
console.log(
  fail
    ? '\nFAILED: ' +
        [
          logs.length && logs.length + ' error(s)',
          bad && bad + ' ball(s) at a non-number position',
          pockets.length && pockets.length + ' pocket(s): ' + pockets.map(c => c.x + ',' + c.y).join(' ')
        ]
          .filter(Boolean)
          .join('; ')
    : '\nPASSED: no errors, no pockets.'
);
process.exit(fail ? 1 : 0);
