import 'jasmine';
import { get } from 'Common/Api/Page';
import ValidationError from 'Common/Api/Errors/Validation';
import AuthenticationError from 'Common/Api/Errors/Authentication';
import ServerError from 'Common/Api/Errors/Server';
import User from 'Common/Models/User';
import ApiKey from 'Common/Models/ApiKey';
import UserRepository from 'Server/Repositories/User';
import ApiKeyRepository from 'Server/Repositories/ApiKey';

let user: User;
let apiKey: ApiKey;

describe('Client Page', async function() {
	beforeEach(async function() {
		const userRepository = new UserRepository(this.db);
		const apiKeyRepository = new ApiKeyRepository(this.db);
		user = await userRepository.create({ ...this.testUser });
		apiKey = await apiKeyRepository.createFromUser(user);
	});

	it('get (normal case)', async function() {
		const result = await get(apiKey.key, 'https://nginx/test-pages/landing-page-examples.html');

		expect(result).toBeInstanceOf(Object);
		expect(typeof result.content).toBe('string');
		expect(result.content).toContain('<html');
		expect(result.content).toContain('</html>');
		expect(result.charset).not.toBeUndefined();
		expect(result.realUrl).toBe('https://nginx/test-pages/landing-page-examples.html');
	});

	it('get (redirection case)', async function() {
		const result = await get(apiKey.key, 'https://nginx/test-pages/redirect-to-landing-page-examples');

		expect(result).toBeInstanceOf(Object);
		expect(result.content).toContain('</html>');
		expect(result.realUrl).toBe('https://nginx/test-pages/landing-page-examples.html');
	});

	it('get (error page called case)', async function() {
		await get(apiKey.key, 'https://nginx/wrong-url');
		// Should not throw an exception -> the code returned should be 200 anyway
	});

	// Commented because it is difficult ot do this hack now that nginx handles the static files itself
	// it('get (explicit charset case)', async function() {
	// 	const result = await get(apiKey.key, 'https://nginx/test-pages/');

	// 	expect(result).toBeInstanceOf(Object);
	// 	expect(result.charset).toBe('ascii');
	// });

	it('get (validation error case)', async function() {
		await expectAsync(get(apiKey.key, 'not an url')).toBeRejectedWithError(ValidationError);
	});

	it('get (authentication error case)', async function() {
		await expectAsync(
			get('wrongkey', 'https://nginx/')
		).toBeRejectedWithError(AuthenticationError);
	});

	it('get (connection error case)', async function() {
		await expectAsync(
			get(apiKey.key, 'https://not.a.valid.domain/')
		).toBeRejectedWithError(ServerError);
	});
});
