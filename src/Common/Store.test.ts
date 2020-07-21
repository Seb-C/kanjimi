import 'jasmine';
import Store from 'Common/Store';

const storage = {
	data: <{ [key: string]: any }>{},
	async get(keys: string[]): Promise<{ [key: string]: any }> {
		return this.data;
	},
	async set(data: { [key: string]: string|null|number }): Promise<void> {
		this.data = {
			...this.data,
			...data,
		};
	},
}

describe('Store', async function() {
	it('getSessionId (empty storage case)', async function() {
		storage.data = {};
		const store = new Store(<Window><any>null, storage);
		const sessionId = await store.getSessionId();

		expect(sessionId).not.toEqual('');
		expect(storage.data.sessionId).toEqual(sessionId);
	});

	it('getSessionId (expired key case)', async function() {
		storage.data = {
			sessionId: 'test session id',
			sessionIdExpiresAt: (new Date()).getTime() - 1,
		};
		const store = new Store(<Window><any>null, storage);
		const sessionId = await store.getSessionId();

		expect(sessionId).not.toEqual('');
		expect(sessionId).not.toEqual('test session id');
		expect(storage.data.sessionId).toEqual(sessionId);
		expect(storage.data.sessionIdExpiresAt > (new Date()).getTime()).toBe(true);
	});

	it('getSessionId (still valid key case)', async function() {
		const originalExpiresAt = (new Date()).getTime() + 1000;
		storage.data = {
			sessionId: 'test session id',
			sessionIdExpiresAt: originalExpiresAt,
		};
		const store = new Store(<Window><any>null, storage);
		const sessionId = await store.getSessionId();

		expect(sessionId).toEqual('test session id');
		expect(storage.data.sessionId).toEqual(sessionId);
		expect(storage.data.sessionIdExpiresAt > originalExpiresAt).toBe(true);
	});
});
