const CACHE_KEYS = {
  PRE_CACHE: `precache-${VERSION}`,
  RUNTIME: `runtime-${VERSION}`
};

// URLS that we don’t want to end up in the cache
const EXCLUDED_URLS = [
  'admin',
  '.netlify',
  'https://identity.netlify.com/v1/netlify-identity-widget.js',
  'https://unpkg.com/netlify-cms@^2.9.3/dist/netlify-cms.js'
];

// URLS that we want to be cached when the worker is installed
const PRE_CACHE_URLS = ['/', '/fonts/lora-v13-latin-700.woff2'];

// You might want to bypass a certain host
const IGNORED_HOSTS = ['localhost', 'unpkg.com', ];

/**
 * Takes an array of strings and puts them in a named cache store
 *
 * @param {String} cacheName
 * @param {Array} items=[]
 */
const addItemsToCache = function(cacheName, items = []) {
  caches.open(cacheName).then(cache => cache.addAll(items));
};

self.addEventListener('install', evt => {
  self.skipWaiting();

  addItemsToCache(CACHE_KEYS.PRE_CACHE, PRE_CACHE_URLS);
});

self.addEventListener('activate', evt => {
  // Look for any old caches that don't match our set and clear them out
  evt.waitUntil(
    caches
      .keys()
      .then(cacheNames => {
        return cacheNames.filter(item => !Object.values(CACHE_KEYS).includes(item));
      })
      .then(itemsToDelete => {
        return Promise.all(
          itemsToDelete.map(item => {
            return caches.delete(item);
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', evt => {
  const {hostname} = new URL(evt.request.url);

  // Check we don't want to ignore this host
  if (IGNORED_HOSTS.indexOf(hostname) >= 0) {
    return;
  }

  // Check we don't want to ignore this URL
  if (EXCLUDED_URLS.some(page => evt.request.url.indexOf(page) > -1)) {
    return;
  }

  evt.respondWith(
    caches.match(evt.request).then(cachedResponse => {
      // Item found in cache so return
      if (cachedResponse) {
        return cachedResponse;
      }

      // Nothing found so load up the request from the network
      return caches.open(CACHE_KEYS.RUNTIME).then(cache => {
        return fetch(evt.request)
          .then(response => {
            // Put the new response in cache and return it
            return cache.put(evt.request, response.clone()).then(() => {
              return response;
            });
          })
          .catch(ex => {
            return;
          });
      });
    })
  );
});
