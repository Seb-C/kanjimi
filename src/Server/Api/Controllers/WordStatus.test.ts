import 'jasmine';
import fetch from 'node-fetch';
import * as Ajv from 'ajv';
import Database from 'Server/Database/Database';
import Dictionary from 'Server/Lexer/Dictionary';
import UserRepository from 'Server/Repository/User';
import ApiKeyRepository from 'Server/Repository/ApiKey';
import WordStatusRepository from 'Server/Repository/WordStatus';
import User from 'Common/Models/User';
import ApiKey from 'Common/Models/ApiKey';
import WordStatus from 'Common/Models/WordStatus';
import Language from 'Common/Types/Language';

let user: User;
let apiKey: ApiKey;

describe('WordStatus', async () => {
	beforeEach(async () => {
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
			jlpt: null,
		});
		apiKey = await apiKeyRepository.create(user);
		await db.close();
	});

	it('createOrUpdate (create case)', async () => {
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

		const validator = new Ajv({ allErrors: true }).compile({
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
					const: user.id,
				},
				word: {
					type: 'string',
					const: 'word',
				},
				showFurigana: {
					type: 'boolean',
					const: true,
				},
				showTranslation: {
					type: 'boolean',
					const: false,
				},
			},
		});

		expect(validator(responseData))
			.withContext(JSON.stringify(validator.errors))
			.toBe(true);

		// Checking the db contents
		const db = new Database();
		const dictionary = new Dictionary();
		const wordStatusRepository = new WordStatusRepository(db, dictionary);
		const dbWordStatus = await wordStatusRepository.get(user, 'word');
		await db.close();

		expect(dbWordStatus).not.toBe(null);
		expect((<WordStatus>dbWordStatus).showFurigana).toBe(true);
		expect((<WordStatus>dbWordStatus).showTranslation).toBe(false);
	});

	it('createOrUpdate (update case)', async () => {
		const db = new Database();
		const dictionary = new Dictionary();
		const wordStatusRepository = new WordStatusRepository(db, dictionary);
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

		const validator = new Ajv({ allErrors: true }).compile({
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
					const: user.id,
				},
				word: {
					type: 'string',
					const: 'word',
				},
				showFurigana: {
					type: 'boolean',
					const: true,
				},
				showTranslation: {
					type: 'boolean',
					const: false,
				},
			},
		});

		expect(validator(responseData))
			.withContext(JSON.stringify(validator.errors))
			.toBe(true);

		// Checking the db contents
		const dbWordStatus = await wordStatusRepository.get(user, 'word');
		await db.close();

		expect(dbWordStatus).not.toBe(null);
		expect((<WordStatus>dbWordStatus).showFurigana).toBe(true);
		expect((<WordStatus>dbWordStatus).showTranslation).toBe(false);
	});

	it('createOrUpdate (wrong userId case)', async () => {
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

	it('createOrUpdate (validation errors)', async () => {
		const response = await fetch('http://localhost:3000/word-status', {
			method: 'PUT',
			headers: {
				Authorization: `Bearer ${apiKey.key}`,
			},
			body: JSON.stringify([]),
		});
		expect(response.status).toBe(422);
		const responseData = await response.json();

		const validator = new Ajv({ allErrors: true }).compile({
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

		expect(validator(responseData))
			.withContext(JSON.stringify(validator.errors))
			.toBe(true);
	});

	it('createOrUpdate (authentication error)', async () => {
		const response = await fetch('http://localhost:3000/word-status', {
			method: 'PUT',
			headers: {
				Authorization: 'Bearer wrongtoken',
			},
			body: JSON.stringify(['word']),
		});
		expect(response.status).toBe(403);
	});

	it('get (normal case)', async () => {
		const db = new Database();
		const dictionary = new Dictionary();
		const wordStatusRepository = new WordStatusRepository(db, dictionary);
		await wordStatusRepository.create(user, 'word2', true, false);
		await db.close();

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

		const validator = new Ajv({ allErrors: true }).compile({
			type: 'array',
			minItems: 2,
			maxItems: 2,
			items: {
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
						const: user.id,
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
			},
		});

		expect(validator(responseData))
			.withContext(JSON.stringify(validator.errors))
			.toBe(true);

		expect(WordStatus.fromApi(responseData[0])).toEqual(
			wordStatusRepository.getDefaultWordStatus(user, 'word1'),
		);

		expect(responseData[1].word).toBe('word2');
		expect(responseData[1].showFurigana).toBe(true);
		expect(responseData[1].showTranslation).toBe(false);
	});

	it('get (validation errors)', async () => {
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

		const validator = new Ajv({ allErrors: true }).compile({
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

		expect(validator(responseData))
			.withContext(JSON.stringify(validator.errors))
			.toBe(true);
	});

	it('get (authentication error)', async () => {
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
