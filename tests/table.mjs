/* Layout test: build the table from its data and compare every wall, flipper, bumper, sensor, scoop, bank, ramp,
   tunnel and insert with a recording, number for number.

     node tests/table.mjs [--table gravebound] [--record]

   Gravebound's recording (tests/golden/gravebound.table.json) was taken from the original Gravebound 0.21, where the
   table was hand-written code. Passing means tables/gravebound/layout.js still builds that exact table.
   After you change a layout ON PURPOSE, run with --record. */
import {chromium} from 'playwright';
import fs from 'fs';
import path from 'path';
import {fileURLToPath} from 'url';
import {serve} from './serve.mjs';
import {init} from './scenarios.mjs';
const here = path.dirname(fileURLToPath(import.meta.url)),
  args = process.argv.slice(2),
  ti = args.indexOf('--table'),
  table = ti < 0 ? 'gravebound' : args[ti + 1],
  record = args.includes('--record');
const gfile = path.join(here, 'golden', table + '.table.json');
// runs in the page: the built table as plain, comparable data
export const dump = () => {
  const P = window.__pb.api,
    T_ = P.T,
    G_ = P.G;
  const segId = new Map();
  T_.segs.forEach((s, i) => segId.set(s, i));
  const sensId = new Map();
  T_.sens.forEach((s, i) => sensId.set(s, i));
  const N = v => (typeof v === 'number' ? (Number.isFinite(v) ? v : String(v)) : v);
  const plain = (o, skip) => {
    const r = {};
    for (const k of Object.keys(o).sort()) {
      if (k === 'src' || (skip && skip.includes(k))) continue;
      const v = o[k];
      if (v === undefined) continue;
      if (v === null || typeof v !== 'object') r[k] = N(v);
      else if (Array.isArray(v)) r[k] = JSON.parse(JSON.stringify(v));
      else r[k] = '[obj]';
    }
    return r;
  };
  const out = {};
  out.segs = T_.segs.map(s => plain(s));
  out.grid = T_.grid.map(row => row.map(s => segId.get(s)));
  out.flips = T_.flips.map(f => plain(f));
  out.bumps = T_.bumps.map(b => plain(b, ['poss', 'conduit', 'opensGrave']));
  out.sens = T_.sens.map(s => plain(s, ['calls']));
  out.holes = Object.keys(T_.holes).map(k => plain(T_.holes[k], ['wingGoal', 'wingIn']));
  out.rails = Object.keys(T_.rails).map(k => {
    const r = T_.rails[k];
    return Object.assign(plain(r, ['x', 'y', 'h3']), {x: r.x.slice(), y: r.y.slice()});
  });
  out.mouths = T_.mouths.map(m => plain(m));
  out.shots = Object.keys(T_.shots).map(k => Object.assign({key: k}, plain(T_.shots[k])));
  out.banks = Object.keys(T_.banks).map(k => {
    const B = T_.banks[k];
    return Object.assign(plain(B, ['segs', 'door', 'doorTime', 'doorPopup', 'wing']), {
      segs: B.segs.map(s => segId.get(s))
    });
  });
  out.sets = Object.keys(T_.sets).map(k => {
    const B = T_.sets[k];
    return Object.assign(plain(B, ['lanes', 'skill', 'ballReset', 'col']), {lanes: B.lanes.map(s => sensId.get(s))});
  });
  out.slings = T_.slings.map(s => ({A: s.A, B: s.B, C: s.C, s: segId.get(s.s), tier: s.tier, side: s.side}));
  out.spawn = JSON.parse(JSON.stringify(T_.spawn));
  out.torches = T_.torches.map(t => plain(t, ['ph']));
  out.wallPaths = T_.wallPaths.map(w => ({pts: w.pts, style: w.style, w: w.w}));
  out.blocks = T_.blocks.map(b => plain(b));
  out.chans = JSON.parse(JSON.stringify(T_.chans));
  out.bossSpot = JSON.parse(JSON.stringify(T_.bossSpot));
  out.statueSpot = JSON.parse(JSON.stringify(T_.statueSpot));
  out.tunnels = Object.keys(T_.tunnels).map(k => {
    const t = T_.tunnels[k];
    return Object.assign({key: k}, plain(t, ['x', 'y']), {x: t.x.slice(), y: t.y.slice()});
  });
  out.wings = Object.keys(T_.wings).map(k => {
    const w = T_.wings[k];
    return {
      key: w.key,
      tier: w.tier,
      y: w.y,
      outline: w.outline,
      goal: w.goal,
      inHole: w.inHole,
      seal: w.seal.map(s => segId.get(s)),
      coins: w.coins || null
    };
  });
  out.coffin = T_.coffin;
  out.graveIn = T_.graveIn;
  out.shooter = T_.shooter;
  out.statues = G_.statues.map(s => plain(s));
  // what only newer layouts have is recorded only where it is used, so older recordings stay as they are
  if (T_.lamps.length) out.lamps = T_.lamps.map(l => plain(l));
  if (T_.drains.some(Boolean)) out.drains = P.fields.map((f, i) => (T_.drains[i] ? T_.drains[i].id : null));
  if (P.fields.some(f => f.x !== 0)) out.place = P.fields;
  return JSON.stringify(out);
};
export const digest = json => {
  const d = JSON.parse(json),
    o = {};
  const fnv = s => {
    let h1 = 0x811c9dc5,
      h2 = 0x1b873593;
    for (let i = 0; i < s.length; i++) {
      const c = s.charCodeAt(i);
      h1 = Math.imul(h1 ^ c, 16777619);
      h2 = (Math.imul(h2 ^ c, 0x85ebca6b) + c) | 0;
    }
    return (h1 >>> 0).toString(16) + (h2 >>> 0).toString(16);
  };
  for (const k of Object.keys(d).sort())
    o[k] = {n: Array.isArray(d[k]) ? d[k].length : 1, hash: fnv(JSON.stringify(d[k]))};
  return o;
};
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const srv = await serve(path.join(here, '..'));
  const br = await chromium.launch({
    args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist']
  });
  const pg = await (await br.newContext({viewport: {width: 640, height: 400}})).newPage();
  const logs = [];
  pg.on('pageerror', e => logs.push('PAGE ERROR ' + e.message));
  await pg.route('**/*', r => (/^http:\/\/127\.0\.0\.1/.test(r.request().url()) ? r.continue() : r.abort()));
  await pg.addInitScript(init, 1);
  await pg.goto(srv.url + '/tables/' + table + '/index.html');
  let got;
  try {
    await pg.waitForFunction(() => window.__pb && window.__pb.ready(), null, {timeout: 120000, polling: 300});
    got = digest(await pg.evaluate(dump));
  } catch (e) {
    console.log('The table did not load.\n' + logs.join('\n'));
    await br.close();
    srv.server.close();
    process.exit(1);
  }
  await br.close();
  srv.server.close();
  if (record) {
    fs.writeFileSync(gfile, JSON.stringify({table, sections: got}, null, 1));
    console.log('wrote ' + gfile);
    process.exit(0);
  }
  if (!fs.existsSync(gfile)) {
    console.log('no recording at ' + gfile + ' (make one with --record)');
    process.exit(1);
  }
  const want = JSON.parse(fs.readFileSync(gfile, 'utf8')).sections;
  let bad = 0;
  for (const k of Object.keys(want)) {
    const a = want[k],
      b = got[k];
    if (!b || a.hash !== b.hash) {
      bad++;
      console.log('DIFFERS  ' + k.padEnd(11) + (b ? 'count ' + a.n + ' -> ' + b.n : 'missing'));
    }
  }
  console.log(
    bad
      ? 'FAILED: ' + table + ' no longer builds the recorded table (' + bad + ' sections differ).'
      : 'PASSED: ' +
          table +
          ' builds the recorded table exactly (' +
          Object.keys(want).length +
          ' sections, ' +
          want.segs.n +
          ' wall segments).'
  );
  process.exit(bad ? 1 : 0);
}
