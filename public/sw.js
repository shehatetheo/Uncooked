// Uncooked service worker: offline shell plus cache-on-first-use for the
// Python and SQL runtimes. Hand-written to stay small and auditable.
const VERSION = "v1";
const STATIC = `uncooked-static-${VERSION}`; // hashed build assets, runtimes, fonts
const PAGES = `uncooked-pages-${VERSION}`; // HTML and route payloads

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(PAGES).then((c) => c.add("/")).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k.startsWith("uncooked-") && k !== STATIC && k !== PAGES).map((k) => caches.delete(k)))).then(() => self.clients.claim()),
  );
});

// The app asks for its routes to be cached once it is idle and online.
self.addEventListener("message", (event) => {
  if (event.data?.type !== "warm" || !Array.isArray(event.data.urls)) return;
  event.waitUntil(
    caches.open(PAGES).then(async (cache) => {
      for (const url of event.data.urls) {
        try {
          if (!(await cache.match(url))) await cache.add(url);
        } catch {
          /* offline or missing: skip */
        }
      }
    }),
  );
});

const isImmutable = (url) => url.pathname.startsWith("/_next/static/") || url.pathname.startsWith("/pyodide/") || url.pathname.startsWith("/sqljs/") || /\.(woff2?|png|svg|webmanifest)$/.test(url.pathname);

async function cacheFirst(request) {
  const cache = await caches.open(STATIC);
  const hit = await cache.match(request);
  if (hit) return hit;
  const res = await fetch(request);
  if (res.ok) cache.put(request, res.clone());
  return res;
}

async function networkFirst(request, fallbackToShell) {
  const cache = await caches.open(PAGES);
  try {
    const res = await fetch(request);
    if (res.ok) cache.put(request, res.clone());
    return res;
  } catch (err) {
    const hit = (await cache.match(request)) || (await cache.match(request, { ignoreSearch: true }));
    if (hit) return hit;
    if (fallbackToShell) {
      const shell = await cache.match("/");
      if (shell) return shell;
    }
    throw err;
  }
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname === "/sw.js" || url.pathname === "/py-worker.mjs") return;
  if (isImmutable(url)) event.respondWith(cacheFirst(request));
  else if (request.mode === "navigate") event.respondWith(networkFirst(request, true));
  else event.respondWith(networkFirst(request, false));
});
