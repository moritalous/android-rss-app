// サービスワーカーのバージョン
const CACHE_VERSION = 'v1';
const CACHE_NAME = `rss-reader-cache-${CACHE_VERSION}`;

// キャッシュするファイルのリスト
const urlsToCache = [
  '/android-rss-app/',
  '/android-rss-app/index.html',
  '/android-rss-app/manifest.json'
];

// インストール時にキャッシュを作成
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('キャッシュを開きました');
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting())
  );
});

// 古いキャッシュを削除
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('古いキャッシュを削除:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// フェッチイベントをハンドル
self.addEventListener('fetch', event => {
  // RSSフィードのリクエストはキャッシュしない
  if (event.request.url.includes('cors-anywhere') || 
      event.request.url.includes('allorigins') ||
      event.request.url.includes('corsproxy.io')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // キャッシュがあればそれを返す
        if (response) {
          return response;
        }

        // キャッシュがなければネットワークからフェッチ
        return fetch(event.request).then(
          response => {
            // 有効なレスポンスかチェック
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // レスポンスをクローンしてキャッシュに保存
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        );
      })
      .catch(() => {
        // オフライン時のフォールバック
        if (event.request.mode === 'navigate') {
          return caches.match('/android-rss-app/index.html');
        }
      })
  );
});
