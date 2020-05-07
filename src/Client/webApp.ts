import Vue from 'vue';
import Layout from 'Client/WebApp/Layout.vue';
import PageNotFound from 'Client/WebApp/PageNotFound.vue';

import Login from 'Client/WebApp/Login.vue';

window.addEventListener('load', function () {
	const baseUrl = (<HTMLBaseElement><any>document.querySelector('base[href]')).href;

	const routes: { [key: string]: Vue.VueConstructor } = {
		[baseUrl + 'app/login']: Login,
	};

	const getComponent = (url: string): Vue.VueConstructor => {
		if (routes[url]) {
			return routes[url];
		} else {
			return PageNotFound;
		}
	};

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

			store.url = url;
			store.component = getComponent(url);
			window.history.pushState(null, document.title, url);
		},
	};

	new Vue({
		el: '#app',
		render: createElement => createElement(Layout),
		data: store,
	});
});
