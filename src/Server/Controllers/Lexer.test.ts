import 'jasmine';
import fetch from 'node-fetch';
import User from 'Common/Models/User';
import ApiKey from 'Common/Models/ApiKey';
import UserRepository from 'Server/Repositories/User';
import ApiKeyRepository from 'Server/Repositories/ApiKey';
import Language from 'Common/Types/Language';
import * as Ajv from 'ajv';

const lexerResponseValidator = new Ajv({ allErrors: true }).compile({
	type: 'array',
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

let user: User;
let apiKey: ApiKey;

describe('LexerController', async function() {
	beforeEach(async function() {
		const userRepository = new UserRepository(this.getDatabase());
		const apiKeyRepository = new ApiKeyRepository(this.getDatabase());
		user = await userRepository.create({ ...this.testUser });
		apiKey = await apiKeyRepository.create(user.id);
	});

	it('analyze (checking results)', async function() {
		const response = await fetch('http://localhost:3000/api/lexer/analyze', {
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

		expect(lexerResponseValidator(responseData))
			.withContext(JSON.stringify(lexerResponseValidator.errors))
			.toBe(true);
		expect(responseData.length).toBe(2);
	});

	it('analyze (validation errors)', async function() {
		const response = await fetch('http://localhost:3000/api/lexer/analyze', {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${apiKey.key}`,
			},
			body: JSON.stringify({}),
		});
		expect(response.status).toBe(422);
		const responseData = await response.json();

		expect(this.validationErrorResponseValidator(responseData))
			.withContext(JSON.stringify(this.validationErrorResponseValidator.errors))
			.toBe(true);
	});

	it('analyze (authentication error)', async function() {
		const response = await fetch('http://localhost:3000/api/lexer/analyze', {
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

	it('analyze (invalid JSON should get a proper error)', async function() {
		const response = await fetch('http://localhost:3000/api/lexer/analyze', {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${apiKey.key}`,
			},
			body: 'not a JSON',
		});
		expect(response.status).toBe(422);
		const responseData = await response.json();

		expect(this.validationErrorResponseValidator(responseData))
			.withContext(JSON.stringify(this.validationErrorResponseValidator.errors))
			.toBe(true);
	});
});
