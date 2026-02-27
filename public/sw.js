// public/sw.js
// CBS — Service Worker
// 策略：App Shell + 音频/图片资产全部 Cache First，确保离线可用

const CACHE_NAME = 'cbs-v1';

// ── 安装：预缓存 App Shell ────────────────────────────────────────────────────
// CRA 构建后 HTML 入口始终为 /index.html，JS/CSS 由 fetch 拦截动态缓存
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      cache.addAll(['/index.html', '/'])
    )
  );
  // 新 SW 立即接管，不等待旧 SW 退出
  self.skipWaiting();
});

// ── 激活：清理旧版本缓存 ──────────────────────────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  // 立即控制所有已打开的页面
  self.clients.claim();
});

// ── Fetch：拦截所有请求 ───────────────────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // 只处理同源请求（排除 freesound.org 等外部链接）
  if (url.origin !== self.location.origin) return;

  // 音频与图片资产：Cache First（优先离线，回退网络并缓存结果）
  const isAsset = url.pathname.includes('/static/media/') ||
                  url.pathname.endsWith('.mp3')           ||
                  url.pathname.endsWith('.png');

  if (isAsset) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          // 只缓存成功的响应
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          const toCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, toCache));
          return response;
        });
      })
    );
    return;
  }

  // JS / CSS 静态包：Cache First + 后台更新（Stale While Revalidate）
  const isStatic = url.pathname.includes('/static/js/') ||
                   url.pathname.includes('/static/css/');

  if (isStatic) {
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) =>
        cache.match(request).then((cached) => {
          const networkFetch = fetch(request).then((response) => {
            cache.put(request, response.clone());
            return response;
          });
          return cached || networkFetch;
        })
      )
    );
    return;
  }

  // HTML 导航请求：Network First，离线时回退到缓存的 index.html
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() =>
        caches.match('/index.html')
      )
    );
  }
});