const CACHE_NAME = 'todo-app-v1'
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/src/main.js',
  '/src/style.css',
  '/favicon.svg',
  '/manifest.webmanifest'
]

// 安装Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS_TO_CACHE))
      .then(() => self.skipWaiting())
  )
})

// 激活Service Worker
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName)
          }
        })
      )
    }).then(() => self.clients.claim())
  )
})

// 拦截网络请求
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // 如果缓存中有，返回缓存内容
        if (response) {
          return response
        }

        // 否则从网络获取
        return fetch(event.request)
          .then(response => {
            // 如果不是成功的响应或者不是GET请求，直接返回
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response
            }

            // 克隆响应
            const responseToCache = response.clone()

            // 将新资源添加到缓存
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache)
              })

            return response
          })
      })
  )
})