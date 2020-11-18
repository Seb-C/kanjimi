import 'jasmine';
import ExtensionStorage from 'Common/Storage/ExtensionStorage';

describe('ExtensionStorage', async function() {
	beforeEach(async function() {
		// @ts-ignore
		global.browser = {
			storage: {
				local: {
					data: <any>{},
					async get (keys: string[]): Promise<{ [key: string]: string|null }> {
						const result: any = {};
						keys.forEach((key) => {
							result[key] = this.data[key] || null;
						});
						return result;
					},
					async set (data: { [key: string]: string|null }): Promise<void> {
						Object.keys(data).forEach((key) => {
							if (data[key] === null) {
								if (this.data[key]) {
									delete this.data[key];
								}
							} else {
								this.data[key] = <string>data[key];
							}
						});
					},
				},
			},
		};
	});
	afterEach(async function() {
		// @ts-ignore
		delete global.browser;
	});
	it('get (normal case)', async function() {
		// @ts-ignore
		global.browser.storage.local.data = {
			test: '42',
		};

		expect(await ExtensionStorage.get(['test'])).toEqual({ test: '42' });
	});
	it('get (undefined case)', async function() {
		// @ts-ignore
		global.browser.storage.local.data = {};
		expect(await ExtensionStorage.get(['test'])).toEqual({ test: null });
	});
	it('get (multiple keys case)', async function() {
		// @ts-ignore
		global.browser.storage.local.data = { test: 'ok' };
		expect(await ExtensionStorage.get(['test', 'test2'])).toEqual({
			test: 'ok',
			test2: null,
		});
	});
	it('get (no keys case)', async function() {
		// @ts-ignore
		global.browser.storage.local.data = {};
		expect(await ExtensionStorage.get([])).toEqual({});
	});

	it('set (normal case)', async function() {
		// @ts-ignore
		global.browser.storage.local.data = {};
		await ExtensionStorage.set({ test: 'foo' });
		// @ts-ignore
		expect(global.browser.storage.local.data.test).toEqual('foo');
	});
	it('set (remove key case)', async function() {
		// @ts-ignore
		global.browser.storage.local.data = { test: '42' };
		await ExtensionStorage.set({ test: null });
		// @ts-ignore
		expect(global.browser.storage.local.data.test).toBeUndefined();
	});
	it('set (empty object case)', async function() {
		// @ts-ignore
		global.browser.storage.local.data = {};
		await ExtensionStorage.set({});
		// @ts-ignore
		expect(global.browser.storage.local.data).toEqual({});
	});
	it('set (empty object case)', async function() {
		// @ts-ignore
		global.browser.storage.local.data = { test: '42' };
		await ExtensionStorage.set({ test: null, test2: 'ok'});
		// @ts-ignore
		expect(global.browser.storage.local.data).toEqual({ test2: 'ok' });
	});
});
