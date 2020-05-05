import 'jasmine';
import fetch from 'node-fetch';
import * as Ajv from 'ajv';
import Database from 'Server/Database/Database';
import UserRepository from 'Server/Repository/User';
import User from 'Common/Models/User';

describe('UserController', async () => {
	beforeEach(async () => {
		// Clearing previous run if necessary
		const db = new Database();
		const userRepository = new UserRepository(db);
		await userRepository.deleteByEmail('unittest@example.com');
		await db.close();
	});

	it('create (normal and duplicate case)', async () => {
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
			required: [
				'id',
				'email',
				'emailVerified',
				'password',
				'languages',
				'createdAt',
			],
			additionalProperties: false,
			properties: {
				id: {
					type: 'string',
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

		// Checking the db contents
		const db = new Database();
		const userRepository = new UserRepository(db);
		const dbUser = await userRepository.getById(responseData.id);
		await db.close();

		expect(dbUser).not.toBe(null);
		expect((<User>dbUser).password).not.toBe(null);
		expect((<User>dbUser).password).not.toBe('');
		expect((<User>dbUser).password).not.toBe('123456');

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

	it('create (validation errors)', async () => {
		const response = await fetch('http://localhost:3000/user', {
			method: 'POST',
			body: JSON.stringify({
				emailValidated: true,
				createdAt: new Date().toISOString(),
			}),
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
