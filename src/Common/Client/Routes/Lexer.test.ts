import 'jasmine';
import { analyze } from 'Common/Client/Routes/Lexer';
import Token from 'Common/Models/Token';
import fetch from 'node-fetch';
import ValidationError from 'Common/Client/Errors/Validation';
import AuthenticationError from 'Common/Client/Errors/Authentication';
import Database from 'Server/Database/Database';
import User from 'Common/Models/User';
import ApiKey from 'Common/Models/ApiKey';
import UserRepository from 'Server/Repository/User';
import ApiKeyRepository from 'Server/Repository/ApiKey';
import Language from 'Common/Types/Language';

let user: User;
let apiKey: ApiKey;

describe('Client Lexer', () => {
	beforeEach(async () => {
		(<any>global).fetch = fetch;

		// Clearing previous run if necessary
		const db = new Database();
		const userRepository = new UserRepository(db);
		const apiKeyRepository = new ApiKeyRepository(db);
		await userRepository.deleteByEmail('unittest@example.com');
		user = await userRepository.create({
			email: 'unittest@example.com',
			password: '123456',
			languages: [Language.FRENCH],
			romanReading: false,
		});
		apiKey = await apiKeyRepository.create(user);

		await db.close();
	});

	it('analyze (normal case)', async () => {
		const result = await analyze(apiKey.key, {
			languages: [Language.FRENCH],
			strings: ['first sentence', 'second sentence'],
		});

		expect(result).toBeInstanceOf(Array);
		expect(result.length).toBe(2);
		expect(result[0]).toBeInstanceOf(Array);
		expect(result[1]).toBeInstanceOf(Array);
		expect(result[0][0]).toBeInstanceOf(Token);
		expect(result[1][0]).toBeInstanceOf(Token);
		// No need to test further because it is already done in the models and API tests
	});

	it('analyze (validation error case)', async () => {
		let error;
		try {
			await analyze(apiKey.key, {
				languages: [],
				strings: [],
			});
		} catch (e) {
			error = e;
		}

		expect(error).toBeInstanceOf(ValidationError);
	});

	it('analyze (authentication error case)', async () => {
		let error;
		try {
			await analyze('wrongtoken', {
				languages: [Language.FRENCH],
				strings: ['first sentence', 'second sentence'],
			});
		} catch (e) {
			error = e;
		}

		expect(error).toBeInstanceOf(AuthenticationError);
	});
});
