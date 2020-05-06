import Vue from 'vue';
import Root from 'Client/WebApp/Root.vue';

window.addEventListener('load', function () {
	const store = {};

	new Vue({
		el: '#app',
		render: createElement => createElement(Root),
		data: store,
	});
});
