import PageHandler from 'Extension/PageHandler';
import Store from 'Extension/Store';
import { debounce } from 'ts-debounce';

const store = new Store();

if (window.location.href.startsWith(<string>process.env.KANJIMI_WWW_URL + '/app')) {
	// Webapp: the extension should not analyze the page, but react to the login
	window.addEventListener('kanjimi-set-api-key', async (event: Event) => {
		await store.setApiKey((<CustomEvent>event).detail);
	}, false);
} else if (
	// Only executing it for the main window. We do not want it
	// to be executed for any iframe containing ads or trackers
	window.parent === window

	// Checking if the parent frame is the Cypress interface
	|| window.parent.location.href.startsWith(
		(new URL(<string>process.env.KANJIMI_WWW_URL)).origin
	)
) {
	// Fix for chrome
	if (typeof browser === 'undefined') {
		// @ts-ignore
		window.browser = require('webextension-polyfill');
	}

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

	// Handling the login from a different tab
	browser.storage.onChanged.addListener(async () => {
		try {
			await store.loadApiKeyFromStorage();
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

	// Scrolling the body
	window.addEventListener('scroll', debounce(convertSentencesAsynchronously, 300));

	// Scrolling any other element (and use capture, necessary for many web apps)
	document.body.addEventListener('scroll', debounce(convertSentencesAsynchronously, 300), true);
}
