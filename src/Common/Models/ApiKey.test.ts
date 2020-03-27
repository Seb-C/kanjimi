import 'jasmine';
import ApiKey from 'Common/Models/ApiKey';
import Language from 'Common/Types/Language';

describe('ApiKey', () => {
	it('API formatting methods', async () => {
		const now = new Date();
		const expires = ApiKey.createExpiryDate(now);
		const input = new ApiKey({
			id: 'uuid',
			key: 'key',
			userId: 'user uuid',
			createdAt: now,
			expiresAt: expires,
		});
		const output = ApiKey.fromApi(JSON.parse(JSON.stringify(input.toApi())));

		expect(output.id).toBe('uuid');
		expect(output.key).toBe('key');
		expect(output.userId).toBe('user uuid');
		expect(output.createdAt).toEqual(now);
		expect(output.expiresAt).toEqual(expires);
	});

	it('generateKey', async () => {
		expect(ApiKey.generateKey()).not.toEqual(ApiKey.generateKey());
		expect(ApiKey.generateKey().length > 32).toEqual(true);
	});

	it('generateKey', async () => {
		const createdAt = new Date();
		const expiresAt = ApiKey.createExpiryDate(createdAt);
		expect(expiresAt > createdAt).toEqual(true);
	});
});
