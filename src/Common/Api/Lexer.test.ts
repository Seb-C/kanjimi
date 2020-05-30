import 'jasmine';
import { analyze } from 'Common/Api/Lexer';
import Token from 'Common/Models/Token';
import ValidationError from 'Common/Api/Errors/Validation';
import AuthenticationError from 'Common/Api/Errors/Authentication';
import User from 'Common/Models/User';
import ApiKey from 'Common/Models/ApiKey';
import UserRepository from 'Server/Repositories/User';
import ApiKeyRepository from 'Server/Repositories/ApiKey';
import Language from 'Common/Types/Language';

let user: User;
let apiKey: ApiKey;

describe('Client Lexer', async function() {
	beforeEach(async function() {
		const userRepository = new UserRepository(this.getDatabase());
		const apiKeyRepository = new ApiKeyRepository(this.getDatabase());
		user = await userRepository.create({ ...this.testUser });
		apiKey = await apiKeyRepository.create(user.id);
	});

	it('analyze (normal case)', async function() {
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

	it('analyze (validation error case)', async function() {
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

	it('analyze (authentication error case)', async function() {
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
