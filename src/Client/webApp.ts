import Vue from 'vue';
import Layout from 'Client/WebApp/Layout.vue';
import Login from 'Client/WebApp/Login.vue';

window.addEventListener('load', function () {
	const baseUrl = (<HTMLBaseElement><any>document.querySelector('base[href]')).href;

	const store = {
		route: window.location.href,
		routes: <{ [key: string]: Vue.VueConstructor }>{
			[baseUrl + 'app/login']: Login,
		},
		setRoute: (url: string) => {
			store.route = url;
			window.history.pushState(null, document.title, url);
		},
		setRouteEventHandler (event: Event) {
			event.preventDefault();
			store.setRoute((<HTMLAnchorElement>event.target).href);
		},
	};

	new Vue({
		el: '#app',
		render: createElement => createElement(Layout),
		data: store,
	});
});
