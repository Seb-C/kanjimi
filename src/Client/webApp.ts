import Vue from 'vue';
import Layout from 'Client/WebApp/Layout.vue';
import PageNotFound from 'Client/WebApp/PageNotFound.vue';

import Login from 'Client/WebApp/Login.vue';

window.addEventListener('load', function () {
	const baseUrl = (<HTMLBaseElement><any>document.querySelector('base[href]')).href;
	const urls: { [key: string]: { component: Vue.VueConstructor, title: string } } = {
		[baseUrl + 'app/login']: { component: Login, title: 'Login' },
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

	const store = {
		url: window.location.href,
		component: getComponent(window.location.href),
		changeRoute: (object: string|Event) => {
			let url: string;
			if (object instanceof Event) {
				object.preventDefault();
				url = (<HTMLAnchorElement>object.target).href;
			} else {
				url = object;
			}

			const title = getTitle(url);

			store.url = url;
			store.component = getComponent(url);
			document.title = title;
			window.history.pushState(null, title, url);
		},
	};

	new Vue({
		el: '#app',
		render: createElement => createElement(Layout),
		data: store,
	});
});
