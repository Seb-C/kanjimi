import Vue from 'vue';
import Layout from 'WebApp/Components/Layout.vue';
import Store from 'WebApp/Store';
import Router from 'WebApp/Router';

import Login from 'WebApp/Components/Login.vue';
import Settings from 'WebApp/Components/Settings.vue';
import Home from 'WebApp/Components/Home.vue';

window.addEventListener('load', async function () {
	const router = new Router([
		{ url: 'app/login', component: Login, title: 'Login' },
		{ url: 'app/settings', component: Settings, title: 'Settings' },
		{ url: 'app', component: Home, title: 'Home' },
	]);
	const store = new Store(router);
	await store.loadApiKeyFromStorage();

	new Vue({
		el: '#app',
		render: createElement => createElement(Layout),
		data: store,
	});
});
