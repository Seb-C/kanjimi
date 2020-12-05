self.addEventListener('install', function(event) {
	event.waitUntil(
		caches.open('pwa-www-cache').then(function (cache) {
			return Promise.all([
				'/app/',

				'/css/app.build.css',
				'/css/bootstrap.min.css',
				'/css/browser.build.css',
				'/css/fontawesome.min.css',
				'/css/style.css',

				'/fonts/fa-brands-400.eot',
				'/fonts/fa-brands-400.svg',
				'/fonts/fa-brands-400.ttf',
				'/fonts/fa-brands-400.woff',
				'/fonts/fa-brands-400.woff2',
				'/fonts/fa-regular-400.eot',
				'/fonts/fa-regular-400.svg',
				'/fonts/fa-regular-400.ttf',
				'/fonts/fa-regular-400.woff',
				'/fonts/fa-regular-400.woff2',
				'/fonts/fa-solid-900.eot',
				'/fonts/fa-solid-900.svg',
				'/fonts/fa-solid-900.ttf',
				'/fonts/fa-solid-900.woff',
				'/fonts/fa-solid-900.woff2',

				'/img/logo/any.svg',
				'/img/sample-sites/wikipedia.svg',
				'/img/sample-sites/yahoo-news.png',
				'/img/stores/chrome.svg',
				'/img/stores/firefox.svg',

				'/js/app.build.js',
				'/js/browser.build.js',
			].map(function (url) {
				const cacheUpdateHeaders = new Headers();
				cacheUpdateHeaders.append('pragma', 'no-cache');
				cacheUpdateHeaders.append('cache-control', 'no-cache');

				return fetch(url, {
					method: 'GET',
					headers: cacheUpdateHeaders,
				}).then(function(response) {
					return cache.put(url, response);
				});
			}));
		})
	);
});

self.addEventListener('fetch', function(event) {
	event.respondWith(
		caches.open('pwa-www-cache').match(event.request).then(function(response) {
			if (response) {
				return response;
			} else {
				return fetch(event.request);
			}
		})
	);
});

self.addEventListener('activate', function(event) {
	event.waitUntil(caches.delete('pwa-www-cache'));
});
