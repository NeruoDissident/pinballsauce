/* ================= WINGS IN 3D ================= */
import {G, T} from '../core/state.js';
import {PI, TAU, hash, mkCanvas} from '../core/util.js';
import {M, R3, ctex, hdr} from './core.js';
import {R, flagstones, path} from './draw2d.js';
import {MB, cone, cyl, offsets, prism, strip} from './mesh.js';
import {E, PITS, WOXS, WOZS, elev, groundY} from './world.js';
import {PAL, THEME, WINGS, WING_KEYS} from '../table/content.js';
import {GT, GY, W, WLEN, WT0, tierOf} from '../table/layout.js';

/* ================= CAMPAIGN WINGS IN 3D =================
   A wing is a small room with its own flippers. In table space each sits past the Grave, so the physics treats it
   as one more level; in the world each is a sunken court beside the main table (see WOXS, WOZS, zshift in
   render3d.js): the Crypt west of the Wilds, the Den east of the Wilds, the Hoard east of the Keep.
   Everything static is built in table space inside one group per wing, and the group carries the offset. */
export const WING = {x0: 40, x1: 600, top: -40, bot: 760, wall: 40};
export function paintWingFloor(key, ss) {
  const tw = T.wings[key],
    tier = tw.tier,
    y = tw.y,
    p = PAL[tier],
    y0 = y + WING.top - WING.wall,
    y1 = y + WING.bot + WING.wall,
    cv = mkCanvas(Math.round(W * ss), Math.round((y1 - y0) * ss)),
    c = cv.getContext('2d');
  c.setTransform(ss, 0, 0, ss, 0, -y0 * ss);
  c.fillStyle = p.b;
  c.fillRect(0, y0, W, y1 - y0);
  // rough paving outside the room proper
  for (let r = 0; r < (y1 - y0) / 24 + 1; r++) {
    const yy = y0 + r * 24,
      off = (r % 2) * 26;
    for (let k = -1; k < 13; k++) {
      const h = hash(r * 29.3 + k * 4.1 + tier);
      c.fillStyle =
        'rgba(' +
        ((70 + h * 30) | 0) +
        ',' +
        ((70 + h * 30) | 0) +
        ',' +
        ((70 + h * 30) | 0) +
        ',' +
        (0.1 + h * 0.14) +
        ')';
      c.fillRect(k * 52 + off + 1, yy + 1, 50, 22);
    }
  }
  const room = tw.outline.concat([
    [420, y + 583],
    [366, y + WLEN + 60],
    [366, y1],
    [274, y1],
    [274, y + WLEN + 60],
    [220, y + 583]
  ]);
  c.save();
  path(c, room, 1);
  c.clip();
  const g = c.createLinearGradient(0, y, 0, y + 640);
  g.addColorStop(0, p.a);
  g.addColorStop(1, p.b);
  c.fillStyle = g;
  c.fillRect(0, y - 10, W, 900);
  flagstones(c, tier);
  if (THEME.wingArt && THEME.wingArt[key]) THEME.wingArt[key](c, y, p);
  const v = c.createLinearGradient(110, 0, 530, 0);
  v.addColorStop(0, 'rgba(0,0,0,.45)');
  v.addColorStop(0.16, 'rgba(0,0,0,0)');
  v.addColorStop(0.84, 'rgba(0,0,0,0)');
  v.addColorStop(1, 'rgba(0,0,0,.45)');
  c.fillStyle = v;
  c.fillRect(0, y - 10, W, 900);
  c.restore();
  // contact shadows
  c.save();
  c.lineCap = 'round';
  c.lineJoin = 'round';
  c.shadowColor = 'rgba(0,0,0,.75)';
  c.shadowBlur = 11 * ss;
  c.strokeStyle = 'rgba(0,0,0,.36)';
  path(c, tw.outline);
  c.lineWidth = 12;
  c.stroke();
  for (const w of T.wallPaths)
    if (tierOf(w.pts[0][1]) === tier) {
      path(c, w.pts);
      c.lineWidth = (w.w || 2) * 2 + 5;
      c.stroke();
    }
  c.fillStyle = 'rgba(0,0,0,.4)';
  for (const b of T.bumps)
    if (b.tier === tier) {
      c.beginPath();
      c.arc(b.x, b.y, b.r + 3, 0, TAU);
      c.fill();
    }
  c.restore();
  // light pools
  c.save();
  c.globalCompositeOperation = 'lighter';
  const pool = WINGS[key].pool || ['55', '22', '40']; // moonlight is nearly white, so it gets less of it
  for (const tr of T.torches)
    if (tierOf(tr.y) === tier) {
      const rr = tr.r * 1.5,
        q = c.createRadialGradient(tr.x, tr.y, 2, tr.x, tr.y, rr);
      q.addColorStop(0, tr.c + pool[0]);
      q.addColorStop(0.4, tr.c + pool[1]);
      q.addColorStop(1, tr.c + '00');
      c.fillStyle = q;
      c.fillRect(tr.x - rr, tr.y - rr, rr * 2, rr * 2);
    }
  for (const b of T.bumps)
    if (b.tier === tier) {
      const q = c.createRadialGradient(b.x, b.y, b.r, b.x, b.y, b.r + 52);
      q.addColorStop(0, p.glow + pool[2]);
      q.addColorStop(1, p.glow + '00');
      c.fillStyle = q;
      c.fillRect(b.x - 90, b.y - 90, 180, 180);
    }
  c.restore();
  // inserts
  c.textAlign = 'center';
  c.textBaseline = 'middle';
  for (const id in T.shots) {
    const s = T.shots[id];
    if (s.tier !== tier) continue;
    c.save();
    c.translate(s.x, s.y);
    if (s.kind === 'dot') {
      c.fillStyle = 'rgba(0,0,0,.5)';
      c.beginPath();
      c.arc(0, 0, 9, 0, TAU);
      c.fill();
      c.strokeStyle = 'rgba(230,222,200,.45)';
      c.lineWidth = 1.3;
      c.stroke();
      c.font = '700 8.5px ' + R.fontL;
      c.fillStyle = 'rgba(235,225,200,.72)';
      c.fillText(s.name.toUpperCase(), 0, 18);
    } else {
      c.rotate(s.ang + PI / 2);
      c.fillStyle = 'rgba(0,0,0,.55)';
      c.beginPath();
      c.moveTo(0, -13);
      c.lineTo(10, 8);
      c.lineTo(-10, 8);
      c.closePath();
      c.fill();
      c.strokeStyle = 'rgba(230,222,200,.45)';
      c.lineWidth = 1.3;
      c.stroke();
      c.rotate(-s.ang - PI / 2);
      c.font = '700 8.5px ' + R.fontL;
      c.fillStyle = 'rgba(235,225,200,.75)';
      c.fillText(s.name.toUpperCase(), 0, s.ang === -PI / 2 ? 20 : 22);
    }
    c.restore();
  }
  for (const id in T.holes) {
    const h = T.holes[id];
    if (h.tier !== tier) continue;
    c.fillStyle = '#000';
    c.beginPath();
    c.arc(h.x, h.y, h.r + 1, 0, TAU);
    c.fill();
  }
  return {cv, y0, y1};
}
export function buildWings() {
  R3.wings = WING_KEYS.map((key, i) => buildWing(key, i));
}
export function buildWing(key, i) {
  const sc = R3.scene,
    tw = T.wings[key],
    tier = tw.tier,
    y = tw.y,
    p = PAL[tier],
    g = new THREE.Group();
  g.position.set(WOXS[i], 0, WOZS[i]);
  sc.add(g);
  const Wg = {key, tier, g, k: 0, tw},
    WM = R3.wingMB[i],
    yE = E[tier],
    yG = elev(WOZS[i] + y + 300) - 38,
    pit = PITS[i];
  const mb = {stone: new MB(), dark: new MB(), roof: new MB()},
    add = (m, mat, o) => {
      if (m.p.length) g.add(m.mesh(mat, o));
    };
  const X0 = WING.x0,
    X1 = WING.x1,
    Y0 = y + WING.top,
    Y1 = y + WING.bot,
    w = WING.wall;
  // floor
  {
    const fl = (Wg.floor = paintWingFloor(key, 2)),
      tex = (Wg.tex = ctex(fl.cv));
    tex.anisotropy = R3.rn.capabilities.getMaxAnisotropy();
    const mat = new THREE.MeshStandardMaterial({
      map: tex,
      emissiveMap: tex,
      emissive: new THREE.Color(1, 1, 1),
      emissiveIntensity: 0.44,
      color: new THREE.Color(1.75, 1.75, 1.9),
      roughness: 0.6,
      metalness: 0,
      envMapIntensity: 0.32
    });
    const m = new MB(),
      u0 = X0 / W,
      u1 = X1 / W,
      v = yy => 1 - (yy - fl.y0) / (fl.y1 - fl.y0);
    m.hint = [0, 1, 0];
    m.quad(
      [X0 - 320, yE, Y0],
      [X1 - 320, yE, Y0],
      [X1 - 320, yE, Y1],
      [X0 - 320, yE, Y1],
      [u0, v(Y0)],
      [u1, v(Y0)],
      [u1, v(Y1)],
      [u0, v(Y1)]
    );
    g.add(m.mesh(mat, {cast: false}));
  }
  // the room's walls, the lanes under the flippers
  {
    const out = offsets(tw.outline, 17, false),
      cx = 320,
      cy = y + 300,
      far = L => L.reduce((a, q) => a + Math.hypot(q[0] - cx, q[1] - cy), 0),
      side = far(out[0]) > far(out[1]) ? out[0] : out[1];
    strip(mb.stone, side, 17, 46, {us: 80, caps: false});
    for (const sd of [-1, 1]) {
      strip(
        mb.stone,
        [
          [320 + sd * 100, y + 583],
          [320 + sd * 46, y + WLEN + 60]
        ],
        3,
        26
      );
      cyl(mb.stone, 320 + sd * 104, y + 566, 9, 0, 52, 8);
    }
    for (const q of tw.outline.slice(1, -1)) {
      const dx = q[0] - cx,
        dy = q[1] - cy,
        l = Math.hypot(dx, dy);
      cyl(mb.stone, q[0] + (dx / l) * 17, q[1] + (dy / l) * 17, 11, 0, 58, 8);
      cone(mb.stone, q[0] + (dx / l) * 17, q[1] + (dy / l) * 17, 13, 58, 72, 8);
    }
  }
  // the court the room sits in: retaining walls up to the ground beside the main table
  {
    const o = {flat: yG, base: yE - 4};
    prism(
      mb.dark,
      [
        [X0 - w, Y0 - w],
        [X0, Y0 - w],
        [X0, Y1 + w],
        [X0 - w, Y1 + w]
      ],
      0,
      o
    );
    prism(
      mb.dark,
      [
        [X1, Y0 - w],
        [X1 + w, Y0 - w],
        [X1 + w, Y1 + w],
        [X1, Y1 + w]
      ],
      0,
      o
    );
    prism(
      mb.dark,
      [
        [X0, Y0 - w],
        [X1, Y0 - w],
        [X1, Y0],
        [X0, Y0]
      ],
      0,
      o
    );
    prism(
      mb.dark,
      [
        [X0, Y1],
        [X1, Y1],
        [X1, Y1 + w],
        [X0, Y1 + w]
      ],
      0,
      o
    );
  }
  Wg.anim = () => {};
  if (THEME.wingProps && THEME.wingProps[key]) THEME.wingProps[key](Wg, g, mb, y, yE, p);
  {
    const glow = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: R3.glowTex,
        color: hdr(p.glow, 2),
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      })
    );
    glow.position.set(0, yE + 44, y + 120);
    glow.scale.set(200, 200, 1);
    g.add(glow);
    Wg.glow = glow;
  }
  add(mb.stone, M.stone[tier]);
  add(mb.dark, M.dark);
  add(mb.roof, M.roof);
  add(WM.steel, M.steel);
  add(WM.bronze, M.bronze);
  add(WM.post, M.post);
  // the land around the court, flat where the court cuts it
  {
    const m = new MB();
    m.hint = [0, 1, 0];
    const PX0 = pit.x0 - 320,
      PX1 = pit.x1 - 320,
      Z0 = pit.z0,
      Z1 = pit.z1,
      a = X0 - w - 320 + WOXS[i],
      b = X1 + w - 320 + WOXS[i],
      c = Y0 - w + WOZS[i],
      d = Y1 + w + WOZS[i];
    const q = (x0, z0, x1, z1) => {
      if (x1 - x0 < 0.5 || z1 - z0 < 0.5) return;
      const P = (x, z) => [x, groundY(x + 320, z), z];
      for (let x = x0; x < x1 - 0.01; x += 95)
        for (let z = z0; z < z1 - 0.01; z += 90) {
          const xb = Math.min(x1, x + 95),
            zb = Math.min(z1, z + 90);
          m.quad(
            P(x, z),
            P(xb, z),
            P(xb, zb),
            P(x, zb),
            [(x + 320) / 220, z / 220],
            [(xb + 320) / 220, z / 220],
            [(xb + 320) / 220, zb / 220],
            [(x + 320) / 220, zb / 220]
          );
        }
    };
    q(PX0, Z0, a, Z1);
    q(b, Z0, PX1, Z1);
    q(a, Z0, b, c);
    q(a, d, b, Z1);
    sc.add(m.mesh(M.ground, {cast: false}));
  }
  // a glow rising from the court while it stands open, so it reads from the main table before you ever go down
  {
    const sp = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: R3.glowTex,
        color: hdr(p.glow, 1.1),
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      })
    );
    sp.position.set(0, yG + 40, y + 330);
    sp.scale.set(900, 900, 1);
    g.add(sp);
    Wg.beacon = sp;
  }
  return Wg;
}
export function repaintWings() {
  if (!R3.wings) return;
  for (const Wg of R3.wings) {
    const f = paintWingFloor(Wg.key, 2),
      c = Wg.floor.cv.getContext('2d');
    c.setTransform(1, 0, 0, 1, 0, 0);
    c.drawImage(f.cv, 0, 0);
    Wg.tex.needsUpdate = true;
  }
}
export function frameWing(dt) {
  const t = G.t,
    run = G.run,
    w = run && run.wing,
    ft = G.focusTier;
  let here = null;
  for (const Wg of R3.wings) {
    const open = !Wg.tw.seal[0].on,
      inside = ft === Wg.tier;
    if (inside) here = Wg;
    Wg.k += ((open ? 1 : 0) - Wg.k) * Math.min(1, dt * 3);
    Wg.anim(Wg.k);
    Wg.glow.material.opacity = Wg.k * (0.7 + 0.2 * Math.sin(t * 5));
    Wg.beacon.material.opacity =
      !inside && w && w.key === Wg.key && w.open && !w.done ? 0.16 + 0.07 * Math.sin(t * 2.4) : 0;
  }
  // one light serves the buried places: it sits in a wing while you are down there, in the Grave otherwise
  const L = R3.tierL[GT];
  if (here) {
    const i = here.tier - WT0;
    L.position.set(WOXS[i], E[here.tier] + 300, here.tw.y + 300 + WOZS[i]);
    L.color.set(PAL[here.tier].glow);
    L.intensity = WINGS[here.key].light || 0.5;
  } else {
    L.position.set(0, E[GT] + 330, GY + 320);
    L.color.set(THEME.tierLight[GT]);
    L.intensity = 1;
  }
}
