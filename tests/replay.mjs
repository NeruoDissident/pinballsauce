/* The engine's regression test: replay fixed inputs with a fixed random seed and compare the whole simulation,
   step for step, with a recording.

     node tests/replay.mjs [minutes=5] [--table gravebound] [--only name,name] [--record] [--url page]

   Gravebound's recording (tests/golden/gravebound.replay.json) was made from the original Gravebound 0.21 before it
   was split into engine and table: 20 scenarios, 25 minutes each. If this test passes, the ball, the flippers, the
   foes, the bosses, every score and every random number are still exactly what the original produced.
   A failure names the scenario and the game time where the two first differ.
   --record rewrites the recording. Only do that for a change you MEANT to make to how tables play. */
import {chromium} from 'playwright';import fs from 'fs';import path from 'path';import {fileURLToPath} from 'url';
import {serve} from './serve.mjs';import {SCEN,init,run} from './scenarios.mjs';
const here=path.dirname(fileURLToPath(import.meta.url)),args=process.argv.slice(2);
const opt=n=>{const i=args.indexOf('--'+n);return i<0?null:args[i+1]||true;};
const mins=+(args.find(a=>/^\d+(\.\d+)?$/.test(a))||5),table=opt('table')||'gravebound',only=opt('only'),record=args.includes('--record'),EVERY=12,CHUNK=100;
const gfile=path.join(here,'golden',table+'.replay.json');
const fnv=l=>{let h1=0x811c9dc5,h2=0x1b873593;for(const s of l)for(let i=0;i<s.length;i++){const c=s.charCodeAt(i);h1=Math.imul(h1^c,16777619);h2=Math.imul(h2^c,0x85ebca6b)+c|0;}return (h1>>>0).toString(16)+(h2>>>0).toString(16);};
const chunks=s=>{const o=[];for(let i=0;i+CHUNK<=s.length;i+=CHUNK)o.push(fnv(s.slice(i,i+CHUNK)));return o;};
const golden=fs.existsSync(gfile)?JSON.parse(fs.readFileSync(gfile,'utf8')):null;
if(!golden&&!record){console.error('no recording at '+gfile+' (make one with --record)');process.exit(1);}
const srv=await serve(path.join(here,'..'));const url=srv.url+'/'+(opt('url')||'tables/'+table+'/index.html'); // --url dist/gravebound.html checks a bundle (tools/bundle.mjs)
const br=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
const out={minutes:mins,every:EVERY,chunk:CHUNK,scenarios:{}},logs=[];let bad=0;
for(const sc of SCEN){if(only&&only!==true&&!only.split(',').some(o=>sc.name.includes(o)))continue;const t0=Date.now();
  const cx=await br.newContext({viewport:{width:640,height:400}});const pg=await cx.newPage();
  pg.on('pageerror',e=>logs.push('PAGE ERROR '+e.message+' '+(e.stack||'').split('\n').slice(1,4).join(' | ')));pg.on('console',m=>{if(m.type()==='error'&&!/ERR_FAILED|ERR_TUNNEL|favicon|net::/.test(m.text()))logs.push(m.text());});
  await pg.route('**/*',r=>/^http:\/\/127\.0\.0\.1/.test(r.request().url())?r.continue():r.abort());
  await pg.addInitScript(init,sc.seed);await pg.goto(url);
  await pg.waitForFunction(()=>window.__pb&&window.__pb.ready(),null,{timeout:180000,polling:300});
  const r=await pg.evaluate(run,[sc,mins,EVERY,null]);await cx.close();
  const got={chunks:chunks(r.samples),score:r.score,calls:r.calls,minutes:mins};out.scenarios[sc.name]=got;
  const secs=((Date.now()-t0)/1000).toFixed(1)+'s';
  if(r.err.length){bad++;console.log('ERROR   '+sc.name.padEnd(18)+r.err[0]);continue;}
  if(record){console.log('RECORDED '+sc.name.padEnd(18)+got.chunks.length+' chunks, score '+r.score+'  '+secs);continue;}
  const g=golden.scenarios[sc.name];if(!g){bad++;console.log('NO RECORDING '+sc.name);continue;}
  const n=Math.min(g.chunks.length,got.chunks.length);let i=0;while(i<n&&g.chunks[i]===got.chunks[i])i++;
  const whole=got.chunks.length===g.chunks.length;
  if(i===n&&(!whole||(g.score===r.score&&g.calls===r.calls)))console.log('MATCH   '+sc.name.padEnd(18)+(n*CHUNK*EVERY/120/60).toFixed(1)+' min of play identical'+(whole?', final score '+r.score:'')+'  '+secs);
  else{bad++;console.log('DIVERGE '+sc.name.padEnd(18)+'first difference between '+(i*CHUNK*EVERY/120).toFixed(0)+' s and '+((i+1)*CHUNK*EVERY/120).toFixed(0)+' s of game time');}}
await br.close();srv.server.close();
if(record){fs.mkdirSync(path.dirname(gfile),{recursive:true});fs.writeFileSync(gfile,JSON.stringify(out));console.log('wrote '+gfile);}
if(logs.length){console.log(logs.slice(0,10).join('\n'));bad++;}
console.log(bad?'\nFAILED: the simulation no longer matches the recording.':'\nPASSED: the simulation matches the recording step for step.');process.exit(bad?1:0);
