import Vue from 'vue';
import PageNotFound from 'WebApp/Pages/PageNotFound.vue';

type Route = {
	url: string,
	component: Vue.VueConstructor,
	title: string,
};

export default class Router {
	public url: string;
	public component: Vue.VueConstructor;

	private routes: { [key: string]: Route } = {};
	private baseUrl: string;

	constructor(routes: Route[]) {
		this.baseUrl = (<HTMLBaseElement><any>document.querySelector('base[href]')).href;
		routes.forEach((route) => {
			const normalizedUrl = this.normalizeUrl(route.url);
			this.routes[normalizedUrl] = route;
		});

		const currentUrl = this.normalizeUrl(window.location.href);
		document.title = this.getTitle(currentUrl);
		this.url = currentUrl;
		this.component = this.getComponent(currentUrl);
	}

	normalizeUrl(url: string): string {
		let absoluteUrl = url;
		if (absoluteUrl.substring(0, 2) === './') {
			absoluteUrl = this.baseUrl + absoluteUrl.substring(2);
		} else if (absoluteUrl.substring(0, 4) !== 'http') {
			absoluteUrl = this.baseUrl + absoluteUrl;
		}

		if (absoluteUrl.substring(absoluteUrl.length - 1) === '/') {
			// Removing trailing slash if necessary
			return absoluteUrl.substring(0, absoluteUrl.length - 1);
		} else {
			return absoluteUrl;
		}
	};

	getComponent(url: string): Vue.VueConstructor {
		if (this.routes[url]) {
			return this.routes[url].component;
		} else {
			return PageNotFound;
		}
	};

	getTitle (url: string): string {
		if (this.routes[url]) {
			return 'Kanjimi - ' + this.routes[url].title;
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
		Vue.set(this, 'component', this.getComponent(url));
		document.title = title;
		window.history.pushState(null, title, url);
	}
}
