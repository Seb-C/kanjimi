import Vue from 'vue';
import PageNotFound from 'Client/WebApp/Components/PageNotFound.vue';

import Login from 'Client/WebApp/Components/Login.vue';
import Home from 'Client/WebApp/Components/Home.vue';

export default class Store {
	public static readonly baseUrl: string = (<HTMLBaseElement><any>document.querySelector('base[href]')).href;

	public url: string;
	public component: Vue.VueConstructor;
	public apiKey: string|null;

	constructor() {
		document.title = this.getTitle(window.location.href);
		const currentUrl = this.normalizeUrl(window.location.href);

		this.url = currentUrl;
		this.component = this.getComponent(currentUrl);
		this.apiKey = localStorage.getItem('key');
	}

	urls: { [key: string]: { component: Vue.VueConstructor, title: string } } = {
		[Store.baseUrl + 'app/login']: { component: Login, title: 'Login' },
		[Store.baseUrl + 'app']: { component: Home, title: 'Home' },
	};

	normalizeUrl(url: string): string {
		let absoluteUrl = url;
		if (absoluteUrl.substring(0, 2) === './') {
			absoluteUrl = Store.baseUrl + absoluteUrl.substring(2);
		} else if (absoluteUrl.substring(0, 4) !== 'http') {
			absoluteUrl = Store.baseUrl + absoluteUrl;
		}

		if (absoluteUrl.substring(absoluteUrl.length - 1) === '/') {
			// Removing trailing slash if necessary
			return absoluteUrl.substring(0, absoluteUrl.length - 1);
		} else {
			return absoluteUrl;
		}
	};

	getComponent(url: string): Vue.VueConstructor {
		if (this.urls[url]) {
			return this.urls[url].component;
		} else {
			return PageNotFound;
		}
	};

	getTitle (url: string): string {
		if (this.urls[url]) {
			return 'Kanjimi - ' + this.urls[url].title;
		} else {
			return 'Kanjimi';
		}
	};

	changeRoute(object: string|Event) {
		let url: string;
		if (object instanceof Event) {
			object.preventDefault();
			url = (<HTMLAnchorElement>object.target).href;
		} else {
			url = object;
		}

		url = this.normalizeUrl(url);

		const title = this.getTitle(url);

		this.url = url;
		this.component = this.getComponent(url);
		document.title = title;
		window.history.pushState(null, title, url);
	}

	setApiKey (key: string) {
		localStorage.setItem('key', key);
		this.apiKey = key;
		window.dispatchEvent(new CustomEvent('kanjimi-set-api-key', { detail: key }));
	}
}
