import Vue from 'vue';
import Layout from 'Client/WebApp/Components/Layout.vue';
import Store from 'Client/WebApp/Store';

window.addEventListener('load', function () {
	const store = new Store();

	new Vue({
		el: '#app',
		render: createElement => createElement(Layout),
		data: store,
	});
});
