/* Static check of every module under engine/ and tables/: it parses, every import names something the other file
   really exports, nothing is used without being imported, nothing imported is assigned to, and engine/ never
   imports from tables/. Run it after any edit: `npm run check`. A browser only reports these one at a time, at run
   time, on the code path that hits them. */
import fs from 'fs';import path from 'path';import {fileURLToPath} from 'url';import * as acorn from 'acorn';import {createRequire} from 'module';
const eslintScope=createRequire(import.meta.url)('eslint-scope');
const root=path.join(path.dirname(fileURLToPath(import.meta.url)),'..');
const BROWSER=new Set('window document Math THREE localStorage requestAnimationFrame cancelAnimationFrame performance navigator Date JSON Object Array Set Map WeakMap Float32Array Uint8Array parseInt parseFloat isFinite isNaN setTimeout clearTimeout setInterval clearInterval addEventListener removeEventListener innerWidth innerHeight console location matchMedia String Number Promise Error TypeError RegExp Symbol undefined NaN Infinity Function Boolean URL URLSearchParams Blob fetch devicePixelRatio Image history globalThis Intl encodeURIComponent decodeURIComponent'.split(' '));
const files=[];const walk=d=>{for(const f of fs.readdirSync(d,{withFileTypes:true})){const p=path.join(d,f.name);if(f.isDirectory())walk(p);else if(f.name.endsWith('.js'))files.push(p);}};
walk(path.join(root,'engine'));walk(path.join(root,'tables'));
const mods={},errs=[];const rel=f=>path.relative(root,f).split(path.sep).join('/');
for(const f of files){const src=fs.readFileSync(f,'utf8');let ast;try{ast=acorn.parse(src,{ecmaVersion:2022,sourceType:'module',ranges:true,locations:true});}catch(e){errs.push(rel(f)+': does not parse: '+e.message);continue;}
  const ex=new Set(),stars=[],imps=[];
  for(const n of ast.body){
    if(n.type==='ExportNamedDeclaration'){if(n.declaration){if(n.declaration.id)ex.add(n.declaration.id.name);else for(const d of n.declaration.declarations||[])if(d.id.type==='Identifier')ex.add(d.id.name);}for(const s of n.specifiers||[])ex.add(s.exported.name);if(n.source)imps.push({from:n.source.value,names:n.specifiers.map(s=>s.local.name),line:n.loc.start.line});}
    else if(n.type==='ExportDefaultDeclaration')ex.add('default');
    else if(n.type==='ExportAllDeclaration')stars.push(n.source.value);
    else if(n.type==='ImportDeclaration')imps.push({from:n.source.value,names:n.specifiers.map(s=>s.type==='ImportDefaultSpecifier'?'default':s.type==='ImportNamespaceSpecifier'?'*':s.imported.name),line:n.loc.start.line});}
  mods[f]={ast,ex,stars,imps};}
const exportsOf=(f,seen=new Set())=>{if(seen.has(f)||!mods[f])return new Set();seen.add(f);const s=new Set(mods[f].ex);for(const st of mods[f].stars)for(const n of exportsOf(path.resolve(path.dirname(f),st),seen))s.add(n);return s;};
for(const f of files){const M=mods[f];if(!M)continue;
  for(const im of M.imps){const tgt=path.resolve(path.dirname(f),im.from);if(!mods[tgt]){errs.push(rel(f)+':'+im.line+': imports '+im.from+', which is not there');continue;}
    if(rel(f).startsWith('engine/')&&rel(tgt).startsWith('tables/'))errs.push(rel(f)+':'+im.line+': the engine must not import from a table ('+im.from+')');
    const have=exportsOf(tgt);for(const n of im.names)if(n!=='*'&&!have.has(n))errs.push(rel(f)+':'+im.line+': '+im.from+' does not export '+n);}
  for(const st of M.stars)if(!mods[path.resolve(path.dirname(f),st)])errs.push(rel(f)+': export * from '+st+', which is not there');
  const sm=eslintScope.analyze(M.ast,{ecmaVersion:2022,sourceType:'module'});
  for(const ref of sm.globalScope.through){const n=ref.identifier.name;if(!BROWSER.has(n))errs.push(rel(f)+':'+ref.identifier.loc.start.line+': '+n+' is used but never imported or defined');}
  for(const v of sm.scopes.find(s=>s.type==='module').variables)if(v.defs.some(d=>d.type==='ImportBinding'))for(const r of v.references)if(r.isWrite())errs.push(rel(f)+':'+r.identifier.loc.start.line+': assigns to the import '+v.name);}
// names exported twice through engine/api.js would shadow each other silently
{const api=path.join(root,'engine/api.js');if(mods[api]){const seen={};for(const st of mods[api].stars){const t=path.resolve(path.dirname(api),st);for(const n of (mods[t]||{ex:[]}).ex){if(seen[n])errs.push('engine/api.js: '+n+' is exported by both '+seen[n]+' and '+rel(t));seen[n]=rel(t);}}}}
console.log(errs.length?errs.join('\n')+'\n\nFAILED: '+errs.length+' problem'+(errs.length>1?'s':''):'PASSED: '+files.length+' modules parse, every import resolves, nothing undefined.');process.exit(errs.length?1:0);
