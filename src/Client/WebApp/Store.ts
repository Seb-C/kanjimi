import Router from 'Client/WebApp/Router';

export default class Store {
	public router: Router;
	public apiKey: string|null = null;

	constructor (router: Router) {
		this.router = router;
	}

	loadApiKeyFromStorage() {
		this.apiKey = localStorage.getItem('key');
	}

	setApiKey (key: string) {
		localStorage.setItem('key', key);
		this.apiKey = key;
		window.dispatchEvent(new CustomEvent('kanjimi-set-api-key', { detail: key }));
	}
}
