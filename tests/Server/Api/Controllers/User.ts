import 'jasmine';
import fetch from 'node-fetch';
import * as Ajv from 'ajv';
import Database from 'Server/Database/Database';

describe('UserController', async () => {
	it('create result', async () => {
		// Clearing previous run if necessary
		const db = (new Database());
		await db.exec(`DELETE FROM "User" WHERE "email" = 'unittest@example.com';`);
		await db.close();

		const response = await fetch('http://localhost:3000/user', {
			method: 'POST',
			body: JSON.stringify({
				email: 'unittest@example.com',
				password: '123456',
				languages: ['en', 'es'],
			}),
		});
		expect(response.status).toBe(200);
		const responseData = await response.json();

		const validator = new Ajv({ allErrors: true }).compile({
			type: 'object',
			additionalProperties: false,
			properties: {
				id: {
					type: 'integer',
				},
				email: {
					type: 'string',
					enum: ['unittest@example.com'],
				},
				emailVerified: {
					type: 'boolean',
					const: false,
				},
				password: {
					type: 'null',
				},
				languages: {
					type: 'array',
					uniqueItems: true,
					minItems: 2,
					maxItems: 2,
					items: {
						type: 'string',
						enum: ['en', 'es'],
					},
				},
				createdAt: {
					type: 'string',
					format: 'date-time',
				},
			},
		});

		expect(validator(responseData))
			.withContext(JSON.stringify(validator.errors))
			.toBe(true);

		// Trying again (it should fail)
		const response2 = await fetch('http://localhost:3000/user', {
			method: 'POST',
			body: JSON.stringify({
				email: 'unittest@example.com',
				password: '123456',
				languages: ['en', 'es'],
			}),
		});
		expect(response2.status).toBe(409);
	});
});
