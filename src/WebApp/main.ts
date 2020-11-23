import Vue from 'vue';
import Layout from 'WebApp/Layout.vue';
import Store from 'WebApp/Store';
import Router from 'WebApp/Router';

import SignUp from 'WebApp/Pages/Authentication/SignUp.vue';
import VerifyEmail from 'WebApp/Pages/Authentication/VerifyEmail.vue';
import Login from 'WebApp/Pages/Authentication/Login.vue';
import RequestResetPassword from 'WebApp/Pages/Authentication/RequestResetPassword.vue';
import ResetPassword from 'WebApp/Pages/Authentication/ResetPassword.vue';
import ChangePassword from 'WebApp/Pages/Authentication/ChangePassword.vue';
import Logout from 'WebApp/Pages/Authentication/Logout.vue';
import Settings from 'WebApp/Pages/Settings.vue';
import About from 'WebApp/Pages/About.vue';
import Changelog from 'WebApp/Pages/Changelog.vue';
import Analyze from 'WebApp/Pages/Analyze.vue';
import Browse from 'WebApp/Pages/Browse.vue';

window.addEventListener('load', async function () {
	if (navigator.serviceWorker) {
		try {
			await navigator.serviceWorker.register('/app/service-worker.js');
		} catch (error) {
			console.error('Service worker registration error', error);
		}
	}

	const router = new Router([
		{ url: 'app/about', component: About, title: 'About Kanjimi - Contact' },
		{ url: 'app/changelog', component: Changelog, title: 'About Kanjimi - Changelog' },
		{ url: 'app/sign-up', component: SignUp, title: 'Sign Up' },
		{ url: 'app/verify-email', component: VerifyEmail, title: 'Email Verification' },
		{ url: 'app/login', component: Login, title: 'Login' },
		{ url: 'app/request-reset-password', component: RequestResetPassword, title: 'Password reset' },
		{ url: 'app/reset-password', component: ResetPassword, title: 'Password reset' },
		{ url: 'app/change-password', component: ChangePassword, title: 'Change my password' },
		{ url: 'app/logout', component: Logout, title: 'Logout' },
		{ url: 'app/settings', component: Settings, title: 'Settings' },
		{ url: 'app/analyze', component: Analyze, title: 'Analyze' },
		{ url: 'app', component: Browse, title: 'Browse' },
	]);
	window.addEventListener('popstate', function () {
		router.setRouteWithoutPushState(window.location.href);
	});

	const store = new Store(router);
	await store.loadApiKeyFromStorage();

	new Vue({
		el: '#app',
		render: createElement => createElement(Layout),
		data: store,
	});
});
