/* Pinballsauce service worker: what makes the site installable and playable with no network.
   The game is many small files with no build step, so nothing is listed here but the front page and the icons.
   Every same-origin GET goes to the network first and is kept; with no network the kept copy is served. That way a
   phone that is online always runs the newest files, and a table that has been opened once works offline. */
const CACHE = 'pinballsauce-v1',
  CORE = [
    './',
    'index.html',
    'catalog.js',
    'engine/app/picker.js',
    'engine/ui/gamepad.js',
    'manifest.webmanifest',
    'assets/icons/icon-192.png',
    'assets/icons/icon-512.png',
    'assets/icons/maskable-512.png',
    'assets/icons/apple-touch-icon.png',
    'assets/icons/favicon-32.png'
  ];
self.addEventListener('install', e => {
  e.waitUntil(
    caches
      .open(CACHE)
      .then(c => c.addAll(CORE))
      .then(() => self.skipWaiting())
  );
});
self.addEventListener('activate', e => {
  e.waitUntil(
    caches
      .keys()
      .then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});
self.addEventListener('fetch', e => {
  const q = e.request;
  if (q.method !== 'GET' || new URL(q.url).origin !== location.origin) return;
  e.respondWith(
    fetch(q)
      .then(r => {
        if (r && r.ok) {
          const copy = r.clone();
          caches.open(CACHE).then(c => c.put(q, copy));
        }
        return r;
      })
      .catch(() => caches.match(q, {ignoreSearch: true}).then(r => r || (q.mode === 'navigate' ? caches.match('index.html') : Response.error())))
  );
});
