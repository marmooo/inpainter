const cacheName = "2026-01-06 00:00";
const urlsToCache = [
  "/inpainter/coi-serviceworker.js",
  "/inpainter/index.js",
  "/inpainter/img/before.webp",
  "/inpainter/img/after.webp",
  "/inpainter/img/anime-64.webp",
  "/inpainter/img/car-64.webp",
  "/inpainter/img/cat-64.webp",
  "/inpainter/img/castle-64.webp",
  "/inpainter/favicon/favicon.svg",
  "https://cdn.jsdelivr.net/npm/wasm-feature-detect@1.8.0/dist/umd/index.min.js",
];

importScripts(
  "https://cdn.jsdelivr.net/npm/wasm-feature-detect@1.8.0/dist/umd/index.min.js",
);

async function getOpenCVPath() {
  const simdSupport = await wasmFeatureDetect.simd();
  const threadsSupport = self.crossOriginIsolated &&
    await wasmFeatureDetect.threads();
  if (simdSupport && threadsSupport) {
    return "/inpainter/opencv/threaded-simd/opencv_js.js";
  } else if (simdSupport) {
    return "/inpainter/opencv/simd/opencv_js.js";
  } else if (threadsSupport) {
    return "/inpainter/opencv/threads/opencv_js.js";
  } else {
    return "/inpainter/opencv/wasm/opencv_js.js";
  }
}

async function addOpenCVPaths() {
  const opencvPath = await getOpenCVPath();
  urlsToCache.push(opencvPath);
  urlsToCache.push(opencvPath.slice(0, -3) + ".wasm");
}

addOpenCVPaths();

async function preCache() {
  const cache = await caches.open(cacheName);
  await Promise.all(
    urlsToCache.map((url) =>
      cache.add(url).catch((err) => console.warn("Failed to cache", url, err))
    ),
  );
  self.skipWaiting();
}

async function handleFetch(event) {
  const cached = await caches.match(event.request);
  return cached || fetch(event.request);
}

async function cleanOldCaches() {
  const cacheNames = await caches.keys();
  await Promise.all(
    cacheNames.map((name) => name !== cacheName ? caches.delete(name) : null),
  );
  self.clients.claim();
}

self.addEventListener("install", (event) => {
  event.waitUntil(preCache());
});
self.addEventListener("fetch", (event) => {
  event.respondWith(handleFetch(event));
});
self.addEventListener("activate", (event) => {
  event.waitUntil(cleanOldCaches());
});
