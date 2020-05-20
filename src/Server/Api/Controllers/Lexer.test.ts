import 'jasmine';
import fetch from 'node-fetch';
import Database from 'Server/Database/Database';
import User from 'Common/Models/User';
import ApiKey from 'Common/Models/ApiKey';
import UserRepository from 'Server/Repository/User';
import ApiKeyRepository from 'Server/Repository/ApiKey';
import Language from 'Common/Types/Language';
import * as Ajv from 'ajv';

let user: User;
let apiKey: ApiKey;

describe('LexerController', async () => {
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
		});
		apiKey = await apiKeyRepository.create(user);

		await db.close();
	});

	it('analyze (checking results)', async () => {
		const response = await fetch('http://localhost:3000/lexer/analyze', {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${apiKey.key}`,
			},
			body: JSON.stringify({
				languages: [Language.FRENCH],
				strings: [
					'テストのために、',
					'この文を書きました。',
				],
			}),
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
			body: JSON.stringify({
				languages: [Language.FRENCH],
				strings: [
					'テストのために、',
					'この文を書きました。',
				],
			}),
		});
		expect(response.status).toBe(403);
	});
});
