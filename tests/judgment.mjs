/* Behavior checks for an interior launch field and Judgment's complete goal ladder.
   Uses the same browser/physics as play; no recordings are overwritten. */
import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {serve, local} from './serve.mjs';
import {init} from './scenarios.mjs';
const srv = await serve(fileURLToPath(new URL('..', import.meta.url)));
const br = await chromium.launch({
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist']
});
try {
  const pg = await br.newPage({viewport: {width: 1100, height: 850}}),
    errors = [];
  pg.on('pageerror', e => errors.push(e.message));
  await local(pg, 'judgment');
  await pg.addInitScript(init, 721);
  await pg.goto(srv.url + '/tables/judgment/');
  await pg.waitForFunction(() => window.__pb?.ready());
  const checks = await pg.evaluate(async () => {
    const P = window.__pb.api,
      L = await import('/engine/api.js'),
      {G, T} = P,
      out = [];
    const check = (ok, msg) => {
      if (!ok) throw Error(msg);
      out.push(msg);
    };
    P.hold(true);
    P.UI.menu(null);
    P.startRun('knight', null);
    G.opt.endless = false;
    const r = G.run;
    check(L.ST === 1 && L.BT === 2, 'Earth launches; Hell drains');
    check(G.balls[0].tier === 1 && T.shooter.y === L.TY[1] + 980, 'First ball is served on Earth');
    L.relight();
    check(
      ['candles', 'bells', 'sanctuary'].every(id => G.lampS[id] === 'flash'),
      'All three soul sources have flashing goal inserts'
    );
    // A ball on the lower field must not be mistaken for a ball waiting on the upper plunger.
    G.balls = [L.newBall(T.shooter.x, L.TY[2] + 700, 0, 0)];
    L.updatePlunger(1 / 120);
    check(!G.plunge.ready, 'Hell cannot activate the Earth plunger');
    for (const tier of [0, 1]) {
      G.balls = [L.newBall(320, L.TY[tier] + 1000, 0, 180)];
      const b = G.balls[0];
      for (let i = 0; i < 140; i++) P.gameStep(1 / 120);
      check(
        G.balls.includes(b) && b.tier === tier + 1,
        'Physical fall from ' + ['Heaven to Earth', 'Earth to Hell'][tier]
      );
    }
    const capture = id => {
      const h = T.holes[id],
        b = L.newBall(h.x, h.y, 0, 0);
      b.st = 'held';
      b.held = {id, t: 0};
      G.balls = [b];
      L.handleHole(h, b);
      return b;
    };
    capture('beast');
    check(r.wounds === 0, 'Beast cannot be defeated before opening Heaven');
    const escaped = capture('redemption');
    for (let i = 0; i < 900; i++) {
      P.gameStep(1 / 120);
      if (escaped.st === 'live' && escaped.tier === 1) break;
    }
    check(escaped.tier === 1, 'Redemption physically returns to Earth');
    L.done('candles', 320, L.TY[1] + 118);
    for (let i = 0; i < 6; i++)
      L.ev(
        'bump',
        T.bumps.find(b => b.group === 'bells'),
        G.balls[0]
      );
    capture('sanctuary');
    check(r.souls.every(Boolean), 'Candles, six bells and Sanctuary rescue three distinct souls');
    L.relight();
    check(G.lampS.ascension === 'flash' && G.lampS.gates === 'flash', 'Rescued souls light the route to the Gates');
    const before = r.score;
    capture('sanctuary');
    check(r.souls.length === 3 && r.score - before < 15000, 'A rescued soul cannot be farmed repeatedly');
    capture('gates');
    check(r.judgment === 2 && !!G.mb && r.shield, 'Gates begin Armageddon and grant Grace');
    L.relight();
    check(G.lampS.descent === 'flash' && G.lampS.chains === 'flash', 'Opening the Gates lights the descent and Chains');
    for (let i = 0; i < 300; i++) P.gameStep(1 / 120);
    check(G.balls.length === 3, 'Armageddon releases three physical balls');
    capture('beast');
    check(r.wounds === 0, 'Chains protect the Beast');
    L.done('chains', 495, L.TY[2] + 490);
    L.relight();
    check(G.lampS.beast === 'flash', 'Breaking the Chains lights the Beast');
    for (let i = 0; i < 3; i++) capture('beast');
    check(r.wounds === 3 && r.judgment === 3, 'Three strikes defeat the exposed Beast');
    L.relight();
    check(G.lampS.redemption === 'flash', 'Final Redemption shot is lit');
    capture('redemption');
    for (let i = 0; i < 700 && G.mode !== 'over'; i++) P.gameStep(1 / 120);
    check(G.mode === 'over' && r.ended === 'won', 'Final Redemption ends the run in Salvation');
    P.startRun('knight', null);
    G.run.shield = true;
    G.save = 0;
    G.balls = [];
    L.onDrain(L.newBall(320, L.H + 40, 0, 100));
    check(!G.run.shield && G.plunge.auto > 0 && G.run.ballsLeft === 3, 'Grace consumes itself and saves a lost ball');
    G.run.souls = [true, true, true];
    G.run.judgment = 3;
    G.run.wounds = 3;
    G.opt.endless = true;
    capture('redemption');
    for (let i = 0; i < 700 && G.run.judgment === 3; i++) P.gameStep(1 / 120);
    check(
      G.mode === 'play' && G.run.judgment === 0 && !G.run.souls.some(Boolean),
      'Endless mode starts a fresh pilgrimage'
    );
    // Saved progress survives a real save/continue lifecycle, with an Earth launch.
    G.run.souls = [true, false, true];
    G.run.bells = 4;
    L.saveRun();
    G.run = null;
    L.continueRun();
    check(
      G.run.souls.join(',') === 'true,false,true' && G.run.bells === 4 && G.balls[0].tier === 1,
      'Continue preserves custom progress and launches on Earth'
    );
    P.startRun('knight', null);
    L.done('vigil', 460, L.TY[1] + 380);
    capture('gates');
    check(G.run.locks === 1 && G.balls.length === 0, 'The Vigil permits the first Choir ball lock');
    for (let i = 0; i < 160; i++) P.gameStep(1 / 120);
    check(G.balls.length === 1 && G.balls[0].tier === 1, 'A locked ball is replaced at the Earth plunger');
    capture('gates');
    for (let i = 0; i < 310; i++) P.gameStep(1 / 120);
    check(G.mb?.name === 'Choir' && G.balls.length === 3, 'The second Choir lock releases multiball');
    return out;
  });
  assert.deepEqual(errors, []);
  checks.forEach(x => console.log('PASS ' + x));
  console.log('PASSED: ' + checks.length + ' behavior checks');
} finally {
  await br.close();
  srv.server.close();
}
