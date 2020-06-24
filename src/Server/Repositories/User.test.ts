import 'jasmine';
import UserRepository from 'Server/Repositories/User';
import ApiKeyRepository from 'Server/Repositories/ApiKey';
import User from 'Common/Models/User';
import Language from 'Common/Types/Language';
import { Request } from 'express';
import { v4 as uuidv4 } from 'uuid';

describe('UserRepository', async function() {
	it('getById', async function() {
		const uuid = uuidv4();
		await this.getDatabase().none(`
			INSERT INTO "User" (
				"id",
				"email",
				"emailVerified",
				"emailVerificationKey",
				"password",
				"passwordResetKey",
				"passwordResetKeyExpiresAt",
				"languages",
				"romanReading",
				"jlpt",
				"createdAt"
			) VALUES (
				\${uuid},
				'unittest@example.com',
				FALSE,
				NULL,
				'password',
				NULL,
				NULL,
				ARRAY['fr'],
				TRUE,
				2,
				CURRENT_TIMESTAMP
			);
		`, { uuid });
		const userRepository = new UserRepository(this.getDatabase());
		const user = await userRepository.getById(uuid);

		expect(user).not.toBe(null);
		expect((<User>user)).toBeInstanceOf(User);
		expect((<User>user).id).toBe(uuid);
		expect((<User>user).email).toBe('unittest@example.com');
		expect((<User>user).romanReading).toBe(true);
		expect((<User>user).jlpt).toBe(2);
	});

	it('getByEmail', async function() {
		const uuid = uuidv4();
		await this.getDatabase().none(`
			INSERT INTO "User" (
				"id",
				"email",
				"emailVerified",
				"emailVerificationKey",
				"password",
				"passwordResetKey",
				"passwordResetKeyExpiresAt",
				"languages",
				"romanReading",
				"jlpt",
				"createdAt"
			) VALUES (
				\${uuid},
				'unittest@example.com',
				FALSE,
				NULL,
				'password',
				NULL,
				NULL,
				ARRAY['fr'],
				FALSE,
				2,
				CURRENT_TIMESTAMP
			);
		`, { uuid });
		const userRepository = new UserRepository(this.getDatabase());
		const user = await userRepository.getByEmail('unittest@example.com');

		expect(user).not.toBe(null);
		expect((<User>user)).toBeInstanceOf(User);
		expect((<User>user).id).toBe(uuid);
		expect((<User>user).email).toBe('unittest@example.com');
		expect((<User>user).romanReading).toBe(false);
		expect((<User>user).jlpt).toBe(2);
	});

	it('getByApiKey', async function() {
		const uuid = uuidv4();
		await this.getDatabase().none(`
			INSERT INTO "User" (
				"id",
				"email",
				"emailVerified",
				"emailVerificationKey",
				"password",
				"passwordResetKey",
				"passwordResetKeyExpiresAt",
				"languages",
				"romanReading",
				"jlpt",
				"createdAt"
			) VALUES (
				\${uuid},
				'unittest@example.com',
				FALSE,
				NULL,
				'password',
				NULL,
				NULL,
				ARRAY['fr'],
				FALSE,
				2,
				CURRENT_TIMESTAMP
			);
		`, { uuid });
		const apiKeyRepository = new ApiKeyRepository(this.getDatabase());
		const apiKey = await apiKeyRepository.create(uuid);
		const userRepository = new UserRepository(this.getDatabase());
		const user = await userRepository.getByApiKey(apiKey.key);

		expect(user).not.toBe(null);
		expect((<User>user)).toBeInstanceOf(User);
		expect((<User>user).id).toBe(uuid);
		expect((<User>user).email).toBe('unittest@example.com');
		expect((<User>user).romanReading).toBe(false);
		expect((<User>user).jlpt).toBe(2);
	});

	it('getFromRequest', async function() {
		const uuid = uuidv4();
		await this.getDatabase().none(`
			INSERT INTO "User" (
				"id",
				"email",
				"emailVerified",
				"emailVerificationKey",
				"password",
				"passwordResetKey",
				"passwordResetKeyExpiresAt",
				"languages",
				"romanReading",
				"jlpt",
				"createdAt"
			) VALUES (
				\${uuid},
				'unittest@example.com',
				FALSE,
				NULL,
				'password',
				NULL,
				NULL,
				ARRAY['fr'],
				TRUE,
				2,
				CURRENT_TIMESTAMP
			);
		`, { uuid });
		const apiKeyRepository = new ApiKeyRepository(this.getDatabase());
		const apiKey = await apiKeyRepository.create(uuid);
		const userRepository = new UserRepository(this.getDatabase());
		const user = await userRepository.getFromRequest(<Request><any>{
			headers: {
				authorization: 'Bearer ' + apiKey.key,
			},
		});

		expect(user).not.toBe(null);
		expect((<User>user)).toBeInstanceOf(User);
		expect((<User>user).id).toBe(uuid);
		expect((<User>user).email).toBe('unittest@example.com');
		expect((<User>user).romanReading).toBe(true);
		expect((<User>user).jlpt).toBe(2);
	});

	it('create', async function() {
		const userRepository = new UserRepository(this.getDatabase());
		const date = new Date();
		const user = await userRepository.create({
			email: 'unittest@example.com',
			emailVerified: true,
			emailVerificationKey: 'test email key',
			password: '123456',
			passwordResetKey: 'test password key',
			passwordResetKeyExpiresAt: date,
			languages: [Language.FRENCH],
			romanReading: true,
			jlpt: 1,
		});
		const dbUser = new User(
			await this.getDatabase().oneOrNone(`
				SELECT * FROM "User" WHERE "email" = 'unittest@example.com';
			`)
		);

		expect(dbUser).toEqual(user);
		expect(user).toBeInstanceOf(User);
		expect(user.email).toBe('unittest@example.com');
		expect(user.emailVerified).toBe(true);
		expect(user.emailVerificationKey).toBe('test email key');
		expect(user.password).not.toBe('123456');
		expect(user.password).toBe(userRepository.hashPassword(user.id, '123456'));
		expect(user.passwordResetKey).toBe('test password key');
		expect(user.passwordResetKeyExpiresAt).toEqual(date);
		expect(user.id).not.toBe('');
		expect(user.languages.length).toBe(1);
		expect(user.languages[0]).toBe(Language.FRENCH);
		expect(user.romanReading).toBe(true);
		expect(user.jlpt).toBe(1);
	});

	it('updateById', async function() {
		const userRepository = new UserRepository(this.getDatabase());
		const uuid = uuidv4();
		const password = userRepository.hashPassword(uuid, '123456');
		const date = new Date();
		await this.getDatabase().none(`
			INSERT INTO "User" (
				"id",
				"email",
				"emailVerified",
				"emailVerificationKey",
				"password",
				"passwordResetKey",
				"passwordResetKeyExpiresAt",
				"languages",
				"romanReading",
				"jlpt",
				"createdAt"
			) VALUES (
				\${uuid},
				'unittest@example.com',
				FALSE,
				NULL,
				\${password},
				NULL,
				NULL,
				ARRAY['fr'],
				FALSE,
				NULL,
				CURRENT_TIMESTAMP
			);
		`, { uuid, password });
		const user = await userRepository.updateById(uuid, {
			emailVerified: true,
			emailVerificationKey: 'test email key',
			password: 'qwerty',
			passwordResetKey: 'test password key',
			passwordResetKeyExpiresAt: date,
			languages: [Language.ENGLISH, Language.GERMAN],
			romanReading: true,
			jlpt: null,
		});
		const dbUser = new User(
			await this.getDatabase().oneOrNone(`
				SELECT * FROM "User" WHERE "email" = 'unittest@example.com';
			`)
		);

		expect(user).toBeInstanceOf(User);
		expect(dbUser).toEqual(user);
		expect(user.emailVerified).toBe(true);
		expect(user.emailVerificationKey).toBe('test email key');
		expect(user.password).not.toBe(password);
		expect(user.password).toBe(userRepository.hashPassword(uuid, 'qwerty'));
		expect(user.passwordResetKey).toBe('test password key');
		expect(user.passwordResetKeyExpiresAt).toEqual(date);
		expect(user.languages.length).toBe(2);
		expect(user.languages[0]).toBe(Language.ENGLISH);
		expect(user.languages[1]).toBe(Language.GERMAN);
	});

	it('deleteByEmail', async function() {
		const uuid = uuidv4();
		await this.getDatabase().none(`
			INSERT INTO "User" (
				"id",
				"email",
				"emailVerified",
				"emailVerificationKey",
				"password",
				"passwordResetKey",
				"passwordResetKeyExpiresAt",
				"languages",
				"romanReading",
				"jlpt",
				"createdAt"
			) VALUES (
				\${uuid},
				'unittest@example.com',
				FALSE,
				NULL,
				'password',
				NULL,
				NULL,
				ARRAY['fr'],
				TRUE,
				NULL,
				CURRENT_TIMESTAMP
			);
		`, { uuid });
		const userRepository = new UserRepository(this.getDatabase());
		await userRepository.deleteByEmail('unittest@example.com');
		const dbUser = await this.getDatabase().oneOrNone(`
			SELECT * FROM "User" WHERE "email" = 'unittest@example.com';
		`);

		expect(dbUser).toBe(null);
	});

	it('hashPassword', async function() {
		const userRepository = new UserRepository(this.getDatabase());
		expect(userRepository.hashPassword('a', 'a')).toEqual(userRepository.hashPassword('a', 'a'));
		expect(userRepository.hashPassword('a', 'a')).not.toEqual(userRepository.hashPassword('b', 'a'));
		expect(userRepository.hashPassword('a', 'a')).not.toEqual(userRepository.hashPassword('a', 'b'));
	});

	it('generateEmailVerificationKey', async function() {
		const userRepository = new UserRepository(this.getDatabase());
		expect(userRepository.generateEmailVerificationKey()).not.toEqual(userRepository.generateEmailVerificationKey());
		expect(userRepository.generateEmailVerificationKey()).not.toBeNull();
		expect(userRepository.generateEmailVerificationKey().length).not.toEqual(0);
	});

	it('generatePasswordRenewalKey', async function() {
		const userRepository = new UserRepository(this.getDatabase());
		expect(userRepository.generatePasswordRenewalKey().passwordResetKey).not.toEqual(
			userRepository.generatePasswordRenewalKey().passwordResetKey,
		);
		expect(userRepository.generatePasswordRenewalKey().passwordResetKey).not.toBeNull();
		expect(userRepository.generatePasswordRenewalKey().passwordResetKey.length).not.toEqual(0);

		expect(userRepository.generatePasswordRenewalKey().passwordResetKeyExpiresAt > new Date()).toEqual(true);
	});
});
