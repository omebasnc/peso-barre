// Peso Barre - funzionamento offline. Cambiare VERSIONE a ogni aggiornamento dei file.
const VERSIONE = "peso-barre-v1";
const FILE = [
  "./", "index.html", "manifest.webmanifest",
  "icon-180.png", "icon-192.png", "icon-512.png",
  "barlow-condensed-latin-600-normal.woff2", "barlow-condensed-latin-700-normal.woff2",
  "barlow-latin-400-normal.woff2", "barlow-latin-500-normal.woff2",
  "ibm-plex-mono-latin-400-normal.woff2", "ibm-plex-mono-latin-500-normal.woff2",
  "ibm-plex-mono-latin-600-normal.woff2"
];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(VERSIONE).then(c => c.addAll(FILE)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== VERSIONE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Prima la copia salvata (funziona offline), poi aggiorna in background quando c'è rete
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  e.respondWith(
    caches.open(VERSIONE).then(cache =>
      cache.match(e.request, {ignoreSearch: true}).then(cached => {
        const rete = fetch(e.request).then(r => {
          if (r && r.ok && new URL(e.request.url).origin === location.origin) cache.put(e.request, r.clone());
          return r;
        }).catch(() => cached);
        return cached || rete;
      })
    )
  );
});
