// Rally lifecycle regressions: real engine state, drains, powers and delayed arrivals.
import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {serve, local} from './serve.mjs';
import {init} from './scenarios.mjs';
const srv = await serve(fileURLToPath(new URL('..', import.meta.url)));
let br;
try {
  br = await chromium.launch({args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader']});
  const pg = await br.newPage(),
    errors = [];
  pg.on('pageerror', e => errors.push(e.message));
  await local(pg, 'gravebound');
  await pg.addInitScript(init, 912);
  await pg.goto(srv.url + '/tables/gravebound/');
  await pg.waitForFunction(() => window.__pb?.ready());
  const checks = await pg.evaluate(async () => {
    const P = window.__pb.api,
      L = await import('/engine/api.js'),
      {G, T} = L,
      out = [];
    const check = (ok, msg) => {
      if (!ok) throw Error(msg);
      out.push(msg);
    };
    const start = () => {
      P.hold(true);
      P.UI.menu(null);
      P.startRun('knight', 'tank');
      G.queue = [];
      G.save = 0;
      G.run.shield = false;
      G.run.grave.open = false;
      G.run.party = [];
      G.run.recruits = [
        {cls: 'mage', spell: 'meteor'},
        {cls: 'rogue', spell: 'knives'}
      ];
      G.run.charge = 100;
      return G.balls[0];
    };
    const arrivals = () => {
      const queue = G.queue.splice(0);
      queue.forEach(q => q.fn());
    };
    const drain = (...balls) => {
      for (const b of balls) {
        b.st = 'live';
        b.y = L.H + 50;
        b.x = L.CX[L.BT];
      }
      L.updateBalls(0);
    };
    let hero = start();
    G.run.level = 6;
    G.run.xp = 75;
    G.run.book = {charge: {dur: 2, a: 1, b: 1}};
    L.recalc();
    L.rally();
    arrivals();
    let mage = G.balls.find(b => b.cls === 'mage'),
      rogue = G.balls.find(b => b.cls === 'rogue');
    check(G.balls.length === 3 && G.rallyActive, 'Rally launches both recruits');
    hero.y = L.TY[0] + 400;
    mage.y = L.TY[L.BT] + 650;
    rogue.y = mage.y - 200;
    check(L.focusBall() === mage, 'Camera focus includes the lowest recruit');
    mage.y = rogue.y - 100;
    check(L.focusBall() === rogue, 'Camera switches as ball heights cross');
    L.updateRally(90);
    check(G.balls.length === 3 && G.rallyActive, 'Rally balls remain beyond the old timeout');
    check(!mage.cast && !mage.spell, 'Only the opening ability burst expires');
    G.save = 0;
    const left = G.run.ballsLeft;
    drain(hero);
    check(G.balls.length === 2 && G.run.ballsLeft === left && !G.sub, 'Original ball can drain without costing a turn');
    drain(rogue);
    check(
      G.balls[0] === mage && !mage.party && mage.hero && mage.cls === 'mage' && mage.noHole === 0,
      'Final recruit takes over, retaining class and scoop access'
    );
    check(!G.rallyActive && L.heroBall() === mage, 'Single survivor leaves multiball and becomes the playable hero');
    L.UI.sync(true);
    check(document.getElementById('hCls').textContent === 'Mage', 'HUD shows the surviving class');
    const build = JSON.stringify({cls: G.run.cls, level: G.run.level, book: G.run.book, perks: G.run.perks});
    G.zones = [];
    mage.pow = {t: 1};
    L.powerImpact(mage, 'target');
    check(!mage.pow, 'Surviving mage uses mage impact behavior instead of the saved knight class');
    drain(mage);
    check(G.sub === 'bonus' && G.run.ballsLeft === left - 1, 'Only the final drain charges one reserve ball');
    L.startBall();
    check(L.ballClass(G.balls[0]) === 'knight' && !G.balls[0].rallyRole, 'Next launch restores the original hero');
    check(
      build === JSON.stringify({cls: G.run.cls, level: G.run.level, book: G.run.book, perks: G.run.perks}),
      'Class and progression survive the temporary class handoff'
    );

    hero = start();
    L.rally();
    G.save = 0;
    drain(hero);
    check(
      !G.sub && G.balls.length === 0 && G.rallyPend === 2,
      'Queued arrivals keep an empty playfield from ending the turn'
    );
    arrivals();
    check(G.balls.length === 2 && !G.sub && G.rallyPend === 0, 'Recruits still arrive after the original ball drains');
    G.save = 0;
    const before = G.run.ballsLeft;
    drain(...G.balls);
    check(
      G.sub === 'bonus' && G.run.ballsLeft === before - 1,
      'Simultaneous final drains pay bonus and charge a ball only once'
    );

    hero = start();
    L.rally();
    const stale = G.queue.splice(0);
    L.startBall();
    stale.forEach(q => q.fn());
    check(
      G.balls.length === 1 && !G.rallyActive && G.rallyPend === 0,
      'Cancelled launches cannot leak into the next ball'
    );

    hero = start();
    L.rally();
    arrivals();
    G.save = 0;
    G.run.grave.open = true;
    drain(hero);
    check(!G.inGrave && G.balls.length === 2, 'Original hero cannot take the Grave while multiball survives');
    G.run.grave.open = false;
    drain(G.balls[0]);
    const survivor = G.balls[0];
    G.run.grave.open = true;
    drain(survivor);
    check(G.inGrave && G.balls.includes(survivor), 'Final recruit can use the Grave as the current ball');

    hero = start();
    L.rally();
    arrivals();
    G.save = 0;
    drain(...G.balls.filter(b => b !== hero));
    check(
      G.balls.length === 1 && G.balls[0] === hero && !G.rallyActive,
      'Original hero surviving also ends multiball normally'
    );

    hero = start();
    L.rally();
    arrivals();
    G.tilt = 1e9;
    G.save = 0;
    drain(hero);
    check(!G.sub && G.balls.length === 2, 'Tilt still waits for all Rally balls to drain');
    drain(...G.balls);
    check(G.sub === 'bonus' && G.bonus.total === 0, 'Last tilted drain ends the turn with zero bonus');
    return out;
  });
  checks.forEach(x => console.log('PASS ' + x));
  assert.deepEqual(errors, []);
  console.log(`PASSED: ${checks.length} Rally checks`);
} finally {
  await br?.close();
  srv.server.close();
}
