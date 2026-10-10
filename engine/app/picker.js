/* ================= THE TABLE PICKER =================
   For a build that carries more than one table in one page (tools/bundle.mjs all). One table runs per page load:
   the picker shows the tables, boots the one chosen, and "Other tables" in a table's title menu comes back here.
   The page's address can name a table to skip the picker: #gravebound, or #gravebound.inspect for inspect mode.
   A single-table page never loads this file. */
import {boot} from './shell.js';

const STYLE = `
/* layout: one column of marquee panels, each lit in its own table's colour and lettered in its own face */
:root{--pk-bg:#07080d;--pk-panel:#0f111a;--pk-line:#272b3d;--pk-ink:#ebe7da;--pk-dim:#9c9cb0;--pk-key:#11131d;color-scheme:dark;
  --pk-display:"Arial Black","Segoe UI",system-ui,sans-serif;--pk-body:Spectral,Georgia,"Times New Roman",serif;--pk-mono:ui-monospace,Menlo,Consolas,monospace}
html,body{height:100%}
body{margin:0;background:var(--pk-bg);color:var(--pk-ink);font:16px/1.5 var(--pk-body)}
#pk{position:absolute;inset:0;overflow-y:auto;-webkit-user-select:text;user-select:text} /* the game's page pins the body, so the picker scrolls inside itself */
#pk>div{min-height:100%;box-sizing:border-box;display:flex;flex-direction:column;gap:28px;max-width:760px;margin:0 auto;padding-block:calc(36px + env(safe-area-inset-top,0px)) calc(28px + env(safe-area-inset-bottom,0px));padding-inline:16px}
#pk header{display:flex;flex-direction:column;gap:6px}
#pk h1{margin:0;font:900 clamp(26px,7vw,40px)/1 var(--pk-display);letter-spacing:.14em;text-transform:uppercase;text-wrap:balance}
#pk header p{margin:0;color:var(--pk-dim);max-width:60ch}
#pk ol{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:16px}
#pk li{--c:#d9a441;display:grid;grid-template-columns:minmax(0,1fr) auto;gap:14px 22px;align-items:end;padding:20px 20px 18px;border:1px solid var(--pk-line);border-top:3px solid var(--c);
  background:linear-gradient(100deg,color-mix(in srgb,var(--c) 16%,var(--pk-panel)) 0%,var(--pk-panel) 46%)}
#pk li>div{min-width:0;display:flex;flex-direction:column;gap:6px}
#pk h2{margin:0;font-weight:700;font-size:clamp(28px,8vw,44px);line-height:1;color:var(--c);text-wrap:balance}
#pk .blurb{margin:0}
#pk .facts{margin:0;font:12px/1.5 var(--pk-mono);letter-spacing:.06em;text-transform:uppercase;color:var(--pk-dim)}
#pk nav{display:flex;gap:10px;flex-wrap:wrap}
#pk button{font:700 13px/1 var(--pk-mono);letter-spacing:.12em;text-transform:uppercase;color:var(--pk-ink);background:var(--pk-key);border:1px solid var(--pk-line);height:46px;padding:0 20px;cursor:pointer}
#pk button.go{background:var(--c);border-color:var(--c);color:#0a0a0e}
#pk button:hover{border-color:var(--c)}
#pk button:focus-visible{outline:2px solid var(--pk-ink);outline-offset:2px}
#pk footer{margin-top:auto;color:var(--pk-dim);font-size:14px;display:flex;flex-direction:column;gap:4px}
#pk footer p{margin:0;max-width:65ch}
#pk kbd{font:12px var(--pk-mono);border:1px solid var(--pk-line);padding:1px 5px}
@media (max-width:560px){#pk li{grid-template-columns:minmax(0,1fr)}#pk nav button{flex:1}}
`;
const esc = s => String(s).replace(/[&<>"]/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'})[c]);

// tables: the table definitions. css: {tableId: text of its theme.css}, applied when that table boots.
export function pickTable(tables, css) {
  css = css || {};
  window.__pbTables = () => {
    try {
      history.replaceState(null, '', location.pathname + location.search);
    } catch (e) {}
    location.reload();
  };
  const go = (def, inspect) => {
    for (const id of ['pk', 'pkStyle']) {
      const el = document.getElementById(id);
      if (el) el.remove();
    }
    if (css[def.id]) {
      const s = document.createElement('style');
      s.textContent = css[def.id];
      document.body.appendChild(s);
    } // last in the page, so it wins over page.css wherever a host put that
    try {
      history.replaceState(null, '', '#' + def.id);
    } catch (e) {}
    boot(def, {inspect});
  };
  const h = (location.hash || '').slice(1),
    want = tables.find(t => h === t.id || h === t.id + '.inspect');
  if (want) {
    go(want, h !== want.id);
    return;
  }
  const st = document.createElement('style');
  st.id = 'pkStyle';
  st.textContent = STYLE;
  document.body.appendChild(st);
  const n = (k, one, many) => k + ' ' + (k === 1 ? one : many || one + 's');
  const cards = tables
    .map((t, i) => {
      const L = t.layout,
        th = t.theme || {},
        pal = th.pal,
        c = t.accent || (pal ? pal[L.fields.length - 1].acc : '#d9a441'),
        face = (th.fonts && th.fonts.fontD) || '"Grenze Gotisch","Old English Text MT",Georgia,serif',
        x = t.content.text || {};
      // only what the table has: a plain table lists its playfield and its ramps and nothing else
      const count = o => Object.keys(o || {}).length,
        u = t.uses || {},
        facts = [n(L.fields.length, 'playfield')];
      if (u.foes !== false && count(t.content.foes)) facts.push(n(count(t.content.foes), 'foe'));
      if (u.bosses !== false && count(t.content.bosses)) facts.push(n(count(t.content.bosses), 'boss', 'bosses'));
      if (u.quests !== false && count(t.content.campaigns))
        facts.push(n(count(t.content.campaigns), t.content.foes ? 'campaign' : 'mission'));
      if ((L.wings || []).length) facts.push(n(L.wings.length, 'wing'));
      if ((L.ramps || []).length) facts.push(n(L.ramps.length, 'ramp'));
      return (
        '<li style="--c:' +
        esc(c) +
        '"><div><h2 style="font-family:' +
        esc(face).replace(/&quot;/g, "'") +
        '">' +
        esc(t.name) +
        '</h2><p class="blurb">' +
        esc(t.blurb || x.eyebrow || '') +
        '</p><p class="facts">' +
        esc(facts.join(' · ')) +
        '</p></div>' +
        '<nav aria-label="' +
        esc(t.name) +
        '"><button type="button" class="go" data-i="' +
        i +
        '">Play</button><button type="button" data-i="' +
        i +
        '" data-ins="1">Inspect</button></nav></li>'
      );
    })
    .join('');
  const el = document.createElement('main');
  el.id = 'pk';
  el.innerHTML =
    '<div><header><h1>Pinballsauce</h1><p>' +
    n(tables.length, 'pinball table') +
    ' built from the same parts. The ball and the flippers are shared; each table has its own layout, its own world, and only the game systems it wants.</p></header><ol>' +
    cards +
    '</ol>' +
    '<footer><p>Play is the game. Inspect opens the table top-down with every piece labelled, a coordinate grid, pan, zoom and a screenshot button.</p><p>In a table: <kbd>Z</kbd> and <kbd>/</kbd> flip, <kbd>Space</kbd> launches and nudges, <kbd>I</kbd> toggles inspect. On a phone, tap the left and right halves. Saves stay in this browser.</p></footer></div>';
  el.addEventListener('click', e => {
    const b = e.target.closest('button[data-i]');
    if (b) go(tables[+b.dataset.i], !!b.dataset.ins);
  });
  document.body.insertAdjacentElement('afterbegin', el);
}
