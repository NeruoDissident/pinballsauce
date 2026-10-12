// Simulate the browser's standard gamepad snapshots; exercise actual lobby/menu/game input handlers.
import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {serve, local} from './serve.mjs';
const srv = await serve(fileURLToPath(new URL('..', import.meta.url)));
const br = await chromium.launch({args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader']});
try {
  const pg = await br.newPage({viewport: {width: 850, height: 900}}),
    errors = [];
  pg.setDefaultTimeout(150000);
  pg.on('pageerror', e => errors.push(e.message));
  await local(pg);
  await pg.addInitScript(() => {
    localStorage.setItem('pinballsauce.prefs.gfx', JSON.stringify({cam: 0, q: 'low', auto: false}));
    let callbacks = new Map(),
      nextId = 0,
      now = 0;
    window.requestAnimationFrame = cb => {
      callbacks.set(++nextId, cb);
      return nextId;
    };
    window.cancelAnimationFrame = id => callbacks.delete(id);
    window.padSessions = () => [...callbacks.values()].filter(cb => cb.name === 'gamepadFrame').length;
    window.fakePad = {index: 0, connected: true, mapping: 'standard', buttons: [], axes: [0, 0]};
    Object.defineProperty(navigator, 'getGamepads', {value: () => [window.fakePad]});
    window.padTick = ({buttons = [], axes = [0, 0], ms = 16} = {}) => {
      window.fakePad.buttons = Array.from({length: 17}, (_, i) => ({
        pressed: buttons.includes(i),
        value: buttons.includes(i) ? 1 : 0
      }));
      window.fakePad.axes = axes;
      now += ms;
      for (const [id, cb] of [...callbacks]) {
        if (cb.name === 'gamepadFrame') {
          callbacks.delete(id);
          cb(now);
        }
      }
    };
  });
  const tick = (buttons = [], axes = [0, 0], ms = 16) => pg.evaluate(o => window.padTick(o), {buttons, axes, ms});
  const tap = async b => {
    await tick([b]);
    await tick();
  };
  const state = () =>
    pg.evaluate(() => {
      const {G, UI, R3} = window.__pb.api;
      return {l: G.in.l, r: G.in.r, n: G.in.n, paused: G.paused, menu: UI.cur, mode: G.mode, cam: R3.camMode};
    });
  const navigate = async selector => {
    for (let n = 0; n < 30; n++) {
      if (await pg.evaluate(s => document.activeElement?.matches(s), selector)) return;
      await tap(13);
    }
    throw Error('Controller could not focus ' + selector);
  };
  for (const path of ['/tables/judgment/', '/dist/pinballsauce.html#judgment']) {
    await pg.goto(srv.url + path);
    await pg.waitForFunction(() => window.__pb?.ready());
    // Held A when the page boots cannot start or skip menus.
    await tick([0]);
    assert.equal((await state()).menu, 'title');
    await tick();
    await tick([0]);
    assert.equal((await state()).menu, null);
    await tick([0]);
    assert.equal((await state()).n, false);
    await tick();
    await tick([4, 5]);
    assert.equal((await state()).l, true);
    assert.equal((await state()).r, true);
    await tick([6, 7]); // bumpers release, triggers continue holding
    assert.equal((await state()).l, true);
    assert.equal((await state()).r, true);
    await tick();
    assert.equal((await state()).l, false);
    assert.equal((await state()).r, false);
    // Mixed input: the controller releases only its own holds.
    await pg.keyboard.down('KeyZ');
    await tick([4]);
    await tick();
    assert.equal((await state()).l, true);
    await pg.keyboard.up('KeyZ');
    assert.equal((await state()).l, false);
    await tick([4]);
    await pg.keyboard.down('KeyZ');
    await pg.keyboard.up('KeyZ');
    assert.equal((await state()).l, true);
    await tick();
    // Launch uses the existing physical plunger, then one press gives one nudge.
    await pg.evaluate(() => window.__pb.api.advance(1, 1));
    await tick([0]);
    await pg.evaluate(() => window.__pb.api.advance(0.5, 1));
    assert.ok(await pg.evaluate(() => window.__pb.api.G.plunge.charge > 0.4));
    await tick();
    await pg.evaluate(() => window.__pb.api.advance(0.03, 1));
    assert.equal(await pg.evaluate(() => window.__pb.api.G.plunge.ready), false);
    const cam = (await state()).cam;
    await tap(3);
    assert.notEqual((await state()).cam, cam);
    const beforeNudge = await pg.evaluate(() => window.__pb.api.G.nudges.length);
    await tick([0]);
    const nudges = await pg.evaluate(() => window.__pb.api.G.nudges.length);
    assert.equal(nudges, beforeNudge + 1);
    await tick([0]);
    assert.equal(await pg.evaluate(() => window.__pb.api.G.nudges.length), nudges);
    await tick();
    await tap(9);
    assert.equal((await state()).paused, true);
    await navigate('#optFlipper');
    await tap(15);
    assert.equal(await pg.locator('#optFlipper').inputValue(), '10');
    await tick([15], [0, 0], 20);
    await tick([15], [0, 0], 400);
    assert.equal(await pg.locator('#optFlipper').inputValue(), '30');
    await tick();
    await tap(14);
    await tap(14);
    await tap(14);
    assert.equal(await pg.locator('#optFlipper').inputValue(), '0');
    await navigate('[data-act="options"]');
    await tap(0);
    const before = await pg.evaluate(() => document.activeElement.id);
    await tick([], [0.2, 0.3]);
    assert.equal(await pg.evaluate(() => document.activeElement.id), before);
    await tick([], [0, 0.9]);
    await tick();
    assert.equal(await pg.evaluate(() => document.activeElement.id), 'optMusic');
    await navigate('#optShake');
    const checked = await pg.locator('#optShake').isChecked();
    await tap(0);
    assert.equal(await pg.locator('#optShake').isChecked(), !checked);
    await tap(1);
    assert.equal((await state()).menu, 'pause');
    await tap(9);
    assert.equal((await state()).paused, false);
    // Disconnect pauses and clears all gamepad holds, with neutral required on reconnect.
    await tick([4, 7]);
    await pg.evaluate(() => {
      window.fakePad.connected = false;
      window.padTick();
    });
    assert.equal((await state()).paused, true);
    assert.equal((await state()).l, false);
    assert.equal((await state()).r, false);
    await pg.evaluate(() => {
      window.fakePad.connected = true;
    });
    await tick([9]);
    assert.equal((await state()).paused, true);
    await tick();
    await tap(9);
    await tick([4]);
    await pg.evaluate(() => window.dispatchEvent(new Event('blur')));
    assert.equal((await state()).l, false);
    assert.equal((await state()).paused, true);
    await tick();
    await tap(9);
    await tap(9);
    await navigate('[data-act="inspect"]');
    await tap(0);
    assert.equal(await pg.evaluate(() => window.__pb.api.INS.on), true);
    await tap(1);
    assert.equal(await pg.evaluate(() => window.__pb.api.INS.on), false);
    console.log(
      'PASS ' +
        path +
        ': flippers, launch, mixed inputs, menus, power, stick deadzone/repeat, pause, reconnect, blur and inspect exit'
    );
  }
  // Complete controller-only startup for every table in the bundled collection, including RPG choices.
  for (const id of ['gravebound', 'neon-descent', 'crush-hour', 'judgment', 'starfall', 'test-bench']) {
    await pg.goto(srv.url + '/dist/pinballsauce.html');
    await pg.waitForSelector('#pk');
    await tick();
    await navigate('[data-table="' + id + '"] .go');
    await tap(0);
    await pg.waitForFunction(() => window.__pb?.ready());
    assert.equal(await pg.locator('#pk').count(), 0);
    assert.equal(await pg.evaluate(() => window.__pb.api.def.id), id);
    await tick();
    await tap(0);
    if ((await state()).menu === 'class') await tap(0);
    if ((await state()).menu === 'party') await tap(0);
    assert.equal((await state()).menu, null);
    assert.equal((await state()).mode, 'play');
    await tick([4, 5]);
    assert.equal((await state()).l, true);
    assert.equal((await state()).r, true);
    console.log('PASS controller-only lobby → ' + id + ' → new run');
  }
  // Desktop preview gets no gamepad polling session; the top-level picker has one.
  await pg.setViewportSize({width: 1440, height: 1000});
  await pg.goto(srv.url + '/dist/pinballsauce.html');
  await pg.waitForFunction(() => document.querySelector('iframe')?.contentWindow.__pb?.ready(), null, {polling: 100});
  const preview = pg.frames().find(f => f !== pg.mainFrame());
  assert.equal(await preview.evaluate(() => window.padSessions()), 0);
  assert.equal(await pg.evaluate(() => window.padSessions()), 1);
  await tick();
  await tick([0]);
  // Selection destroys the preview. The selected game's title cannot be auto-confirmed by held A.
  await pg.waitForFunction(() => window.__pb?.ready());
  await tick([0]);
  assert.equal((await state()).menu, 'title');
  assert.equal(preview.isDetached(), true);
  assert.equal(await pg.evaluate(() => window.padSessions()), 1);
  assert.deepEqual(errors, []);
  console.log('PASS preview isolation, held-confirmation safety, no browser errors');
} finally {
  await br.close();
  srv.server.close();
}
