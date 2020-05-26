import 'jasmine';
import { create, get } from 'Common/Api/ApiKey';
import ApiKey from 'Common/Models/ApiKey';
import User from 'Common/Models/User';
import ValidationError from 'Common/Api/Errors/Validation';
import AuthenticationError from 'Common/Api/Errors/Authentication';
import Database from 'Server/Database/Database';
import UserRepository from 'Server/Repositories/User';
import ApiKeyRepository from 'Server/Repositories/ApiKey';
import Language from 'Common/Types/Language';

let user: User;

describe('Client ApiKey', () => {
	beforeEach(async () => {
		const db = new Database();
		const userRepository = new UserRepository(db);
		user = await userRepository.create({
			email: 'unittest@example.com',
			emailVerified: false,
			emailVerificationKey: null,
			password: '123456',
			languages: [Language.FRENCH],
			romanReading: false,
			jlpt: null,
		});
		await db.close();
	});

	it('create (normal case)', async () => {
		const result = await create({
			email: 'unittest@example.com',
			password: '123456',
		});

		expect(result).toBeInstanceOf(ApiKey);
		// No need to test further this response because it is already done in the models and API tests
	});

	it('create (validation error case)', async () => {
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

	it('create (invalid credentials case)', async () => {
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

	it('get (normal case)', async () => {
		const db = new Database();
		const apiKeyRepository = new ApiKeyRepository(db);
		const apiKey = await apiKeyRepository.create(user);
		await db.close();

		const resultApiKey = await get(apiKey.key);

		expect(resultApiKey).toEqual(apiKey);
	});

	it('get (invalid token case)', async () => {
		let error;
		try {
			await get('invalidtoken');
		} catch (e) {
			error = e;
		}

		expect(error).toBeInstanceOf(AuthenticationError);
	});
});
