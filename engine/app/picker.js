/* Shared opening screen. Catalog metadata comes from the host; previews run in a separate frame.
   Selecting a table removes the preview before starting the real game. */
const STYLE = `
#pk{--pk-ink:#f1ede3;--pk-dim:#a7adb9;--pk-line:#ffffff24;position:fixed;inset:0;z-index:100;color:var(--pk-ink);background:#080b12;font:15px/1.45 "Segoe UI",system-ui,sans-serif;overflow:auto;color-scheme:dark}
#pk *{box-sizing:border-box}
#pk .pk-inner{position:relative;max-width:760px;margin:auto;padding:calc(32px + env(safe-area-inset-top,0px)) max(20px,env(safe-area-inset-right,0px)) calc(40px + env(safe-area-inset-bottom,0px)) max(20px,env(safe-area-inset-left,0px))}
#pk header{margin-bottom:32px}
#pk .eyebrow{font:600 11px/1.5 "Segoe UI",sans-serif;letter-spacing:.24em;text-transform:uppercase;color:#c5ac78;margin:0 0 12px}
#pk h1{font:900 clamp(30px,6vw,44px)/1 "Arial Black","Segoe UI",sans-serif;letter-spacing:-.055em;margin:0 0 12px;color:var(--pk-ink);text-shadow:none}
#pk header p:last-child{color:var(--pk-dim);margin:0}
#pk section{margin-top:26px}
#pk h2{font:600 11px/1.5 "Segoe UI",sans-serif;letter-spacing:.2em;text-transform:uppercase;display:flex;align-items:center;gap:12px;margin:0 0 12px;color:var(--pk-dim)}
#pk h2:after{content:"";height:1px;background:var(--pk-line);flex:1}
#pk ol{list-style:none;padding:0;margin:0;display:grid;gap:12px}
#pk li{border:1px solid var(--pk-line);border-left:3px solid var(--c);background:linear-gradient(110deg,color-mix(in srgb,var(--c) 9%,#121722),#121722);padding:20px;transition:background .15s,border-color .15s}
#pk li:hover,#pk li:focus-within{border-color:var(--c);background:linear-gradient(110deg,color-mix(in srgb,var(--c) 16%,#121722),#121722)}
#pk h3{margin:0;padding:0;border:0;text-transform:none;font:750 28px/1.1 "Segoe UI",sans-serif;letter-spacing:-.035em}
#pk a.table{color:var(--c);text-decoration:none}
#pk .blurb{color:var(--pk-dim);margin:9px 0 18px}
#pk nav{display:flex;gap:10px}
#pk button{font:650 11px/1 "Segoe UI",sans-serif;letter-spacing:.1em;text-transform:uppercase;border:1px solid var(--pk-line);border-radius:4px;color:var(--pk-ink);background:transparent;min-height:44px;padding:0 16px;cursor:pointer;box-shadow:none}
#pk nav button{flex:1}
#pk button.go{background:var(--c);border-color:var(--c);color:#080b12}
#pk button:hover{border-color:var(--pk-ink)}
#pk button:focus-visible,#pk a:focus-visible{outline:2px solid #fff;outline-offset:4px}
#pk footer{color:var(--pk-dim);font-size:12px;margin-top:24px;max-width:44ch}
#pk footer p{margin:6px 0}
#pk kbd{font:11px monospace;border:1px solid var(--pk-line);padding:1px 4px;border-radius:3px}
#pk .pk-preview,#pk .pk-feature{display:none}
@media(min-width:960px) and (pointer:fine){
 #pk{background:radial-gradient(ellipse at 75% 40%,#27364a,#080b12 75%)}
 #pk .pk-preview{display:block;position:absolute;inset:0 0 0 30%;width:70%;height:100%;border:0;pointer-events:none}
 #pk:after{content:"";position:absolute;inset:0;pointer-events:none;background:linear-gradient(90deg,#080b12 0%,#080b12f2 23%,#080b12a8 40%,#080b1220 65%),linear-gradient(0deg,#080b12ed,transparent 32%)}
 #pk .pk-inner{z-index:1;margin:0;padding:34px clamp(24px,4vw,72px);width:470px;min-height:100%;max-width:none}
 #pk header{margin-bottom:24px}
 #pk h1{font-size:42px}
 #pk section{margin-top:22px}
 #pk ol{gap:8px}
 #pk li{padding:12px 14px;display:grid;grid-template-columns:1fr auto;align-items:center;gap:12px;background:#121722b8;backdrop-filter:blur(12px)}
 #pk h3{font-size:22px}
 #pk .blurb{display:none}
 #pk nav{gap:6px}
 #pk nav button{padding:0 10px;min-height:38px}
 #pk nav button:not(.go){font-size:9px;padding:0 7px;color:var(--pk-dim)}
 #pk footer{font-size:11px;margin-top:22px}
 #pk .pk-feature{display:block;position:absolute;z-index:1;left:max(500px,44%);right:6%;bottom:7%;pointer-events:none}
 #pk .pk-feature h2{font:800 clamp(32px,4.5vw,72px)/1.1 "Segoe UI",sans-serif;letter-spacing:-.05em;color:var(--preview-color);margin:0 0 10px;text-transform:none;display:block;text-shadow:0 2px 24px #000}
 #pk .pk-feature h2:after{display:none}
 #pk .pk-feature .preview-note{margin:0 0 18px;color:#d5d9df;max-width:36ch;font-size:16px}
 #pk .pk-feature button{pointer-events:auto;background:#080b1299;backdrop-filter:blur(10px)}
}
@media(prefers-reduced-motion:reduce){#pk li{transition:none}}
`;
const esc = s => String(s).replace(/[&<>"]/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'})[c]);

// The one-file build supplies bootTable; the source site navigates to table folders.
export function pickTable(tables, css = {}, catalog = [], bootTable) {
  const rank = t => {
    const i = catalog.findIndex(c => c.id === t.id);
    return i < 0 ? catalog.length : i;
  };
  const ordered = [...tables].sort((a, b) => rank(a) - rank(b));
  const info = t => ({...t, ...catalog.find(c => c.id === t.id)});
  const url = (t, inspect = false) =>
    bootTable ? '#' + t.id + (inspect ? '.inspect' : '') : 'tables/' + t.id + '/' + (inspect ? '?inspect' : '');
  window.__pbTables = () => {
    try {
      history.replaceState(null, '', location.pathname + location.search);
    } catch (e) {}
    location.reload();
  };
  let cleanup = () => {};
  const go = (def, inspect) => {
    if (!bootTable) {
      location.href = url(def, inspect);
      return;
    }
    cleanup();
    for (const id of ['pk', 'pkStyle']) document.getElementById(id)?.remove();
    if (css[def.id]) {
      const style = document.createElement('style');
      style.textContent = css[def.id];
      document.body.appendChild(style);
    }
    try {
      history.replaceState(null, '', url(def, inspect));
    } catch (e) {}
    bootTable(def, {inspect});
  };
  const h = window.__pbPreviewId || (location.hash || '').slice(1),
    want = tables.find(t => h === t.id || h === t.id + '.inspect');
  if (want) {
    go(want, h !== want.id);
    return;
  }
  // srcdoc inherits the parent origin, including for the offline file:// collection.
  const previewDocument = bootTable ? '<!doctype html>' + document.documentElement.outerHTML : null;
  const st = document.createElement('style');
  st.id = 'pkStyle';
  st.textContent = STYLE;
  document.head.appendChild(st);
  const el = document.createElement('main');
  el.id = 'pk';
  const cards = group =>
    ordered
      .map((t, i) => {
        const c = info(t);
        if ((c.group || 'Experimental') !== group) return '';
        return (
          '<li data-table="' +
          esc(t.id) +
          '" style="--c:' +
          esc(c.accent || '#d9a441') +
          '"><div><h3><a class="table" href="' +
          url(t) +
          '" data-i="' +
          i +
          '">' +
          esc(c.name) +
          '</a></h3><p class="blurb">' +
          esc(c.blurb || '') +
          '</p></div><nav aria-label="' +
          esc(c.name) +
          '"><button type="button" class="go" data-i="' +
          i +
          '">Play</button><button type="button" data-i="' +
          i +
          '" data-ins="1">Inspect</button></nav></li>'
        );
      })
      .join('');
  el.innerHTML =
    '<div class="pk-inner"><header><p class="eyebrow">The pinball collection</p><h1>Pinballsauce</h1><p>Pick a world. Keep the ball alive.</p></header>' +
    ['Development', 'Experimental']
      .map(group => '<section aria-label="' + group + '"><h2>' + group + '</h2><ol>' + cards(group) + '</ol></section>')
      .join('') +
    '<footer><p><kbd>Z</kbd> / <kbd>←</kbd> Left flipper &nbsp; <kbd>/</kbd> / <kbd>→</kbd> Right flipper<br><kbd>Space</kbd> Launch & nudge · <kbd>Esc</kbd> Pause</p><p>On a phone, tap either side to flip.<br>Your progress stays in this browser.</p></footer></div>' +
    '<aside class="pk-feature"><p class="eyebrow" id="previewStatus">Attract mode · Live table</p><h2 id="previewTitle"></h2><p class="preview-note" id="previewNote"></p><button type="button" id="previewPause">Pause preview</button></aside>';
  el.addEventListener('click', e => {
    const b = e.target.closest('[data-i]');
    if (b && !e.ctrlKey && !e.metaKey && !e.shiftKey && !e.altKey) {
      e.preventDefault();
      go(ordered[+b.dataset.i], !!b.dataset.ins);
    }
  });
  document.body.prepend(el);
  const desktop = matchMedia('(min-width:960px) and (pointer:fine)');
  let frame = null,
    paused = matchMedia('(prefers-reduced-motion:reduce)').matches;
  const previewPause = el.querySelector('#previewPause');
  const syncPause = () => {
    try {
      frame?.contentWindow.__pb?.api.hold(paused || document.hidden);
    } catch (e) {}
    previewPause.textContent = paused ? 'Play preview' : 'Pause preview';
    previewPause.setAttribute('aria-pressed', String(paused));
  };
  const change = () => {
    if (!desktop.matches) {
      frame?.remove();
      frame = null;
      return;
    }
    if (frame || !ordered.length) return;
    const t = info(ordered[Math.floor(Math.random() * ordered.length)]);
    el.style.setProperty('--preview-color', t.accent || '#d9a441');
    el.querySelector('#previewTitle').textContent = t.name;
    el.querySelector('#previewNote').textContent = t.blurb || '';
    previewPause.hidden = false;
    el.querySelector('#previewStatus').textContent = 'Attract mode · Live table';
    frame = document.createElement('iframe');
    frame.className = 'pk-preview';
    frame.title = 'Silent pinball attract mode';
    frame.tabIndex = -1;
    frame.setAttribute('aria-hidden', 'true');
    const currentFrame = frame;
    frame.addEventListener('load', () => {
      if (frame !== currentFrame) return;
      try {
        const child = frame.contentWindow,
          p = child.__pb;
        if (!p?.ready()) throw Error('Preview unavailable');
        const style = child.document.createElement('style');
        style.textContent = '#menu,#hud,#gfx,#banner,#touch,#pauseBtn,#camBtn,.side{display:none!important}';
        child.document.head.appendChild(style);
        p.api.UI.menu(null);
        p.api.advance(6, 1);
        syncPause();
      } catch (e) {
        el.querySelector('#previewStatus').textContent = 'Choose a table to play';
        previewPause.hidden = true;
      }
    });
    if (previewDocument)
      frame.srcdoc = previewDocument.replace(
        /<head([^>]*)>/i,
        '<head$1><script>window.__pbPreviewId=' + JSON.stringify(t.id).replace(/</g, '\\u003c') + ';<\/script>'
      );
    else frame.src = url(t);
    el.prepend(frame);
    syncPause();
  };
  previewPause.addEventListener('click', () => {
    paused = !paused;
    syncPause();
  });
  desktop.addEventListener('change', change);
  document.addEventListener('visibilitychange', syncPause);
  cleanup = () => {
    frame?.remove();
    frame = null;
    desktop.removeEventListener('change', change);
    document.removeEventListener('visibilitychange', syncPause);
  };
  change();
}
