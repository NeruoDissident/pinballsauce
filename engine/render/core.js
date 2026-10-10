/* ================= RENDERER STATE =================
   R3 (scene, camera, everything that moves), quality levels, camera modes, shared materials. */
/* ---------- renderer state ---------- */
export const R3 = {
  ready: false,
  q: null,
  qName: 'high',
  auto: true,
  camMode: 0,
  cam: {p: new THREE.Vector3(0, 900, 3700), t: new THREE.Vector3(0, 0, 2700), fov: 38},
  dyn: {
    flips: [],
    bumps: [],
    segs: [],
    slings: [],
    sens: [],
    shots: {},
    holes: [],
    spins: [],
    torches: [],
    statues: [],
    lamps: []
  },
  balls: [],
  fps: 60,
  ft: [],
  w: 1,
  h: 1
};
export const QUALITY = {
  high: {post: true, msaa: true, shadow: 2048, dpr: 2, label: 'High'},
  medium: {post: true, msaa: false, shadow: 1024, dpr: 1.25, label: 'Medium'},
  low: {post: false, msaa: false, shadow: 0, dpr: 1, label: 'Low'}
};
export const CAMS = [
  {name: 'Player', pitch: 48, fov: 32},
  {name: 'Chase', pitch: 31, fov: 46},
  {name: 'Overhead', pitch: 83, fov: 30}
];
export const M = {};
export const lin = c => new THREE.Color(c).convertSRGBToLinear();
export const fixc = o => {
  for (const k of ['color', 'emissive']) if (typeof o[k] === 'number' || typeof o[k] === 'string') o[k] = lin(o[k]);
  return o;
};
export const SM = o => new THREE.MeshStandardMaterial(fixc(o));
export const BM = o => new THREE.MeshBasicMaterial(fixc(o));
export const hdr = (hex, k) => new THREE.Color(hex).convertSRGBToLinear().multiplyScalar(k === undefined ? 1 : k);
export function ctex(cv, o) {
  const t = new THREE.CanvasTexture(cv);
  t.encoding = THREE.sRGBEncoding;
  if (o && o.repeat) {
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
  }
  if (R3.rn) t.anisotropy = Math.min(8, R3.rn.capabilities.getMaxAnisotropy());
  return t;
}
