import 'jasmine';
import fetch from 'node-fetch';
import * as Ajv from 'ajv';
import Dictionary from 'Server/Lexer/Dictionary';
import UserRepository from 'Server/Repositories/User';
import ApiKeyRepository from 'Server/Repositories/ApiKey';
import WordStatusRepository from 'Server/Repositories/WordStatus';
import User from 'Common/Models/User';
import ApiKey from 'Common/Models/ApiKey';
import WordStatus from 'Common/Models/WordStatus';

let user: User;
let apiKey: ApiKey;

const wordStatusSchema = {
	type: 'object',
	required: [
		'userId',
		'word',
		'showFurigana',
		'showTranslation',
	],
	additionalProperties: false,
	properties: {
		userId: {
			type: 'string',
		},
		word: {
			type: 'string',
		},
		showFurigana: {
			type: 'boolean',
		},
		showTranslation: {
			type: 'boolean',
		},
	},
};
const wordStatusValidator = new Ajv({ allErrors: true }).compile(wordStatusSchema);
const wordStatusArrayValidator = new Ajv({ allErrors: true }).compile({
	type: 'array',
	items: wordStatusSchema,
});

describe('WordStatusController', async function() {
	beforeEach(async function() {
		const userRepository = new UserRepository(await this.getDatabase());
		const apiKeyRepository = new ApiKeyRepository(await this.getDatabase());
		user = await userRepository.create({ ...this.testUser });
		apiKey = await apiKeyRepository.create(user.id);
	});

	it('createOrUpdate (create case)', async function() {
		const response = await fetch('https://localhost:3000/api/word-status', {
			method: 'PUT',
			headers: {
				Authorization: `Bearer ${apiKey.key}`,
			},
			body: JSON.stringify({
				userId: user.id,
				word: '日本',
				showFurigana: true,
				showTranslation: false,
			}),
		});
		expect(response.status).toBe(200);
		const responseData = await response.json();

		expect(wordStatusValidator(responseData))
			.withContext(JSON.stringify(wordStatusValidator.errors))
			.toBe(true);
		expect(responseData.userId).toBe(user.id);
		expect(responseData.word).toBe('日本');
		expect(responseData.showFurigana).toBe(true);
		expect(responseData.showTranslation).toBe(false);

		// Checking the db contents
		const dictionary = new Dictionary();
		const wordStatusRepository = new WordStatusRepository(await this.getDatabase(), dictionary);
		const dbWordStatus = await wordStatusRepository.get(user, '日本');

		expect(dbWordStatus).not.toBe(null);
		expect((<WordStatus>dbWordStatus).showFurigana).toBe(true);
		expect((<WordStatus>dbWordStatus).showTranslation).toBe(false);
	});

	it('createOrUpdate (update case)', async function() {
		const dictionary = new Dictionary();
		const wordStatusRepository = new WordStatusRepository(await this.getDatabase(), dictionary);
		await wordStatusRepository.create(user, '日本', false, true);

		const response = await fetch('https://localhost:3000/api/word-status', {
			method: 'PUT',
			headers: {
				Authorization: `Bearer ${apiKey.key}`,
			},
			body: JSON.stringify({
				userId: user.id,
				word: '日本',
				showFurigana: true,
				showTranslation: false,
			}),
		});
		expect(response.status).toBe(200);
		const responseData = await response.json();

		expect(wordStatusValidator(responseData))
			.withContext(JSON.stringify(wordStatusValidator.errors))
			.toBe(true);
		expect(responseData.userId).toBe(user.id);
		expect(responseData.word).toBe('日本');
		expect(responseData.showFurigana).toBe(true);
		expect(responseData.showTranslation).toBe(false);

		// Checking the db contents
		const dbWordStatus = await wordStatusRepository.get(user, '日本');

		expect(dbWordStatus).not.toBe(null);
		expect((<WordStatus>dbWordStatus).showFurigana).toBe(true);
		expect((<WordStatus>dbWordStatus).showTranslation).toBe(false);
	});

	it('createOrUpdate (wrong userId case)', async function() {
		const response = await fetch('https://localhost:3000/api/word-status', {
			method: 'PUT',
			headers: {
				Authorization: `Bearer ${apiKey.key}`,
			},
			body: JSON.stringify({
				userId: '00000000-0000-0000-0000-000000000000',
				word: '日本',
				showFurigana: true,
				showTranslation: true,
			}),
		});
		expect(response.status).toBe(403);
	});

	it('createOrUpdate (validation errors)', async function() {
		const response = await fetch('https://localhost:3000/api/word-status', {
			method: 'PUT',
			headers: {
				Authorization: `Bearer ${apiKey.key}`,
			},
			body: JSON.stringify([]),
		});
		expect(response.status).toBe(422);
		const responseData = await response.json();

		expect(this.validationErrorResponseValidator(responseData))
			.withContext(JSON.stringify(this.validationErrorResponseValidator.errors))
			.toBe(true);
	});

	it('createOrUpdate (word not in dictionaty)', async function() {
		const response = await fetch('https://localhost:3000/api/word-status', {
			method: 'PUT',
			headers: {
				Authorization: `Bearer ${apiKey.key}`,
			},
			body: JSON.stringify({
				userId: user.id,
				word: 'word that cannot be in the dictionary',
				showFurigana: true,
				showTranslation: false,
			}),
		});
		expect(response.status).toBe(422);
		const responseData = await response.json();

		expect(this.validationErrorResponseValidator(responseData))
			.withContext(JSON.stringify(this.validationErrorResponseValidator.errors))
			.toBe(true);
	});

	it('createOrUpdate (authentication error)', async function() {
		const response = await fetch('https://localhost:3000/api/word-status', {
			method: 'PUT',
			headers: {
				Authorization: 'Bearer wrongtoken',
			},
			body: JSON.stringify(['日本']),
		});
		expect(response.status).toBe(403);
	});

	it('search (normal case)', async function() {
		const dictionary = new Dictionary();
		const wordStatusRepository = new WordStatusRepository(await this.getDatabase(), dictionary);
		await wordStatusRepository.create(user, '食べる', true, false);

		const response = await fetch('https://localhost:3000/api/word-status/search', {
			method: 'POST',
			body: JSON.stringify(['日本', '食べる']),
			headers: {
				Authorization: `Bearer ${apiKey.key}`,
			},
		});
		expect(response.status).toBe(200);
		const responseData = await response.json();

		expect(wordStatusArrayValidator(responseData))
			.withContext(JSON.stringify(wordStatusArrayValidator.errors))
			.toBe(true);
		expect(responseData.length).toBe(2);
		expect(responseData[0].userId).toBe(user.id);
		expect(responseData[1].userId).toBe(user.id);

		expect(WordStatus.fromApi(responseData[0])).toEqual(
			wordStatusRepository.getDefaultWordStatus(user, '日本'),
		);

		expect(responseData[1].word).toBe('食べる');
		expect(responseData[1].showFurigana).toBe(true);
		expect(responseData[1].showTranslation).toBe(false);
	});

	it('search (validation errors)', async function() {
		const response = await fetch('https://localhost:3000/api/word-status/search', {
			method: 'POST',
			body: JSON.stringify([]),
			headers: {
				Authorization: `Bearer ${apiKey.key}`,
			},
		});
		expect(response.status).toBe(422);
		const responseData = await response.json();

		expect(this.validationErrorResponseValidator(responseData))
			.withContext(JSON.stringify(this.validationErrorResponseValidator.errors))
			.toBe(true);
	});

	it('search (authentication error)', async function() {
		const response = await fetch('https://localhost:3000/api/word-status/search', {
			method: 'POST',
			body: JSON.stringify(['日本']),
			headers: {
				Authorization: 'Bearer wrongtoken',
			},
		});
		expect(response.status).toBe(403);
	});
});
