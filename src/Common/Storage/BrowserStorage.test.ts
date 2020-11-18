import 'jasmine';
import BrowserStorage from 'Common/Storage/BrowserStorage';

describe('BrowserStorage', async function() {
	beforeEach(async function() {
		// @ts-ignore
		global.window = {
			localStorage: {
				data: <any>{},
				getItem (key: string): any {
					return this.data[key] || null;
				},
				setItem (key: string, value: any) {
					this.data[key] = value;
				},
				removeItem (key: string) {
					delete this.data[key];
				},
			},
		};
	});
	afterEach(async function() {
		// @ts-ignore
		delete global.window;
	});
	it('get (normal case)', async function() {
		// @ts-ignore
		global.window.localStorage.data = {
			test: '42',
		};

		expect(await BrowserStorage.get(['test'])).toEqual({ test: '42' });
	});
	it('get (undefined case)', async function() {
		// @ts-ignore
		global.window.localStorage.data = {};
		expect(await BrowserStorage.get(['test'])).toEqual({ test: null });
	});
	it('get (multiple keys case)', async function() {
		// @ts-ignore
		global.window.localStorage.data = { test: 'ok' };
		expect(await BrowserStorage.get(['test', 'test2'])).toEqual({
			test: 'ok',
			test2: null,
		});
	});
	it('get (no keys case)', async function() {
		// @ts-ignore
		global.window.localStorage.data = {};
		expect(await BrowserStorage.get([])).toEqual({});
	});

	it('set (normal case)', async function() {
		// @ts-ignore
		global.window.localStorage.data = {};
		await BrowserStorage.set({ test: 'foo' });
		// @ts-ignore
		expect(global.window.localStorage.data.test).toEqual('foo');
	});
	it('set (remove key case)', async function() {
		// @ts-ignore
		global.window.localStorage.data = { test: '42' };
		await BrowserStorage.set({ test: null });
		// @ts-ignore
		expect(global.window.localStorage.data.test).toBeUndefined();
	});
	it('set (empty object case)', async function() {
		// @ts-ignore
		global.window.localStorage.data = {};
		await BrowserStorage.set({});
		// @ts-ignore
		expect(global.window.localStorage.data).toEqual({});
	});
	it('set (empty object case)', async function() {
		// @ts-ignore
		global.window.localStorage.data = { test: '42' };
		await BrowserStorage.set({ test: null, test2: 'ok'});
		// @ts-ignore
		expect(global.window.localStorage.data).toEqual({ test2: 'ok' });
	});
});
