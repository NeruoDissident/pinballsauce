// Player-facing strength control: pause safety, keyboard/touch, persistence and stroke isolation.
import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {serve, local} from './serve.mjs';
const srv = await serve(fileURLToPath(new URL('..', import.meta.url)));
const br = await chromium.launch({args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader']});
try {
  const pg = await br.newPage({viewport: {width: 1000, height: 900}}),
    errors = [];
  pg.on('pageerror', e => errors.push(e.message));
  pg.setDefaultTimeout(150000);
  await pg.addInitScript(() => {
    window.requestAnimationFrame = () => 0;
  });
  await pg.addInitScript(() =>
    localStorage.setItem('pinballsauce.prefs.gfx', JSON.stringify({cam: 0, q: 'low', auto: false}))
  );
  await local(pg, 'judgment');
  await pg.goto(srv.url + '/tables/judgment/');
  await pg.waitForFunction(() => window.__pb?.ready());
  await pg.getByRole('button', {name: 'New run', exact: true}).click();
  await pg.keyboard.press('Escape');
  const slider = pg.getByRole('slider', {name: 'Flipper power'});
  assert.equal(await slider.inputValue(), '0');
  await pg.evaluate(async () => {
    const L = await import('/engine/api.js');
    window.powerBefore = JSON.parse(JSON.stringify(L.FEEL));
    window.ballBefore = JSON.stringify(L.G.balls.map(b => [b.x, b.y, b.vx, b.vy]));
  });
  for (let n = 0; n <= 100; n += 10) {
    await slider.fill(String(n));
    const state = await pg.evaluate(async () => {
      const L = await import('/engine/api.js');
      for (let i = 0; i < 120; i++) L.gameStep(1 / 120);
      return {
        feel: L.FEEL,
        paused: L.G.paused,
        balls: JSON.stringify(L.G.balls.map(b => [b.x, b.y, b.vx, b.vy])),
        before: window.ballBefore
      };
    });
    assert.equal(state.feel.flipper, 1.15 * (1 + n / 100));
    const before = await pg.evaluate(() => window.powerBefore);
    assert.deepEqual({...state.feel, flipper: before.flipper}, before);
    assert.equal(state.paused, true);
    assert.equal(state.balls, state.before);
    assert.equal(await pg.locator('#flipperValue').textContent(), '+' + n + '%');
  }
  await slider.focus();
  await pg.keyboard.press('ArrowLeft');
  assert.equal(await slider.inputValue(), '90');
  await pg.keyboard.press('Home');
  assert.equal(await slider.inputValue(), '0');
  await pg.keyboard.press('End');
  assert.equal(await slider.inputValue(), '100');
  await pg.getByRole('button', {name: 'Resume', exact: true}).click();
  assert.equal(await pg.evaluate(() => window.__pb.api.G.paused), false);
  await pg.reload();
  await pg.waitForFunction(() => window.__pb?.ready());
  await pg.getByRole('button', {name: 'Options', exact: true}).click();
  assert.equal(await slider.inputValue(), '100');
  console.log(
    'PASS all 11 power settings, unchanged stroke/other physics, frozen paused ball, keyboard and reload persistence'
  );
  for (const table of ['gravebound', 'neon-descent', 'test-bench', 'starfall', 'crush-hour']) {
    await pg.goto(srv.url + '/tables/' + table + '/');
    await pg.waitForFunction(() => window.__pb?.ready());
    await pg.getByRole('button', {name: 'Options', exact: true}).click();
    assert.equal(await slider.inputValue(), '100');
    assert.equal(await pg.evaluate(async () => (await import('/engine/api.js')).FEEL.flipper), 2.3);
    await slider.fill('0');
    assert.equal(await pg.evaluate(async () => (await import('/engine/api.js')).FEEL.flipper), 1.15);
    await slider.fill('100');
    console.log('PASS shared baseline, double power and remembered setting: ' + table);
  }
  const invalid = await pg.evaluate(async () => {
    const L = await import('/engine/api.js');
    const results = [-1, 999, NaN, Infinity, 'bad', 44].map(v => L.setFlipperBoost(v));
    L.setFlipperBoost(0);
    return results;
  });
  assert.deepEqual(invalid, [0, 100, 0, 0, 0, 40]);
  const mobile = await br.newContext({viewport: {width: 390, height: 844}, isMobile: true, hasTouch: true});
  const phone = await mobile.newPage();
  phone.setDefaultTimeout(150000);
  await phone.addInitScript(() => {
    window.requestAnimationFrame = () => 0;
  });
  phone.on('pageerror', e => errors.push(e.message));
  await phone.addInitScript(() =>
    localStorage.setItem('pinballsauce.prefs.gfx', JSON.stringify({cam: 0, q: 'low', auto: false}))
  );
  await local(phone, 'judgment');
  await phone.goto(srv.url + '/tables/judgment/');
  await phone.waitForFunction(() => window.__pb?.ready());
  await phone.getByRole('button', {name: 'New run', exact: true}).tap();
  await phone.evaluate(() => {
    window.__pb.api.UI.sync(true);
    window.__pb.api.draw(1);
  });
  await phone.getByRole('button', {name: 'Pause', exact: true}).tap();
  const mobileSlider = phone.getByRole('slider', {name: 'Flipper power'}),
    box = await mobileSlider.boundingBox();
  assert.ok(box && box.width > 200 && box.height >= 36);
  assert.ok(box.x >= 0 && box.x + box.width <= 390);
  await phone.touchscreen.tap(box.x + box.width * 0.75, box.y + box.height / 2);
  assert.ok(Number(await mobileSlider.inputValue()) >= 60);
  await phone.screenshot({path: 'tests/out/flipper-power-mobile.png'});
  await pg.goto(srv.url + '/tables/judgment/');
  await pg.waitForFunction(() => window.__pb?.ready());
  await pg.getByRole('button', {name: 'New run', exact: true}).click();
  await pg.keyboard.press('Escape');
  await pg.evaluate(() => window.__pb.api.draw(1));
  await pg.screenshot({path: 'tests/out/flipper-power-desktop.png'});
  assert.deepEqual(errors, []);
  console.log('PASS bounded input and touch slider; desktop/mobile screenshots saved');
  await mobile.close();
} finally {
  await br.close();
  srv.server.close();
}
