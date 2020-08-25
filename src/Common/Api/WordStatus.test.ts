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
		const userRepository = new UserRepository(await this.getDatabase());
		const apiKeyRepository = new ApiKeyRepository(await this.getDatabase());
		const wordStatusRepository = new WordStatusRepository(await this.getDatabase(), dictionary);
		user = await userRepository.create({ ...this.testUser });
		apiKey = await apiKeyRepository.create(user.id);
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
		let error;
		try {
			await search(apiKey.key, []);
		} catch (e) {
			error = e;
		}

		expect(error).toBeInstanceOf(ValidationError);
	});

	it('search (authentication error case)', async function() {
		let error;
		try {
			await search('wrongtoken', ['日本']);
		} catch (e) {
			error = e;
		}

		expect(error).toBeInstanceOf(AuthenticationError);
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
		let error;
		try {
			await createOrUpdate(apiKey.key, new WordStatus({}));
		} catch (e) {
			error = e;
		}

		expect(error).toBeInstanceOf(ValidationError);
	});

	it('createOrUpdate (authentication error case)', async function() {
		let error;
		try {
			const newWordStatusData = new WordStatus({
				userId: user.id,
				word: '日本',
				showFurigana: true,
				showTranslation: true,
			});
			await createOrUpdate('wrongtoken', newWordStatusData);
		} catch (e) {
			error = e;
		}

		expect(error).toBeInstanceOf(AuthenticationError);
	});

	it('createOrUpdate (authentication error because of wrong userId case)', async function() {
		let error;
		try {
			const newWordStatusData = new WordStatus({
				userId: '00000000-0000-0000-0000-000000000000',
				word: '日本',
				showFurigana: true,
				showTranslation: true,
			});
			await createOrUpdate(apiKey.key, newWordStatusData);
		} catch (e) {
			error = e;
		}

		expect(error).toBeInstanceOf(AuthenticationError);
	});
});
