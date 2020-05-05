import 'jasmine';
import ApiKey from 'Common/Models/ApiKey';

describe('ApiKey', () => {
	it('API formatting methods', async () => {
		const now = new Date();
		const expires = new Date();
		expires.setDate(expires.getDate() + 1);
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
});
