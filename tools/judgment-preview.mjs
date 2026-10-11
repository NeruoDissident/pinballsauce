// Maintainer capture utility: real rendered playfields, no composited artwork.
import {chromium} from 'playwright';
import {serve, local} from '../tests/serve.mjs';
import {fileURLToPath} from 'node:url';
import fs from 'node:fs';
import path from 'node:path';
const root = fileURLToPath(new URL('..', import.meta.url));
const output = path.resolve(process.argv[2] || '../preview');
fs.mkdirSync(output, {recursive: true});
const srv = await serve(root),
  br = await chromium.launch({
    args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist']
  });
try {
  const pg = await br.newPage({viewport: {width: 1200, height: 1050}});
  pg.on('pageerror', e => console.error(e.message));
  await local(pg, 'judgment');
  await pg.goto(srv.url + '/tables/judgment/');
  await pg.waitForFunction(() => window.__pb?.ready());
  await pg.evaluate(() => {
    const p = window.__pb.api;
    p.hold(true);
    p.draw(8, 0.1);
  });
  await pg.screenshot({path: path.join(output, 'judgment-title.png')});
  for (let tier = 0; tier < (process.argv.includes('--ui-only') ? 0 : 3); tier++) {
    await pg.evaluate(tier => {
      const p = window.__pb.api;
      p.closeInspect();
      p.UI.menu(null);
      p.startRun('knight');
      p.G.balls = [p.newBall(320, p.fields[tier].y + 620, 0, 0)];
      p.G.focusTier = tier;
      p.R3.camMode = 0;
      p.UI.q = [];
      p.UI.next();
      p.draw(6, 0.8);
      p.UI.sync(true);
    }, tier);
    await pg.screenshot({path: path.join(output, ['heaven', 'earth', 'hell'][tier] + '-play.png')});
    for (const tilted of [false, true]) {
      await pg.evaluate(
        ({tier, tilted}) => {
          const p = window.__pb.api;
          p.openInspect();
          p.INS.tier = tier;
          p.INS.x = 320;
          p.INS.y = p.fields[tier].y + 440;
          p.INS.span = 1250;
          p.INS.tilt = tilted;
          for (const k in p.INS.layers) p.INS.layers[k] = false;
          p.draw(3, 0.8);
        },
        {tier, tilted}
      );
      await pg.screenshot({
        path: path.join(output, ['heaven', 'earth', 'hell'][tier] + (tilted ? '-tilted' : '-top') + '.png')
      });
    }
  }
  if (!process.argv.includes('--ui-only')) for (const tier of [0,2]) {
    await pg.evaluate(tier => {
      const p=window.__pb.api;
      p.closeInspect(); p.startRun('knight'); p.UI.menu(null);
      Object.assign(p.G.run,{souls:[true,true,true],judgment:2,chains:true,attack:25,wounds:2});
      p.G.balls=[];
      for(let i=0;i<140;i++) p.gameStep(1/120);
      p.G.balls=[p.newBall(320,p.fields[tier].y+650,0,0)];p.G.focusTier=tier;
      p.UI.q=[];p.UI.next();p.draw(6,.8);p.UI.sync(true);
    },tier);
    await pg.screenshot({path:path.join(output,tier===0?'heaven-gates-open.png':'hell-jaw-open.png')});
  }
  const phone = await br.newPage({viewport: {width: 390, height: 844}, isMobile: true, hasTouch: true});
  await local(phone, 'judgment');
  await phone.goto(srv.url + '/tables/judgment/');
  await phone.waitForFunction(() => window.__pb?.ready());
  await phone.evaluate(() => {
    const p = window.__pb.api;
    p.hold(true);
    p.draw(2, 0.1);
  });
  await phone.screenshot({path: path.join(output, 'judgment-mobile-title.png')});
  await phone.evaluate(() => {
    const p = window.__pb.api;
    p.UI.menu(null);
    p.startRun('knight');
    p.UI.q = [];
    p.UI.next();
    p.draw(6, 0.8);
  });
  await phone.screenshot({path: path.join(output, 'judgment-mobile.png')});
  await phone.close();
  await pg.evaluate(() => {
    const p = window.__pb.api;
    p.closeInspect();
    p.startRun('knight');
    p.UI.menu(null);
    p.UI.q = [];
    p.UI.next();
    p.G.focusTier = 1;
    p.draw(6, 0.8);
  });
  await pg.setViewportSize({width: 1200, height: 1050});
  await pg.waitForTimeout(700);
  await pg.evaluate(async () => {
    const p = window.__pb.api,
      m = await import('/engine/api.js');
    p.G.run.souls = [true, true, true];
    p.G.run.judgment = 3;
    p.G.run.wounds = 3;
    p.G.run.won = 1;
    m.gameOver(true);
    p.draw(2, 0.1);
  });
  await pg.screenshot({path: path.join(output, 'judgment-salvation.png')});
  console.log('Screenshots: ' + output);
} finally {
  await br.close();
  srv.server.close();
}
