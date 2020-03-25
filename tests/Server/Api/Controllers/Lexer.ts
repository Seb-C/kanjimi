import 'jasmine';
import fetch from 'node-fetch';
import Token from 'Common/Models/Token';
import * as Ajv from 'ajv';

describe('LexerController', async () => {
	it('analyze (checking results)', async () => {
		const response = await fetch('http://localhost:3000/lexer/analyze', {
			method: 'POST',
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
});
