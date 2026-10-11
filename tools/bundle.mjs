/* One-file builds. The game needs no build step to run; this is for handing it to someone as a single .html.

     node tools/bundle.mjs gravebound          -> dist/gravebound.html      one table, nothing else needed, works offline
     node tools/bundle.mjs all                 -> dist/pinballsauce.html    every table behind a picker
     options:  --cdn        load three.js from cdnjs instead of carrying it (smaller file, needs the network)
               --fragment   no <!doctype>/<html>/<head>/<body>: for hosts that wrap the page themselves
               --out path   where to write

   How it works. Every module the entry reaches is parsed, and the modules are written one after another into a single
   <script type="module">, in the order a browser would have evaluated them. Imports and the word `export` are
   removed: in one scope, a name simply is the thing it named. Where two modules use the same top-level name for
   different things, one is renamed (name$3), along with every reference to it. Live bindings (`export let`, which
   engine/table/layout.js and content.js rely on) therefore keep working: there is only one variable.
   tests/replay.mjs can run against the result (--url), which is how to know a bundle is still the same game. */
import fs from 'fs';
import path from 'path';
import {fileURLToPath} from 'url';
import * as acorn from 'acorn';
import {analyze} from 'eslint-scope';
const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..'),
  args = process.argv.slice(2);
const flag = n => args.includes('--' + n),
  opt = n => {
    const i = args.indexOf('--' + n);
    return i < 0 ? null : args[i + 1];
  };
const what = args.find(a => !a.startsWith('--') && a !== opt('out')) || 'all';
const tables =
  what === 'all'
    ? fs
        .readdirSync(path.join(root, 'tables'))
        .filter(d => fs.existsSync(path.join(root, 'tables', d, 'table.js')))
        .sort()
    : [what];
for (const t of tables)
  if (!fs.existsSync(path.join(root, 'tables', t, 'table.js'))) {
    console.error('no such table: ' + t);
    process.exit(1);
  }
const read = p => fs.readFileSync(path.join(root, p), 'utf8');

/* ---------- 1. the module graph, in evaluation order ---------- */
const VIRT = '/__entry__.js',
  virtual = {};
virtual[VIRT] =
  what === 'all'
    ? "import {pickTable} from '/engine/app/picker.js';\nimport {boot} from '/engine/app/shell.js';\nimport {CATALOG} from '/catalog.js';\n" +
      tables.map((t, i) => 'import t' + i + " from '/tables/" + t + "/table.js';").join('\n') +
      '\npickTable([' +
      tables.map((t, i) => 't' + i).join(',') +
      '],' +
      JSON.stringify(
        Object.fromEntries(
          tables
            .map(t => [
              t,
              fs.existsSync(path.join(root, 'tables', t, 'theme/theme.css'))
                ? read('tables/' + t + '/theme/theme.css')
                : ''
            ])
            .filter(q => q[1])
        )
      ) +
      ',CATALOG,boot);\n'
    : "import {boot} from '/engine/app/shell.js';\nimport table from '/tables/" +
      tables[0] +
      "/table.js';\nboot(table);\n";
const mods = new Map(),
  order = [];
function load(id) {
  if (mods.has(id)) return;
  const src = virtual[id] || read(id.slice(1)),
    ast = acorn.parse(src, {ecmaVersion: 2022, sourceType: 'module', ranges: true}),
    m = {id, src, ast, deps: []};
  mods.set(id, m);
  for (const n of ast.body)
    if (
      (n.type === 'ImportDeclaration' || n.type === 'ExportAllDeclaration' || n.type === 'ExportNamedDeclaration') &&
      n.source
    ) {
      const d = n.source.value[0] === '/' ? n.source.value : path.posix.join(path.posix.dirname(id), n.source.value);
      n.dep = d;
      m.deps.push(d);
      load(d);
    }
  order.push(m);
}
load(VIRT);

/* ---------- 2. what each module declares, exports and leaves free ---------- */
const free = new Set();
order.forEach((m, i) => {
  m.i = i;
  const sm = analyze(m.ast, {ecmaVersion: 2022, sourceType: 'module'});
  m.scope = sm.scopes.find(s => s.type === 'module');
  for (const r of sm.globalScope.through) free.add(r.identifier.name);
  m.exp = new Map();
  m.stars = [];
  m.def = null;
  for (const n of m.ast.body) {
    if (n.type === 'ExportNamedDeclaration') {
      if (n.source) throw new Error(m.id + ': "export {..} from" is not supported; import then export');
      if (n.declaration) {
        const d = n.declaration;
        if (d.id) m.exp.set(d.id.name, d.id.name);
        else
          for (const v of d.declarations) {
            if (v.id.type !== 'Identifier') throw new Error(m.id + ': export a plain name, not a pattern');
            m.exp.set(v.id.name, v.id.name);
          }
      }
      for (const s of n.specifiers) m.exp.set(s.exported.name, s.local.name);
    } else if (n.type === 'ExportAllDeclaration') m.stars.push(n.dep);
    else if (n.type === 'ExportDefaultDeclaration') m.def = '__default$' + i;
  }
});
// where an exported name really lives: follows `export *`
function find(id, name, seen) {
  const m = mods.get(id);
  if (name === 'default') return m.def ? {m, local: null} : null;
  if (m.exp.has(name)) return {m, local: m.exp.get(name)};
  seen = seen || new Set();
  if (seen.has(id)) return null;
  seen.add(id);
  for (const d of m.stars) {
    const r = find(d, name, seen);
    if (r) return r;
  }
  return null;
}

/* ---------- 3. one final name per top-level thing ---------- */
const taken = new Set();
for (const m of order) {
  m.final = new Map();
  for (const v of m.scope.variables) {
    if (v.defs.some(d => d.type === 'ImportBinding')) continue;
    let nm = v.name;
    if (taken.has(nm) || free.has(nm)) nm = v.name + '$' + m.i;
    taken.add(nm);
    m.final.set(v.name, nm);
  }
  if (m.def) taken.add(m.def);
}

/* ---------- 4. rewrite each module ---------- */
const shorthand = new Map(); // start offset of an identifier that is the value of a shorthand property -> true
function walk(n, f) {
  if (!n || typeof n.type !== 'string') return;
  f(n);
  for (const k in n) {
    const v = n[k];
    if (k === 'dep') continue;
    if (Array.isArray(v)) v.forEach(c => walk(c, f));
    else if (v && typeof v.type === 'string') walk(v, f);
  }
}
let renames = 0;
const out = order
  .map(m => {
    const ed = [],
      short = new Set();
    walk(m.ast, n => {
      if (n.type === 'Property' && n.shorthand) {
        const v = n.value.type === 'AssignmentPattern' ? n.value.left : n.value;
        short.add(v.start);
      }
    });
    const rename = (v, to) => {
      if (v.name === to) return;
      renames++;
      const seen = new Set();
      for (const id of v.identifiers.concat(v.references.map(r => r.identifier))) {
        if (seen.has(id.start)) continue;
        seen.add(id.start);
        ed.push([id.start, id.end, short.has(id.start) ? id.name + ':' + to : to]);
      }
    };
    for (const v of m.scope.variables) {
      const imp = v.defs.find(d => d.type === 'ImportBinding');
      if (!imp) {
        rename(v, m.final.get(v.name));
        continue;
      }
      const spec = imp.node,
        decl = imp.parent,
        dep = decl.dep;
      if (spec.type === 'ImportNamespaceSpecifier')
        throw new Error(m.id + ': "import * as" is not supported by the bundler');
      const name = spec.type === 'ImportDefaultSpecifier' ? 'default' : spec.imported.name,
        r = find(dep, name);
      if (!r) throw new Error(m.id + ': ' + dep + ' does not export ' + name);
      const to = r.local === null ? r.m.def : r.m.final.get(r.local);
      // only the uses are renamed: the import statement itself is deleted below
      if (v.name !== to) {
        renames++;
        const seen = new Set();
        for (const ref of v.references) {
          const id = ref.identifier;
          if (seen.has(id.start)) continue;
          seen.add(id.start);
          ed.push([id.start, id.end, short.has(id.start) ? id.name + ':' + to : to]);
        }
      }
    }
    for (const n of m.ast.body) {
      if (n.type === 'ImportDeclaration' || n.type === 'ExportAllDeclaration') ed.push([n.start, n.end, '']);
      else if (n.type === 'ExportNamedDeclaration') {
        if (n.declaration) ed.push([n.start, n.declaration.start, '']);
        else ed.push([n.start, n.end, '']);
      } else if (n.type === 'ExportDefaultDeclaration') {
        const d = n.declaration;
        if ((d.type === 'FunctionDeclaration' || d.type === 'ClassDeclaration') && d.id)
          throw new Error(m.id + ': export default of a named function is not supported');
        ed.push([n.start, d.start, 'const ' + m.def + '=']);
      }
    }
    const cuts = ed.filter(e => e[2] === ''),
      keep = ed.filter(e => e[2] === '' || !cuts.some(d => d[0] <= e[0] && e[1] <= d[1])); // a rename inside something being deleted is moot
    keep.sort((a, b) => b[0] - a[0]);
    let s = m.src;
    for (let k = 0; k < keep.length; k++) {
      const e = keep[k];
      if (k && e[1] > keep[k - 1][0]) throw new Error(m.id + ': overlapping edits at ' + e[0]);
      s = s.slice(0, e[0]) + e[2] + s.slice(e[1]);
    }
    return (
      '\n/* ---------------- ' +
      (m.id === VIRT ? 'entry' : m.id.slice(1)) +
      ' ---------------- */\n' +
      s.replace(/^\s*\n/gm, '')
    );
  })
  .join('\n');
// the result must parse, and must not declare anything twice
acorn.parse(out, {ecmaVersion: 2022, sourceType: 'module'});

/* ---------- 5. the page ---------- */
const VEND = [
  'three.min.js',
  'examples/js/shaders/CopyShader.js',
  'examples/js/shaders/LuminosityHighPassShader.js',
  'examples/js/postprocessing/EffectComposer.js',
  'examples/js/postprocessing/RenderPass.js',
  'examples/js/postprocessing/ShaderPass.js',
  'examples/js/postprocessing/UnrealBloomPass.js'
];
const safe = s => s.replace(/<\/script/gi, '<\\/script').replace(/<!--/g, '<\\!--');
const cdn = flag('cdn'),
  fragment = flag('fragment');
const NOLIB =
  '<script>if(!window.THREE)document.body.insertAdjacentHTML("afterbegin","<p style=\\"margin:0;padding:24px 16px;font:16px/1.5 system-ui,sans-serif;color:#ece4cf;background:#07070b\\">The 3D library (three.js, from cdnjs.cloudflare.com) did not load, so the table cannot be drawn. Check the connection and reload.</p>");</script>';
const libs = VEND.map((f, k) =>
  k === 0 && cdn
    ? '<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>\n' + NOLIB
    : '<script>/* three.js r128: ' +
      f +
      ' (MIT, vendor/three/LICENSE) */\n' +
      safe(read('vendor/three/' + f)) +
      '\n</script>'
).join('\n');
const one = tables.length === 1 ? tables[0] : null,
  name = one ? (/name:'([^']+)'/.exec(read('tables/' + one + '/table.js')) || [0, one])[1] : 'Pinballsauce';
let css = read('engine/ui/page.css');
if (one && fs.existsSync(path.join(root, 'tables', one, 'theme/theme.css')))
  css += '\n' + read('tables/' + one + '/theme/theme.css');
const fonts = [
  ...new Set(
    tables
      .map(
        t =>
          (/<link rel="stylesheet" href="(https:\/\/fonts\.googleapis\.com[^"]+)"/.exec(
            read('tables/' + t + '/index.html')
          ) || [])[1]
      )
      .filter(Boolean)
  )
];
const head =
  '<title>' +
  name +
  '</title>\n' +
  fonts.map(f => '<link rel="stylesheet" href="' + f + '">').join('\n') +
  '\n<style>[hidden]{display:none!important}\n' +
  css +
  '\n</style>';
const body = libs + '\n<script type="module">' + safe(out) + '\n</script>';
const html = fragment
  ? head + '\n' + body + '\n'
  : '<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no,viewport-fit=cover">\n<meta name="theme-color" content="#07070b">\n' +
    head +
    '\n</head>\n<body>\n' +
    body +
    '\n</body>\n</html>\n';
const file = opt('out') ? path.resolve(opt('out')) : path.join(root, 'dist', (one || 'pinballsauce') + '.html');
fs.mkdirSync(path.dirname(file), {recursive: true});
fs.writeFileSync(file, html);
console.log(
  'wrote ' +
    path.relative(process.cwd(), file) +
    '  ' +
    (html.length / 1024).toFixed(0) +
    ' KB  (' +
    order.length +
    ' modules, ' +
    tables.join(' + ') +
    ', ' +
    renames +
    ' names made unique' +
    (cdn ? ', three.js from cdnjs' : '') +
    ')'
);
