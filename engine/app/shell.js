/* ================= THE SHELL =================
   boot(table) starts everything. Also settings, dev keys, the flat overlay (gauges, floating text), the frame loop
   and the test hooks (window.__pb). */
import {INS, closeInspect, drawInspect, openInspect} from './inspect.js';
import {mountPage} from '../ui/page.js';
import {G, T, focusBall} from '../core/state.js';
import {$, PI, TAU, clamp, prefs, rand} from '../core/util.js';
import {newBall, physics} from '../physics/physics.js';
import {project3D, pxPerUnit, snapCam} from '../render/camera.js';
import {CAMS, QUALITY, R3} from '../render/core.js';
import {R, starPath} from '../render/draw2d.js';
import {_v, frame3D} from '../render/frame.js';
import {resize3D, setQuality} from '../render/quality.js';
import {init3D, paintNames, repaintFloor} from '../render/scene.js';
import {repaintWings} from '../render/wings.js';
import {ZX, ZZ} from '../render/world.js';
import {nudge, serve, setFlip} from '../rules/ball.js';
import {hitBoss} from '../rules/bosses.js';
import {choose} from '../rules/choices.js';
import {CLASSES} from '../rules/classes.js';
import {openDoor} from '../rules/events.js';
import {graveCatch} from '../rules/grave.js';
import {relight} from '../rules/lamps.js';
import {COMPANIONS, ROLES, guardPosts} from '../rules/party.js';
import {qAdd, qCur} from '../rules/quests.js';
import {continueRun, initGame, saveRun, startDemo, startRun} from '../rules/run.js';
import {gameStep} from '../rules/step.js';
import {enterWing} from '../rules/wings.js';
import {DEF, RULES, TEXT, THEME, TUNE, USE, WINGS, WING_KEYS} from '../table/content.js';
import {BT, CX, FEELS, GT, GY, H, NM, OX, TY} from '../table/layout.js';
import {UI, bindInput, popup} from '../ui/ui.js';

/* ================= 3D SHELL: settings, overlay, resize, loop, boot ================= */
export const GFX = prefs.get('gfx', {cam: 0, q: 'high', auto: true});
export const DEV = {on: false};
export function gfxSave() {
  prefs.set('gfx', {cam: R3.camMode, q: R3.qName, auto: R3.auto});
}
export function gfxInfo() {
  const play = G.mode === 'play' && !G.demo;
  $('gfx').hidden = !play;
  $('camBtn').hidden = !(play && UI.touch); // on touch the view is a button up top (the chip is not shown there)
  if (!play) return;
  $('camName').textContent = CAMS[R3.camMode].name;
  $('gInfo').textContent =
    (UI.touch ? '' : 'C ') +
    CAMS[R3.camMode].name +
    '  ·  ' +
    (UI.touch ? '' : 'Q ') +
    (R3.q ? R3.q.label + (R3.q.post && !R3.postOn ? ' (no glow)' : '') : '') +
    '  ·  ' +
    Math.round(R3.fps) +
    ' fps';
}
export function gfxKey(k) {
  if (k === 'cam') {
    R3.camMode = (R3.camMode + 1) % CAMS.length;
    popup(CAMS[R3.camMode].name + ' view', '', 'info');
    gfxSave();
  } else if (k === 'qual') {
    const o = ['high', 'medium', 'low'],
      n = o[(o.indexOf(R3.qName) + 1) % 3];
    setQuality(n, true);
    popup(QUALITY[n].label + ' detail', '', 'info');
    gfxSave();
  } else if (k === 'full') {
    const d = document;
    try {
      const r = d.fullscreenElement ? d.exitFullscreen() : d.documentElement.requestFullscreen();
      if (r && r.catch) r.catch(() => {});
    } catch (e) {}
  } else if (k === 'dev') {
    DEV.on = !DEV.on;
    $('gDev').hidden = !DEV.on;
  } else if (DEV.on && G.mode === 'play' && G.run && !G.demo && !G.sub && !G.choice && !G.paused) devKey(k);
  gfxInfo();
}
// Dev keys (toggle with `): 1-4 drop the ball on a level, 5, 6 and 7 send it into the Crypt, the Den and the Hoard, G opens the Grave, B adds a ball, N finishes the current main-quest step.
// A run that used them is marked, and its score is saved with a star.
export function devKey(k) {
  const r = G.run;
  r.dev = true;
  const dn = k.length === 2 && k[0] === 'd' && k[1] >= '1' && k[1] <= '9' ? +k[1] - 1 : -1; // digits: the fields top to bottom, then the Grave, then the wings
  if (dn > NM) {
    if (G.inGrave) return;
    const key = WING_KEYS[dn - NM - 1];
    if (!key) return;
    const gate = WINGS[key].gate;
    G.enemies.forEach(e => {
      if (e.tier > GT) e.dead = true;
    });
    G.pickups = G.pickups.filter(p => !p.hoard);
    openDoor(false);
    r.wing = {key, open: true, done: false, prog: 0};
    if (WINGS[key].opensDoor) openDoor(true);
    G.plunge.auto = 0;
    const h = T.holes[gate],
      b = newBall(h.x, h.y, 0, 0);
    b.st = 'held';
    b.held = {id: gate, t: 0};
    G.balls = [b];
    G.mb = null;
    enterWing(b.held);
    b.held.delay = 0.2;
  } else if (dn >= 0) {
    const t = dn;
    if (t === NM) {
      if (G.inGrave || !USE.grave) return;
      G.save = 0;
      r.shield = false;
      G.plunge.auto = 0;
      G.balls = [];
      r.grave.open = true;
      const b = newBall(CX[BT], H + 10, 0, 0);
      G.balls.push(b);
      if (!graveCatch(b)) {
        G.balls = [];
        serve();
      }
    } else {
      G.inGrave = false;
      G.graveLive = false;
      if (!G.fallen) G.tilt = 0;
      const at = DEF.layout.fields[t].drop; // where a ball can be dropped into the field: its middle, unless it says
      G.balls = [newBall((at ? OX[t] + at[0] : CX[t]) + rand(-30, 30), TY[t] + (at ? at[1] : 560), rand(-60, 60), 120)];
    }
  } else if (k === 'dg') {
    const g = r.grave;
    if (G.inGrave || !USE.grave) return;
    g.open = !g.open;
    g.hits = g.open ? g.need : 0;
    if (g.open) popup('The Grave Opens', 'Your next lost ball falls into it', 'good');
  } else if (k === 'db') {
    if (!G.inGrave && G.balls.length < 5) G.plunge.auto = Math.max(G.plunge.auto, 0.2);
  } else if (k === 'dn') {
    const q = r.main,
      o = q && qCur(q);
    if (!o) return;
    if (o.t === 'boss') {
      if (G.boss && G.boss.alive) hitBoss(G.boss, G.boss.hp + 1, false);
    } else qAdd(q, 99);
  } else return;
  G.dirty = true;
  relight();
}
/* ---------- flat overlay: everything that is text, a gauge or a full-screen wash ---------- */
export const _p = {x: 0, y: 0, ok: false};
export const _p2 = {x: 0, y: 0, ok: false};
export function drawOverlay() {
  const cv = $('fx'),
    c = cv.getContext('2d'),
    s = UI.fxS || 1,
    w = R3.w,
    h = R3.h,
    t = G.t,
    run = G.run;
  c.setTransform(1, 0, 0, 1, 0, 0);
  c.clearRect(0, 0, cv.width, cv.height);
  if (!run) return;
  c.setTransform(s, 0, 0, s, 0, 0);
  c.lineCap = 'round';
  c.lineJoin = 'round';
  c.textAlign = 'center';
  c.textBaseline = 'middle';
  const cls = run.cls,
    cl = CLASSES[cls];
  // the party: a ring on each post and a health bar over each guard
  if (run.party && run.party.length && G.focusTier < NM)
    for (const q of run.party) {
      const post = guardPosts(G.focusTier).find(p => p.slot === q.slot);
      if (!post) continue;
      const d = COMPANIONS[q.id],
        RL = ROLES[d.role],
        hh = 44;
      project3D(post.x, post.y, hh, _p);
      if (!_p.ok) continue;
      const u = pxPerUnit(post.x, post.y, hh),
        x = _p.x,
        y = _p.y;
      const bw = 40 * u,
        by = y - 10 * u;
      c.fillStyle = '#05050a';
      c.fillRect(x - bw / 2 - 1, by - 1, bw + 2, 4 * u + 2);
      c.fillStyle = q.hp > 0 ? RL.col : '#553';
      c.fillRect(x - bw / 2, by, bw * Math.max(0, q.hp / q.maxHp), 4 * u);
      c.font = '700 ' + Math.max(8, 8 * u) + 'px ' + R.fontL;
      c.fillStyle = q.hp > 0 ? '#ffe9b0' : '#8a8070';
      c.fillText((q.hp > 0 ? '' : 'WOUNDED  ') + d.name.toUpperCase(), x, by - 7 * u);
    }
  // foes: health, armor, the wind-up before a strike, the build-up of a spell
  for (const e of G.enemies) {
    if (e.dead || e.spawn > 0) continue;
    const hh = e.r + 13;
    project3D(e.x, e.y, hh, _p);
    if (!_p.ok || _p.y < -40 || _p.y > h + 40) continue;
    const u = pxPerUnit(e.x, e.y, hh),
      x = _p.x,
      y = _p.y,
      rr = (e.r + 10) * u;
    if (e.hp < e.maxHp) {
      const bw = 34 * u,
        by = y - (e.r + 20) * u;
      c.fillStyle = '#05050a';
      c.fillRect(x - bw / 2 - 1, by - 1, bw + 2, 4 * u + 2);
      c.fillStyle = '#ff5a5a';
      c.fillRect(x - bw / 2, by, bw * Math.max(0, e.hp / e.maxHp), 4 * u);
    }
    for (let a = 0; a < e.armor; a++) {
      c.fillStyle = '#cfd8e0';
      c.strokeStyle = '#05050a';
      c.lineWidth = 1;
      c.beginPath();
      c.arc(x + (a - (e.armor - 1) / 2) * 11 * u, y + (e.r + 14) * u, 4 * u, 0, TAU);
      c.fill();
      c.stroke();
    }
    if (e.wind > 0 && e.tier === G.focusTier) {
      c.strokeStyle = '#ff5a68';
      c.lineWidth = 3;
      c.beginPath();
      c.arc(x, y, rr, -PI / 2, -PI / 2 + TAU * (1 - e.wind / e.def.wind));
      c.stroke();
    } else if (e.stun > 0) {
      c.strokeStyle = '#9fe8ff';
      c.lineWidth = 2;
      c.beginPath();
      c.arc(x, y, rr, 0, TAU);
      c.stroke();
    }
    if (e.def.cast) {
      const f = 1 - e.castT / e.def.cast;
      if (f > 0.4) {
        c.strokeStyle = '#c08cff';
        c.lineWidth = 3;
        c.beginPath();
        c.arc(x, y, rr + 4, -PI / 2, -PI / 2 + (TAU * (f - 0.4)) / 0.6);
        c.stroke();
      }
    }
  }
  // boss: the spell clock, stun stars
  {
    const bo = G.boss;
    if (bo && bo.alive && bo.rise <= 0) {
      project3D(bo.x, bo.y, 78, _p);
      if (_p.ok) {
        const u = pxPerUnit(bo.x, bo.y, 78);
        if (bo.phase === 'cast') {
          c.strokeStyle = '#ff4050';
          c.lineWidth = 5;
          c.beginPath();
          c.arc(_p.x, _p.y, (bo.r + 18) * u * 1.9, -PI / 2, -PI / 2 + TAU * (1 - bo.castT / bo.def.cast.time));
          c.stroke();
        }
        if (bo.stun > 0) {
          c.fillStyle = '#ffe14a';
          for (let i = 0; i < 3; i++) {
            const a = t * 5 + (i * TAU) / 3;
            starPath(c, _p.x + Math.cos(a) * 30 * u, _p.y - bo.r * 2.3 * u + Math.sin(a) * 7 * u, 6 * u, 2.4 * u, 4, a);
            c.fill();
          }
        }
      }
    }
  }
  // lightning
  if (G.bolts.length && THEME.fx.bolts !== false) {
    c.save();
    c.globalCompositeOperation = 'lighter';
    for (const b of G.bolts) {
      c.globalAlpha = Math.max(0, 1 - b.t / 0.35);
      c.beginPath();
      let ok = true;
      for (let i = 0; i < b.pts.length; i++) {
        project3D(b.pts[i][0], b.pts[i][1], 16, _p);
        if (!_p.ok) {
          ok = false;
          break;
        }
        if (i) c.lineTo(_p.x, _p.y);
        else c.moveTo(_p.x, _p.y);
      }
      if (!ok) continue;
      c.strokeStyle = b.c || '#8fd0ff';
      c.lineWidth = 5;
      c.stroke();
      c.strokeStyle = '#fff';
      c.lineWidth = 1.8;
      c.stroke();
    }
    c.restore();
    c.globalAlpha = 1;
  }
  // the ball: cradle ring filling, armed shot ring
  for (let i = 0; i < G.balls.length; i++) {
    const b = G.balls[i],
      o = R3.balls[i];
    if (!o || b.st !== 'live' || (!(b.cr > 0) && !(b.arm > 0))) continue;
    _v.set(o.sx - 320 + ZX(o.sy), o.sh, o.sy + ZZ(o.sy)).project(R3.camera);
    const x = (_v.x * 0.5 + 0.5) * w,
      y = (-_v.y * 0.5 + 0.5) * h,
      u = pxPerUnit(o.sx, o.sy, b.r);
    if (b.cr > 0) {
      const R1 = (b.r + 9) * u,
        R2 = (b.r + 15) * u,
        k1 = Math.min(1, b.cr / TUNE.cradleArm);
      c.strokeStyle = '#05050a';
      c.lineWidth = 6;
      c.beginPath();
      c.arc(x, y, R1, 0, TAU);
      c.stroke();
      c.strokeStyle = cl.glow;
      c.lineWidth = 3.5;
      c.beginPath();
      c.arc(x, y, R1, -PI / 2, -PI / 2 + TAU * k1);
      c.stroke();
      if (run.charge >= 100 && b.cr > TUNE.cradleArm) {
        const k2 = Math.min(1, (b.cr - TUNE.cradleArm) / (TUNE.cradleRally - TUNE.cradleArm));
        c.strokeStyle = '#05050a';
        c.lineWidth = 6;
        c.beginPath();
        c.arc(x, y, R2, 0, TAU);
        c.stroke();
        c.strokeStyle = '#ffd24a';
        c.lineWidth = 3.5;
        c.beginPath();
        c.arc(x, y, R2, -PI / 2, -PI / 2 + TAU * k2);
        c.stroke();
      }
    }
    if (b.arm > 0) {
      c.strokeStyle = cl.glow;
      c.lineWidth = 2.4;
      c.setLineDash([6, 5]);
      c.lineDashOffset = -t * 40;
      c.beginPath();
      c.arc(x, y, (b.r + 8 + Math.sin(t * 10) * 1.5) * u, 0, TAU);
      c.stroke();
      c.setLineDash([]);
    }
  }
  // the Grave's clock, ball save
  if (G.inGrave && G.graveLive) {
    project3D(320, GY + 470, 2, _p);
    if (_p.ok) {
      const u = pxPerUnit(320, GY + 470, 2);
      c.font = '700 ' + Math.round(96 * u) + 'px ' + R.fontD;
      c.fillStyle = G.graveT < 8 ? 'rgba(255,80,90,' + (0.45 + 0.25 * Math.sin(t * 10)) + ')' : 'rgba(157,255,200,.28)';
      c.fillText(Math.ceil(G.graveT), _p.x, _p.y);
    }
  }
  if (!G.inGrave && (G.save > 0 || run.shield) && G.balls.length && G.focusTier === BT) {
    project3D(CX[BT], H - 20, 4, _p);
    if (_p.ok) {
      c.font = '700 11px ' + R.fontL;
      c.lineWidth = 3;
      c.strokeStyle = 'rgba(0,0,0,.8)';
      const tx = G.save > 0 ? 'BALL SAVE' : 'WARD';
      c.strokeText(tx, _p.x, _p.y);
      c.fillStyle = G.save > 0 ? '#bfefff' : '#ffe6a0';
      c.fillText(tx, _p.x, _p.y);
    }
  }
  // floating numbers
  for (const f of G.floats) {
    project3D(clamp(f.x, 60, 580), f.y, 34 + f.t * 30, _p);
    if (!_p.ok) continue;
    c.globalAlpha = clamp(1.4 - f.t, 0, 1);
    c.font = '700 ' + Math.round(f.size * 1.2) + 'px ' + R.fontL;
    c.lineWidth = 3.5;
    c.strokeStyle = 'rgba(0,0,0,.85)';
    c.strokeText(f.text, _p.x, _p.y);
    c.fillStyle = f.color;
    c.fillText(f.text, _p.x, _p.y);
  }
  c.globalAlpha = 1;
  // washes: darkness curse, damage, flashes, a dead table
  const fb = focusBall();
  if (G.curse.dark > 0 && fb) {
    const o = R3.balls[G.balls.indexOf(fb)];
    if (o) {
      _v.set(o.sx - 320 + ZX(o.sy), o.sh, o.sy + ZZ(o.sy)).project(R3.camera);
      const x = (_v.x * 0.5 + 0.5) * w,
        y = (-_v.y * 0.5 + 0.5) * h,
        u = pxPerUnit(o.sx, o.sy, 0),
        g = c.createRadialGradient(x, y, 60 * u, x, y, 270 * u);
      g.addColorStop(0, 'rgba(0,0,0,0)');
      g.addColorStop(1, 'rgba(0,0,6,' + Math.min(0.93, G.curse.dark) + ')');
      c.fillStyle = g;
      c.fillRect(0, 0, w, h);
    }
  }
  if (G.hurtT > 0) {
    const g = c.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.25, w / 2, h / 2, Math.max(w, h) * 0.7);
    g.addColorStop(0, 'rgba(200,20,30,0)');
    g.addColorStop(1, 'rgba(200,20,30,' + Math.min(0.6, G.hurtT * 0.9) + ')');
    c.fillStyle = g;
    c.fillRect(0, 0, w, h);
  }
  if (G.flash > 0 && THEME.fx.flash > 0) {
    c.globalCompositeOperation = 'lighter';
    c.globalAlpha = Math.min(0.34, G.flash * 0.34) * Math.min(1, THEME.fx.flash);
    c.fillStyle = G.flashC;
    c.fillRect(0, 0, w, h);
    c.globalAlpha = 1;
    c.globalCompositeOperation = 'source-over';
  }
  if (G.tilt > 0 && G.balls.length) {
    c.fillStyle = 'rgba(10,0,0,.35)';
    c.fillRect(0, 0, w, h);
  }
  // other balls that are above the view during multiball
  if (G.balls.length > 1) {
    c.fillStyle = cl.glow;
    for (let i = 0; i < G.balls.length; i++) {
      const b = G.balls[i],
        o = R3.balls[i];
      if (b === fb || !o || b.st === 'tunnel') continue;
      _v.set(o.sx - 320 + ZX(o.sy), o.sh, o.sy + ZZ(o.sy)).project(R3.camera);
      const y = (-_v.y * 0.5 + 0.5) * h,
        x = clamp((_v.x * 0.5 + 0.5) * w, 20, w - 20);
      if (y < 0) {
        c.beginPath();
        c.moveTo(x, 8);
        c.lineTo(x + 9, 22);
        c.lineTo(x - 9, 22);
        c.closePath();
        c.fill();
      }
    }
  }
  drawInspect();
}

export function resize() {
  const st = $('stage'),
    w = st.clientWidth || innerWidth,
    h = st.clientHeight || innerHeight || 600,
    fx = $('fx'),
    d = Math.min(window.devicePixelRatio || 1, 1.5);
  resize3D(w, h);
  fx.width = Math.round(w * d);
  fx.height = Math.round(h * d);
  UI.fxS = d;
}
export let lastT = 0;
export let acc = 0;
export let hudT = 0;
export let slowT = 0;
// Phones fire `resize` (a rotation, the toolbar sliding in and out) before the layout has settled, and sometimes not at
// all, which left the picture at the old shape, stretched to fit. So the real size of the stage is checked every
// frame instead of trusting the event.
let _stage = null;
function fitCheck() {
  _stage = _stage || $('stage');
  const w = _stage.clientWidth,
    h = _stage.clientHeight;
  if (w && h && (w !== R3.w || h !== R3.h)) resize();
}
export function loop(ts) {
  requestAnimationFrame(loop);
  fitCheck();
  if (R3.hold) {
    lastT = ts;
    return;
  }
  const raw = (ts - lastT) / 1000 || 0,
    dt = Math.min(0.05, raw);
  lastT = ts;
  acc += dt;
  let n = 0;
  while (acc >= 1 / 120 && n < 8) {
    if (!R3.freeze) gameStep(1 / 120);
    acc -= 1 / 120;
    n++;
  }
  if (n === 8) acc = 0; // inspect mode freezes the game, not the picture
  R3.acc = R3.freeze ? 0 : acc;
  frame3D(dt);
  drawOverlay();
  if (raw > 0 && raw < 0.5) {
    R3.fps += (1 / raw - R3.fps) * 0.05;
    // step the detail down by itself if this machine cannot hold a playable frame rate
    if (R3.auto && !document.hidden && G.t > 4) {
      slowT = R3.fps < 38 ? slowT + raw : Math.max(0, slowT - raw);
      if (slowT > 2.5 && R3.qName !== 'low') {
        slowT = 0;
        R3.fps = 60;
        setQuality(R3.qName === 'high' ? 'medium' : 'low');
        gfxSave();
        popup('Detail lowered', 'Press Q to change it back', 'info');
      }
    }
  }
  hudT += dt;
  if (hudT > 0.2) {
    hudT = 0;
    G.dirty = true;
    gfxInfo();
  }
  UI.sync();
}
// test hook: freeze the loop and advance by hand (used by the headless screenshot and soak scripts)
window.__gb = {
  G,
  T,
  UI,
  physics,
  newBall,
  get rules() {
    return RULES;
  },
  get def() {
    return DEF;
  },
  get uses() {
    return USE;
  },
  // the fields as the layout lists them: id, and the corner each one's own numbers are measured from
  get fields() {
    return DEF.layout.fields.map((f, i) => ({id: f.id, x: OX[i], y: TY[i]}));
  },
  INS,
  openInspect,
  closeInspect,
  startRun,
  gameStep,
  devKey,
  setQuality,
  DEV,
  setFlip,
  nudge,
  choose,
  saveRun,
  continueRun,
  R3,
  hold(v) {
    R3.hold = v;
  },
  draw(n, dt) {
    R3.acc = 0;
    for (let i = 0; i < (n || 1); i++) frame3D(dt === undefined ? 0.5 : dt);
    drawOverlay();
    G.dirty = true;
    UI.sync();
    gfxInfo();
  },
  advance(sec, frames) {
    const n = Math.round(sec * 120),
      per = frames ? Math.max(1, Math.round(n / frames)) : 0;
    R3.acc = 0;
    for (let i = 0; i < n; i++) {
      gameStep(1 / 120);
      if (per && i % per === per - 1) frame3D(per / 120);
    }
    if (per) {
      drawOverlay();
      G.dirty = true;
      UI.sync();
      gfxInfo();
    }
  }
};
// the same hook under the name the engine's own tests use
window.__pb = {ready: () => R3.ready, api: window.__gb};
export function boot(def, opt) {
  mountPage();
  // ?feel=fast on the address tries this table on another feel preset, without editing it
  const tryFeel = new URLSearchParams(location.search).get('feel');
  if (tryFeel && FEELS[tryFeel]) def = Object.assign({}, def, {feel: tryFeel});
  initGame(def);
  $('hCoin').textContent = TEXT.coin;
  R3.camMode = (GFX.cam | 0) % CAMS.length;
  R3.qName = QUALITY[GFX.q] ? GFX.q : 'high';
  R3.auto = GFX.auto !== false;
  if (!init3D($('gl'))) {
    const m = $('menu');
    m.hidden = false;
    m.innerHTML =
      '<div class="pane"><p class="lead">This needs WebGL, and the browser would not start it. Try a current Chrome, Edge or Firefox with hardware acceleration turned on.</p></div>';
    return;
  }
  resize();
  bindInput();
  startDemo();
  snapCam();
  UI.menu('title');
  requestAnimationFrame(loop);
  if (/[?&]inspect\b/.test(location.search) || /inspect/.test(location.hash) || (opt && opt.inspect)) openInspect();
  if (document.fonts && document.fonts.ready)
    document.fonts.ready.then(() => {
      try {
        repaintFloor();
        paintNames();
        repaintWings();
      } catch (e) {}
    });
}
