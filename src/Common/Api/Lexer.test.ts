import 'jasmine';
import { analyze, getKanji } from 'Common/Api/Lexer';
import Token from 'Common/Models/Token';
import ValidationError from 'Common/Api/Errors/Validation';
import AuthenticationError from 'Common/Api/Errors/Authentication';
import NotFoundError from 'Common/Api/Errors/NotFound';
import User from 'Common/Models/User';
import ApiKey from 'Common/Models/ApiKey';
import UserRepository from 'Server/Repositories/User';
import ApiKeyRepository from 'Server/Repositories/ApiKey';
import Language from 'Common/Types/Language';

let user: User;
let apiKey: ApiKey;

describe('Client Lexer', async function() {
	beforeEach(async function() {
		const userRepository = new UserRepository(this.db);
		const apiKeyRepository = new ApiKeyRepository(this.db);
		user = await userRepository.create({ ...this.testUser });
		apiKey = await apiKeyRepository.createFromUser(user);
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
		await expectAsync(
			analyze(apiKey.key, {
				languages: [],
				strings: [],
			})
		).toBeRejectedWithError(ValidationError);
	});

	it('analyze (authentication error case)', async function() {
		await expectAsync(
			analyze('wrongtoken', {
				languages: [Language.FRENCH],
				strings: ['first sentence', 'second sentence'],
			})
		).toBeRejectedWithError(AuthenticationError);
	});

	it('getKanji (normal case)', async function() {
		const kanjis = await getKanji(apiKey.key, '恐');

		expect(Object.keys(kanjis)).toContain('恐');
		expect(Object.keys(kanjis)).toContain('心');
		expect(Object.keys(kanjis)).toContain('工');
		expect(Object.keys(kanjis)).toContain('凡');
	});

	it('getKanji (wrong authentication case)', async function() {
		await expectAsync(
			getKanji('wrongtoken', 'A')
		).toBeRejectedWithError(AuthenticationError);
	});

	it('getKanji (not a kanji error case)', async function() {
		await expectAsync(
			getKanji(apiKey.key, 'A')
		).toBeRejectedWithError(ValidationError);
	});

	it('getKanji (more than one character error case)', async function() {
		await expectAsync(
			getKanji(apiKey.key, '食食')
		).toBeRejectedWithError(ValidationError);
	});

	it('getKanji (unknown Kanji error case)', async function() {
		await expectAsync(
			getKanji(apiKey.key, '龯')
		).toBeRejectedWithError(NotFoundError);
	});
});
