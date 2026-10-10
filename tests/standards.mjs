/* The standards check: does a table do what docs/PINBALL.md says a table does?

     node tests/standards.mjs [--table starfall] [--feel fast]

   It reads the built table and plays some launches, and prints one line for each standard: OK, or NOTE with what is
   missing. These are guidelines, so a NOTE does not fail anything: it is there so nobody has to remember to ask.
   What it looks at:
     launch     plunge the ball at every strength with nobody on the flippers: how often does it reach a flipper
                before it drains? (PINBALL.md, "A fair launch": 9 in 10)
     goal lights   does every goal that names a shot have a light at that shot?
     shot lights   does every ramp, scoop, bank, spinner, lane set and bumper group have a light?
     state lamps   is the multiplier on the playfield? the ball save? the kickback? the lock?
     the gap    how wide is the gap between the tips of each playfield's main flippers, in balls?
     roads      can every playfield be reached from the home one, and can the ball get on from each?
   Exits 1 only if the page throws. */
import {chromium} from 'playwright';
import path from 'path';
import {fileURLToPath} from 'url';
import {serve, local} from './serve.mjs';
import {init} from './scenarios.mjs';
const here = path.dirname(fileURLToPath(import.meta.url)),
  args = process.argv.slice(2),
  ti = args.indexOf('--table'),
  table = ti < 0 ? 'gravebound' : args[ti + 1],
  fi = args.indexOf('--feel'),
  feel = fi < 0 ? null : args[fi + 1]; // try the table on another feel preset without editing it

const run = async () => {
  const P = window.__pb.api,
    G = P.G,
    T = P.T,
    F = P.fields,
    def = P.def,
    home = F[F.length - 1],
    out = {};
  const L = await import('/engine/rules/lamps.js');
  P.hold(true);
  P.setQuality('low', true);
  G.opt.autoPick = true;

  // ---- launch: 48 strengths from a tap to a full pull, nobody on the flippers
  let reached = 0,
    n = 0;
  const lost = [];
  for (let seed = 1; seed <= 1; seed++)
    for (let k = 0; k < 48; k++) {
      window.__rng.seed(100 + k);
      P.UI.menu(null);
      P.startRun('knight', null);
      G.auto = false;
      G.bot = null;
      const hold = 0.04 + k * 0.018; // 0.04 s to 0.89 s on the plunger (full strength is 0.85 s)
      let t = 0,
        b = null,
        res = null,
        out = false; // has the ball left the plunger lane?
      let gone = false; // has the plunger let go of it?
      for (let i = 0; i < 120 * 14 && !res; i++) {
        if (G.choice) P.choose(0);
        if (!gone && G.plunge.ready) {
          if (!b) b = G.balls.find(q => q.st === 'live' && q.x > T.shooter.x - 17);
          t += 1 / 120;
          G.in.n = t < hold;
        }
        P.gameStep(1 / 120);
        if (!b) continue;
        if (!gone) {
          gone = t >= hold && !G.plunge.ready;
          continue;
        }
        if (b.x < T.shooter.x - 30) out = true;
        if (b.onFlip > 0) res = 'flipper';
        else if (b.gone || !G.balls.includes(b) || b.y > home.y + 1080) res = 'drain';
        else if (G.plunge.ready) res = out ? 'drain' : 'back'; // saved and served again, or it never left the lane
      }
      G.in.n = false;
      if (res === 'back') continue; // too soft to leave the lane: it rolls back to be plunged again. Not a launch
      n++;
      if (res === 'flipper') reached++;
      else lost.push(Math.round(100 * Math.min(1, hold / 0.85)) + '%' + (res ? '' : ' (still in play after 14 s)'));
    }
  out.launch = {reached, n, lost};

  // ---- lights
  const goalIds = new Set(),
    c = def.content || {},
    step = o => {
      if (o && (o.t === 'shot' || o.t === 'done') && o.id && o.id !== 'wing') goalIds.add(o.id);
    };
  for (const k in c.campaigns || {}) {
    const cp = c.campaigns[k];
    for (const key in cp) {
      const v = cp[key];
      if (Array.isArray(v)) v.forEach(o => (o && o.step ? step(o.step) : step(o)));
      else step(v);
    }
  }
  (c.plan || []).forEach(p => p.step && step(p.step));
  (c.side || []).forEach(q => q.steps.forEach(step));
  out.goalsNoLight = [...goalIds].filter(id => !T.shots[id]);
  out.goals = goalIds.size;
  const shotIds = new Set();
  for (const id in T.rails) if (!T.rails[id].drain) shotIds.add(id);
  for (const id in T.holes) if (T.holes[id].tier < F.length) shotIds.add(id);
  for (const id in T.banks) if (T.banks[id].tier < F.length) shotIds.add(id);
  for (const id in T.sets) if (T.sets[id].tier < F.length) shotIds.add(id);
  for (const s of T.sens) if (s.kind === 'spin' && s.tier < F.length) shotIds.add(s.id);
  for (const b of T.bumps) if (b.tier < F.length && b.group) shotIds.add(b.group);
  out.shots = shotIds.size;
  out.shotsNoLight = [...shotIds].filter(id => !T.shots[id]);

  // ---- state on the playfield
  const shows = new Set(T.lamps.map(l => l.show));
  out.lamps = {
    multiplier: [...shows].some(s => /^mult/.test(s)),
    'ball save': shows.has('save'),
    kickback: T.sens.some(s => s.kind === 'kick') ? shows.has('kickback') : null,
    lock: shows.has('lockLit') || shows.has('lock1')
  };
  out.lampCount = T.lamps.length;

  // ---- the gap between the main flippers of each playfield
  out.gaps = F.map((f, i) => {
    const low = sd => T.flips.filter(q => q.tier === i && q.side === sd).sort((a, b) => b.y - a.y)[0],
      l = low(-1),
      r = low(1);
    if (!l || !r) return {id: f.id, gap: null};
    const tip = q => q.x + q.dir * q.L * Math.cos(q.rest);
    return {id: f.id, gap: Math.round(tip(r) - tip(l))};
  });

  // ---- roads: which playfields can the ball get to from the home one?
  const idx = F.length - 1,
    g = L.roads(),
    seen = new Set([idx]);
  for (let grew = true; grew;) {
    grew = false;
    for (const a of [...seen])
      for (const e of g[a])
        if (!seen.has(e.to)) {
          seen.add(e.to);
          grew = true;
        }
  }
  out.cutOff = F.filter((f, i) => !seen.has(i)).map(f => f.id);
  return out;
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
  r = await pg.evaluate(run);
} catch (e) {
  console.log('The table did not load, or the check threw.\n' + logs.join('\n') + '\n' + e.message);
  await br.close();
  srv.server.close();
  process.exit(1);
}
await br.close();
srv.server.close();

let notes = 0;
const say = (ok, what, detail) => {
  if (!ok) notes++;
  console.log((ok ? 'OK    ' : 'NOTE  ') + what + (detail ? '  ' + detail : ''));
};
console.log('\n' + table + (feel ? ' on the ' + feel + ' feel' : '') + ', against docs/PINBALL.md\n');
const pc = Math.round((100 * r.launch.reached) / r.launch.n);
say(
  pc >= 90,
  'fair launch: ' +
    r.launch.reached +
    ' of ' +
    r.launch.n +
    ' launches reached a flipper (' +
    pc +
    '%; the standard is 90%)',
  r.launch.lost.length ? 'drained untouched at plunger strength ' + [...new Set(r.launch.lost)].join(', ') : ''
);
say(
  !r.goalsNoLight.length,
  'a light on every goal: ' + (r.goals - r.goalsNoLight.length) + ' of ' + r.goals + ' goals that name a shot have one',
  r.goalsNoLight.length
    ? 'none at: ' + r.goalsNoLight.join(', ')
    : r.goals
      ? ''
      : '(this table writes no goals as data)'
);
say(
  !r.shotsNoLight.length,
  'a light at every shot: ' + (r.shots - r.shotsNoLight.length) + ' of ' + r.shots,
  r.shotsNoLight.length ? 'none at: ' + r.shotsNoLight.join(', ') : ''
);
for (const k in r.lamps)
  if (r.lamps[k] !== null) say(r.lamps[k], 'game state on the playfield: ' + k, r.lamps[k] ? '' : 'no lamp shows it');
for (const g of r.gaps)
  if (g.gap === null) say(false, 'flippers on ' + g.id, 'it has no pair of flippers at its foot');
  else
    say(
      g.gap <= 80,
      'the gap between the flippers on ' + g.id + ': ' + g.gap + ' units, ' + (g.gap / 22).toFixed(1) + ' balls',
      g.gap > 80 ? 'wide: more than three and a half balls' : ''
    );
say(
  !r.cutOff.length,
  'every playfield can be reached from the home one',
  r.cutOff.length ? 'not: ' + r.cutOff.join(', ') : ''
);
if (logs.length) console.log('\n' + logs.slice(0, 10).join('\n'));
console.log(
  '\n' +
    (logs.length
      ? 'FAILED: the page threw.'
      : notes
        ? notes +
          ' note' +
          (notes > 1 ? 's' : '') +
          '. Notes are guidelines the table does not follow; decide if that is on purpose.'
        : 'Meets every standard that can be checked. The rest is judged by playing.')
);
process.exit(logs.length ? 1 : 0);
