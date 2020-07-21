import PageHandler from 'Common/PageHandler';
import Store from 'Common/Store';

const storage = {
	get: async (keys: string[]): Promise<{ [key: string]: any }> => {
		return {
			// TODO
		};
	},
	set: async (data: { [key: string]: any }): Promise<void> => {
		// TODO
	},
};

const store = new Store(storage);
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
pageHandler.bindPageEvents();
