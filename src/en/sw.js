const CACHE_NAME = "2025-05-12 00:00";
const urlsToCache = [
  "/inpainter/",
  "/inpainter/en/",
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

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    }),
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    }),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.filter((cacheName) => cacheName !== CACHE_NAME)
          .map((cacheName) => caches.delete(cacheName)),
      );
    }),
  );
});
