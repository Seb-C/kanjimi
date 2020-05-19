import User from 'Common/Models/User';
import ApiKey from 'Common/Models/ApiKey';
import { get as getApiKey } from 'Common/Client/Routes/ApiKey';
import { get as getUser } from 'Common/Client/Routes/User';
import Router from 'WebApp/Router';

export default class Store {
	public router: Router;
	public apiKey: ApiKey|null = null;
	public user: User|null = null;

	constructor(router: Router) {
		this.router = router;
	}

	public loadApiKeyFromStorage = async () => {
		const key = localStorage.getItem('key');

		if (key === null) {
			this.apiKey = null;
			this.user = null;
		} else {
			const apiKey = await getApiKey(key);
			const user = await getUser(key, apiKey.userId);

			// Always setting the two at the same time, otherwise we may
			// have inconsistencies since both operations are asynchronous
			this.apiKey = apiKey;
			this.user = user;
		}
	}

	public setApiKey = async (apiKey: ApiKey|null) => {
		if (apiKey === null) {
			localStorage.removeItem('key');
			window.dispatchEvent(
				new CustomEvent('kanjimi-set-api-key', {
					detail: null,
				}),
			);

			this.apiKey = null;
			this.user = null;
		} else {
			localStorage.setItem('key', apiKey.key);
			window.dispatchEvent(
				new CustomEvent('kanjimi-set-api-key', {
					detail: apiKey.key,
				}),
			);

			const user = await getUser(apiKey.key, apiKey.userId);

			// Always setting the two at the same time, otherwise we may
			// have inconsistencies since both operations are asynchronous
			this.apiKey = apiKey;
			this.user = user;
		}
	}

	public setUser = (user: User) => {
		this.user = user;
	}
}
