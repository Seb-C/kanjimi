export default {
	get: async (keys: string[]): Promise<{ [key: string]: string|null }> => {
		return browser.storage.local.get(keys);
	},
	set: async (data: { [key: string]: string|null }): Promise<void> => {
		return browser.storage.local.set(data);
	},
};
