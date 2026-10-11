/* The phone check: the site as an installable app, on a phone-sized touch screen.

     node tests/mobile.mjs [--table gravebound]

   It opens the table list and a table as a phone would (390 by 844, touch), and checks: the manifest and its icons;
   the service worker taking the page and serving it with no network; the way back to the table list; that the
   camera strip and the nudge block are not drawn; the view and pause buttons; the side panels (not shown upright,
   shown on its side); nudging by double-tap; that the picture is not stretched after a rotation whose resize event
   never arrives; and that the table sits in the same fog upright as on its side (the picture used to go dark).
   Two frames are saved in tests/out. Exits 1 if any line fails. */
import {chromium} from 'playwright';
import path from 'path';
import {fileURLToPath} from 'url';
import {serve} from './serve.mjs';
const here = path.dirname(fileURLToPath(import.meta.url)),
  args = process.argv.slice(2),
  ti = args.indexOf('--table'),
  table = ti < 0 ? 'gravebound' : args[ti + 1];
const srv = await serve(path.join(here, '..'));
const log = [],
  ok = (n, v) => log.push((v ? 'ok   ' : 'FAIL ') + n);
const br = await chromium.launch({
  args: [
    '--use-gl=angle',
    '--use-angle=swiftshader',
    '--enable-unsafe-swiftshader',
    '--ignore-gpu-blocklist',
    '--disable-blink-features=AutomationControlled'
  ]
});
const ctx = await br.newContext({
  viewport: {width: 390, height: 844},
  deviceScaleFactor: 2,
  isMobile: true,
  hasTouch: true
});
const pg = await ctx.newPage(),
  errs = [];
pg.on('pageerror', e => errs.push(e.message.slice(0, 200)));
const ready = () => pg.waitForFunction(() => window.__pb && window.__pb.ready(), null, {timeout: 150000, polling: 400});
// the table list, then the table from it
await pg.goto(srv.url + '/index.html');
const man = await pg.evaluate(async () => {
  const l = document.querySelector('link[rel=manifest]');
  const m = await (await fetch(l.href)).json();
  const icons = await Promise.all(m.icons.map(async i => (await fetch(new URL(i.src, l.href))).ok));
  return {m, icons, apple: !!document.querySelector('link[rel=apple-touch-icon]')};
});
ok(
  'manifest: name, start url, full-screen display',
  man.m.name && man.m.start_url && /fullscreen|standalone/.test(man.m.display)
);
ok(
  'manifest: 192, 512 and maskable icons all load',
  man.icons.every(Boolean) && man.m.icons.some(i => i.purpose === 'maskable')
);
ok('an apple touch icon on the page', man.apple);
await pg.evaluate(() => navigator.serviceWorker.ready);
await pg.reload();
await pg.waitForFunction(() => navigator.serviceWorker.controller, null, {timeout: 20000}).catch(() => {});
ok('service worker installed and controlling the page', await pg.evaluate(() => !!navigator.serviceWorker.controller));
await pg.goto(srv.url + '/tables/' + table + '/');
await ready();
ok(
  'the table page links the manifest and is under the same worker',
  await pg.evaluate(() => !!document.querySelector('link[rel=manifest]') && !!navigator.serviceWorker.controller)
);
await ctx.setOffline(true);
await pg.reload({waitUntil: 'domcontentloaded', timeout: 150000});
await ready().catch(() => {});
ok(
  'the table reloads and runs with no network',
  await pg.evaluate(() => !!(window.__pb && window.__pb.ready() && document.querySelector('#menu button')))
);
ok(
  'its title menu offers the way back to the table list',
  await pg.evaluate(() => [...document.querySelectorAll('#menu button')].some(b => /other tables/i.test(b.textContent)))
);
await pg.goto(srv.url + '/index.html').catch(() => {});
ok('the table list opens with no network', await pg.evaluate(() => document.querySelectorAll('a.table').length >= 5));
await ctx.setOffline(false);
await pg.goto(srv.url + '/tables/' + table + '/');
await ready();
// play, upright
await pg.evaluate(() => {
  const P = window.__pb.api;
  P.setQuality('low', true);
  P.UI.menu(null);
  P.startRun(P.uses.classes ? 'knight' : 'plain', null);
});
await pg.tap('#stage', {position: {x: 60, y: 600}}).catch(() => {});
await pg.waitForTimeout(1500);
const up = await pg.evaluate(() => {
  const g = id => document.getElementById(id),
    cs = el => getComputedStyle(el),
    r = el => el.getBoundingClientRect();
  const tn = g('tN'),
    cb = g('camBtn'),
    pb = g('pauseBtn');
  return {
    gfx: cs(g('gfx')).display,
    tnText: tn.textContent,
    tnBg: cs(tn).backgroundColor,
    tnBd: cs(tn).borderTopWidth,
    cam: [Math.round(r(cb).y), Math.round(r(cb).width), Math.round(r(cb).height), cb.hidden],
    pause: [Math.round(r(pb).width), Math.round(r(pb).height)],
    journal: cs(g('journal')).display,
    sheet: cs(g('sheet')).display,
    touch: window.__pb.api.UI.touch,
    chips: g('hFx').textContent
  };
});
ok('upright: the camera and quality strip is not shown (' + up.gfx + ')', up.gfx === 'none');
ok(
  'upright: the nudge block is gone: no word, no fill, no border (' +
    JSON.stringify([up.tnText, up.tnBg, up.tnBd]) +
    ')',
  !up.tnText && /rgba\(0, 0, 0, 0\)|transparent/.test(up.tnBg) && up.tnBd === '0px'
);
ok(
  'upright: a 44 px view button at the top (' + up.cam + ') and a 44 px pause (' + up.pause + ')',
  !up.cam[3] && up.cam[0] < 140 && up.cam[1] >= 44 && up.cam[2] >= 44 && up.pause[0] >= 44
);
ok(
  'upright: the two side panels are not shown (' + up.journal + ', ' + up.sheet + ')',
  up.journal === 'none' && up.sheet === 'none'
);
ok('the launch hint names the right side (' + up.chips.slice(0, 60) + ')', /right side/i.test(up.chips));
const v0 = await pg.evaluate(async () => (await import('/engine/api.js')).R3.camMode);
await pg.tap('#camBtn');
ok(
  'tapping the view button changes the view',
  await pg.evaluate(async v => (await import('/engine/api.js')).R3.camMode !== v, v0)
);
// nudge: double-tap a side; spaced taps do not; the invisible bottom-middle zone does
const nd = await pg.evaluate(async () => {
  const m = await import('/engine/api.js'),
    G = m.G;
  G.plunge.ready = false;
  G.balls.forEach(b => {
    b.x = m.OX[m.BT] + 300;
    b.y = m.TY[m.BT] + 600;
    b.vx = b.vy = 0;
  });
  G.tilt = 0;
  G.nudges = [];
  G.nudgeCd = 0;
  const L = document.getElementById('tL'),
    tap = id => {
      L.dispatchEvent(new PointerEvent('pointerdown', {pointerId: id, pointerType: 'touch', bubbles: true}));
      L.dispatchEvent(new PointerEvent('pointerup', {pointerId: id, pointerType: 'touch', bubbles: true}));
    };
  window.__pb.api.hold(true);
  for (let i = 0; i < 3; i++) window.__pb.api.gameStep(1 / 120);
  G.plunge.ready = false;
  const n0 = G.nudges.length;
  tap(11);
  tap(12);
  const a = G.nudges.length - n0;
  await new Promise(r => setTimeout(r, 420));
  G.nudges = [];
  tap(21);
  await new Promise(r => setTimeout(r, 420));
  tap(22);
  const b = G.nudges.length;
  await new Promise(r => setTimeout(r, 420));
  G.nudges = [];
  const tn = document.getElementById('tN');
  tn.dispatchEvent(new PointerEvent('pointerdown', {pointerId: 31, pointerType: 'touch', bubbles: true}));
  tn.dispatchEvent(new PointerEvent('pointerup', {pointerId: 31, pointerType: 'touch', bubbles: true}));
  const c = G.nudges.length;
  window.__pb.api.hold(false);
  return [a, b, c];
});
ok(
  'double-tapping a side nudges once (' +
    nd[0] +
    '); two taps 0.4 s apart do not (' +
    nd[1] +
    '); the bottom middle still nudges (' +
    nd[2] +
    ')',
  nd[0] === 1 && nd[1] === 0 && nd[2] === 1
);
const fog = async () =>
  pg.evaluate(async () => {
    const m = await import('/engine/api.js');
    m.R3.camMode = 0;
    for (let i = 0; i < 40; i++) m.updateCam3D(0.1);
    const c = m.R3.cam,
      d = Math.hypot(c.p.x - c.t.x, c.p.y - c.t.y, c.p.z - c.t.z),
      den = m.R3.scene.fog.density;
    return [Math.round(d), +(1 - Math.exp(-Math.pow(den * d, 2))).toFixed(2)];
  });
const fP = await fog();
await pg.screenshot({path: path.join(here, 'out', 'phone-upright.png'), timeout: 120000});
// a rotation whose resize event never arrives: the picture must still match the screen
await pg.evaluate(async () => {
  const m = await import('/engine/api.js');
  removeEventListener('resize', m.resize);
  if (window.visualViewport) window.visualViewport.removeEventListener('resize', m.resize);
});
await pg.setViewportSize({width: 844, height: 390});
await pg.waitForTimeout(1500);
const asp = await pg.evaluate(async () => {
  const m = await import('/engine/api.js'),
    st = document.getElementById('stage'),
    gl = document.getElementById('gl');
  return [st.clientWidth / st.clientHeight, m.R3.camera.aspect, gl.width / gl.height];
});
ok(
  'on its side after a missed resize: no stretch (' + asp.map(x => +x.toFixed(3)) + ')',
  Math.abs(asp[0] - asp[1]) < 0.01 && Math.abs(asp[0] - asp[2]) < 0.02
);
const fL = await fog();
ok(
  'the table sits in the same fog upright as on its side (upright d ' +
    fP[0] +
    ' fog ' +
    fP[1] +
    '; on its side d ' +
    fL[0] +
    ' fog ' +
    fL[1] +
    ')',
  Math.abs(fP[1] - fL[1]) < 0.03
);
const side = await pg.evaluate(() => {
  const g = id => document.getElementById(id),
    cs = el => getComputedStyle(el),
    r = el => el.getBoundingClientRect();
  return {
    journal: cs(g('journal')).display,
    sheet: cs(g('sheet')).display,
    jw: Math.round(r(g('journal')).width),
    sw: Math.round(r(g('sheet')).width),
    gfx: cs(g('gfx')).display
  };
});
ok(
  'on its side: both side panels are shown (' + JSON.stringify(side) + ')',
  side.journal === 'block' && side.sheet === 'block' && side.gfx === 'none'
);
await pg.screenshot({path: path.join(here, 'out', 'phone-side.png'), timeout: 120000});
await pg.setViewportSize({width: 390, height: 844});
await pg.waitForTimeout(1500);
const asp2 = await pg.evaluate(async () => {
  const m = await import('/engine/api.js'),
    st = document.getElementById('stage');
  return [st.clientWidth / st.clientHeight, m.R3.camera.aspect];
});
ok('and upright again: no stretch (' + asp2.map(x => +x.toFixed(3)) + ')', Math.abs(asp2[0] - asp2[1]) < 0.01);
ok('no page errors', !errs.length);
console.log(log.join('\n'));
if (errs.length) console.log(errs.join('\n'));
const f = log.filter(l => l.startsWith('FAIL')).length;
console.log(f + ' failed of ' + log.length);
await br.close();
srv.server.close();
process.exit(f ? 1 : 0);
