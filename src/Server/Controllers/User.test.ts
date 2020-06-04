import 'jasmine';
import fetch from 'node-fetch';
import * as Ajv from 'ajv';
import UserRepository from 'Server/Repositories/User';
import ApiKeyRepository from 'Server/Repositories/ApiKey';
import User from 'Common/Models/User';
import Language from 'Common/Types/Language';
import { promises as FileSystem } from 'fs';
import * as QuotedPrintable from 'quoted-printable';

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
		},
		password: {
			type: 'null',
		},
		languages: {
			type: 'array',
			uniqueItems: true,
			items: {
				type: 'string',
			},
		},
		romanReading: {
			type: 'boolean',
		},
		jlpt: {
			type: ['integer', 'null'],
			minimum: 1,
			maximum: 5,
		},
		createdAt: {
			type: 'string',
			format: 'date-time',
		},
	},
});

describe('UserController', async function() {
	it('get (normal case)', async function() {
		const userRepository = new UserRepository(this.getDatabase());
		const apiKeyRepository = new ApiKeyRepository(this.getDatabase());
		const user = await userRepository.create({
			...this.testUser,
			languages: [Language.ENGLISH, Language.SPANISH],
			jlpt: 2,
		});
		const apiKey = await apiKeyRepository.create(user.id);

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
		expect(responseData.emailVerified).toBe(false);
		expect(responseData.languages).toEqual(['en', 'es']);
		expect(responseData.jlpt).toBe(2);
	});

	it('get (authentication errors)', async function() {
		const userRepository = new UserRepository(this.getDatabase());
		const apiKeyRepository = new ApiKeyRepository(this.getDatabase());
		const user = await userRepository.create({ ...this.testUser });
		const user2 = await userRepository.create({
			...this.testUser,
			email: 'unittest2@example.com',
		});
		const apiKey = await apiKeyRepository.create(user.id);

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

	it('create (normal and duplicate case)', async function() {
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
		expect(responseData.emailVerified).toBe(false);
		expect(responseData.languages).toEqual(['en', 'es']);
		expect(responseData.jlpt).toBe(2);

		// Checking the db contents
		const userRepository = new UserRepository(this.getDatabase());
		const dbUser = <User>(await userRepository.getById(responseData.id));

		expect(<User|null>dbUser).not.toBe(null);
		expect(dbUser.id).toBe(responseData.id);
		expect(dbUser.password).not.toBe(null);
		expect(dbUser.password).not.toBe('');
		expect(dbUser.password).not.toBe('123456');
		expect(dbUser.emailVerified).toBe(false);
		expect(dbUser.emailVerificationKey).not.toBeNull();
		expect(dbUser.passwordResetKey).toBeNull();
		expect(dbUser.passwordResetKeyExpiresAt).toBeNull();

		const mails = await FileSystem.readdir('/tmp/mails');
		expect(mails.length).toEqual(1);
		const mail = QuotedPrintable.decode(
			await FileSystem.readFile('/tmp/mails/' + mails[0], { encoding: 'utf-8' })
		);
		expect(mail).toContain('To: unittest@example.com');
		expect(mail).toContain(
			`http://localhost:3000/www/app/verify-email?userId=${dbUser.id}&emailVerificationKey=${dbUser.emailVerificationKey}`
		);

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

	it('create (validation errors)', async function() {
		const response = await fetch('http://localhost:3000/user', {
			method: 'POST',
			body: JSON.stringify({
				emailVerified: true,
				emailVerificationKey: '123',
				passwordResetKey: '123',
				passwordResetKeyExpiresAt: new Date(),
				createdAt: new Date().toISOString(),
			}),
		});
		expect(response.status).toBe(422);
		const responseData = await response.json();

		expect(this.validationErrorResponseValidator(responseData))
			.withContext(JSON.stringify(this.validationErrorResponseValidator.errors))
			.toBe(true);
	});

	it('update (normal case)', async function() {
		const userRepository = new UserRepository(this.getDatabase());
		const apiKeyRepository = new ApiKeyRepository(this.getDatabase());
		const user = await userRepository.create({
			...this.testUser,
			languages: [Language.FRENCH],
			romanReading: false,
			jlpt: 1,
			password: '123456',
		});
		const apiKey = await apiKeyRepository.create(user.id);

		const response = await fetch(`http://localhost:3000/user/${user.id}`, {
			method: 'PATCH',
			headers: {
				Authorization: `Bearer ${apiKey.key}`,
			},
			body: JSON.stringify({
				languages: ['en', 'es'],
				romanReading: true,
				jlpt: 2,
				oldPassword: '123456',
				password: 'qwerty',
			}),
		});
		expect(response.status).toBe(200);
		const responseData = await response.json();

		expect(userResponseValidator(responseData))
			.withContext(JSON.stringify(userResponseValidator.errors))
			.toBe(true);
		expect(responseData.id).toBe(user.id);
		expect(responseData.languages).toEqual(['en', 'es']);
		expect(responseData.jlpt).toBe(2);

		// Checking the db contents
		const dbUser = <User>(await userRepository.getById(responseData.id));

		expect(<User|null>dbUser).not.toBe(null);
		expect(dbUser.languages).toEqual([Language.ENGLISH, Language.SPANISH]);
		expect(dbUser.romanReading).toBe(true);
		expect(dbUser.jlpt).toBe(2);
		expect(dbUser.password).toEqual(userRepository.hashPassword(dbUser.id, 'qwerty'));
	});

	it('update (validation errors)', async function() {
		const userRepository = new UserRepository(this.getDatabase());
		const apiKeyRepository = new ApiKeyRepository(this.getDatabase());
		const user = await userRepository.create({ ...this.testUser });
		const apiKey = await apiKeyRepository.create(user.id);

		const response = await fetch(`http://localhost:3000/user/${user.id}`, {
			method: 'PATCH',
			headers: {
				Authorization: `Bearer ${apiKey.key}`,
			},
			body: JSON.stringify({
				emailVerified: true,
				emailVerificationKey: '123',
				passwordResetKey: '123',
				passwordResetKeyExpiresAt: new Date(),
				createdAt: new Date().toISOString(),
			}),
		});
		expect(response.status).toBe(422);
		const responseData = await response.json();

		expect(this.validationErrorResponseValidator(responseData))
			.withContext(JSON.stringify(this.validationErrorResponseValidator.errors))
			.toBe(true);
	});

	it('update (old password required if new specified)', async function() {
		const userRepository = new UserRepository(this.getDatabase());
		const apiKeyRepository = new ApiKeyRepository(this.getDatabase());
		const user = await userRepository.create({
			...this.testUser,
			password: '123456',
		});
		const apiKey = await apiKeyRepository.create(user.id);

		const response = await fetch(`http://localhost:3000/user/${user.id}`, {
			method: 'PATCH',
			headers: {
				Authorization: `Bearer ${apiKey.key}`,
			},
			body: JSON.stringify({
				password: 'qwerty',
			}),
		});
		expect(response.status).toBe(422);
		const responseData = await response.json();

		expect(this.validationErrorResponseValidator(responseData))
			.withContext(JSON.stringify(this.validationErrorResponseValidator.errors))
			.toBe(true);
	});

	it('update (error if the old password does not match)', async function() {
		const userRepository = new UserRepository(this.getDatabase());
		const apiKeyRepository = new ApiKeyRepository(this.getDatabase());
		const user = await userRepository.create({
			...this.testUser,
			password: '123456',
		});
		const apiKey = await apiKeyRepository.create(user.id);

		const response = await fetch(`http://localhost:3000/user/${user.id}`, {
			method: 'PATCH',
			headers: {
				Authorization: `Bearer ${apiKey.key}`,
			},
			body: JSON.stringify({
				oldPassword: '456789',
				password: 'qwerty',
			}),
		});
		expect(response.status).toBe(403);
	});

	it('update (not found error)', async function() {
		const userRepository = new UserRepository(this.getDatabase());
		const apiKeyRepository = new ApiKeyRepository(this.getDatabase());
		const user = await userRepository.create({ ...this.testUser });
		const apiKey = await apiKeyRepository.create(user.id);

		const response = await fetch(`http://localhost:3000/user/00000000-0000-0000-0000-000000000000`, {
			method: 'PATCH',
			headers: {
				Authorization: `Bearer ${apiKey.key}`,
			},
			body: JSON.stringify({
				romanReading: true,
			}),
		});
		expect(response.status).toBe(404);
	});
	it('update (not found + not a uuid)', async function() {
		const userRepository = new UserRepository(this.getDatabase());
		const apiKeyRepository = new ApiKeyRepository(this.getDatabase());
		const user = await userRepository.create({ ...this.testUser });
		const apiKey = await apiKeyRepository.create(user.id);

		const response = await fetch(`http://localhost:3000/user/wrong_id`, {
			method: 'PATCH',
			headers: {
				Authorization: `Bearer ${apiKey.key}`,
			},
			body: JSON.stringify({
				romanReading: true,
			}),
		});
		expect(response.status).toBe(404);
	});
	it('update (empty id)', async function() {
		const userRepository = new UserRepository(this.getDatabase());
		const apiKeyRepository = new ApiKeyRepository(this.getDatabase());
		const user = await userRepository.create({ ...this.testUser });
		const apiKey = await apiKeyRepository.create(user.id);

		const response = await fetch(`http://localhost:3000/user/`, {
			method: 'PATCH',
			headers: {
				Authorization: `Bearer ${apiKey.key}`,
			},
			body: JSON.stringify({
				romanReading: true,
			}),
		});
		expect(response.status).toBe(404);
	});

	it('update (authentication errors)', async function() {
		const userRepository = new UserRepository(this.getDatabase());
		const apiKeyRepository = new ApiKeyRepository(this.getDatabase());
		const user = await userRepository.create({
			...this.testUser,
			languages: [Language.FRENCH],
		});
		const user2 = await userRepository.create({
			...this.testUser,
			email: 'unittest2@example.com',
			password: '234567',
			languages: [Language.ENGLISH],
		});
		const apiKey = await apiKeyRepository.create(user.id);

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
	});

	it('verifyEmail (normal case)', async function() {
		const userRepository = new UserRepository(this.getDatabase());
		const user = await userRepository.create({
			...this.testUser,
			emailVerified: false,
			emailVerificationKey: 'qwerty',
		});

		const response = await fetch(`http://localhost:3000/user/${user.id}/verify-email`, {
			method: 'PATCH',
			body: JSON.stringify({
				emailVerificationKey: 'qwerty',
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
		expect((<User>dbUser).emailVerified).toBe(true);
		expect((<User>dbUser).emailVerificationKey).toBe(null);
	});

	it('verifyEmail (validation errors)', async function() {
		const userRepository = new UserRepository(this.getDatabase());
		const user = await userRepository.create({
			...this.testUser,
			emailVerified: false,
			emailVerificationKey: 'qwerty',
		});

		const response = await fetch(`http://localhost:3000/user/${user.id}/verify-email`, {
			method: 'PATCH',
			body: JSON.stringify({
				emailVerificationKey: null,
			}),
		});
		expect(response.status).toBe(422);
		const responseData = await response.json();

		expect(this.validationErrorResponseValidator(responseData))
			.withContext(JSON.stringify(this.validationErrorResponseValidator.errors))
			.toBe(true);
	});

	it('verifyEmail (not found error)', async function() {
		const response = await fetch(`http://localhost:3000/user/00000000-0000-0000-0000-000000000000/verify-email`, {
			method: 'PATCH',
			body: JSON.stringify({
				emailVerificationKey: '123456',
			}),
		});
		expect(response.status).toBe(404);
	});
	it('verifyEmail (not found + not a uuid)', async function() {
		const response = await fetch(`http://localhost:3000/user/wrong_id/verify-email`, {
			method: 'PATCH',
			body: JSON.stringify({
				emailVerificationKey: '123456',
			}),
		});
		expect(response.status).toBe(404);
	});
	it('verifyEmail (empty id)', async function() {
		const response = await fetch(`http://localhost:3000/user//verify-email`, {
			method: 'PATCH',
			body: JSON.stringify({
				emailVerificationKey: '123456',
			}),
		});
		expect(response.status).toBe(404);
	});

	it('verifyEmail (already verified error)', async function() {
		const userRepository = new UserRepository(this.getDatabase());
		const user = await userRepository.create({
			...this.testUser,
			emailVerified: true,
			emailVerificationKey: 'qwerty',
		});

		const response = await fetch(`http://localhost:3000/user/${user.id}/verify-email`, {
			method: 'PATCH',
			body: JSON.stringify({
				emailVerificationKey: 'qwerty',
			}),
		});
		expect(response.status).toBe(409);
	});

	it('verifyEmail (wrong key error)', async function() {
		const userRepository = new UserRepository(this.getDatabase());
		const user = await userRepository.create({
			...this.testUser,
			emailVerified: false,
			emailVerificationKey: 'qwerty',
		});

		const response = await fetch(`http://localhost:3000/user/${user.id}/verify-email`, {
			method: 'PATCH',
			body: JSON.stringify({
				emailVerificationKey: 'not qwerty',
			}),
		});
		expect(response.status).toBe(403);
	});

	it('requestResetPassword (normal case)', async function() {
		const userRepository = new UserRepository(this.getDatabase());
		let user = await userRepository.create({
			...this.testUser,
			email: 'unittest@example.com',
			emailVerified: true,
			passwordResetKey: null,
			passwordResetKeyExpiresAt: null,
		});

		const response = await fetch(`http://localhost:3000/user/request-reset-password`, {
			method: 'POST',
			body: JSON.stringify({
				email: 'unittest@example.com',
			}),
		});
		expect(response.status).toBe(200);

		// Reloading data from the DB
		user = <User>(await userRepository.getById(user.id));

		expect(user.passwordResetKey).not.toBe(null);
		expect((<string>(user.passwordResetKey)).length > 0).toBe(true);

		expect(user.passwordResetKeyExpiresAt).not.toBe(null);
		expect(<Date>(user.passwordResetKeyExpiresAt) > new Date()).toBe(true);
	});

	it('requestResetPassword (validation error)', async function() {
		const response = await fetch(`http://localhost:3000/user/request-reset-password`, {
			method: 'POST',
			body: JSON.stringify({}),
		});
		expect(response.status).toBe(422);
		const responseData = await response.json();

		expect(this.validationErrorResponseValidator(responseData))
			.withContext(JSON.stringify(this.validationErrorResponseValidator.errors))
			.toBe(true);
	});

	it('requestResetPassword (unknown user)', async function() {
		const response = await fetch(`http://localhost:3000/user/request-reset-password`, {
			method: 'POST',
			body: JSON.stringify({
				email: 'nobody@example.com',
			}),
		});
		expect(response.status).toBe(200);
	});

	it('requestResetPassword (non-verified email)', async function() {
		const userRepository = new UserRepository(this.getDatabase());
		let user = await userRepository.create({
			...this.testUser,
			email: 'unittest@example.com',
			emailVerified: false,
			passwordResetKey: null,
			passwordResetKeyExpiresAt: null,
		});

		const response = await fetch(`http://localhost:3000/user/request-reset-password`, {
			method: 'POST',
			body: JSON.stringify({
				email: 'nobody@example.com',
			}),
		});
		expect(response.status).toBe(200);

		// Reloading data from the DB
		user = <User>(await userRepository.getById(user.id));

		expect(user.passwordResetKey).toBe(null);
		expect(user.passwordResetKeyExpiresAt).toBe(null);
	});

	it('requestResetPassword (password reset already requested)', async function() {
		const expiresAt = new Date();
		expiresAt.setHours(expiresAt.getHours() + 24);

		const userRepository = new UserRepository(this.getDatabase());
		let user = await userRepository.create({
			...this.testUser,
			email: 'unittest@example.com',
			emailVerified: true,
			passwordResetKey: 'test',
			passwordResetKeyExpiresAt: expiresAt,
		});

		const response = await fetch(`http://localhost:3000/user/request-reset-password`, {
			method: 'POST',
			body: JSON.stringify({
				email: 'unittest@example.com',
			}),
		});
		expect(response.status).toBe(200);

		// Reloading data from the DB
		user = <User>(await userRepository.getById(user.id));

		expect(user.passwordResetKey).toBe('test');
		expect(user.passwordResetKeyExpiresAt).toEqual(expiresAt);
	});

	it('resetPassword (normal case)', async function() {
		const expiresAt = new Date();
		expiresAt.setHours(expiresAt.getHours() + 24);

		const userRepository = new UserRepository(this.getDatabase());
		const user = await userRepository.create({
			...this.testUser,
			password: '123456',
			passwordResetKey: 'test_key',
			passwordResetKeyExpiresAt: expiresAt,
		});

		const response = await fetch(`http://localhost:3000/user/${user.id}/reset-password`, {
			method: 'PATCH',
			body: JSON.stringify({
				password: 'qwerty',
				passwordResetKey: 'test_key',
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

		expect((<User>dbUser).password).toEqual(userRepository.hashPassword(user.id, 'qwerty'));
		expect((<User>dbUser).passwordResetKey).toBe(null);
		expect((<User>dbUser).passwordResetKeyExpiresAt).toBe(null);
	});

	it('resetPassword (validation errors)', async function() {
		const userRepository = new UserRepository(this.getDatabase());
		const user = await userRepository.create({ ...this.testUser });

		const response = await fetch(`http://localhost:3000/user/${user.id}/reset-password`, {
			method: 'PATCH',
			body: JSON.stringify({}),
		});
		expect(response.status).toBe(422);
		const responseData = await response.json();

		expect(this.validationErrorResponseValidator(responseData))
			.withContext(JSON.stringify(this.validationErrorResponseValidator.errors))
			.toBe(true);
	});

	it('resetPassword (not found error)', async function() {
		const response = await fetch(`http://localhost:3000/user/00000000-0000-0000-0000-000000000000/reset-password`, {
			method: 'PATCH',
			body: JSON.stringify({
				password: 'qwerty',
				passwordResetKey: 'test_key',
			}),
		});
		expect(response.status).toBe(404);
	});
	it('resetPassword (not found + not a uuid)', async function() {
		const response = await fetch(`http://localhost:3000/user/wrong_id/reset-password`, {
			method: 'PATCH',
			body: JSON.stringify({
				password: 'qwerty',
				passwordResetKey: 'test_key',
			}),
		});
		expect(response.status).toBe(404);
	});
	it('resetPassword (empty id)', async function() {
		const response = await fetch(`http://localhost:3000/user//reset-password`, {
			method: 'PATCH',
			body: JSON.stringify({
				password: 'qwerty',
				passwordResetKey: 'test_key',
			}),
		});
		expect(response.status).toBe(404);
	});

	it('resetPassword (invalid key error)', async function() {
		const expiresAt = new Date();
		expiresAt.setHours(expiresAt.getHours() + 24);

		const userRepository = new UserRepository(this.getDatabase());
		const user = await userRepository.create({
			...this.testUser,
			password: '123456',
			passwordResetKey: 'test_key',
			passwordResetKeyExpiresAt: expiresAt,
		});

		const response = await fetch(`http://localhost:3000/user/${user.id}/reset-password`, {
			method: 'PATCH',
			body: JSON.stringify({
				password: 'qwerty',
				passwordResetKey: 'wrong_key',
			}),
		});
		expect(response.status).toBe(403);

		// Reloading the user from the database
		const user2 = await userRepository.getById(user.id);

		expect(user2).toEqual(user);
	});

	it('resetPassword (expired key error)', async function() {
		const expiresAt = new Date();
		expiresAt.setHours(expiresAt.getHours() - 1);

		const userRepository = new UserRepository(this.getDatabase());
		const user = await userRepository.create({
			...this.testUser,
			password: '123456',
			passwordResetKey: 'test_key',
			passwordResetKeyExpiresAt: expiresAt,
		});

		const response = await fetch(`http://localhost:3000/user/${user.id}/reset-password`, {
			method: 'PATCH',
			body: JSON.stringify({
				password: 'qwerty',
				passwordResetKey: 'test_key',
			}),
		});
		expect(response.status).toBe(403);

		// Reloading the user from the database
		const user2 = await userRepository.getById(user.id);

		expect(user2).toEqual(user);
	});
});
