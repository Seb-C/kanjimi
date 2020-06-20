import 'jasmine';
import Store from 'Extension/Store';

let storage: { [key: string]: number|string };

describe('Store', async function() {
	beforeEach(async function() {
		const win = <any>global;
		if (!win.browser) {
			win.browser = {};
		}
		if (!win.browser.storage) {
			win.browser.storage = {};
		}
		if (!win.browser.storage.local) {
			win.browser.storage.local = {
				get: async (keys: any) => {
					return storage;
				},
				set: async (newValues: any) => {
					storage = {
						...storage,
						...newValues,
					};
				},
			};
		}
	});

	it('getSessionId (empty storage case)', async function() {
		storage = {};
		const store = new Store();
		const sessionId = await store.getSessionId();

		expect(sessionId).not.toEqual('');
		expect(storage.sessionId).toEqual(sessionId);
	});

	it('getSessionId (expired key case)', async function() {
		storage = {
			sessionId: 'test session id',
			sessionIdExpiresAt: (new Date()).getTime() - 1,
		};
		const store = new Store();
		const sessionId = await store.getSessionId();

		expect(sessionId).not.toEqual('');
		expect(sessionId).not.toEqual('test session id');
		expect(storage.sessionId).toEqual(sessionId);
		expect(storage.sessionIdExpiresAt > (new Date()).getTime()).toBe(true);
	});

	it('getSessionId (still valid key case)', async function() {
		const originalExpiresAt = (new Date()).getTime() + 1000;
		storage = {
			sessionId: 'test session id',
			sessionIdExpiresAt: originalExpiresAt,
		};
		const store = new Store();
		const sessionId = await store.getSessionId();

		expect(sessionId).toEqual('test session id');
		expect(storage.sessionId).toEqual(sessionId);
		expect(storage.sessionIdExpiresAt > originalExpiresAt).toBe(true);
	});
});
