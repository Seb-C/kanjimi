import 'jasmine';
import { create, get } from 'Common/Client/Routes/ApiKey';
import ApiKey from 'Common/Models/ApiKey';
import User from 'Common/Models/User';
import fetch from 'node-fetch';
import ValidationError from 'Common/Client/Errors/Validation';
import AuthenticationError from 'Common/Client/Errors/Authentication';
import Database from 'Server/Database/Database';
import UserRepository from 'Server/Repository/User';
import ApiKeyRepository from 'Server/Repository/ApiKey';
import Language from 'Common/Types/Language';

let user: User;

describe('Client ApiKey', () => {
	beforeEach(async () => {
		(<any>global).fetch = fetch;

		// Clearing previous run if necessary
		const db = new Database();
		const userRepository = new UserRepository(db);
		await userRepository.deleteByEmail('unittest@example.com');
		user = await userRepository.create({
			email: 'unittest@example.com',
			password: '123456',
			languages: [Language.FRENCH],
			romanReading: false,
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
