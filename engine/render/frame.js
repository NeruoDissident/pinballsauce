/* ================= ONE FRAME =================
   Poses everything from the game state and draws. Reads G and T, changes neither (it does add cosmetic sparks). */
import {G, T, focusBall} from '../core/state.js';
import {PI, clamp, hash, lerp, rand} from '../core/util.js';
import {frameActors} from './actors.js';
import {updateCam3D} from './camera.js';
import {R3} from './core.js';
import {probeFrame} from './quality.js';
import {frameRunes} from './runes.js';
import {ballObj, railY} from './scene.js';
import {frameWing} from './wings.js';
import {E, ZX, ZZ, elev, elevIn, zshift} from './world.js';
import {CLASSES} from '../rules/classes.js';
import {lampState} from '../rules/lamps.js';
import {PAL, THEME, USE} from '../table/content.js';
import {railPos} from '../table/geometry.js';
import {GRID, GT, GY, NM, OX, TY} from '../table/layout.js';

/* ---------- per-frame ---------- */
export const _v = new THREE.Vector3();
export const _q = new THREE.Quaternion();
export const _ax = new THREE.Vector3();
export const _bp = {x: 0, y: 0, tx: 0, ty: 0};
export const _bo = {x: 0, y: 0, h: 0};
export function ballPos(b, ex) {
  const o = _bo; // where to draw the ball: its physics position carried forward by the time since the last step
  if (b.st === 'rail' && b.rail && b.rail.h3) {
    const s = clamp(b.rs + b.rv * ex, 0, b.rail.len);
    railPos(b.rail, s, _bp);
    o.x = _bp.x;
    o.y = _bp.y;
    o.h = railY(b.rail, s) + b.r;
    if (b.lead) {
      // just taken onto a drain ramp from somewhere across the foot of the field: slide over to it, do not jump
      const k = b.lead[2] / 0.3;
      o.x += b.lead[0] * k;
      o.y += b.lead[1] * k;
    }
    return o;
  }
  if (b.st === 'live') {
    o.x = b.x + b.vx * ex;
    o.y = b.y + b.vy * ex;
  } else {
    o.x = b.x;
    o.y = b.y;
  }
  o.h = elev(o.y, o.x) + b.r - (b.st === 'held' ? 9 : 0);
  return o;
}
export function ballY(b) {
  return ballPos(b, 0).h;
}
export function flash3D(x, y, color, power) {
  R3.flashQ.push({x, y, color, power: power || 1});
}
export function frame3D(dt) {
  if (!R3.ready) return;
  const D = R3.dyn,
    t = G.t,
    sc = R3.scene,
    run = G.run,
    cls = run ? run.cls : 'knight',
    cl = CLASSES[cls];
  const ex = G.paused || G.choice || G.mode === 'over' ? 0 : (R3.acc || 0) * (G.slow > 0 ? 0.4 : 1);
  // flippers
  for (const o of D.flips) {
    const f = o.f,
      a = clamp(f.a + f.w * ex, f.up, f.rest);
    o.g.rotation.y = -Math.atan2(Math.sin(a), f.dir * Math.cos(a));
    o.rub.emissiveIntensity = G.tilt > 0 ? 0.05 : f.on ? 1.5 : 0.35;
  }
  // balls
  let fb = focusBall(),
    tg = 0;
  const cloak = G.phase > 0;
  for (let i = 0; i < Math.max(G.balls.length, R3.balls.length); i++) {
    const b = G.balls[i];
    if (!b) {
      const o = R3.balls[i];
      o.m.visible = o.blob.visible = o.halo.visible = o.loc.visible = false;
      continue;
    }
    const o = ballObj(i),
      hid = b.st === 'tunnel',
      bp = ballPos(b, ex),
      bx = bp.x,
      bz = bp.y,
      y = bp.h;
    o.m.visible = !hid;
    o.blob.visible = !hid && b.st !== 'rail';
    o.halo.visible = o.loc.visible = !hid;
    o.sx = bx;
    o.sy = bz;
    o.sh = y;
    if (hid) {
      const sp = R3.tunnelGlow[tg++];
      if (sp) {
        sp.visible = true;
        const tn = b.tun;
        if (tn && tn.zone) {
          const n = tn.n - 1,
            u = clamp(b.rs / tn.len, 0, 1),
            ax = tn.x[0] - 320 + ZX(tn.y[0]),
            az = tn.y[0] + ZZ(tn.y[0]),
            ay = elev(tn.y[0], tn.x[0]),
            bx2 = tn.x[n] - 320 + ZX(tn.y[n]),
            bz2 = tn.y[n] + ZZ(tn.y[n]),
            by2 = elev(tn.y[n], tn.x[n]);
          sp.position.set(lerp(ax, bx2, u), lerp(ay, by2, u) + 6 - 30 * Math.sin(u * PI), lerp(az, bz2, u));
        } else sp.position.set(b.x - 320, elev(b.y, b.x) + 6, b.y);
        const k = 0.8 + 0.2 * Math.sin(t * 30);
        sp.scale.set(70 * k, 70 * k, 1);
      }
      continue;
    }
    const dx = bx - o.lx,
      dz = bz - o.ly,
      d = Math.hypot(dx, dz);
    if (d > 0.001 && d < 80) {
      _ax.set(dz / d, 0, -dx / d);
      _q.setFromAxisAngle(_ax, d / b.r);
      o.q.premultiply(_q);
    }
    o.lx = bx;
    o.ly = bz;
    const hot = !!b.pow || b.arm > 0,
      pc = b.pc || null,
      gc = b.pg || pc || (b.pow && cls === 'mage' ? '#ff8a3a' : cl.glow),
      ghost = cloak || (cls === 'rogue' && hot);
    zshift(o.m.position.set(bx - 320, y, bz) && o.m);
    o.m.scale.setScalar(b.r);
    o.m.quaternion.copy(o.q);
    o.mat.color.set(pc || cl.color).convertSRGBToLinear();
    o.mat.emissive.set(gc).convertSRGBToLinear();
    o.mat.emissiveIntensity = b.pow ? 0.9 : b.arm > 0 ? 0.5 + 0.25 * Math.sin(t * 14) : 0.2;
    if (o.mat.transparent !== ghost) {
      o.mat.transparent = ghost;
      o.mat.needsUpdate = true;
    }
    o.mat.opacity = ghost ? 0.45 : 1;
    zshift(o.blob.position.set(bx - 320, elev(bz, bx) + 0.5, bz) && o.blob);
    o.blob.scale.setScalar(b.r * 1.7);
    zshift(o.halo.position.set(bx - 320, y, bz) && o.halo);
    o.halo.material.color.set(gc);
    o.halo.material.opacity = hot ? 0.55 + 0.25 * Math.sin(t * 14) : 0.3;
    o.halo.scale.setScalar(b.r * (hot ? 8.5 : 5.2));
    zshift(o.loc.position.set(bx - 320, y, bz) && o.loc);
    o.loc.material.color.set(gc);
    o.loc.scale.setScalar(b.r * 3.4);
    if (b.pow && b.st === 'live' && Math.random() < dt * 40)
      G.parts.push({
        x: b.x + rand(-4, 4),
        y: b.y + rand(-4, 4),
        vx: -b.vx * 0.1,
        vy: -b.vy * 0.1,
        life: 0,
        max: 0.35,
        color: gc,
        size: 3
      });
  }
  for (; tg < R3.tunnelGlow.length; tg++) R3.tunnelGlow[tg].visible = false;
  if (fb && fb.st !== 'tunnel') {
    const fp = ballPos(fb, ex);
    R3.ballL.position.set(fp.x - 320 + ZX(fp.y), fp.h + 26, fp.y + 6 + ZZ(fp.y));
    R3.ballL.color.set(fb.pow && cls === 'mage' ? '#ff8a3a' : cl.glow);
    R3.ballL.intensity = fb.pow ? 2 : 1.15;
    const au = R3.aura;
    au.visible = cls === 'cleric' && fb.st === 'live';
    if (au.visible) {
      au.position.set(fp.x - 320 + ZX(fp.y), elev(fp.y, fp.x) + 0.8, fp.y + ZZ(fp.y));
      au.scale.setScalar(G.mods.lantern ? 140 : 85);
    }
  } else {
    R3.ballL.intensity = 0;
    R3.aura.visible = false;
  }
  // bumpers, their boss wards, statues
  for (const o of D.bumps) {
    const b = o.b,
      f = Math.max(0, b.flash),
      s = 1 + f * 0.09;
    o.g.scale.set(s, 1 + f * 0.05, s);
    for (const q of o.mats) q.m.emissiveIntensity = q.k + f * 1.6;
    if (f > 0.9) {
      if (!o.lit) {
        o.lit = true;
        flash3D(b.x, b.y, b.bell ? '#ffd070' : PAL[b.tier].glow, 1);
      }
    } else if (f < 0.5) o.lit = false;
    o.ring.color.copy(
      R3.tmpC
        .set(b.bell ? '#ffd070' : PAL[b.tier].glow)
        .convertSRGBToLinear()
        .multiplyScalar(0.45 + f * 2.6)
    );
    if (o.rune) o.rune.opacity = 0.45 + 0.12 * Math.sin(t * 2 + b.x) + f;
    if (o.flame) {
      const k = 1 + 0.12 * Math.sin(t * 17 + b.x) + 0.08 * Math.sin(t * 31 + b.y) + f * 0.6;
      o.flame.scale.set(30 * k, 46 * k, 1);
      o.flame.position.y = 50 + k * 3;
    }
    if (o.ember && o.emberCol) o.ember.color.copy(o.emberCol).multiplyScalar(0.25 + f * 3);
    if (o.bell) {
      if (f > 0.9) o.t = 1;
      o.t = Math.max(0, o.t - dt * 0.9);
      o.bell.rotation.z = Math.sin(t * 14) * 0.42 * o.t * o.t;
    }
    o.ward.visible = !!b.ward;
    if (b.ward) {
      const k = 0.55 + 0.35 * Math.sin(t * 8);
      o.wardS.material.opacity = k;
      o.wardT.scale.setScalar(1 + 0.04 * Math.sin(t * 8));
    }
  }
  for (const o of D.statues) {
    const st = o.s,
      f = Math.max(0, st.flash);
    o.g.visible = st.on;
    for (const q of o.mats) q.m.emissiveIntensity = q.k + f * 1.4;
    if (o.rune) o.rune.opacity = 0.5 + 0.15 * Math.sin(t * 1.7) + f;
  }
  // targets
  for (const o of D.segs) {
    const s = o.s,
      f = Math.max(0, s.flash);
    if (o.drop) {
      const k = s.on ? 1 : 0;
      o.k += (k - o.k) * Math.min(1, dt * 16);
      o.m.position.y = o.y0 - (1 - o.k) * (o.h - 1.2);
      o.mat.emissiveIntensity = 0.14 + f * 2.2;
    } else o.mat.emissiveIntensity = (s.lit ? 1.5 : 0.1) + f * 2.4;
  }
  for (const o of D.slings) o.mat.emissiveIntensity = 0.3 + Math.max(0, o.s.s.flash) * 3.2;
  // lane inserts; the skill-shot candle blinks while the ball waits on the plunger
  for (const o of D.sens) {
    const s = o.s,
      sk = s.set && T.sets[s.set].skill && G.skill >= 0 && T.sets[s.set].lanes[G.skill] === s && ((t * 6) | 0) % 2;
    const last = o.lane && s.set && !s.lit && T.sets[s.set].lanes.filter(l => !l.lit).length === 1 && ((t * 5) | 0) % 2;
    const lit = o.kick
      ? run && run.kickback
        ? 0.75 + 0.25 * Math.sin(t * 5)
        : 0
      : o.lane
        ? (s.lit || sk ? 1 : last ? 0.5 : 0) + Math.max(0, s.flash) * 0.6
        : Math.max(0, s.flash);
    o.v += (Math.min(1.3, lit) - o.v) * Math.min(1, dt * 14);
    if (o.v > 0.02) {
      o.mat.color.copy(o.on).multiplyScalar(o.v);
      o.mat.opacity = 1;
    } else {
      o.mat.color.setRGB(0.012, 0.012, 0.02);
      o.mat.opacity = 0.7;
    }
  }
  // status lamps
  for (const o of D.lamps) {
    const st = lampState(o.l),
      lit = st === 2 ? (((t * 5) | 0) % 2 ? 1 : 0.15) : st;
    o.v += (lit - o.v) * Math.min(1, dt * 14);
    if (o.v > 0.02) {
      o.mat.color.copy(o.on).multiplyScalar(o.v);
      o.mat.opacity = 1;
    } else {
      o.mat.color.setRGB(0.012, 0.012, 0.02);
      o.mat.opacity = 0.7;
    }
  }
  // shot inserts: gold for the main quest, blue for side quests, red when a boss spell can be broken
  const show = lampShow(),
    ft = G.focusTier,
    S = G.lampS || {};
  for (const k in D.shots) {
    const o = D.shots[k];
    let cols = null,
      id0 = null;
    for (const id of o.ids)
      if (G.lit[id]) {
        cols = G.lit[id];
        id0 = id;
        break;
      }
    const sw = show && o.tier === ft ? show(o.y) : 0;
    if (sw > 0) {
      o.mat.color.copy(o.base).multiplyScalar(1.4);
      o.mat.opacity = sw;
    } else if (cols) {
      const st = S[id0] || 'flash',
        fast = cols.indexOf('danger') >= 0 || cols.indexOf('main') >= 0;
      o.mat.color.copy(R3.litC[cols[((t * 2) | 0) % cols.length]]);
      o.mat.opacity =
        st === 'flash'
          ? 0.55 + 0.45 * Math.sin(t * (fast ? 11 : 6))
          : st === 'lit'
            ? 0.6 + 0.08 * Math.sin(t * 2)
            : 0.26;
    } else if (o.tier === ft && G.comboT > 0 && G.combo >= 1 && o.big) {
      o.mat.color.copy(R3.litC.soft);
      o.mat.opacity = 0.3 + 0.1 * Math.sin(t * 8);
    } else if (o.bank && o.bank.segs.some(q => (q.kind === 'drop' ? !q.on : q.lit))) {
      o.mat.color.copy(o.base);
      o.mat.opacity = 0.3;
    } else {
      o.mat.color.copy(o.base);
      o.mat.opacity = 0.05 + 0.03 * Math.sin(t * 1.6 + o.ph);
    }
  }
  for (const o of D.holes) {
    const h = o.h,
      L = G.lit[h.id],
      st = S[h.id] || 'flash',
      m = o.sp.material;
    if (L) m.color.copy(R3.litC[L[0]]);
    else m.color.copy(o.base);
    m.opacity =
      clamp(
        Math.max(h.glow, L ? (st === 'flash' ? 0.4 + 0.25 * Math.sin(t * 5) : st === 'lit' ? 0.45 : 0.2) : 0),
        0,
        1
      ) * 0.9;
  }
  if (USE.levels) frameRunes(t);
  for (const o of D.spins) {
    o.pv.rotation.x = o.s.ang || 0;
    o.mat.emissiveIntensity = o.s.rate > 0 ? 0.9 : 0.05;
  }
  for (const o of D.torches) {
    const k = 1 + 0.14 * Math.sin(t * 13 + o.tr.ph) + 0.09 * Math.sin(t * 29 + o.tr.ph * 2);
    o.fl.scale.set(o.fs * k, o.fs * 1.5 * k, 1);
    const h = o.hs * (0.92 + 0.08 * Math.sin(t * 9 + o.tr.ph));
    o.halo.scale.set(h, h, 1);
  }
  // plunger, the Grave, ball save
  R3.plunger.position.z = T.shooter.y + 16 + G.plunge.charge * 30;
  if (USE.grave) {
    const open = !T.banks.nails.segs.some(x => x.on),
      m = R3.graveGlow.material;
    m.opacity = open ? 0.8 + 0.15 * Math.sin(t * 6) : 0.28;
    const s = open ? 230 : 110;
    R3.graveGlow.scale.set(s, s, 1);
    const g = run && run.grave,
      f = g ? (g.open ? 1 : g.hits / g.need) : 0;
    R3.graveMark.material.opacity = g && g.open && !G.inGrave ? 0.45 + 0.3 * Math.sin(t * 4) : 0;
    R3.graveStone.emissiveIntensity = f * (g && g.open ? 1.6 + 0.5 * Math.sin(t * 4) : 0.9);
  }
  {
    const sv = run && (G.save > 0 || run.shield) && !G.inGrave,
      sm = R3.saveGlow.material;
    sm.opacity = sv ? 0.45 + 0.25 * Math.sin(t * 6) : 0;
    if (sv) sm.color.copy(R3.litC[G.save > 0 ? 'side' : 'main']);
  }
  frameActors(dt, ex);
  frameWing(dt);
  for (const id in R3.gates) R3.gates[id].visible = !!T.rails[id].closed;
  // flash lights
  while (R3.flashQ.length) {
    const f = R3.flashQ.shift();
    let L = R3.flashL[0];
    for (const l of R3.flashL) if (l.userData.t < L.userData.t) L = l;
    L.userData.t = 1;
    L.userData.p = f.power;
    L.color.set(f.color);
    L.position.set(f.x - 320 + ZX(f.y), elev(f.y, f.x) + 34, f.y + ZZ(f.y));
  }
  for (const l of R3.flashL) {
    l.userData.t = Math.max(0, l.userData.t - dt * 5.5);
    l.intensity = l.userData.t * 2.6 * (l.userData.p || 1);
  }
  // particles: the 2D game moves them on the table; here each also arcs up off it. Newest first, into the batch for
  // its sprite (the table's own unless its spray asked for another), until that batch is full
  {
    const c = R3.tmpC,
      L = G.parts;
    R3.parts.userData.used = 0;
    for (const b of R3.partsBy.values()) b.userData.used = 0;
    for (let j = L.length - 1; j >= 0; j--) {
      const p = L[j],
        B = p.shape ? R3.partBatch(p.shape) : R3.parts,
        P = B.geometry.attributes.position,
        i = B.userData.used;
      if (i >= P.count) continue;
      B.userData.used = i + 1;
      const u = p.life / p.max,
        k = Math.max(0, 1 - u);
      P.setXYZ(i, p.x - 320 + ZX(p.y), elev(p.y, p.x) + 6 + (p.size || 3) * 26 * u * (1 - u), p.y + ZZ(p.y));
      c.set(p.color)
        .convertSRGBToLinear()
        .multiplyScalar(k * 1.8);
      B.geometry.attributes.color.setXYZ(i, c.r, c.g, c.b);
    }
    const tidy = B => {
      const P = B.geometry.attributes.position,
        d = B.userData;
      if (!d.used && !d.was) return; // nothing in it now or last frame
      for (let i = d.used; i < d.was; i++) P.setXYZ(i, 0, -9999, 0);
      d.was = d.used;
      P.needsUpdate = true;
      B.geometry.attributes.color.needsUpdate = true;
    };
    tidy(R3.parts);
    for (const b of R3.partsBy.values()) tidy(b);
  }
  // drifting motes
  {
    const P = R3.motes.geometry.attributes.position,
      C = R3.motes.geometry.attributes.color,
      n = P.count;
    for (let i = 0; i < n; i++) {
      const h1 = hash(i * 7.13),
        h2 = hash(i * 1.91),
        h3 = hash(i * 4.4),
        ti = i % (USE.grave ? NM + 1 : NM),
        ms = THEME.motes[ti].style,
        ph = t * (0.3 + h1 * 0.4) + h1 * 40;
      const y0 = ti === GT ? GY + 40 : TY[ti] + 20,
        span = ti === GT ? 640 : 960,
        x = -380 + h1 * 760 + Math.sin(ph) * 24,
        yy = y0 + h2 * span + Math.cos(ph * 1.3) * 16;
      const hh = ms === 'rise' ? (t * 22 + h3 * 160) % 160 : 20 + h3 * 110 + Math.sin(ph * 1.7) * 12,
        a = ms === 'blink' ? Math.max(0, Math.sin(t * 2.2 + h1 * 30)) : 0.45 + 0.4 * Math.sin(ph * 2);
      P.setXYZ(i, x + OX[ti], (ti === GT ? E[GT] : GRID ? elevIn(ti, yy) : elev(yy)) + hh, yy);
      const c = R3.moteCols[ti];
      C.setXYZ(i, c.r * a, c.g * a, c.b * a);
    }
    P.needsUpdate = true;
    C.needsUpdate = true;
  }
  updateCam3D(dt);
  {
    const m = R3.moon,
      c = R3.cam.t;
    const fx = OX[G.focusTier] || 0;
    m.target.position.set(fx, c.y, c.z - 120);
    m.position.set(fx - 460, c.y + 1200, c.z + 520);
  }
  {
    const ft = G.focusTier,
      fc = THEME.fog[ft];
    R3.tmpC.set(fc);
    sc.fog.color.lerp(R3.tmpC, Math.min(1, dt * 2));
    sc.background.copy(sc.fog.color);
  }
  if (R3.grade) R3.grade.uniforms.time.value = (t * 61) % 17;
  if (R3.composer) R3.composer.render();
  else R3.rn.render(sc, R3.camera);
  if (R3.probe > 0 && --R3.probe === 0) probeFrame();
}
// the lamp show: a wave down the level at ball start, and a slow roll in attract mode; returns a brightness function of table y, or null
export function lampShow() {
  const ft = G.focusTier;
  if (ft >= NM) return null;
  if (G.lampShow > 0) {
    const k = 1 - G.lampShow / 1.6,
      yw = TY[ft] + k * 1050 - 60;
    return y => {
      const d = Math.abs(y - yw);
      return d < 170 ? 1 - d / 170 : 0;
    };
  }
  if (G.mode === 'title') {
    const k = (G.t * 0.28) % 1,
      yw = TY[ft] + k * 1150 - 120;
    return y => {
      const d = Math.abs(y - yw);
      return d < 150 ? 0.8 * (1 - d / 150) : 0;
    };
  }
  return null;
}
