import 'jasmine';
import fetch from 'node-fetch';
import User from 'Common/Models/User';
import ApiKey from 'Common/Models/ApiKey';
import UserRepository from 'Server/Repositories/User';
import UserActivityRepository from 'Server/Repositories/UserActivity';
import ApiKeyRepository from 'Server/Repositories/ApiKey';
import Language from 'Common/Types/Language';
import { sql } from 'kiss-orm';
import * as Ajv from 'ajv';
import { v4 as uuidv4 } from 'uuid';

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

const getKanjiResponseValidator = new Ajv({ allErrors: true }).compile({
	type: 'object',
	additionalProperties: {
		type: 'object',
		additionalProperties: false,
		required: [
			'kanji',
			'meanings',
			'readings',
			'structure',
			'fileUrl',
		],
		properties: {
			kanji: {
				type: 'string',
				minLength: 1,
				maxLength: 1,
			},
			meanings: {
				type: 'array',
				items: {
					type: 'object',
					additionalProperties: false,
					properties: {
						kanji: {
							type: 'string',
						},
						meaning: {
							type: 'string',
						},
						meaningLang: {
							type: 'string',
						},
					},
				},
			},
			readings: {
				type: 'array',
				items: {
					type: 'object',
					additionalProperties: false,
					properties: {
						kanji: {
							type: 'string',
						},
						reading: {
							type: 'string',
						},
					},
				},
			},
			structure: {
				type: 'object',
				additionalProperties: false,
				properties: {
					element: {
						type: 'string',
					},
					position: {
						type: ['string', 'null'],
					},
					components: {
						type: 'array',
						items: {
							type: ['string', 'object'],
						},
					},
				},
			},
			fileUrl: {
				type: 'string',
				format: 'uri',
			},
		},
	},
});

let user: User;
let apiKey: ApiKey;

describe('LexerController', async function() {
	beforeEach(async function() {
		const userRepository = new UserRepository(await this.getDatabase());
		const apiKeyRepository = new ApiKeyRepository(await this.getDatabase());
		user = await userRepository.create({ ...this.testUser });
		apiKey = await apiKeyRepository.create(user.id);
	});

	it('analyze (checking results)', async function() {
		const response = await fetch('https://localhost:3000/api/lexer/analyze', {
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

	it('analyze (increments the UserActivity table)', async function() {
		await fetch('https://localhost:3000/api/lexer/analyze', {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${apiKey.key}`,
			},
			body: JSON.stringify({
				languages: [Language.FRENCH],
				strings: ['テスト', 'test'],
			}),
		});

		const userActivityRepository = new UserActivityRepository(await this.getDatabase());
		const activity = await userActivityRepository.get(user.id, new Date());
		expect(activity.characters).toBe(7);
	});

	it('analyze (inserts into the AnalyzeLog table)', async function() {
		const sessionId = uuidv4();
		await fetch('https://localhost:3000/api/lexer/analyze', {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${apiKey.key}`,
			},
			body: JSON.stringify({
				languages: [Language.FRENCH],
				strings: ['テスト', 'test'],
				pageUrl: 'https://kanjimi.com/fake-url',
				sessionId: sessionId,
			}),
		});

		const analyzeLogs = await (await this.getDatabase()).query(sql`
			SELECT * FROM "AnalyzeLog" WHERE "sessionId" = ${sessionId};
		`);
		expect(analyzeLogs.length).not.toBe(0);
		expect(analyzeLogs[0].url).toBe('https://kanjimi.com/fake-url');
		expect(analyzeLogs[0].characters).toBe(7);
		expect(analyzeLogs[0].requestedAt).not.toBe(null);
	});

	it('analyze (validation errors)', async function() {
		const response = await fetch('https://localhost:3000/api/lexer/analyze', {
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
		const response = await fetch('https://localhost:3000/api/lexer/analyze', {
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
		const response = await fetch('https://localhost:3000/api/lexer/analyze', {
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

	it('getKanji (normal case)', async function() {
		const response = await fetch('https://localhost:3000/api/lexer/kanji/' + encodeURIComponent('恐'), {
			method: 'GET',
			headers: {
				Authorization: `Bearer ${apiKey.key}`,
			},
		});
		expect(response.status).toBe(200);
		const responseData = await response.json();

		expect(getKanjiResponseValidator(responseData))
			.withContext(JSON.stringify(getKanjiResponseValidator.errors))
			.toBe(true);
		expect(response.status).toBe(200);
		expect(Object.keys(responseData)).toContain('恐');
		expect(Object.keys(responseData)).toContain('心');
		expect(Object.keys(responseData)).toContain('工');
		expect(Object.keys(responseData)).toContain('凡');
	});

	it('getKanji (not a kanji error case)', async function() {
		const response = await fetch('https://localhost:3000/api/lexer/kanji/X', {
			method: 'GET',
			headers: {
				Authorization: `Bearer ${apiKey.key}`,
			},
		});
		expect(response.status).toBe(422);
	});

	it('getKanji (more than one character error case)', async function() {
		const response = await fetch('https://localhost:3000/api/lexer/kanji/test', {
			method: 'GET',
			headers: {
				Authorization: `Bearer ${apiKey.key}`,
			},
		});
		expect(response.status).toBe(422);
	});

	it('getKanji (unknown Kanji error case)', async function() {
		const response = await fetch('https://localhost:3000/api/lexer/kanji/' + encodeURIComponent('龯'), {
			method: 'GET',
			headers: {
				Authorization: `Bearer ${apiKey.key}`,
			},
		});
		expect(response.status).toBe(404);
	});
});
