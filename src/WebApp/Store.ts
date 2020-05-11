import Router from 'WebApp/Router';

export default class Store {
	public router: Router;
	public apiKey: string|null = null;

	constructor(router: Router) {
		this.router = router;
	}

	public loadApiKeyFromStorage = () => {
		this.apiKey = localStorage.getItem('key');
	}

	public setApiKey = (key: string) => {
		localStorage.setItem('key', key);
		this.apiKey = key;
		window.dispatchEvent(new CustomEvent('kanjimi-set-api-key', { detail: key }));
	}
}
