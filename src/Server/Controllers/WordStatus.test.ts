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

const validationErrorValidator = new Ajv({ allErrors: true }).compile({
	type: 'array',
	items: {
		type: 'object',
		additionalProperties: true,
		required: ['message'],
		properties: {
			message: {
				type: 'string',
			},
		},
	},
});

describe('WordStatus', async function() {
	beforeEach(async function() {
		const userRepository = new UserRepository(this.getDatabase());
		const apiKeyRepository = new ApiKeyRepository(this.getDatabase());
		user = await userRepository.create({ ...this.testUser });
		apiKey = await apiKeyRepository.create(user);
	});

	it('createOrUpdate (create case)', async function() {
		const response = await fetch('http://localhost:3000/word-status', {
			method: 'PUT',
			headers: {
				Authorization: `Bearer ${apiKey.key}`,
			},
			body: JSON.stringify({
				userId: user.id,
				word: 'word',
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
		expect(responseData.word).toBe('word');
		expect(responseData.showFurigana).toBe(true);
		expect(responseData.showTranslation).toBe(false);

		// Checking the db contents
		const dictionary = new Dictionary();
		const wordStatusRepository = new WordStatusRepository(this.getDatabase(), dictionary);
		const dbWordStatus = await wordStatusRepository.get(user, 'word');

		expect(dbWordStatus).not.toBe(null);
		expect((<WordStatus>dbWordStatus).showFurigana).toBe(true);
		expect((<WordStatus>dbWordStatus).showTranslation).toBe(false);
	});

	it('createOrUpdate (update case)', async function() {
		const dictionary = new Dictionary();
		const wordStatusRepository = new WordStatusRepository(this.getDatabase(), dictionary);
		await wordStatusRepository.create(user, 'word', false, true);

		const response = await fetch('http://localhost:3000/word-status', {
			method: 'PUT',
			headers: {
				Authorization: `Bearer ${apiKey.key}`,
			},
			body: JSON.stringify({
				userId: user.id,
				word: 'word',
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
		expect(responseData.word).toBe('word');
		expect(responseData.showFurigana).toBe(true);
		expect(responseData.showTranslation).toBe(false);

		// Checking the db contents
		const dbWordStatus = await wordStatusRepository.get(user, 'word');

		expect(dbWordStatus).not.toBe(null);
		expect((<WordStatus>dbWordStatus).showFurigana).toBe(true);
		expect((<WordStatus>dbWordStatus).showTranslation).toBe(false);
	});

	it('createOrUpdate (wrong userId case)', async function() {
		const response = await fetch('http://localhost:3000/word-status', {
			method: 'PUT',
			headers: {
				Authorization: `Bearer ${apiKey.key}`,
			},
			body: JSON.stringify({
				userId: 'wrong uuid',
				word: 'word',
				showFurigana: true,
				showTranslation: true,
			}),
		});
		expect(response.status).toBe(403);
	});

	it('createOrUpdate (validation errors)', async function() {
		const response = await fetch('http://localhost:3000/word-status', {
			method: 'PUT',
			headers: {
				Authorization: `Bearer ${apiKey.key}`,
			},
			body: JSON.stringify([]),
		});
		expect(response.status).toBe(422);
		const responseData = await response.json();

		expect(validationErrorValidator(responseData))
			.withContext(JSON.stringify(validationErrorValidator.errors))
			.toBe(true);
	});

	it('createOrUpdate (authentication error)', async function() {
		const response = await fetch('http://localhost:3000/word-status', {
			method: 'PUT',
			headers: {
				Authorization: 'Bearer wrongtoken',
			},
			body: JSON.stringify(['word']),
		});
		expect(response.status).toBe(403);
	});

	it('get (normal case)', async function() {
		const dictionary = new Dictionary();
		const wordStatusRepository = new WordStatusRepository(this.getDatabase(), dictionary);
		await wordStatusRepository.create(user, 'word2', true, false);

		const response = await fetch(
			`http://localhost:3000/word-status?${escape(JSON.stringify([
				'word1',
				'word2',
			]))}`,
			{
				method: 'GET',
				headers: {
					Authorization: `Bearer ${apiKey.key}`,
				},
			},
		);
		expect(response.status).toBe(200);
		const responseData = await response.json();

		expect(wordStatusArrayValidator(responseData))
			.withContext(JSON.stringify(wordStatusArrayValidator.errors))
			.toBe(true);
		expect(responseData.length).toBe(2);
		expect(responseData[0].userId).toBe(user.id);
		expect(responseData[1].userId).toBe(user.id);

		expect(WordStatus.fromApi(responseData[0])).toEqual(
			wordStatusRepository.getDefaultWordStatus(user, 'word1'),
		);

		expect(responseData[1].word).toBe('word2');
		expect(responseData[1].showFurigana).toBe(true);
		expect(responseData[1].showTranslation).toBe(false);
	});

	it('get (validation errors)', async function() {
		const response = await fetch(
			`http://localhost:3000/word-status?${escape(JSON.stringify([]))}`,
			{
				method: 'GET',
				headers: {
					Authorization: `Bearer ${apiKey.key}`,
				},
			},
		);
		expect(response.status).toBe(422);
		const responseData = await response.json();

		expect(validationErrorValidator(responseData))
			.withContext(JSON.stringify(validationErrorValidator.errors))
			.toBe(true);
	});

	it('get (authentication error)', async function() {
		const response = await fetch(
			`http://localhost:3000/word-status?${escape(JSON.stringify([
				'word',
			]))}`,
			{
				method: 'GET',
				headers: {
					Authorization: 'Bearer wrongtoken',
				},
			},
		);
		expect(response.status).toBe(403);
	});
});
