import PageHandler from 'Extension/PageHandler';
import Store from 'Extension/Store';
import { debounce } from 'ts-debounce';

(async () => {
	const store = new Store();
	await store.loadApiKeyFromStorage();
	store.notifyIfLoggedOut();

	const pageHandler = new PageHandler(store);
	pageHandler.injectUIContainer();
	pageHandler.injectLoaderCss();
	pageHandler.convertSentences();

	// Changing the key whenever it changes on the kanjimi website
	window.addEventListener('kanjimi-set-api-key', async (event: Event) => {
		const origin = (<Window>event.target).location.href;
		const expectedOrigin = process.env.KANJIMI_WWW_URL + '/';
		if (origin.substring(0, expectedOrigin.length) === expectedOrigin) {
			await store.setApiKey((<CustomEvent>event).detail);
		}
	}, false);

	// Handling the login from a different tab
	browser.storage.onChanged.addListener(async () => {
		await store.loadApiKeyFromStorage.bind(this);
		pageHandler.convertSentences();
	});

	window.addEventListener('scroll', debounce(() => {
		pageHandler.convertSentences();
	}, 300));
})();
