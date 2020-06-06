import PageHandler from 'Extension/PageHandler';
import Store from 'Extension/Store';
import { debounce } from 'ts-debounce';

if (
	// Only executing it for the main window. We do not want it
	// to be executed for any iframe containing ads or trackers
	window.parent === window

	// Checking if the parent frame is the Cypress interface
	|| window.parent.location.href.startsWith(
		<string>process.env.KANJIMI_API_URL
	)
) {
	const store = new Store();
	const pageHandler = new PageHandler(store);

	(async () => {
		try {
			await store.loadApiKeyFromStorage();
			store.notifyIfLoggedOut();
			if (store.apiKey !== null) {
				await pageHandler.convertSentences();
			}
		} catch (error) {
			console.error(error);
		}
	})();

	pageHandler.injectUIContainer();
	pageHandler.injectLoaderCss();

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
		try {
			await store.loadApiKeyFromStorage.bind(this);
			await pageHandler.convertSentences();
		} catch (error) {
			console.error(error);
		}
	});

	const convertSentencesAsynchronously = async () => {
		try {
			await pageHandler.convertSentences();
		} catch (error) {
			console.error(error);
		}
	};
	window.addEventListener('load', convertSentencesAsynchronously);
	window.addEventListener('scroll', debounce(convertSentencesAsynchronously, 300));
}
