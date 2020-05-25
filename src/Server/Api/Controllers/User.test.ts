import 'jasmine';
import fetch from 'node-fetch';
import * as Ajv from 'ajv';
import Database from 'Server/Database/Database';
import UserRepository from 'Server/Repository/User';
import ApiKeyRepository from 'Server/Repository/ApiKey';
import User from 'Common/Models/User';
import Language from 'Common/Types/Language';

const userResponseValidator = new Ajv({ allErrors: true }).compile({
	type: 'object',
	required: [
		'id',
		'email',
		'emailVerified',
		'password',
		'languages',
		'romanReading',
		'jlpt',
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
		romanReading: {
			type: 'boolean',
		},
		jlpt: {
			type: 'integer',
			minimum: 2,
			maximum: 2,
		},
		createdAt: {
			type: 'string',
			format: 'date-time',
		},
	},
});

const validationErrorResponseValidator = new Ajv({ allErrors: true }).compile({
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

describe('UserController', async () => {
	beforeEach(async () => {
		// Clearing previous run if necessary
		const db = new Database();
		const userRepository = new UserRepository(db);
		await userRepository.deleteByEmail('unittest@example.com');
		await userRepository.deleteByEmail('unittest2@example.com');
		await db.close();
	});

	it('get (normal case)', async () => {
		const db = new Database();
		const userRepository = new UserRepository(db);
		const apiKeyRepository = new ApiKeyRepository(db);
		const user = await userRepository.create({
			email: 'unittest@example.com',
			emailVerified: false,
			emailVerificationKey: null,
			password: '123456',
			languages: [Language.ENGLISH, Language.SPANISH],
			romanReading: false,
			jlpt: 2,
		});
		const apiKey = await apiKeyRepository.create(user);
		await db.close();

		const response = await fetch(`http://localhost:3000/user/${user.id}`, {
			method: 'GET',
			headers: {
				Authorization: `Bearer ${apiKey.key}`,
			},
		});
		expect(response.status).toBe(200);
		const responseData = await response.json();

		expect(userResponseValidator(responseData))
			.withContext(JSON.stringify(userResponseValidator.errors))
			.toBe(true);
		expect(responseData.id).toEqual(user.id);
	});

	it('get (authentication errors)', async () => {
		const db = new Database();
		const userRepository = new UserRepository(db);
		const apiKeyRepository = new ApiKeyRepository(db);
		const user = await userRepository.create({
			email: 'unittest@example.com',
			emailVerified: false,
			emailVerificationKey: null,
			password: '123456',
			languages: [Language.FRENCH],
			romanReading: false,
			jlpt: 2,
		});
		const user2 = await userRepository.create({
			email: 'unittest2@example.com',
			emailVerified: false,
			emailVerificationKey: null,
			password: '234567',
			languages: [Language.ENGLISH],
			romanReading: true,
			jlpt: 2,
		});
		const apiKey = await apiKeyRepository.create(user);
		await db.close();

		const response = await fetch(`http://localhost:3000/user/${user2.id}`, {
			method: 'GET',
			headers: {
				Authorization: `Bearer ${apiKey.key}`,
			},
		});
		expect(response.status).toBe(403);

		// Should also fail with a wrong key
		const response2 = await fetch(`http://localhost:3000/user/${user2.id}`, {
			method: 'GET',
			headers: {
				Authorization: `Bearer wrongkey`,
			},
		});
		expect(response2.status).toBe(403);
	});

	it('create (normal and duplicate case)', async () => {
		const response = await fetch('http://localhost:3000/user', {
			method: 'POST',
			body: JSON.stringify({
				email: 'unittest@example.com',
				password: '123456',
				languages: ['en', 'es'],
				romanReading: false,
				jlpt: 2,
			}),
		});
		expect(response.status).toBe(200);
		const responseData = await response.json();

		expect(userResponseValidator(responseData))
			.withContext(JSON.stringify(userResponseValidator.errors))
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
		expect((<User>dbUser).emailVerified).toBe(false);

		// Trying again (it should fail)
		const response2 = await fetch('http://localhost:3000/user', {
			method: 'POST',
			body: JSON.stringify({
				email: 'unittest@example.com',
				password: '123456',
				languages: ['en', 'es'],
				romanReading: false,
				jlpt: 2,
			}),
		});
		expect(response2.status).toBe(409);
	});

	it('create (validation errors)', async () => {
		const response = await fetch('http://localhost:3000/user', {
			method: 'POST',
			body: JSON.stringify({
				emailVerified: true,
				emailVerificationKey: '123',
				createdAt: new Date().toISOString(),
			}),
		});
		expect(response.status).toBe(422);
		const responseData = await response.json();

		expect(validationErrorResponseValidator(responseData))
			.withContext(JSON.stringify(validationErrorResponseValidator.errors))
			.toBe(true);
	});

	it('update (normal case)', async () => {
		const db = new Database();
		const userRepository = new UserRepository(db);
		const apiKeyRepository = new ApiKeyRepository(db);
		const user = await userRepository.create({
			email: 'unittest@example.com',
			emailVerified: false,
			emailVerificationKey: null,
			password: '123456',
			languages: [Language.FRENCH],
			romanReading: false,
			jlpt: 1,
		});
		const apiKey = await apiKeyRepository.create(user);

		const response = await fetch(`http://localhost:3000/user/${user.id}`, {
			method: 'PATCH',
			headers: {
				Authorization: `Bearer ${apiKey.key}`,
			},
			body: JSON.stringify({
				languages: ['en', 'es'],
				romanReading: true,
				jlpt: 2,
			}),
		});
		expect(response.status).toBe(200);
		const responseData = await response.json();

		expect(userResponseValidator(responseData))
			.withContext(JSON.stringify(userResponseValidator.errors))
			.toBe(true);
		expect(responseData.id).toBe(user.id);

		// Checking the db contents
		const dbUser = await userRepository.getById(responseData.id);

		expect(dbUser).not.toBe(null);
		expect((<User>dbUser).languages).toEqual([Language.ENGLISH, Language.SPANISH]);
		expect((<User>dbUser).romanReading).toBe(true);
		expect((<User>dbUser).emailVerified).toBe(false);
		expect((<User>dbUser).jlpt).toBe(2);

		await db.close();
	});

	it('update (validation errors)', async () => {
		const db = new Database();
		const userRepository = new UserRepository(db);
		const apiKeyRepository = new ApiKeyRepository(db);
		const user = await userRepository.create({
			email: 'unittest@example.com',
			emailVerified: false,
			emailVerificationKey: null,
			password: '123456',
			languages: [Language.FRENCH],
			romanReading: false,
			jlpt: 2,
		});
		const apiKey = await apiKeyRepository.create(user);

		const response = await fetch(`http://localhost:3000/user/${user.id}`, {
			method: 'PATCH',
			headers: {
				Authorization: `Bearer ${apiKey.key}`,
			},
			body: JSON.stringify({
				emailVerified: true,
				emailVerificationKey: '123',
				createdAt: new Date().toISOString(),
			}),
		});
		expect(response.status).toBe(422);
		const responseData = await response.json();

		expect(validationErrorResponseValidator(responseData))
			.withContext(JSON.stringify(validationErrorResponseValidator.errors))
			.toBe(true);

		await db.close();
	});

	it('update (authentication errors)', async () => {
		const db = new Database();
		const userRepository = new UserRepository(db);
		const apiKeyRepository = new ApiKeyRepository(db);
		const user = await userRepository.create({
			email: 'unittest@example.com',
			emailVerified: false,
			emailVerificationKey: null,
			password: '123456',
			languages: [Language.FRENCH],
			romanReading: false,
			jlpt: 2,
		});
		const user2 = await userRepository.create({
			email: 'unittest2@example.com',
			emailVerified: false,
			emailVerificationKey: null,
			password: '234567',
			languages: [Language.ENGLISH],
			romanReading: true,
			jlpt: 2,
		});
		const apiKey = await apiKeyRepository.create(user);

		const response = await fetch(`http://localhost:3000/user/${user2.id}`, {
			method: 'PATCH',
			headers: {
				Authorization: `Bearer ${apiKey.key}`,
			},
			body: JSON.stringify({
				languages: ['en', 'es'],
			}),
		});
		expect(response.status).toBe(403);

		// Reloading the user from the database
		const dbUser2 = await userRepository.getById(user2.id);

		expect(dbUser2).not.toBe(null);
		expect((<User>dbUser2).languages).not.toEqual([Language.ENGLISH, Language.SPANISH]);

		// Should also fail with a wrong key
		const response2 = await fetch(`http://localhost:3000/user/${user2.id}`, {
			method: 'PATCH',
			headers: {
				Authorization: `Bearer wrongkey`,
			},
			body: JSON.stringify({
				languages: ['en', 'es'],
			}),
		});
		expect(response2.status).toBe(403);

		await db.close();
	});
});
