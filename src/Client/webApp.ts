import Vue from 'vue';
import Layout from 'Client/WebApp/Layout.vue';
import PageNotFound from 'Client/WebApp/PageNotFound.vue';

import Login from 'Client/WebApp/Login.vue';
import Home from 'Client/WebApp/Home.vue';

window.addEventListener('load', function () {
	const baseUrl = (<HTMLBaseElement><any>document.querySelector('base[href]')).href;
	const urls: { [key: string]: { component: Vue.VueConstructor, title: string } } = {
		[baseUrl + 'app/login']: { component: Login, title: 'Login' },
		[baseUrl + 'app']: { component: Home, title: 'Home' },
	};

	const normalizeUrl = (url: string): string => {
		let absoluteUrl = url;
		if (absoluteUrl.substring(0, 2) === './') {
			absoluteUrl = baseUrl + absoluteUrl.substring(2);
		} else if (absoluteUrl.substring(0, 4) !== 'http') {
			absoluteUrl = baseUrl + absoluteUrl;
		}

		if (absoluteUrl.substring(absoluteUrl.length - 1) === '/') {
			// Removing trailing slash if necessary
			return absoluteUrl.substring(0, absoluteUrl.length - 1);
		} else {
			return absoluteUrl;
		}
	};

	const getComponent = (url: string): Vue.VueConstructor => {
		if (urls[url]) {
			return urls[url].component;
		} else {
			return PageNotFound;
		}
	};
	const getTitle = (url: string): string => {
		if (urls[url]) {
			return 'Kanjimi - ' + urls[url].title;
		} else {
			return 'Kanjimi';
		}
	};

	document.title = getTitle(window.location.href);
	const currentUrl = normalizeUrl(window.location.href);

	const store = {
		url: currentUrl,
		component: getComponent(currentUrl),
		changeRoute: (object: string|Event) => {
			let url: string;
			if (object instanceof Event) {
				object.preventDefault();
				url = (<HTMLAnchorElement>object.target).href;
			} else {
				url = object;
			}

			url = normalizeUrl(url);

			const title = getTitle(url);

			store.url = url;
			store.component = getComponent(url);
			document.title = title;
			window.history.pushState(null, title, url);
		},
		apiKey: <string|null>localStorage.getItem('key'),
		setApiKey (key: string) {
			localStorage.setItem('key', key);
			store.apiKey = key;
			window.dispatchEvent(new CustomEvent('kanjimi-set-api-key', { detail: key }));
		}
	};

	new Vue({
		el: '#app',
		render: createElement => createElement(Layout),
		data: store,
	});
});
