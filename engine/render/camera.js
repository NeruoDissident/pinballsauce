/* ================= CAMERA ================= */
import {inspectCam} from '../app/inspect.js';
import {G, focusBall} from '../core/state.js';
import {PI, clamp, rand} from '../core/util.js';
import {CAMS, R3} from './core.js';
import {_v} from './frame.js';
import {E, ZX, ZZ, elev} from './world.js';
import {BT, FY, GT, GY, OX, TY} from '../table/layout.js';

// Player view: place the camera so the flippers sit near the bottom of the screen and the top of the level near the top
export function frameLevel(tier, pitch, fov, asp) {
  const p = (pitch * PI) / 180,
    tv = Math.tan((fov * PI) / 360),
    sn = Math.sin(p),
    cs = Math.cos(p),
    zA = FY[tier] + (tier === GT ? 62 : 74),
    zB = tier === GT ? GY + 6 : tier > GT ? TY[tier] + 10 : TY[tier] - 18,
    L = zA - zB,
    half = tier > GT ? 285 : 345;
  const bo = G.boss;
  let nA = -0.92,
    nB = bo && bo.tier === tier ? 0.55 : 0.68,
    h = 0,
    kA = 0;
  /* a boss fight needs headroom under its health bar */ const g = n => (n * tv * sn + cs) / (n * tv * cs - sn);
  for (let it = 0; it < 4; it++) {
    h = L / (g(nA) - g(nB));
    kA = h * g(nA);
    const depth = h * sn - kA * cs,
      m = half / (depth * tv * asp * 0.97);
    if (m <= 1.001) break;
    nA /= m;
    nB /= m;
  }
  return {h, zc: zA - kA, sn, cs};
}
export function updateCam3D(dt) {
  inspectCam();
  const cam = R3.cam,
    C = R3.camera,
    b = focusBall(),
    asp = C.aspect;
  let px,
    py,
    pz,
    tx,
    ty,
    tz,
    fov,
    rate = 4;
  const tier = G.focusTier,
    f = FY[tier],
    e = E[tier],
    fx = OX[tier] || 0, // the middle of the field in view, across the table
    bx = b ? b.x - 320 - fx : 0, // the ball, measured from it
    by = b ? b.y : f - 300;
  if (R3.dbg) {
    fov = R3.dbg.fov || 40;
    px = R3.dbg.p[0];
    py = R3.dbg.p[1];
    pz = R3.dbg.p[2];
    tx = R3.dbg.t[0];
    ty = R3.dbg.t[1];
    tz = R3.dbg.t[2];
    rate = 1e3;
  } else if (G.demo && G.mode === 'title') {
    const s = G.t * 0.1;
    fov = 36;
    tx = 30 + Math.sin(s) * 50;
    ty = E[BT] + 20;
    tz = TY[BT] + 330;
    px = -610 + Math.sin(s * 0.8) * 150;
    py = E[BT] + 560 + Math.sin(s * 0.6) * 50;
    pz = FY[BT] + 470;
    rate = 1.2;
    if (asp < 1) {
      px *= 0.5;
      py += 700 / asp - 700;
      pz += 500 / asp - 500;
    }
  } else {
    const m = CAMS[R3.camMode],
      p = (m.pitch * PI) / 180,
      tv = Math.tan((m.fov * PI) / 360);
    fov = m.fov;
    if (R3.camMode === 1) {
      tx = bx * 0.62;
      ty = b ? elev(by, b.x) + 8 : e;
      tz = by - 150;
      const D = Math.max(560, 300 / (tv * asp));
      px = tx * 0.92;
      py = ty + D * Math.sin(p);
      pz = tz + D * Math.cos(p);
      rate = 6;
    } else if (R3.camMode === 2) {
      const D = Math.max(352 / (tv * asp), 430 / tv);
      tx = 0;
      ty = e;
      tz = clamp(by - 40, f - 900 + D * tv * 0.9, f + 150 - D * tv * 0.9);
      if (tier === GT) tz = GY + 340;
      px = 0;
      py = ty + D * Math.sin(p);
      pz = tz + D * Math.cos(p);
      rate = 5;
    } else {
      const F = frameLevel(tier, m.pitch, m.fov, asp),
        c = f - 420,
        dz = clamp((by - c) * 0.07, -34, 24),
        dx = bx * 0.05;
      px = dx;
      py = e + F.h;
      pz = F.zc + dz;
      tx = dx * 1.6;
      ty = e;
      tz = pz - (F.h * F.cs) / F.sn;
    }
  }
  if (!R3.dbg && !(G.demo && G.mode === 'title')) {
    const ox = ZX(by) + fx,
      oz = ZZ(by);
    px += ox;
    tx += ox;
    pz += oz;
    tz += oz;
  }
  const k = 1 - Math.exp(-dt * rate);
  cam.t.x += (tx - cam.t.x) * k;
  cam.t.y += (ty - cam.t.y) * k;
  cam.t.z += (tz - cam.t.z) * k;
  cam.p.x += (px - cam.p.x) * k;
  cam.p.y += (py - cam.p.y) * k;
  cam.p.z += (pz - cam.p.z) * k;
  cam.fov += (fov - cam.fov) * k;
  const sh = G.opt && G.opt.shake ? Math.min(18, G.cam.shake) * 0.3 : 0;
  C.position.set(cam.p.x + (sh ? rand(-sh, sh) : 0), cam.p.y + (sh ? rand(-sh, sh) : 0), cam.p.z);
  C.lookAt(cam.t.x, cam.t.y, cam.t.z);
  if (Math.abs(C.fov - cam.fov) > 0.01) {
    C.fov = cam.fov;
    C.updateProjectionMatrix();
  }
}
export function snapCam() {
  updateCam3D(100);
}
export function project3D(x, y, h, out) {
  _v.set(x - 320 + ZX(y), elev(y, x) + (h || 0), y + ZZ(y)).project(R3.camera);
  out.x = (_v.x * 0.5 + 0.5) * R3.w;
  out.y = (-_v.y * 0.5 + 0.5) * R3.h;
  out.ok = _v.z < 1 && _v.z > -1;
  return out;
}
// screen pixels per table unit at a point on the table, for sizing overlay rings
export function pxPerUnit(x, y, h) {
  const ox = ZX(y),
    oz = ZZ(y);
  _v.set(x - 320 + ox, elev(y, x) + (h || 0), y + oz).project(R3.camera);
  const ax = _v.x;
  _v.set(x - 320 + 10 + ox, elev(y, x) + (h || 0), y + oz).project(R3.camera);
  return (Math.abs(_v.x - ax) * 0.5 * R3.w) / 10;
}
