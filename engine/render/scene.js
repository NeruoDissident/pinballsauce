/* ================= BUILDING THE SCENE =================
   Turns T into meshes: walls, blocks, ramps, flippers, targets, inserts, scoops, torches, the plunger, the Grave. */
import {defaultBumper, defaultStatue} from './defaults.js';
import {G, T} from '../core/state.js';
import {PI, TAU, clamp, hash, lerp, mkCanvas} from '../core/util.js';
import {buildActors} from './actors.js';
import {M, R3, SM, ctex, hdr} from './core.js';
import {LITC, R} from './draw2d.js';
import {paintFloorChunks} from './floor.js';
import {MB, at, box, cyl, offsets, prism, strip, ugeo} from './mesh.js';
import {buildRunes} from './runes.js';
import {
  texBall,
  texFlame,
  texGlow,
  texGround,
  texParticle,
  texRampBed,
  texRampGlow,
  texSky,
  texStone,
  texWood
} from './textures.js';
import {buildWings} from './wings.js';
import {
  BLOCK_H,
  E,
  RAMP_H,
  SLOPES,
  UP,
  WALL_H,
  elev,
  elevIn,
  elevOf,
  groundY,
  inSlope,
  inWing,
  setWorld,
  sstep,
  wingIdx,
  zshift
} from './world.js';
import {DEF, PAL, THEME, USE, WINGS, WING_KEYS} from '../table/content.js';
import {arcPts} from '../table/geometry.js';
import {
  ABOVE,
  BELOW,
  BT,
  CHAINS,
  CX,
  FIELD_H,
  GRID,
  GT,
  GY,
  H,
  HW,
  NM,
  OX,
  TIER_NAME,
  TY,
  W,
  XR,
  fieldAt,
  fieldNear,
  roofed,
  tierOf
} from '../table/layout.js';

export function init3D(canvas) {
  let rn;
  try {
    rn = new THREE.WebGLRenderer({canvas, antialias: true, powerPreference: 'high-performance', alpha: false});
  } catch (e) {
    return false;
  }
  R3.rn = rn;
  rn.outputEncoding = THREE.sRGBEncoding;
  rn.shadowMap.type = THREE.PCFSoftShadowMap;
  rn.setClearColor(0x05050a, 1);
  const scene = (R3.scene = new THREE.Scene());
  scene.background = new THREE.Color(0x05050a);
  scene.fog = new THREE.FogExp2(0x06060c, 0.0004);
  R3.camera = new THREE.PerspectiveCamera(38, 1, 24, 9000);
  // reflections
  const pm = new THREE.PMREMGenerator(rn),
    sky = new THREE.CanvasTexture(texSky());
  sky.mapping = THREE.EquirectangularReflectionMapping;
  sky.encoding = THREE.sRGBEncoding;
  R3.env = pm.fromEquirectangular(sky).texture;
  scene.environment = R3.env;
  sky.dispose();
  pm.dispose();
  setWorld(DEF.layout);
  if (THEME.fonts) Object.assign(R, THEME.fonts);
  // what each lamp colour means is the engine's (main, side, lock, gold, soft, danger, spell); the colours are the table's
  if (THEME.lampCols) Object.assign(LITC, THEME.lampCols);
  buildMaterials();
  buildLights();
  buildFloor3D();
  buildStatic();
  buildDynamic();
  buildWings();
  for (const o of R3.scene.children) zshift(o);
  if (THEME.scenery) THEME.scenery();
  buildFx();
  buildActors();
  R3.ready = true;
  return true;
}
export function buildMaterials() {
  const S = SM,
    st = ctex(texStone(), {repeat: 1}),
    wd = ctex(texWood(), {repeat: 1}),
    gd = ctex(texGround(), {repeat: 1});
  const stoneCol = THEME.stoneCol;
  M.stone = stoneCol.map(c =>
    S({map: st, bumpMap: st, bumpScale: 1.6, color: c, roughness: 0.84, metalness: 0.02, envMapIntensity: 0.5})
  );
  M.frame = S({
    map: st,
    bumpMap: st,
    bumpScale: 1.6,
    color: 0x474760,
    roughness: 0.88,
    metalness: 0.02,
    envMapIntensity: 0.45
  });
  M.dark = S({
    map: st,
    bumpMap: st,
    bumpScale: 1.4,
    color: 0x3c3c50,
    roughness: 0.9,
    metalness: 0,
    envMapIntensity: 0.3
  });
  M.steel = S({color: 0xc2cadf, metalness: 1, roughness: 0.32, envMapIntensity: 1.25});
  M.bronze = S({color: 0xd9a441, metalness: 1, roughness: 0.36, envMapIntensity: 1.5});
  M.iron = S({color: 0x30323f, metalness: 0.85, roughness: 0.5, envMapIntensity: 1});
  M.post = S({color: 0x8d90a2, roughness: 0.55, metalness: 0.1, envMapIntensity: 0.8});
  M.wood = S({map: wd, color: 0xa88a66, roughness: 0.78, metalness: 0, envMapIntensity: 0.4});
  M.bone = S({color: 0xb4ad98, roughness: 0.38, metalness: 0.05, envMapIntensity: 0.9});
  M.earth = S({map: gd, color: 0x6a5540, roughness: 1, metalness: 0, envMapIntensity: 0.15});
  M.ground = S({map: gd, color: 0x5c6670, roughness: 1, metalness: 0, envMapIntensity: 0.2});
  M.pine = S({color: 0x12261f, roughness: 0.95, metalness: 0, envMapIntensity: 0.25, flatShading: true});
  M.bark = S({color: 0x2a2420, roughness: 1, metalness: 0, envMapIntensity: 0.2});
  M.roof = S({color: 0x2a2238, roughness: 0.8, metalness: 0.1, envMapIntensity: 0.4, flatShading: true});
  M.ward = new THREE.MeshBasicMaterial({
    color: hdr('#62d8ff', 0.9),
    transparent: true,
    opacity: 0.16,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.DoubleSide
  });
  M.black = new THREE.MeshBasicMaterial({color: 0x000000});
  R3.glowTex = ctex(texGlow());
  R3.flameTex = ctex(texFlame());
  if (THEME.materials) THEME.materials(M);
}
export function buildLights() {
  const sc = R3.scene;
  sc.add((R3.hemi = new THREE.HemisphereLight(0x8fa6e0, 0x1a1420, 0.36)));
  sc.add(new THREE.AmbientLight(0x404058, 0.4));
  const moon = (R3.moon = new THREE.DirectionalLight(0xcfdcff, 1.7));
  moon.castShadow = true;
  const s = moon.shadow;
  s.mapSize.set(2048, 2048);
  s.camera.left = -560;
  s.camera.right = 560;
  s.camera.top = 760;
  s.camera.bottom = -760;
  s.camera.near = 200;
  s.camera.far = 2600;
  s.bias = -0.0006;
  s.normalBias = 1.2;
  sc.add(moon, moon.target);
  // one warm pool of light over each level
  const cols = THEME.tierLight,
    zs = cols.map((c, i) => (i < NM ? TY[i] + 470 : GY + 320));
  R3.tierL = cols.map((c, i) => {
    const l = new THREE.PointLight(new THREE.Color(c), i === GT ? (USE.grave ? 1 : 0) : 1.15, 1250, 1.4);
    l.position.set(OX[i] || 0, E[i] + 330, zs[i]);
    sc.add(l);
    return l;
  });
  R3.ballL = new THREE.PointLight(0xffffff, 1.1, 210, 1.6);
  sc.add(R3.ballL);
  R3.flashL = [0, 1, 2].map(() => {
    const l = new THREE.PointLight(0xffffff, 0, 330, 1.5);
    l.userData.t = 0;
    sc.add(l);
    return l;
  });
}
export function buildFloor3D() {
  const chunks = (R3.chunks = paintFloorChunks(2));
  R3.floorTex = [];
  for (const ch of chunks) {
    const tex = ctex(ch.cv);
    tex.anisotropy = R3.rn.capabilities.getMaxAnisotropy();
    R3.floorTex.push(tex);
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
    const mb = new MB();
    mb.hint = [0, 1, 0];
    const yEnd = ch.grave ? ch.y1 : Math.min(ch.y1, ch.end);
    let y = ch.y0;
    while (y < yEnd - 0.01) {
      const y2 = Math.min(yEnd, y + (ch.grave ? 200 : inSlope(y, y + 7) ? 7 : Math.min(40, nextSlope(y) - y || 40))),
        v0 = 1 - (y - ch.y0) / (ch.y1 - ch.y0),
        v1 = 1 - (y2 - ch.y0) / (ch.y1 - ch.y0),
        e0 = ch.grave ? E[GT] : GRID ? elevIn(ch.top, y) : elev(y),
        e1 = ch.grave ? E[GT] : GRID ? elevIn(ch.top, y2) : elev(y2),
        xa = ch.ox - 320,
        xb = ch.ox + 320;
      mb.quad([xa, e0, y], [xb, e0, y], [xb, e1, y2], [xa, e1, y2], [0, v0], [1, v0], [1, v1], [0, v1]);
      y = y2;
    }
    const m = mb.mesh(mat, {cast: false});
    R3.scene.add(m);
  }
}
export function nextSlope(y) {
  let b = 1e9;
  for (const s of SLOPES) if (s[0] - 2 > y) b = Math.min(b, s[0] - 2);
  return b;
}
export function repaintFloor() {
  const fresh = paintFloorChunks(2);
  fresh.forEach((ch, i) => {
    const c = R3.chunks[i].cv.getContext('2d');
    c.setTransform(1, 0, 0, 1, 0, 0);
    c.drawImage(ch.cv, 0, 0);
    R3.floorTex[i].needsUpdate = true;
  });
}
/* ---------- everything that never moves ---------- */
export function buildStatic() {
  const sc = R3.scene,
    stone = Array.from({length: NM + 1}, () => new MB()),
    frame = new MB(),
    steel = new MB(),
    bronze = new MB(),
    iron = new MB(),
    post = new MB(),
    ward = new MB(),
    wood = new MB(),
    dark = new MB();
  const WMS = (R3.wingMB = WING_KEYS.map(() => ({steel: new MB(), bronze: new MB(), post: new MB()})));
  /* the cabinet. Each run of joined fields has a wall down both sides and a block over the arch at its head (a flat
     lid where the head field has no arch). The cap behind the arch is left off where another field stands there. */
  for (const ch of CHAINS) {
    const t = ch[0],
      b = ch[ch.length - 1],
      ox = OX[t],
      y = TY[t],
      yA = y + 300,
      yEnd = b === BT ? H + 34 : TY[b] + FIELD_H,
      cap = roofed(t) ? 10 : 110;
    elevOf(t);
    prism(
      frame,
      [
        [ox - 70, yA],
        [ox + 20, yA],
        [ox + 20, yEnd],
        [ox - 70, yEnd]
      ],
      34
    );
    prism(
      frame,
      [
        [ox + 620, yA],
        [ox + 710, yA],
        [ox + 710, yEnd],
        [ox + 620, yEnd]
      ],
      34
    );
    prism(
      stone[t],
      [
        [ox - 70, y - cap],
        [ox + 710, y - cap],
        [ox + 710, yA],
        [ox + 620, yA]
      ].concat(
        T.std[t].arch
          ? arcPts(320 + ox, yA, 300, TAU, PI, 60).slice(1, -1)
          : [
              [ox + 620, y + 20],
              [ox + 20, y + 20]
            ],
        [
          [ox + 20, yA],
          [ox - 70, yA]
        ]
      ),
      34
    );
    if (b !== BT) {
      // a field that drains into a ramp: a hood over the last of it, where the ball is taken onto the ramp
      const e = E[b] + WALL_H;
      prism(
        stone[b],
        [
          [ox + 20, TY[b] + FIELD_H - 38],
          [ox + 620, TY[b] + FIELD_H - 38],
          [ox + 620, TY[b] + FIELD_H],
          [ox + 20, TY[b] + FIELD_H]
        ],
        0,
        {flat: e + 8, base: e}
      );
    }
    elevOf(-1);
  }
  // islands between levels, aprons and the named landmarks
  const aF = Math.acos(258 / 300),
    aG = Math.asin(36 / 300);
  for (const b of T.blocks) {
    if (b.dead && !b.apron) {
      const cx = 320 + OX[b.tier],
        sd = b.pts[0][0] < cx ? -1 : 1,
        nA = TY[BELOW[b.tier]] + 300,
        arc =
          sd < 0 ? arcPts(cx, nA, 300, 1.5 * PI - aG, PI + aF, 22) : arcPts(cx, nA, 300, 1.5 * PI + aG, TAU - aF, 22);
      prism(stone[b.tier], b.pts.slice(0, 4).concat(arc.slice(1, -1), [b.pts[4]]), WALL_H, {depth: 110});
    } else if (b.dead) prism(stone[b.tier], b.pts, WALL_H, {depth: 40});
    else prism(stone[b.tier], b.pts, BLOCK_H);
  }
  // guide walls, scoops, posts, flaps and the one-way wards
  for (const w of T.wallPaths) {
    const k = w.w || 2,
      wi = wingIdx(w.pts[0][1]),
      wg = wi >= 0,
      WM = WMS[wi];
    if (w.style === 'gate') strip(ward, w.pts, 0.5, 19, {depth: 0, caps: false});
    else if (w.style === 'flap') strip(steel, w.pts, 1.2, 15, {caps: false});
    else if (w.style === 'scoop') strip(wg ? WM.bronze : bronze, w.pts, k, 24);
    else if (w.style === 'post') strip(wg ? WM.post : post, w.pts, k, 30, {capRise: 3});
    else strip(wg ? WM.steel : steel, w.pts, k, 21);
  }
  // shooter lane back stop, hole rims
  box(iron, T.shooter.x, T.shooter.y + 18, 0, 16, 30, 8);
  for (const id in T.holes) {
    const h = T.holes[id];
    (inWing(h.y) ? WMS[wingIdx(h.y)].bronze : bronze).add(
      new THREE.TorusGeometry(h.r + 1.6, 1.5, 6, 24).rotateX(PI / 2),
      at(h.x, h.y, 1.2)
    );
  }
  // ramps
  for (const id in T.rails) buildRail(T.rails[id], steel, iron);
  // the Grave: coffin walls, the pit around it
  if (USE.grave) {
    const out = offsets(T.coffin, 16, false),
      c = [
        T.coffin.reduce((a, p) => a + p[0], 0) / T.coffin.length,
        T.coffin.reduce((a, p) => a + p[1], 0) / T.coffin.length
      ];
    const far = L => L.reduce((a, p) => a + Math.hypot(p[0] - c[0], p[1] - c[1]), 0),
      side = far(out[0]) > far(out[1]) ? out[0] : out[1];
    strip(wood, side, 16, 44, {us: 96, caps: false});
    for (const sd of [-1, 1])
      strip(
        wood,
        [
          [320 + sd * 100, GY + 663],
          [320 + sd * 46, HW + 60]
        ],
        3,
        26
      );
    for (const p of [T.coffin[1], T.coffin[2], T.coffin[5], T.coffin[6], T.coffin[3], T.coffin[4]]) {
      const dx = p[0] - 320,
        dy = p[1] - (GY + 330),
        l = Math.hypot(dx, dy);
      cyl(bronze, p[0] + (dx / l) * 16, p[1] + (dy / l) * 16, 5, 40, 48, 8);
    }
    const yb = E[GT] - 4,
      yt = E[BT] - 36;
    prism(
      dark,
      [
        [-130, H + 34],
        [2, H + 34],
        [2, HW + 260],
        [-130, HW + 260]
      ],
      0,
      {flat: yt, base: yb}
    );
    prism(
      dark,
      [
        [638, H + 34],
        [770, H + 34],
        [770, HW + 260],
        [638, HW + 260]
      ],
      0,
      {flat: yt, base: yb}
    );
    prism(
      dark,
      [
        [2, H + 34],
        [638, H + 34],
        [638, H + 84],
        [2, H + 84]
      ],
      0,
      {flat: E[BT] - 0.5, base: yb}
    );
  } else {
    // no room under the table: the cabinet simply ends in a foot below the home field's drain
    prism(
      frame,
      [
        [-70, H + 34],
        [710, H + 34],
        [710, H + 120],
        [-70, H + 120]
      ],
      0,
      {flat: E[BT] + 34, base: E[BT] - 60}
    );
  }
  const add = (mb, mat, o) => {
    if (mb.p.length) sc.add(mb.mesh(mat, o));
  };
  stone.forEach((mb, i) => add(mb, M.stone[i]));
  add(frame, M.frame);
  add(steel, M.steel);
  add(bronze, M.bronze);
  add(iron, M.iron);
  add(post, M.post);
  add(wood, M.wood);
  add(dark, M.earth);
  add(ward, M.ward, {cast: false, receive: false});
  // level names carved into the stone above each level
  // (on the cap over the arch of a field at the head of a run; on the two islands above a field joined under another)
  const names = [];
  for (let i = 0; i < NM; i++) {
    const ox = OX[i],
      y = TY[i],
      nm = TIER_NAME[i];
    if (ABOVE[i] >= 0) names.push([ox + 140, y - 74, nm, 128, WALL_H, -1], [ox + 500, y - 74, nm, 128, WALL_H, -1]);
    else if (!roofed(i)) names.push([ox + 320, y - 76, nm, 230, 34, i]);
    else if (T.std[i].arch) names.push([ox + 44, y + 50, nm, 128, 34, i], [ox + 596, y + 50, nm, 128, 34, i]);
  }
  R3.nameDecals = names.map(q => {
    const cv = mkCanvas(512, 128),
      tex = ctex(cv),
      mb = new MB(),
      hw = q[3] / 2,
      hh = q[3] / 8,
      h = q[4] + 0.7,
      P = (x, y) => [x - 320, elev(y, x) + h, y];
    mb.hint = [0, 1, 0];
    elevOf(q[5]);
    mb.quad(
      P(q[0] - hw, q[1] - hh),
      P(q[0] + hw, q[1] - hh),
      P(q[0] + hw, q[1] + hh),
      P(q[0] - hw, q[1] + hh),
      [0, 1],
      [1, 1],
      [1, 0],
      [0, 0]
    );
    elevOf(-1);
    const m = mb.mesh(
      new THREE.MeshBasicMaterial({map: tex, transparent: true, depthWrite: false, color: hdr('#e6c890', 0.8)}),
      {cast: false, receive: false}
    );
    sc.add(m);
    return {cv, tex, text: q[2]};
  });
  paintNames();
}
export function paintNames() {
  for (const d of R3.nameDecals) {
    const c = d.cv.getContext('2d');
    c.clearRect(0, 0, 512, 128);
    c.textAlign = 'center';
    c.textBaseline = 'middle';
    {
      let fs = 76;
      c.font = '600 76px ' + R.fontD;
      if (THEME.fitNames !== false)
        while (fs > 28 && c.measureText(d.text).width > 496) {
          fs -= 4;
          c.font = '600 ' + fs + 'px ' + R.fontD;
        }
    } // a long name in a wide face is set smaller, never clipped
    c.fillStyle = 'rgba(0,0,0,.9)';
    c.fillText(d.text, 258, 70);
    c.fillStyle = 'rgba(232,200,130,.95)';
    c.fillText(d.text, 256, 66);
    d.tex.needsUpdate = true;
  }
}
// a ramp: the ball's path lifted off the table, drawn as a wire-form with a plated bed
export function buildRail(r, steel, iron) {
  const n = r.n,
    ef = elev(r.y[0], r.x[0]),
    et = elev(r.y[n - 1], r.x[n - 1]),
    X = [],
    Yh = [],
    Z = [];
  r.h3 = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const s = i * r.ds,
      prof = sstep(0, 1, Math.min(1, s / 80, (r.len - s) / 80)),
      base = Math.max(lerp(ef, et, sstep(40, r.len * 0.55, s)), elev(r.y[i], r.x[i]));
    r.h3[i] = base + (RAMP_H + (r.lift || 0)) * prof + (prof > 0 ? 1 : 0);
    X.push(r.x[i] - 320);
    Yh.push(r.h3[i]);
    Z.push(r.y[i]);
  }
  const tan = i => {
    const a = Math.max(0, i - 1),
      b = Math.min(n - 1, i + 1);
    let tx = X[b] - X[a],
      tz = Z[b] - Z[a];
    const l = Math.hypot(tx, tz) || 1;
    return [tx / l, tz / l];
  };
  // bed
  const mb = new MB();
  mb.hint = [0, 1, 0];
  let v = 0;
  const hw = 13;
  for (let i = 0; i < n - 1; i++) {
    const t0 = tan(i),
      t1 = tan(i + 1),
      v1 = v + r.ds / 48;
    mb.quad(
      [X[i] - t0[1] * hw, Yh[i], Z[i] + t0[0] * hw],
      [X[i] + t0[1] * hw, Yh[i], Z[i] - t0[0] * hw],
      [X[i + 1] + t1[1] * hw, Yh[i + 1], Z[i + 1] - t1[0] * hw],
      [X[i + 1] - t1[1] * hw, Yh[i + 1], Z[i + 1] + t1[0] * hw],
      [0, v],
      [1, v],
      [1, v1],
      [0, v1]
    );
    v = v1;
  }
  const tier = r.from,
    col = r.col || THEME.rampCol[tier],
    bt = ctex(texRampBed(col), {repeat: 1}),
    gt = ctex(texRampGlow(col), {repeat: 1});
  const bed = mb.mesh(
    new THREE.MeshStandardMaterial({
      map: bt,
      emissiveMap: gt,
      emissive: new THREE.Color(1, 1, 1),
      emissiveIntensity: 2.4,
      roughness: 0.4,
      metalness: 0.7,
      envMapIntensity: 1.1,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.62,
      depthWrite: false
    }),
    {cast: true}
  );
  bed.userData.rail = r;
  R3.scene.add(bed);
  (R3.railBeds = R3.railBeds || []).push(bed);
  // side wires, ties and legs
  for (const sd of [-1, 1]) {
    const pts = [];
    for (let i = 0; i < n; i += 2) {
      const t = tan(i);
      pts.push(new THREE.Vector3(X[i] - sd * t[1] * 15, Yh[i] + 9, Z[i] + sd * t[0] * 15));
    }
    const t = tan(n - 1);
    pts.push(new THREE.Vector3(X[n - 1] - sd * t[1] * 15, Yh[n - 1] + 9, Z[n - 1] + sd * t[0] * 15));
    steel.add(
      new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), pts.length * 2, 1.9, 6, false),
      new THREE.Matrix4()
    );
  }
  for (let i = 4; i < n - 2; i += 5) {
    const t = tan(i);
    steel.add(
      ugeo('box'),
      new THREE.Matrix4().compose(
        new THREE.Vector3(X[i], Yh[i] - 1.2, Z[i]),
        new THREE.Quaternion().setFromAxisAngle(UP, Math.atan2(-t[0], -t[1])),
        new THREE.Vector3(30, 1.6, 2.2)
      )
    );
    for (const sd of [-1, 1])
      steel.add(
        ugeo('c6'),
        new THREE.Matrix4().compose(
          new THREE.Vector3(X[i] - sd * t[1] * 15, Yh[i] + 4, Z[i] + sd * t[0] * 15),
          new THREE.Quaternion(),
          new THREE.Vector3(1.1, 10, 1.1)
        )
      );
  }
  for (let i = 22; i < n - 18; i += 26) {
    const x = r.x[i],
      g = standOn(x, r.y[i]),
      hgt = Yh[i] - g;
    if (hgt < RAMP_H * 0.8) continue;
    const t = tan(i),
      sd = ((i / 26) | 0) % 2 ? 1 : -1;
    iron.add(
      ugeo('c6'),
      new THREE.Matrix4().compose(
        new THREE.Vector3(X[i] - sd * t[1] * 15, g + hgt / 2, Z[i] + sd * t[0] * 15),
        new THREE.Quaternion(),
        new THREE.Vector3(1.5, hgt, 1.5)
      )
    );
  }
}
// what a ramp's leg stands on: a field's floor, the top of the cabinet wall beside it, or the land outside
function standOn(x, y) {
  if (!GRID) return x < -70 || x > 710 ? groundY(x, y) : elev(y) + (x < 20 || x > 620 ? 34 : 0);
  const i = fieldAt(x, y);
  if (i >= 0) return elevIn(i, y) + (x < OX[i] + 20 || x > OX[i] + 620 ? 34 : 0);
  const j = fieldNear(x, y);
  return Math.max(OX[j] - x, x - (OX[j] + W)) > 70 || y < TY[j] - 110 || y > TY[j] + FIELD_H
    ? groundY(x, y)
    : elevIn(j, y) + 34;
}
export function railY(r, s) {
  const f = clamp(s / r.ds, 0, r.n - 1.001),
    i = f | 0;
  return r.h3[i] + (r.h3[i + 1] - r.h3[i]) * (f - i);
}
/* ---------- everything that moves or lights up ---------- */
export function buildDynamic() {
  const sc = R3.scene,
    D = R3.dyn,
    S = SM;
  R3.gates = {};
  for (const m of T.mouths) {
    const g = new THREE.Group();
    g.position.set(m.x - 320, elev(m.y, m.x), m.y);
    g.rotation.y = -Math.atan2(m.dy, m.dx);
    for (let k = -2; k <= 2; k++) {
      const b = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 1.4, 34, 6), M.iron);
      b.position.set(0, 17, k * 8.5);
      b.castShadow = true;
      g.add(b);
    }
    const t = new THREE.Mesh(new THREE.BoxGeometry(3, 3, 40), M.iron);
    t.position.y = 33;
    g.add(t);
    g.visible = false;
    sc.add(g);
    R3.gates[m.rail] = g;
  }
  // flippers
  const fshape = (r1, r2, L) => {
    const s = new THREE.Shape();
    s.absarc(0, 0, r1, PI / 2, PI * 1.5, false);
    s.absarc(L, 0, r2, -PI / 2, PI / 2, false);
    s.closePath();
    return s;
  };
  // one bat and one rubber per flipper length in use
  const FG = {},
    fgeo = L =>
      FG[L] ||
      (FG[L] = [
        new THREE.ExtrudeGeometry(fshape(7.6, 4.2, L), {
          depth: 11,
          bevelEnabled: true,
          bevelSize: 0.9,
          bevelThickness: 1.2,
          bevelSegments: 2,
          curveSegments: 12
        })
          .rotateX(-PI / 2)
          .translate(0, 2, 0),
        new THREE.ExtrudeGeometry(fshape(9, 5.4, L), {depth: 5, bevelEnabled: false, curveSegments: 12})
          .rotateX(-PI / 2)
          .translate(0, 5, 0)
      ]);
  const pg = new THREE.CylinderGeometry(3.6, 3.6, 17, 12).translate(0, 8.5, 0);
  for (const f of T.flips) {
    const g = new THREE.Group(),
      col = PAL[f.tier].glow,
      fg = fgeo(f.L)[0],
      rg = fgeo(f.L)[1];
    const rub = new THREE.MeshStandardMaterial({
      color: hdr(col, 0.5),
      emissive: hdr(col),
      emissiveIntensity: 0.35,
      roughness: 0.6,
      metalness: 0
    });
    const a = new THREE.Mesh(fg, M.bone),
      b = new THREE.Mesh(rg, rub),
      p = new THREE.Mesh(pg, M.steel);
    a.castShadow = b.castShadow = true;
    a.receiveShadow = true;
    g.add(a, b, p);
    g.position.set(f.x - 320, elev(f.y, f.x) + 0.5, f.y);
    sc.add(g);
    D.flips.push({f, g, rub});
  }
  // bumpers
  for (const b of T.bumps) D.bumps.push((THEME.bumper || defaultBumper)(b));
  // statues
  for (const s of G.statues) D.statues.push((THEME.statue || defaultStatue)(s));
  // drop targets, standup targets, the sealed door, coffin nails
  const tgeo = ugeo('box');
  for (const id in T.banks)
    for (const s of T.banks[id].segs) {
      const drop = s.kind === 'drop',
        door = !!T.banks[id].door,
        nail = id === 'nails',
        p = PAL[s.tier];
      const base = door ? '#8f9bb0' : nail ? '#b9a070' : drop ? p.acc : '#b98c3a',
        lit = drop ? p.glow : '#ffd24a';
      const mat = S({
        color: base,
        emissive: hdr(lit),
        emissiveIntensity: 0.12,
        roughness: 0.45,
        metalness: door || nail ? 0.8 : 0.25,
        envMapIntensity: 1
      });
      const h = drop ? 24 : 19,
        m = new THREE.Mesh(tgeo, mat);
      m.scale.set(s.len, h, drop ? 6.4 : 5);
      m.rotation.y = -Math.atan2(s.dy, s.dx);
      const cx = (s.x1 + s.x2) / 2,
        cy = (s.y1 + s.y2) / 2,
        y0 = elev(cy, cx) + h / 2;
      m.position.set(cx - 320, y0, cy);
      m.castShadow = true;
      sc.add(m);
      D.segs.push({s, m, mat, drop, y0, h, k: 1});
    }
  for (const wk in T.wings)
    for (const s of T.wings[wk].seal) {
      const mat = S({
          color: WINGS[wk].sealCol,
          emissive: hdr(PAL[T.wings[wk].tier].glow),
          emissiveIntensity: 0.14,
          roughness: 0.6,
          metalness: 0.1
        }),
        h = 30,
        m = new THREE.Mesh(tgeo, mat);
      m.scale.set(s.len + 2, h, 8);
      m.rotation.y = -Math.atan2(s.dy, s.dx);
      const cx = (s.x1 + s.x2) / 2,
        cy = (s.y1 + s.y2) / 2,
        y0 = elev(cy, cx) + h / 2;
      m.position.set(cx - 320, y0, cy);
      m.castShadow = true;
      sc.add(m);
      D.segs.push({s, m, mat, drop: true, y0, h, k: 1});
    }
  // slingshots
  for (const s of T.slings) {
    const p = PAL[s.tier],
      mb = new MB();
    prism(mb, [s.A, s.B, s.C], 17);
    sc.add(mb.mesh(M.stone[s.tier]));
    const sm = new MB();
    strip(sm, [s.A, s.B, s.C], 2, 20, {capGrow: 1.4, capRise: 4});
    sc.add(sm.mesh(M.steel));
    const mat = S({color: hdr(p.acc, 0.6), emissive: hdr(p.glow), emissiveIntensity: 0.3, roughness: 0.5});
    const bm = new MB();
    strip(bm, [s.A, s.C], 2.3, 13, {h0: 5, caps: false});
    const band = bm.mesh(mat);
    sc.add(band);
    D.slings.push({s, mat});
  }
  // lane inserts
  const disc = new THREE.CircleGeometry(7, 18).rotateX(-PI / 2),
    dia = new THREE.CircleGeometry(8, 4).rotateX(-PI / 2);
  const arrowG = (tip, back, hw) => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute([tip, 0, 0, -back, 0, -hw, -back, 0, hw], 3));
    g.setAttribute('normal', new THREE.Float32BufferAttribute([0, 1, 0, 0, 1, 0, 0, 1, 0], 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute([1, 0.5, 0, 0, 0, 1], 2));
    return g;
  };
  const tri = arrowG(9, 9, 11),
    arrow = arrowG(13, 8, 10);
  for (const s of T.sens) {
    if (s.kind === 'spin') {
      D.spins.push(mkSpinner(s));
      continue;
    }
    if (s.kind === 'orbit') continue;
    const kick = s.kind === 'kick',
      lane = s.kind === 'lane' || s.set,
      col = kick ? '#62d8ff' : s.set && T.sets[s.set].col ? T.sets[s.set].col : lane ? '#ffc060' : '#ffe6a0';
    const mat = new THREE.MeshBasicMaterial({
      color: 0x08080c,
      transparent: true,
      opacity: 0.7,
      depthWrite: false,
      polygonOffset: true,
      polygonOffsetFactor: -2,
      polygonOffsetUnits: -2
    });
    const m = new THREE.Mesh(kick ? tri : lane ? disc : dia, mat);
    m.position.set(s.x - 320, elev(s.y, s.x) + 0.35, kick ? s.y - 49 : s.y);
    if (kick) m.rotation.y = PI / 2;
    m.renderOrder = 2;
    sc.add(m);
    D.sens.push({s, mat, kick, lane, on: hdr(col, 1.25), v: 0});
  }
  // status lamps: a round insert each, lit from the run (rules/lamps.js)
  for (const l of T.lamps) {
    const mat = new THREE.MeshBasicMaterial({
      color: 0x08080c,
      transparent: true,
      opacity: 0.7,
      depthWrite: false,
      polygonOffset: true,
      polygonOffsetFactor: -2,
      polygonOffsetUnits: -2
    });
    const m = new THREE.Mesh(new THREE.CircleGeometry(l.r, 20).rotateX(-PI / 2), mat);
    m.position.set(l.x - 320, elev(l.y, l.x) + 0.35, l.y);
    m.renderOrder = 2;
    sc.add(m);
    D.lamps.push({l, mat, on: hdr(l.col || PAL[l.tier].glow, 1.25), v: 0});
  }
  // shot inserts: the painted arrows light from underneath
  const dot = new THREE.CircleGeometry(9, 18).rotateX(-PI / 2);
  for (const id in T.shots) {
    const s = T.shots[id];
    if (s.id !== id || D.shots[s.x + ',' + s.y]) continue;
    const col = s.tier === GT ? '#9dffc8' : THEME.rampCol[s.tier];
    const mat = new THREE.MeshBasicMaterial({
      color: hdr(col, 1.6),
      transparent: true,
      opacity: 0.1,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      polygonOffset: true,
      polygonOffsetFactor: -3,
      polygonOffsetUnits: -3
    });
    const m = new THREE.Mesh(s.kind === 'dot' ? dot : arrow, mat);
    m.position.set(s.x - 320, elev(s.y, s.x) + 0.4, s.y);
    if (s.kind !== 'dot') m.rotation.y = -s.ang;
    m.renderOrder = 2;
    sc.add(m);
    D.shots[s.x + ',' + s.y] = {
      ids: Object.keys(T.shots).filter(k => T.shots[k] === s),
      mat,
      base: mat.color.clone(),
      ph: hash(s.x + s.y) * TAU,
      tier: s.tier,
      y: s.y,
      big: /^(ramp|orbit)/.test(id),
      bank: T.banks[id] || null
    };
  }
  if (USE.levels) buildRunes(); // the spellbook's ring of lamps
  // scoops glow
  for (const id in T.holes) {
    const h = T.holes[id],
      sp = new THREE.Sprite(
        new THREE.SpriteMaterial({
          map: R3.glowTex,
          color: hdr(h.tier === GT ? '#eaffd0' : '#ffd9a0', 1.4),
          transparent: true,
          opacity: 0,
          blending: THREE.AdditiveBlending,
          depthWrite: false
        })
      );
    sp.position.set(h.x - 320, elev(h.y, h.x) + 8, h.y);
    sp.scale.set(74, 74, 1);
    sc.add(sp);
    const d = new THREE.Mesh(
      new THREE.CircleGeometry(h.r + 1, 20).rotateX(-PI / 2),
      new THREE.MeshBasicMaterial({
        color: 0x000000,
        polygonOffset: true,
        polygonOffsetFactor: -1,
        polygonOffsetUnits: -1
      })
    );
    d.position.set(h.x - 320, elev(h.y, h.x) + 0.2, h.y);
    sc.add(d);
    D.holes.push({h, sp, base: sp.material.color.clone()});
  }
  // torches
  for (const tr of T.torches) D.torches.push(mkTorch(tr));
  // plunger
  {
    const g = new THREE.Group(),
      rod = new THREE.Mesh(new THREE.CylinderGeometry(2.6, 2.6, 70, 10).rotateX(PI / 2).translate(0, 0, 39), M.steel),
      tip = new THREE.Mesh(new THREE.CylinderGeometry(8, 8, 6, 14).rotateX(PI / 2), M.bone),
      knob = new THREE.Mesh(new THREE.SphereGeometry(7, 12, 10).translate(0, 0, 76), M.bronze);
    g.add(rod, tip, knob);
    g.position.set(T.shooter.x - 320, elev(T.shooter.y + 20, T.shooter.x) + 11, T.shooter.y + 16);
    sc.add(g);
    R3.plunger = g;
  }
  // the light at the head of the coffin, the mark and the stone by the drain that show the Grave is open
  if (USE.grave) {
    const sp = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: R3.glowTex,
        color: hdr('#eaffd0', 2),
        transparent: true,
        opacity: 0.3,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      })
    );
    sp.position.set(0, E[GT] + 40, GY + 194);
    sp.scale.set(120, 120, 1);
    sc.add(sp);
    R3.graveGlow = sp;
    const mk = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: R3.glowTex,
        color: hdr('#7dffb0', 1.6),
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      })
    );
    mk.position.set(CX[BT] - 320, E[BT] + 10, H - 30);
    mk.scale.set(150, 150, 1);
    sc.add(mk);
    R3.graveMark = mk;
    const sh = new THREE.Shape();
    sh.moveTo(-11, 0);
    sh.lineTo(-11, 14);
    sh.absarc(0, 14, 11, PI, 0, true);
    sh.lineTo(11, 0);
    sh.closePath();
    const gm = SM({color: '#3a4a44', emissive: hdr('#7dffb0'), emissiveIntensity: 0, roughness: 0.7}),
      st = new THREE.Mesh(
        new THREE.ExtrudeGeometry(sh, {depth: 5, bevelEnabled: false, curveSegments: 8}).translate(0, 0, -2.5),
        gm
      );
    st.position.set(CX[BT] - 320, E[BT], H - 34);
    st.rotation.x = -0.5;
    st.castShadow = true;
    sc.add(st);
    R3.graveStone = gm;
  }
  // the glow over the drain while a ball save is running; the cleric's aura
  {
    const sv = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: R3.glowTex,
        color: hdr('#62d8ff', 1.5),
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      })
    );
    sv.position.set(CX[BT] - 320, E[BT] + 8, H - 14);
    sv.scale.set(110, 110, 1);
    sc.add(sv);
    R3.saveGlow = sv;
    const au = new THREE.Mesh(
      new THREE.RingGeometry(0.965, 1, 64).rotateX(-PI / 2),
      new THREE.MeshBasicMaterial({
        color: hdr('#ffe0a0', 1.2),
        transparent: true,
        opacity: 0.22,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      })
    );
    au.visible = false;
    au.renderOrder = 2;
    sc.add(au);
    R3.aura = au;
  }
}
export function mkSpinner(s) {
  const g = new THREE.Group(),
    mat = new THREE.MeshStandardMaterial({
      color: '#d9a441',
      metalness: 1,
      roughness: 0.3,
      emissive: hdr('#ffe6a0'),
      emissiveIntensity: 0.05,
      envMapIntensity: 1.6,
      side: THREE.DoubleSide
    });
  const plate = new THREE.Mesh(new THREE.BoxGeometry(34, 17, 1.4), mat);
  plate.castShadow = true;
  const pv = new THREE.Group();
  pv.position.y = 15;
  pv.add(plate);
  g.add(pv);
  for (const sx of [-1, 1]) {
    const p = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.2, 26, 6), M.steel);
    p.position.set(sx * 20, 13, 0);
    g.add(p);
  }
  const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.8, 40, 6).rotateZ(PI / 2), M.steel);
  bar.position.y = 15;
  g.add(bar);
  g.position.set(s.x - 320, elev(s.y, s.x), s.y);
  if (s.rot) g.rotation.y = -s.rot;
  R3.scene.add(g);
  return {s, pv, mat};
}
// torches never stand in the ball's way: each is moved to the nearest wall top, block or coffin rim
export function torchSpot(tr) {
  if (tr.fix) return tr.fix;
  const tier = tierOf(tr.y),
    ly = tr.y - TY[tier];
  if (tier === GT) return ly < 100 ? {x: 320, y: GY + 8, h: 44} : {x: tr.x < 320 ? 46 : 594, y: tr.y, h: 44};
  if (tr.x < 70 || tr.x > (XR[tier] < 620 ? 560 : 570)) return {x: tr.x < 320 ? 4 : 636, y: tr.y, h: 34};
  if (ly < 300) {
    const dx = tr.x - 320,
      dy = ly - 300,
      l = Math.hypot(dx, dy),
      top = Math.abs(dx) < 10;
    if (top && tier > 0) return {x: 320, y: TY[tier] - 14, h: E[tier - 1] - E[tier] + 30, hang: true};
    return {x: 320 + (dx / l) * 317, y: TY[tier] + 300 + (dy / l) * 317, h: tier === 0 ? 34 : WALL_H};
  }
  return {x: tr.x, y: tr.y + 26, h: BLOCK_H};
}
export function mkTorch(tr) {
  const sp = torchSpot(tr),
    g = new THREE.Group(),
    col = tr.c,
    big = tr.r > 120;
  g.position.set(sp.x - 320, elev(sp.y, sp.x) + sp.h, sp.y);
  if (sp.hang) {
    const ch = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.7, 16, 5), M.iron);
    ch.position.y = -8;
    const cage = new THREE.Mesh(new THREE.CylinderGeometry(4.5, 3.2, 9, 6), M.iron);
    cage.position.y = -20;
    g.add(ch, cage);
  } else {
    const st = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 2, 18, 6), M.iron);
    st.position.y = 9;
    const bw = new THREE.Mesh(new THREE.CylinderGeometry(5, 2.4, 6, 8), M.iron);
    bw.position.y = 20;
    st.castShadow = bw.castShadow = true;
    g.add(st, bw);
  }
  const fy = sp.hang ? -19 : 30,
    fl = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: R3.flameTex,
        color: hdr(col, 2.3),
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      })
    );
  fl.position.y = fy;
  const fs = big ? 22 : 17;
  fl.scale.set(fs, fs * 1.5, 1);
  const halo = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: R3.glowTex,
      color: hdr(col, 0.9),
      transparent: true,
      opacity: 0.34,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    })
  );
  halo.position.y = fy - 2;
  halo.scale.set(big ? 130 : 96, big ? 130 : 96, 1);
  g.add(halo, fl);
  R3.scene.add(g);
  return {tr, fl, halo, fs, hs: big ? 130 : 96};
}
/* ---------- balls, particles, motes ---------- */
export function buildFx() {
  const sc = R3.scene;
  R3.ballGeo = new THREE.SphereGeometry(1, 40, 28);
  R3.ballTex = ctex(texBall());
  R3.blobGeo = new THREE.CircleGeometry(1, 20).rotateX(-PI / 2);
  /* Particles are drawn in batches, one per sprite. Nearly always there is one: the table's own (theme.fx.particle).
     A spray that asks for a shape of its own (theme.fx.bursts, or a table rule's burst) gets a batch the first time
     it fires. */
  const N = 320,
    batch = shape => {
      const pg = new THREE.BufferGeometry();
      pg.setAttribute('position', new THREE.BufferAttribute(new Float32Array(N * 3), 3));
      pg.setAttribute('color', new THREE.BufferAttribute(new Float32Array(N * 3), 3));
      for (let i = 0; i < N; i++) pg.attributes.position.setXYZ(i, 0, -9999, 0);
      const kind = typeof shape === 'string' && shape in THEME.fx.shapes ? THEME.fx.shapes[shape] : shape,
        pts = new THREE.Points(
          pg,
          new THREE.PointsMaterial({
            size: THEME.fx.particleSize,
            map: kind === 'dot' ? R3.glowTex : ctex(texParticle(kind)),
            vertexColors: true,
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            sizeAttenuation: true
          })
        );
      pts.frustumCulled = false;
      pts.userData.used = pts.userData.was = 0;
      sc.add(pts);
      return pts;
    };
  R3.parts = batch(THEME.fx.particle);
  R3.partsBy = new Map(); // shape -> its batch
  R3.partBatch = shape => {
    let b = R3.partsBy.get(shape);
    if (!b) R3.partsBy.set(shape, (b = batch(shape)));
    return b;
  };
  const Mn = 260,
    mg = new THREE.BufferGeometry();
  mg.setAttribute('position', new THREE.BufferAttribute(new Float32Array(Mn * 3), 3));
  mg.setAttribute('color', new THREE.BufferAttribute(new Float32Array(Mn * 3), 3));
  R3.motes = new THREE.Points(
    mg,
    new THREE.PointsMaterial({
      size: 7,
      map: R3.glowTex,
      vertexColors: true,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true
    })
  );
  R3.motes.frustumCulled = false;
  sc.add(R3.motes);
  R3.moteCols = THEME.motes.map(q => hdr(q.col, 1.4));
  R3.tunnelGlow = [0, 1, 2, 3, 4].map(() => {
    const sp = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: R3.glowTex,
        color: hdr('#62d8ff', 1.6),
        transparent: true,
        opacity: 0.9,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        depthTest: false
      })
    );
    sp.scale.set(70, 70, 1);
    sp.visible = false;
    sc.add(sp);
    return sp;
  });
  R3.tmpC = new THREE.Color();
  R3.litC = {};
  for (const k in LITC) R3.litC[k] = hdr(LITC[k], 1.9);
  R3.flashQ = [];
}
export function ballObj(i) {
  let o = R3.balls[i];
  if (o) return o;
  const mat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    map: R3.ballTex,
    metalness: 1,
    roughness: 0.16,
    envMapIntensity: 3.4,
    emissive: new THREE.Color(0xffffff),
    emissiveIntensity: 0.2
  });
  const m = new THREE.Mesh(R3.ballGeo, mat);
  m.castShadow = true;
  R3.scene.add(m);
  const blob = new THREE.Mesh(
    R3.blobGeo,
    new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.45,
      depthWrite: false,
      map: R3.glowTex,
      polygonOffset: true,
      polygonOffsetFactor: -4,
      polygonOffsetUnits: -4
    })
  );
  blob.renderOrder = 3;
  R3.scene.add(blob);
  const halo = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: R3.glowTex,
      transparent: true,
      opacity: 0.3,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    })
  );
  R3.scene.add(halo);
  const loc = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: R3.glowTex,
      transparent: true,
      opacity: 0.2,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      depthTest: false
    })
  );
  loc.renderOrder = 9;
  R3.scene.add(loc);
  o = R3.balls[i] = {m, mat, blob, halo, loc, q: new THREE.Quaternion(), lx: 0, ly: 0};
  return o;
}
