export default {
	get: async (keys: string[]): Promise<{ [key: string]: string|null }> => {
		const result: any = {};
		keys.forEach((key) => {
			result[key] = localStorage.getItem(key) || null;
		});
		return result;
	},
	set: async (data: { [key: string]: string|null }): Promise<void> => {
		Object.keys(data).forEach((key) => {
			if (data[key] === null) {
				localStorage.removeItem(key);
			} else {
				localStorage.setItem(key, <string>data[key]);
			}
		});
	},
};
