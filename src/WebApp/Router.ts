import Vue from 'vue';
import PageNotFound from 'WebApp/Pages/PageNotFound.vue';

type Route = {
	url: string,
	component: Vue.VueConstructor,
	title: string,
};

export default class Router {
	public url: string = '';
	public readonly params: { [url: string]: string } = {};
	public component: Vue.VueConstructor = PageNotFound;

	private routes: { [key: string]: Route } = {};
	private baseUrl: string;

	constructor(routes: Route[]) {
		this.baseUrl = (<HTMLBaseElement><any>document.querySelector('base[href]')).href;
		routes.forEach((route) => {
			const normalizedUrl = this.normalizeUrl(route.url).url;
			this.routes[normalizedUrl] = route;
		});

		this.setRouteWithoutPushState(window.location.href);
	}

	normalizeUrl(url: string): { url: string, params: URLSearchParams } {
		let absoluteUrl = url;
		if (absoluteUrl.substring(0, 2) === './') {
			absoluteUrl = this.baseUrl + absoluteUrl.substring(2);
		} else if (absoluteUrl.substring(0, 4) !== 'http') {
			absoluteUrl = this.baseUrl + absoluteUrl;
		}

		let search = '';
		if (absoluteUrl.includes('?')) {
			search = absoluteUrl.substring(absoluteUrl.indexOf('?') + 1);
			absoluteUrl = absoluteUrl.substring(0, absoluteUrl.indexOf('?'));
		}

		if (absoluteUrl.substring(absoluteUrl.length - 1) === '/') {
			// Removing trailing slash if necessary
			absoluteUrl = absoluteUrl.substring(0, absoluteUrl.length - 1);
		}

		return {
			url: absoluteUrl,
			params: new URLSearchParams(search),
		};
	};

	getComponent(url: string): Vue.VueConstructor {
		if (this.routes[url]) {
			return this.routes[url].component;
		} else {
			return PageNotFound;
		}
	};

	getDefaultTitle (url: string): string {
		if (this.routes[url]) {
			return 'Kanjimi - ' + this.routes[url].title;
		} else {
			return 'Kanjimi';
		}
	};

	setTitle (title: string) {
		document.title = title;
	};

	addTitleSuffix (suffix: string) {
		this.setTitle(this.getDefaultTitle(this.url) + ` (${suffix})`);
	};

	changeRoute(object: string|Event) {
		let url: string;
		if (object instanceof Event) {
			object.preventDefault();
			url = (<HTMLAnchorElement>object.target).href;
		} else {
			url = object;
		}

		this.setRouteWithoutPushState(url);
		window.history.pushState(null, document.title, url);
	}

	setRouteWithoutPushState(url: string) {
		const { url: currentUrl, params } = this.normalizeUrl(url);

		this.setTitle(this.getDefaultTitle(currentUrl));
		this.url = currentUrl;
		Vue.set(this, 'component', this.getComponent(currentUrl));

		Object.keys(this.params).forEach((key: string) => {
			Vue.delete(this.params, key);
		});
		params.forEach((value: string, key: string) => {
			Vue.set(this.params, key, value);
		});
	}
}
