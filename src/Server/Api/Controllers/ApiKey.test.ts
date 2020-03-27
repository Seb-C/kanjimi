import 'jasmine';
import fetch from 'node-fetch';
import * as Ajv from 'ajv';
import Database from 'Server/Database/Database';
import User from 'Common/Models/User';
import ApiKey from 'Common/Models/ApiKey';
import { v4 as uuidv4 } from 'uuid';

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

describe('ApiKeyController', async () => {
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

		await db.close();
	});

	it('create (normal and duplicate case)', async () => {
		const response = await fetch('http://localhost:3000/api-key', {
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
		const db = (new Database());
		const dbApiKey = await db.get(ApiKey, `
			SELECT * FROM "ApiKey" WHERE "id" = \${id};
		`, { id: responseData.id });
		await db.close();

		expect(dbApiKey).not.toBe(null);
		expect((<ApiKey>dbApiKey).key).not.toBe('');
	});

	it('create (validation errors)', async () => {
		const response = await fetch('http://localhost:3000/api-key', {
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

	it('create (incorrect email)', async () => {
		const response = await fetch('http://localhost:3000/api-key', {
			method: 'POST',
			body: JSON.stringify({
				email: 'wrongemail@example.com',
				password: '123456',
			}),
		});
		expect(response.status).toBe(403);
	});

	it('create (incorrect password)', async () => {
		const response = await fetch('http://localhost:3000/api-key', {
			method: 'POST',
			body: JSON.stringify({
				email: 'unittest@example.com',
				password: 'wrong password',
			}),
		});
		expect(response.status).toBe(403);
	});

	it('get the api key object from the credentials', async () => {
		const uuid = uuidv4();
		const db = (new Database());
		// Note: the inserted data should be cleaned properly because there is a casdace delete
		const apiKey = <ApiKey>await db.get(ApiKey, `
			INSERT INTO "ApiKey" ("id", "key", "userId", "createdAt", "expiresAt")
			VALUES (\${id}, \${key}, \${userId}, \${createdAt}, \${expiresAt})
			RETURNING *;
		`, {
			id: uuid,
			key: ApiKey.generateKey(),
			userId: user.id,
			createdAt: new Date(),
			expiresAt: ApiKey.createExpiryDate(new Date()),
		});
		await db.close();

		const response = await fetch('http://localhost:3000/api-key', {
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
