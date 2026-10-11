// Physical checks for opt-in mechanisms: collisions, transit, hold/release, reset and route choice.
import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {serve, local} from './serve.mjs';
import {init} from './scenarios.mjs';
const srv = await serve(fileURLToPath(new URL('..', import.meta.url)));
const br = await chromium.launch({args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader']});
try {
  const pg = await br.newPage(),
    errors = [];
  pg.on('pageerror', e => errors.push(e.message));
  await local(pg, 'judgment');
  await pg.addInitScript(init, 913);
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
    const start = () => {
      P.hold(true);
      P.UI.menu(null);
      P.startRun('knight');
      G.opt.endless = false;
      G.queue = [];
    };
    const step = (seconds, until) => {
      for (let i = 0; i < seconds * 120; i++) {
        P.gameStep(1 / 120);
        if (until?.()) return true;
      }
      return false;
    };
    start();
    const gate = T.mechanisms.pearlyGates,
      jaw = T.mechanisms.beastJaw;
    let b = L.newBall(320, gate.y + 75, 0, -700);
    G.balls = [b];
    step(0.22);
    check(b.st === 'live' && b.y > gate.y && b.vy > 0, 'Closed Pearly Gates physically rebound an approaching ball');
    G.run.souls = [true, true, true];
    G.balls = [];
    step(0.85);
    check(gate.position > 0.99 && !T.holes.gates.closed, 'Qualification swings both Gates open');
    b = L.newBall(320, gate.y + 65, 0, -650);
    G.balls = [b];
    check(
      step(0.5, () => b.st === 'held') && G.run.judgment === 2,
      'A real shot through the open Gates starts Armageddon'
    );
    start();
    G.run.judgment = 2;
    b = L.newBall(346, jaw.y + 80, 0, -680);
    G.balls = [b];
    step(0.24);
    check(b.st === 'live' && b.vy > 0 && G.run.wounds === 0, 'Closed jaw protects the Beast with a physical rebound');
    L.done('chains', 495, L.TY[2] + 490);
    G.balls = [];
    step(0.9);
    check(jaw.position > 0.99 && !T.holes.beast.closed, 'Chains open the jaw and expose the scoop');
    b = L.newBall(346, jaw.y + 65, 0, -650);
    G.balls = [b];
    check(
      step(0.5, () => b.st === 'held') && G.run.wounds === 1,
      'A physical shot into the open mouth wounds the Beast'
    );
    G.run.attack = 0.02;
    step(0.4);
    check(jaw.position > 0.99 && b.st === 'held', 'Jaw waits for a captured ball before closing');
    check(step(2, () => b.st === 'live' && b.y > jaw.y + b.r + 10), 'Timed-out attack ejects its ball safely past the jaw');
    G.balls = [];
    step(1);
    check(
      !G.run.chains && jaw.position < 0.01 && T.holes.beast.closed,
      'Attack timeout closes the jaw and relights the Chains'
    );
    start();
    const bell = T.mechanisms.cathedralBell;
    b = L.newBall(bell.x, bell.y + 55, 0, -700);
    G.balls = [b];
    step(0.15);
    check(bell.s > 2 && G.run.bells === 2, 'Hitting the captive ball moves it and rings the cathedral bell twice');
    G.balls = [];
    step(3);
    check(bell.s < 1, 'Captive ball returns to its home stop');
    for (const diverted of [false, true]) {
      start();
      G.run.judgment = diverted ? 2 : 0;
      P.rules.tick(0, G.run);
      b = L.newBall(320, L.TY[0] + 432, 0, 0);
      G.balls = [b];
      L.enterRail(b, 'haloLoop');
      check(
        step(6, () => b.railHold > 0),
        'Halo magnet catches the ball (' + (diverted ? 'Armageddon' : 'normal') + ')'
      );
      const x = b.x,
        y = b.y;
      step(0.5);
      check(b.railHold > 0 && Math.hypot(b.x - x, b.y - y) < 0.01, 'Magnetic hold keeps the ball visibly still');
      check(
        step(6, () => b.rail.id !== 'haloLoop'),
        'Magnet releases automatically into the diverter'
      );
      check(b.rail.id === (diverted ? 'apocalypse' : 'haloReturn'), 'Diverter chooses the correct connected track');
      check(
        step(10, () => b.st === 'live') && b.tier === (diverted ? 2 : 0),
        'Visible track returns the ball to its intended field'
      );
    }
    start();
    b = L.newBall(0, 0, 0, 0);
    G.balls = [b];
    L.enterRail(b, 'orbitFeed', 380);
    const upper = T.flips.find(f => f.tier === 1 && f.y < L.TY[1] + 700);
    check(
      step(3, () => b.st === 'live' && b.onFlip > 0) && Math.abs(b.y - upper.y) < 90,
      'Right orbit feed delivers onto the upper flipper'
    );
    start();
    check(
      Object.values(T.mechanisms).every(m => !m.open && !m.position && !m.s),
      'New run resets every moving mechanism'
    );
    return out;
  });
  assert.deepEqual(errors, []);
  checks.forEach(x => console.log('PASS ' + x));
  console.log('PASSED: ' + checks.length + ' mechanism checks');
} finally {
  await br.close();
  srv.server.close();
}
