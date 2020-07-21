import PageHandler from 'Common/PageHandler';
import Store from 'Common/Store';

// Fix for chrome and blink browsers
if (typeof browser === 'undefined') {
	// @ts-ignore
	window.browser = require('webextension-polyfill');
}

const storage = {
	get: async (keys: string[]): Promise<{ [key: string]: any }> => {
		return browser.storage.local.get(keys);
	},
	set: async (data: { [key: string]: any }): Promise<void> => {
		return browser.storage.local.set(data);
	},
};

const store = new Store(storage);

const isWebsite = window.location.href.startsWith(
	<string>process.env.KANJIMI_WWW_URL + '/',
);
const isTestPage = window.location.href.startsWith(
	<string>process.env.KANJIMI_WWW_URL + '/test-pages/',
);
const isCypressInterface = window.parent.location.href.startsWith(
	(new URL(<string>process.env.KANJIMI_WWW_URL)).origin,
);
const isMainWindow = window.parent === window;

if (isWebsite) {
	window.addEventListener('kanjimi-set-api-key', async (event: Event) => {
		await store.setApiKey((<CustomEvent>event).detail);
	}, false);

	// Synchronizing the keys
	(async () => {
		try {
			const extensionKey = await store.getApiKeyFromStorage();
			const siteKey = localStorage.getItem('key');
			if (siteKey !== extensionKey) {
				store.setApiKey(siteKey);
			}
		} catch (error) {
			console.error(error);
		}
	})();

	// Declaring that the extension is installed
	document.body.setAttribute('data-extension-installed', 'true');
}

if ((isMainWindow || isCypressInterface) && (!isWebsite || isTestPage)) {
	const pageHandler = new PageHandler(store);

	(async () => {
		try {
			await store.loadApiKeyFromStorage(false);
			store.notifyIfLoggedOut();
			if (store.apiKey !== null && document.visibilityState === 'visible') {
				await pageHandler.convertSentences();
			}
		} catch (error) {
			console.error(error);
		}
	})();

	pageHandler.injectUIContainer();
	pageHandler.injectLoaderCss();

	// Handling the login from a different tab
	browser.storage.onChanged.addListener(async (changes: any) => {
		if (changes.key) {
			try {
				await store.loadApiKeyFromStorage(true);
				await pageHandler.convertSentences();
			} catch (error) {
				console.error(error);
			}
		}
	});

	pageHandler.bindPageEvents();
}
