import 'jasmine';
import fetch from 'node-fetch';
import * as Ajv from 'ajv';
import User from 'Common/Models/User';
import ApiKey from 'Common/Models/ApiKey';
import UserRepository from 'Server/Repositories/User';
import ApiKeyRepository from 'Server/Repositories/ApiKey';

const apiKeyResponseValidator = new Ajv({ allErrors: true }).compile({
	type: 'object',
	required: [
		'id',
		'key',
		'userId',
		'createdAt',
		'expiresAt',
	],
	additionalProperties: false,
	properties: {
		id: {
			type: 'string',
		},
		key: {
			type: 'string',
		},
		userId: {
			type: 'string',
		},
		createdAt: {
			type: 'string',
			format: 'date-time',
		},
		expiresAt: {
			type: 'string',
			format: 'date-time',
		},
	},
});

let user: User;

describe('ApiKeyController', async function() {
	beforeEach(async function() {
		const userRepository = new UserRepository(this.db);
		user = await userRepository.create({
			...this.testUser,
			emailVerified: true,
		});
	});

	it('create (normal and duplicate case)', async function() {
		const response = await fetch('https://localhost:3000/api/api-key', {
			method: 'POST',
			body: JSON.stringify({
				email: 'unittest@example.com',
				password: '123456',
			}),
		});
		expect(response.status).toBe(200);
		const responseData = await response.json();

		expect(apiKeyResponseValidator(responseData))
			.withContext(JSON.stringify(apiKeyResponseValidator.errors))
			.toBe(true);

		// Checking the db contents
		const apiKeyRepository = new ApiKeyRepository(this.db);
		const dbApiKey = await apiKeyRepository.getById(responseData.id);

		expect(dbApiKey).not.toBe(null);
		expect((<ApiKey>dbApiKey).key).not.toBe('');
	});

	it('create (validation errors)', async function() {
		const response = await fetch('https://localhost:3000/api/api-key', {
			method: 'POST',
			body: JSON.stringify({}),
		});
		expect(response.status).toBe(422);
		const responseData = await response.json();

		expect(this.validationErrorResponseValidator(responseData))
			.withContext(JSON.stringify(this.validationErrorResponseValidator.errors))
			.toBe(true);
	});

	it('create (incorrect email)', async function() {
		const response = await fetch('https://localhost:3000/api/api-key', {
			method: 'POST',
			body: JSON.stringify({
				email: 'wrongemail@example.com',
				password: '123456',
			}),
		});
		expect(response.status).toBe(403);
	});

	it('create (incorrect password)', async function() {
		const response = await fetch('https://localhost:3000/api/api-key', {
			method: 'POST',
			body: JSON.stringify({
				email: 'unittest@example.com',
				password: 'wrong password',
			}),
		});
		expect(response.status).toBe(403);
	});

	it('create (email not yet verified)', async function() {
		const userRepository = new UserRepository(this.db);
		user = await userRepository.updateById(user.id, { emailVerified: false });

		const response = await fetch('https://localhost:3000/api/api-key', {
			method: 'POST',
			body: JSON.stringify({
				email: 'unittest@example.com',
				password: '123456',
			}),
		});
		expect(response.status).toBe(403);
	});

	it('get the api key object from the credentials', async function() {
		const apiKeyRepository = new ApiKeyRepository(this.db);
		const apiKey = await apiKeyRepository.create(user.id);

		const response = await fetch('https://localhost:3000/api/api-key', {
			method: 'GET',
			headers: {
				Authorization: `Bearer ${apiKey.key}`,
			},
		});
		expect(response.status).toBe(200);
		const responseData = await response.json();

		expect(apiKeyResponseValidator(responseData))
			.withContext(JSON.stringify(apiKeyResponseValidator.errors))
			.toBe(true);
	});
});
