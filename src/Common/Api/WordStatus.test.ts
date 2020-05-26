import 'jasmine';
import { get, createOrUpdate } from 'Common/Api/WordStatus';
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
		const userRepository = new UserRepository(this.getDatabase());
		const apiKeyRepository = new ApiKeyRepository(this.getDatabase());
		const wordStatusRepository = new WordStatusRepository(this.getDatabase(), dictionary);
		user = await userRepository.create({ ...this.testUser });
		apiKey = await apiKeyRepository.create(user);
		wordStatus = await wordStatusRepository.create(user, 'word', true, false);
	});

	it('get (normal case)', async function() {
		const apiWordStatuses = await get(apiKey.key, ['word']);

		expect(apiWordStatuses).toBeInstanceOf(Array);
		expect(apiWordStatuses.length).toBe(1);
		expect(apiWordStatuses[0]).toBeInstanceOf(WordStatus);
		expect(apiWordStatuses[0]).toEqual(wordStatus);
		// No need to test further because it is already done in the models and API tests
	});

	it('get (validation error case)', async function() {
		let error;
		try {
			await get(apiKey.key, []);
		} catch (e) {
			error = e;
		}

		expect(error).toBeInstanceOf(ValidationError);
	});

	it('get (authentication error case)', async function() {
		let error;
		try {
			await get('wrongtoken', ['word']);
		} catch (e) {
			error = e;
		}

		expect(error).toBeInstanceOf(AuthenticationError);
	});

	it('createOrUpdate (normal case)', async function() {
		const newWordStatusData = new WordStatus({
			userId: user.id,
			word: 'word',
			showFurigana: true,
			showTranslation: true,
		});
		const apiWordStatus = await createOrUpdate(apiKey.key, newWordStatusData);

		expect(apiWordStatus).toBeInstanceOf(WordStatus);
		expect(apiWordStatus).toEqual(newWordStatusData);
	});

	it('get (validation error case)', async function() {
		let error;
		try {
			await createOrUpdate(apiKey.key, new WordStatus({}));
		} catch (e) {
			error = e;
		}

		expect(error).toBeInstanceOf(ValidationError);
	});

	it('get (authentication error case)', async function() {
		let error;
		try {
			const newWordStatusData = new WordStatus({
				userId: user.id,
				word: 'word',
				showFurigana: true,
				showTranslation: true,
			});
			await createOrUpdate('wrongtoken', newWordStatusData);
		} catch (e) {
			error = e;
		}

		expect(error).toBeInstanceOf(AuthenticationError);
	});

	it('get (authentication error because of wrong userId case)', async function() {
		let error;
		try {
			const newWordStatusData = new WordStatus({
				userId: 'wrongid',
				word: 'word',
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
