import 'jasmine';
import { get, createOrUpdate } from 'Common/Client/Routes/WordStatus';
import fetch from 'node-fetch';
import ValidationError from 'Common/Client/Errors/Validation';
import AuthenticationError from 'Common/Client/Errors/Authentication';
import Database from 'Server/Database/Database';
import User from 'Common/Models/User';
import ApiKey from 'Common/Models/ApiKey';
import WordStatus from 'Common/Models/WordStatus';
import UserRepository from 'Server/Repository/User';
import ApiKeyRepository from 'Server/Repository/ApiKey';
import WordStatusRepository from 'Server/Repository/WordStatus';
import Language from 'Common/Types/Language';

let user: User;
let apiKey: ApiKey;
let wordStatus: WordStatus;

describe('Client WordStatus', () => {
	beforeEach(async () => {
		(<any>global).fetch = fetch;

		// Clearing previous run if necessary
		const db = new Database();
		const userRepository = new UserRepository(db);
		const apiKeyRepository = new ApiKeyRepository(db);
		const wordStatusRepository = new WordStatusRepository(db);
		await userRepository.deleteByEmail('unittest@example.com');
		user = await userRepository.create({
			email: 'unittest@example.com',
			password: '123456',
			languages: [Language.FRENCH],
			romanReading: false,
			jlpt: null,
		});
		apiKey = await apiKeyRepository.create(user);
		wordStatus = await wordStatusRepository.create(user, 'word', true, false);

		await db.close();
	});

	it('get (normal case)', async () => {
		const apiWordStatuses = await get(apiKey.key, ['word']);

		expect(apiWordStatuses).toBeInstanceOf(Array);
		expect(apiWordStatuses.length).toBe(1);
		expect(apiWordStatuses[0]).toBeInstanceOf(WordStatus);
		expect(apiWordStatuses[0]).toEqual(wordStatus);
		// No need to test further because it is already done in the models and API tests
	});

	it('get (validation error case)', async () => {
		let error;
		try {
			await get(apiKey.key, []);
		} catch (e) {
			error = e;
		}

		expect(error).toBeInstanceOf(ValidationError);
	});

	it('get (authentication error case)', async () => {
		let error;
		try {
			await get('wrongtoken', ['word']);
		} catch (e) {
			error = e;
		}

		expect(error).toBeInstanceOf(AuthenticationError);
	});

	it('createOrUpdate (normal case)', async () => {
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

	it('get (validation error case)', async () => {
		let error;
		try {
			await createOrUpdate(apiKey.key, new WordStatus({}));
		} catch (e) {
			error = e;
		}

		expect(error).toBeInstanceOf(ValidationError);
	});

	it('get (authentication error case)', async () => {
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

	it('get (authentication error because of wrong userId case)', async () => {
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
