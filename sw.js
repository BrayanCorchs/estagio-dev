// Guarda os arquivos do app para ele abrir rápido e funcionar sem internet.
// Ao publicar uma versão nova, mude o número abaixo para os aparelhos baixarem tudo de novo.
const CACHE = "estagio-dev-v1";
const ARQUIVOS = ["./", "index.html", "manifest.json", "app.js", "bugs.js", "bugs2.js", "bugs3.js", "js-track.js", "real.js", "real2.js", "tracks.js", "tracks2.js", "tracks3.js", "tracks4.js", "tracks5.js", "tracks6.js", "icones/apple-touch-icon.png", "icones/favicon-32.png", "icones/icone-192.png", "icones/icone-512.png", "icones/icone-maskable-512.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ARQUIVOS)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(caches.keys()
    .then(nomes => Promise.all(nomes.filter(n => n !== CACHE).map(n => caches.delete(n))))
    .then(() => self.clients.claim()));
});

self.addEventListener("fetch", e => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET" || url.origin !== location.origin) return;
  e.respondWith(caches.match(e.request).then(guardado => {
    const daRede = fetch(e.request).then(resp => {
      if (resp.ok) { const copia = resp.clone(); caches.open(CACHE).then(c => c.put(e.request, copia)); }
      return resp;
    }).catch(() => guardado);
    return guardado || daRede;
  }));
});
