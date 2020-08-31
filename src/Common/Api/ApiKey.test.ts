import 'jasmine';
import { create, get } from 'Common/Api/ApiKey';
import ApiKey from 'Common/Models/ApiKey';
import User from 'Common/Models/User';
import ValidationError from 'Common/Api/Errors/Validation';
import AuthenticationError from 'Common/Api/Errors/Authentication';
import UserRepository from 'Server/Repositories/User';
import ApiKeyRepository from 'Server/Repositories/ApiKey';

let user: User;

describe('Client ApiKey', async function() {
	beforeEach(async function() {
		const userRepository = new UserRepository(this.db);
		user = await userRepository.create({
			...this.testUser,
			emailVerified: true,
		});
	});

	it('create (normal case)', async function() {
		const result = await create({
			email: 'unittest@example.com',
			password: '123456',
		});

		expect(result).toBeInstanceOf(ApiKey);
		// No need to test further this response because it is already done in the models and API tests
	});

	it('create (validation error case)', async function() {
		let error;
		try {
			await create({
				email: 'not an email',
				password: '123456',
			});
		} catch (e) {
			error = e;
		}

		expect(error).toBeInstanceOf(ValidationError);
	});

	it('create (invalid credentials case)', async function() {
		let error;
		try {
			await create({
				email: 'invalidemail@example.com',
				password: '123456',
			});
		} catch (e) {
			error = e;
		}

		expect(error).toBeInstanceOf(AuthenticationError);
	});

	it('get (normal case)', async function() {
		const apiKeyRepository = new ApiKeyRepository(this.db);
		const apiKey = await apiKeyRepository.createFromUser(user);

		const resultApiKey = await get(apiKey.key);

		expect(resultApiKey).toEqual(apiKey);
	});

	it('get (invalid token case)', async function() {
		let error;
		try {
			await get('invalidtoken');
		} catch (e) {
			error = e;
		}

		expect(error).toBeInstanceOf(AuthenticationError);
	});
});
