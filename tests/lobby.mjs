// Opening-screen behavior in the source site, bundled collection, and offline file.
import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {fileURLToPath, pathToFileURL} from 'node:url';
import {serve, local} from './serve.mjs';
const root = fileURLToPath(new URL('..', import.meta.url)),
  srv = await serve(root);
const br = await chromium.launch({
  args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist']
});
const ids = ['gravebound', 'neon-descent', 'crush-hour', 'judgment', 'starfall', 'test-bench'];
try {
  const pg = await br.newPage({viewport: {width: 1440, height: 1000}}),
    errors = [];
  pg.setDefaultTimeout(120000);
  pg.on('pageerror', e => errors.push(e.message));
  await local(pg);
  await pg.addInitScript(() => {
    localStorage.setItem('pinballsauce.prefs.gfx', JSON.stringify({cam: 0, q: 'low', auto: false}));
    localStorage.setItem('pinballsauce.prefs.flipperBoost', '40');
  });
  for (const page of ['index.html', 'dist/pinballsauce.html']) {
    await pg.goto(srv.url + '/' + page);
    assert.deepEqual(await pg.locator('#pk li').evaluateAll(es => es.map(e => e.dataset.table)), ids);
    assert.equal(await pg.locator('section[aria-label="Development"] li').count(), 4);
    assert.equal(await pg.locator('section[aria-label="Experimental"] li').count(), 2);
    await pg.waitForFunction(() => {
      const f = document.querySelector('iframe');
      return f?.contentWindow.__pb?.ready() && f.contentWindow.__pb.api.UI.cur === null;
    });
    const preview = pg.frames().find(f => f !== pg.mainFrame());
    const state = await preview.evaluate(() => ({
      id: window.__pb.api.def.id,
      demo: window.__pb.api.G.demo,
      time: window.__pb.api.G.t
    }));
    assert.ok(ids.includes(state.id));
    assert.equal(state.demo, true);
    await preview.waitForFunction(t => window.__pb.api.G.t > t + 0.2, state.time);
    assert.equal(await preview.locator('#menu').isVisible(), false);
    await pg.getByRole('button', {name: 'Pause preview', exact: true}).click();
    assert.equal(await preview.evaluate(() => window.__pb.api.R3.hold), true);
    await pg.screenshot({path: 'tests/out/lobby-' + (page.startsWith('dist') ? 'bundle' : 'source') + '.png'});
    assert.equal(await pg.evaluate(() => localStorage.getItem('pinballsauce.prefs.flipperBoost')), '40');
    await pg.getByRole('button', {name: 'Play preview', exact: true}).click();
    assert.equal(await preview.evaluate(() => window.__pb.api.R3.hold), false);
    await pg.setViewportSize({width: 600, height: 900});
    await pg.waitForFunction(() => !document.querySelector('iframe'));
    await pg.setViewportSize({width: 1440, height: 1000});
    await pg.waitForFunction(() => document.querySelector('iframe')?.contentWindow.__pb?.ready());
    console.log('PASS ' + page + ': order, groups, live demo, pause/resume and responsive cleanup');
  }
  // Use a compact viewport for menu routing; the desktop preview removal was checked above.
  await pg.setViewportSize({width: 850, height: 900});
  for (const id of ids) {
    await pg.goto(srv.url + '/dist/pinballsauce.html');
    await pg.locator('[data-table="' + id + '"] button.go').click();
    await pg.waitForFunction(() => window.__pb?.ready());
    assert.equal(await pg.evaluate(() => window.__pb.api.def.id), id);
    assert.equal(await pg.locator('#pk').count(), 0);
    assert.equal(await pg.locator('iframe').count(), 0);
    await pg.getByRole('button', {name: 'Other tables', exact: true}).click();
    await pg.waitForSelector('#pk');
  }
  await pg.locator('[data-table="judgment"] button[data-ins]').click();
  await pg.waitForFunction(() => window.__pb?.ready());
  assert.equal(await pg.evaluate(() => window.__pb.api.INS.on), true);
  console.log('PASS bundled Play/Other tables for all six tables and Inspect');
  const phone = await br.newPage({viewport: {width: 390, height: 844}, isMobile: true, hasTouch: true});
  await local(phone);
  for (const page of ['index.html', 'dist/pinballsauce.html']) {
    await phone.goto(srv.url + '/' + page);
    assert.deepEqual(await phone.locator('#pk li').evaluateAll(es => es.map(e => e.dataset.table)), ids);
    assert.equal(await phone.locator('iframe').count(), 0);
    const card = await phone.locator('#pk li').first().boundingBox();
    assert.ok(card.height >= 150 && card.x >= 0 && card.x + card.width <= 390);
    await phone.screenshot({path: 'tests/out/lobby-phone-' + (page.startsWith('dist') ? 'bundle' : 'source') + '.png'});
  }
  await phone.locator('[data-table="judgment"] button.go').tap();
  await phone.waitForFunction(() => window.__pb?.ready(), null, {timeout: 120000});
  assert.equal(await phone.evaluate(() => window.__pb.api.def.id), 'judgment');
  console.log('PASS phone keeps large cards, loads no preview and launches by touch');
  await phone.close();
  await pg.unroute('**/*');
  await pg.setViewportSize({width: 1440, height: 1000});
  const requests = [];
  await pg.route(/^https?:/, r => {
    requests.push(r.request().url());
    return r.abort();
  });
  await pg.goto(pathToFileURL(root + '/dist/pinballsauce.html').href);
  await pg.waitForFunction(() => document.querySelector('iframe')?.contentWindow.__pb?.ready());
  // The existing bundle includes optional web-font links; all requests are blocked for this offline check.
  assert.ok(requests.every(url => url.startsWith('https://fonts.googleapis.com/')));
  await pg.locator('[data-table="judgment"] button.go').click();
  await pg.waitForFunction(() => window.__pb?.ready());
  assert.equal(await pg.locator('iframe').count(), 0);
  assert.equal(await pg.evaluate(() => window.__pb.api.def.id), 'judgment');
  assert.deepEqual(errors, []);
  console.log('PASS offline preview and desktop launch with network blocked and no page errors');
} finally {
  await br.close();
  srv.server.close();
}
