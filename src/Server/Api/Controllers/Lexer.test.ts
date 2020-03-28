import 'jasmine';
import fetch from 'node-fetch';
import Token from 'Common/Models/Token';
import Database from 'Server/Database/Database';
import User from 'Common/Models/User';
import ApiKey from 'Common/Models/ApiKey';
import * as Ajv from 'ajv';
import { v4 as uuidv4 } from 'uuid';

let user: User;
let apiKey: ApiKey;

describe('LexerController', async () => {
	beforeEach(async () => {
		// Clearing previous run if necessary
		const db = (new Database());
		await db.exec(`DELETE FROM "User" WHERE "email" = 'unittest@example.com';`);

		const uuid = uuidv4();
		user = <User>await db.get(User, `
			INSERT INTO "User" ("id", "email", "emailVerified", "password", "languages", "createdAt")
			VALUES (\${id}, \${email}, FALSE, \${password}, \${languages}, \${createdAt})
			RETURNING *;
		`, {
			id: uuid,
			email: 'unittest@example.com',
			password: User.hashPassword(uuid, '123456'),
			languages: ['fr'],
			createdAt: new Date(),
		});
		apiKey = <ApiKey>await db.get(ApiKey, `
			INSERT INTO "ApiKey" ("id", "key", "userId", "createdAt", "expiresAt")
			VALUES (\${id}, \${key}, \${userId}, \${createdAt}, \${expiresAt})
			RETURNING *;
		`, {
			id: uuidv4(),
			key: ApiKey.generateKey(),
			userId: user.id,
			createdAt: new Date(),
			expiresAt: ApiKey.createExpiryDate(new Date()),
		});

		await db.close();
	});

	it('analyze (checking results)', async () => {
		const response = await fetch('http://localhost:3000/lexer/analyze', {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${apiKey.key}`,
			},
			body: JSON.stringify([
				'テストのために、',
				'この文を書きました。',
			]),
		});
		expect(response.status).toBe(200);
		const responseData = await response.json();

		const validator = new Ajv({ allErrors: true }).compile({
			type: 'array',
			minItems: 2,
			maxItems: 2,
			items: {
				type: 'array',
				minItems: 1,
				items: {
					type: 'object',
					additionalProperties: false,
					required: [
						'type',
						'text',
						'words',
						'verb',
						'conjugation',
						'forms',
					],
					properties: {
						type: {
							type: 'string',
						},
						text: {
							type: 'string',
						},
						words: {
							type: 'array',
							items: {
								type: 'object',
								additionalProperties: false,
								required: [
									'word',
									'reading',
									'translationLang',
									'translation',
									'tags',
								],
								properties: {
									word: {
										type: 'string',
									},
									reading: {
										type: 'string',
									},
									translationLang: {
										type: ['string', 'null'],
									},
									translation: {
										type: 'string',
									},
									tags: {
										type: 'array',
										items: {
											type: 'string',
										},
									},
								},
							},
						},
						verb: {
							type: ['string', 'null'],
						},
						conjugation: {
							type: ['string', 'null'],
						},
						forms: {
							type: 'array',
							items: {
								type: 'object',
								additionalProperties: false,
								required: [
									'conjugation',
									'dictionaryForm',
									'type',
								],
								properties: {
									conjugation: {
										type: 'string',
									},
									dictionaryForm: {
										type: 'string',
									},
									type: {
										type: 'string',
									},
								},
							},
						},
					},
				},
			},
		});

		expect(validator(responseData))
			.withContext(JSON.stringify(validator.errors))
			.toBe(true);
	});

	it('analyze (validation errors)', async () => {
		const response = await fetch('http://localhost:3000/lexer/analyze', {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${apiKey.key}`,
			},
			body: JSON.stringify({}),
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

	it('analyze (authentication error)', async () => {
		const response = await fetch('http://localhost:3000/lexer/analyze', {
			method: 'POST',
			headers: {
				Authorization: 'Bearer wrongtoken',
			},
			body: JSON.stringify([
				'テストのために、',
				'この文を書きました。',
			]),
		});
		expect(response.status).toBe(403);
	});
});
