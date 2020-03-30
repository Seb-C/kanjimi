import 'jasmine';
import fetch from 'node-fetch';
import * as Ajv from 'ajv';
import Database from 'Server/Database/Database';
import UserRepository from 'Server/Repository/User';
import ApiKeyRepository from 'Server/Repository/ApiKey';
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
		user = await userRepository.create('unittest@example.com', '123456', [Language.FRENCH]);
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
		const dbWordStatus = await db.get(WordStatus, `
			SELECT *
			FROM "WordStatus"
			WHERE "userId" = \${userId}
			AND "word" = \${word};
		`, {
			userId: user.id,
			word: 'word',
		});
		await db.close();

		expect(dbWordStatus).not.toBe(null);
		expect((<WordStatus>dbWordStatus).showFurigana).toBe(true);
		expect((<WordStatus>dbWordStatus).showTranslation).toBe(false);
	});

	it('createOrUpdate (update case)', async () => {
		const db = new Database();
		await db.exec(`
			INSERT INTO "WordStatus" ("userId", "word", "showFurigana", "showTranslation")
			VALUES (\${userId}, \${word}, \${showFurigana}, \${showTranslation});
		`, {
			userId: user.id,
			word: 'word',
			showFurigana: false,
			showTranslation: true,
		});

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
		const dbWordStatus = await db.get(WordStatus, `
			SELECT *
			FROM "WordStatus"
			WHERE "userId" = \${userId}
			AND "word" = \${word};
		`, {
			userId: user.id,
			word: 'word',
		});
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
});