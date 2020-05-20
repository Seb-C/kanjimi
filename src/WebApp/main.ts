import Vue from 'vue';
import Layout from 'WebApp/Pages/Layout.vue';
import Store from 'WebApp/Store';
import Router from 'WebApp/Router';

import Login from 'WebApp/Pages/Login.vue';
import Logout from 'WebApp/Pages/Logout.vue';
import Settings from 'WebApp/Pages/Settings.vue';
import Home from 'WebApp/Pages/Home.vue';

window.addEventListener('load', async function () {
	const router = new Router([
		{ url: 'app/login', component: Login, title: 'Login' },
		{ url: 'app/logout', component: Logout, title: 'Logout' },
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
