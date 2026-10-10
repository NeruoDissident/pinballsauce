/* ================= UTIL =================
   Maths, random numbers, storage, small DOM helpers. No game knowledge. Imports nothing. */
/* ================= UTIL ================= */
export const PI = Math.PI;
export const TAU = PI * 2;
export const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
export const lerp = (a, b, t) => a + (b - a) * t;
export const rand = (a = 1, b) => (b === undefined ? Math.random() * a : a + Math.random() * (b - a));
export const irand = (a, b) => Math.floor(rand(a, b + 1));
export const pick = a => a[Math.floor(Math.random() * a.length)];
export const shuffle = a => {
  a = a.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};
export const fmt = n => Math.floor(n).toLocaleString('en-US');
export const hash = n => {
  n = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return n - Math.floor(n);
};
// saves, scores and progress are kept per table; settings (prefs) are shared by every table
export let STORE_NS = 'pinballsauce.';
export function setStoreNs(s) {
  STORE_NS = s;
}
export const store = {
  get(k, d) {
    try {
      const v = localStorage.getItem(STORE_NS + k);
      return v ? JSON.parse(v) : d;
    } catch (e) {
      return d;
    }
  },
  set(k, v) {
    try {
      localStorage.setItem(STORE_NS + k, JSON.stringify(v));
    } catch (e) {}
  },
  del(k) {
    try {
      localStorage.removeItem(STORE_NS + k);
    } catch (e) {}
  }
};
export const prefs = {
  get(k, d) {
    try {
      const v = localStorage.getItem('pinballsauce.prefs.' + k);
      return v ? JSON.parse(v) : d;
    } catch (e) {
      return d;
    }
  },
  set(k, v) {
    try {
      localStorage.setItem('pinballsauce.prefs.' + k, JSON.stringify(v));
    } catch (e) {}
  }
};
export function mkCanvas(w, h) {
  const cv = document.createElement('canvas');
  cv.width = w;
  cv.height = h;
  return cv;
}
/* ================= UI, INPUT, LOOP ================= */
export const $ = id => document.getElementById(id);
export const esc = s => String(s).replace(/[&<>"]/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;'})[c]);
