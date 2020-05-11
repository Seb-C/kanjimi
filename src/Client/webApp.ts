import Vue from 'vue';
import Layout from 'Client/WebApp/Components/Layout.vue';
import Store from 'Client/WebApp/Store';
import Router from 'Client/WebApp/Router';

import Login from 'Client/WebApp/Components/Login.vue';
import Home from 'Client/WebApp/Components/Home.vue';

window.addEventListener('load', function () {
	const router = new Router([
		{ url: 'app/login', component: Login, title: 'Login' },
		{ url: 'app', component: Home, title: 'Home' },
	]);
	const store = new Store(router);
	store.loadApiKeyFromStorage();

	new Vue({
		el: '#app',
		render: createElement => createElement(Layout),
		data: store,
	});
});
