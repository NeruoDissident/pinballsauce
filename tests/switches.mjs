/* The switches check: nothing is core. Take a table, turn each of its game systems off in turn, and play it.

     node tests/switches.mjs [minutes=3] [--table gravebound]

   For every system the table has on (classes, levels, health, party, cards, gold, foes, bosses, quests, side, grave),
   the table is loaded with that one system switched off (`uses:{name:false}`), every menu is opened, and a bot plays
   it for the given minutes of game time, drawing a frame and the HUD every minute. Last, it is loaded with every
   system off at once: that is the plain table. The table's own files are not changed; the test hands the page a
   main.js that sets `uses` before booting.
   It checks that nothing throws, that no ball ends up at a non-number position, and that the run can end (the last
   ball is left to drain and the summary screen is drawn). It does not judge whether the table is
   still a good table without the system: a Gravebound with no quests has nothing to do. Exits 1 if anything threw. */
import {chromium} from 'playwright';
import path from 'path';
import {fileURLToPath} from 'url';
import {serve, local} from './serve.mjs';
import {init} from './scenarios.mjs';
const here = path.dirname(fileURLToPath(import.meta.url)),
  args = process.argv.slice(2),
  ti = args.indexOf('--table'),
  table = ti < 0 ? 'gravebound' : args[ti + 1],
  mins = +(args.find(a => /^\d+(\.\d+)?$/.test(a)) || 3);
const KEYS = ['classes', 'levels', 'health', 'party', 'cards', 'gold', 'foes', 'bosses', 'quests', 'side', 'grave'];

const play = mins => {
  const P = window.__pb.api,
    G = P.G,
    err = [];
  let bad = 0,
    runs = 0,
    overs = 0,
    ended = false,
    drawMs = 0;
  try {
    P.hold(true);
    P.setQuality('low', true);
    for (const m of ['title', 'scores', 'options', 'controls', 'help', 'title']) P.UI.menu(m);
    const t0 = performance.now();
    P.draw(1);
    drawMs = performance.now() - t0;
    G.opt.autoPick = true;
    const cls = P.uses.classes ? 'knight' : 'plain',
      begin = () => {
        P.UI.menu(null);
        P.startRun(cls, P.uses.party ? 'tank' : null);
        G.auto = true;
        P.DEV.on = true;
        G.bot = {hl: 0, hr: 0, tl: 30, tr: 30, pl: 0, plT: 0.7};
        runs++;
      };
    begin();
    const NM = P.fields.length,
      n = Math.round(mins * 60 * 120);
    let drops = 0,
      paused = false;
    for (let i = 0; i < n; i++) {
      if (i % 180 === 0 && G.mode === 'over') {
        overs++;
        P.draw(1); // the summary screen
        begin();
      }
      if (i > 0 && i % (40 * 120) === 0 && G.mode === 'play' && !G.sub && !G.choice && !G.inGrave)
        P.devKey('d' + (1 + (drops++ % NM)));
      if (G.choice) P.choose(0);
      P.gameStep(1 / 120);
      if (i % (60 * 120) === 0) P.draw(1);
      if (!paused && i > n / 2 && G.mode === 'play' && !G.choice) {
        paused = true; // the pause screen, with the hero sheet and the journal as this table has them
        P.UI.menu('pause');
        P.draw(1);
        P.UI.menu('resume');
      }
      for (const b of G.balls)
        if (!(b.x === b.x && b.y === b.y)) {
          bad++;
          b.x = 320;
          b.y = 100;
          b.vx = b.vy = 0;
        }
    }
    // end the run: last ball, nobody on the flippers. Then draw the summary screen
    if (G.mode === 'play') {
      G.auto = false;
      G.bot = null;
      P.setFlip(-1, false); // let go of the flippers: the bot may have been holding a ball on one
      P.setFlip(1, false);
      G.in.n = false;
      G.run.ballsLeft = 1;
      for (let i = 0; i < 120 * 240 && G.mode !== 'over'; i++) {
        G.save = 0;
        if (G.choice) P.choose(0);
        P.gameStep(1 / 120);
      }
    }
    ended = G.mode === 'over';
    if (ended) P.draw(1);
  } catch (e) {
    err.push(e.message + ' | ' + (e.stack || '').split('\n').slice(1, 4).join(' | '));
  }
  return {err, bad, runs, overs, ended, drawMs, score: G.run ? G.run.score : 0, uses: Object.assign({}, P.uses)};
};

const srv = await serve(path.join(here, '..'));
const url = srv.url + '/tables/' + table + '/index.html';
const br = await chromium.launch({
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist']
});
const load = async (off, seed, m) => {
  const cx = await br.newContext({viewport: {width: 480, height: 320}}),
    pg = await cx.newPage(),
    logs = [];
  pg.on('pageerror', e =>
    logs.push('PAGE ERROR ' + e.message + ' ' + (e.stack || '').split('\n').slice(1, 4).join(' | '))
  );
  await local(pg, table, off && {uses: Object.fromEntries(off.map(k => [k, false]))});
  await pg.addInitScript(init, seed);
  let r = null;
  try {
    await pg.goto(url);
    await pg.waitForFunction(() => window.__pb && window.__pb.ready(), null, {timeout: 180000, polling: 300});
    r = await pg.evaluate(play, m);
    logs.push(...r.err);
  } catch (e) {
    logs.push('did not load: ' + e.message.split('\n')[0]);
  }
  await cx.close();
  return {r, logs};
};

console.log('\n' + table + ': each game system off in turn, ' + mins + ' min of bot play each\n');
const base = await load(null, 9100, 0.2);
if (!base.r || base.logs.length) {
  console.log('The table does not run as it is.\n' + base.logs.join('\n'));
  await br.close();
  srv.server.close();
  process.exit(1);
}
const on = KEYS.filter(k => base.r.uses[k]);
console.log(
  'on as shipped: ' + (on.join(', ') || 'none') + '   (a frame takes ' + Math.round(base.r.drawMs) + ' ms here)\n'
);
let fail = 0;
const variants = on.map(k => [k]);
if (on.length > 1) variants.push(on);
for (let i = 0; i < variants.length; i++) {
  const off = variants[i],
    name = off.length > 1 ? 'everything off' : 'no ' + off[0],
    {r, logs} = await load(off, 9100 + i * 37, mins);
  const still = r ? KEYS.filter(k => r.uses[k]) : [],
    ok = !logs.length && r && !r.bad && r.ended && off.every(k => !r.uses[k]);
  if (!ok) fail++;
  console.log(
    (ok ? 'OK    ' : 'FAIL  ') +
      name.padEnd(16) +
      (r
        ? r.runs +
          ' run' +
          (r.runs > 1 ? 's' : '') +
          ', ' +
          (r.ended ? 'ended, ' : 'DID NOT END, ') +
          'score ' +
          r.score +
          (off.length === 1
            ? '   (also off with it: ' +
              (on.filter(k => !still.includes(k) && k !== off[0]).join(', ') || 'nothing') +
              ')'
            : '')
        : '') +
      (r && r.bad ? '   ' + r.bad + ' balls at a non-number position' : '')
  );
  for (const l of logs.slice(0, 4)) console.log('        ' + l);
}
await br.close();
srv.server.close();
console.log(
  '\n' +
    (fail
      ? 'FAILED: ' + fail + ' of ' + variants.length + ' did not run clean.'
      : 'Every system can be switched off and the table still loads, plays and ends a run.')
);
process.exit(fail ? 1 : 0);
