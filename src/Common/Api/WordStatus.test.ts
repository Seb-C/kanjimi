import 'jasmine';
import { search, createOrUpdate } from 'Common/Api/WordStatus';
import ValidationError from 'Common/Api/Errors/Validation';
import AuthenticationError from 'Common/Api/Errors/Authentication';
import User from 'Common/Models/User';
import ApiKey from 'Common/Models/ApiKey';
import WordStatus from 'Common/Models/WordStatus';
import UserRepository from 'Server/Repositories/User';
import ApiKeyRepository from 'Server/Repositories/ApiKey';
import WordStatusRepository from 'Server/Repositories/WordStatus';
import Dictionary from 'Server/Lexer/Dictionary';

let user: User;
let apiKey: ApiKey;
let wordStatus: WordStatus;

describe('Client WordStatus', async function() {
	beforeEach(async function() {
		const dictionary = new Dictionary();
		const userRepository = new UserRepository(this.db);
		const apiKeyRepository = new ApiKeyRepository(this.db);
		const wordStatusRepository = new WordStatusRepository(this.db, dictionary);
		user = await userRepository.create({ ...this.testUser });
		apiKey = await apiKeyRepository.createFromUser(user);
		wordStatus = await wordStatusRepository.create(user, '日本', true, false);
	});

	it('search (normal case)', async function() {
		const apiWordStatuses = await search(apiKey.key, ['日本']);

		expect(apiWordStatuses).toBeInstanceOf(Array);
		expect(apiWordStatuses.length).toBe(1);
		expect(apiWordStatuses[0]).toBeInstanceOf(WordStatus);
		expect(apiWordStatuses[0]).toEqual(wordStatus);
		// No need to test further because it is already done in the models and API tests
	});

	it('search (validation error case)', async function() {
		await expectAsync(search(apiKey.key, [])).toBeRejectedWithError(ValidationError);
	});

	it('search (authentication error case)', async function() {
		await expectAsync(search('wrongtoken', ['日本'])).toBeRejectedWithError(AuthenticationError);
	});

	it('createOrUpdate (normal case)', async function() {
		const newWordStatusData = new WordStatus({
			userId: user.id,
			word: '日本',
			showFurigana: true,
			showTranslation: true,
		});
		const apiWordStatus = await createOrUpdate(apiKey.key, newWordStatusData);

		expect(apiWordStatus).toBeInstanceOf(WordStatus);
		expect(apiWordStatus).toEqual(newWordStatusData);
	});

	it('createOrUpdate (validation error case)', async function() {
		await expectAsync(
			createOrUpdate(apiKey.key, new WordStatus({}))
		).toBeRejectedWithError(ValidationError);
	});

	it('createOrUpdate (authentication error case)', async function() {
		const newWordStatusData = new WordStatus({
			userId: user.id,
			word: '日本',
			showFurigana: true,
			showTranslation: true,
		});

		await expectAsync(
			createOrUpdate('wrongtoken', newWordStatusData)
		).toBeRejectedWithError(AuthenticationError);
	});

	it('createOrUpdate (authentication error because of wrong userId case)', async function() {
		const newWordStatusData = new WordStatus({
			userId: '00000000-0000-0000-0000-000000000000',
			word: '日本',
			showFurigana: true,
			showTranslation: true,
		});

		await expectAsync(
			createOrUpdate(apiKey.key, newWordStatusData)
		).toBeRejectedWithError(AuthenticationError);
	});
});
