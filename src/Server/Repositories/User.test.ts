import 'jasmine';
import UserRepository from 'Server/Repositories/User';
import ApiKeyRepository from 'Server/Repositories/ApiKey';
import User from 'Common/Models/User';
import Language from 'Common/Types/Language';
import { sql } from 'kiss-orm';
import { Request } from 'express';
import { v4 as uuidv4 } from 'uuid';

describe('UserRepository', async function() {
	it('get', async function() {
		const uuid = uuidv4();
		await this.db.query(sql`
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
				${uuid},
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
		`);
		const userRepository = new UserRepository(this.db);
		const user = await userRepository.get(uuid);

		expect((<User>user)).toBeInstanceOf(User);
		expect((<User>user).id).toBe(uuid);
		expect((<User>user).email).toBe('unittest@example.com');
		expect((<User>user).romanReading).toBe(true);
		expect((<User>user).jlpt).toBe(2);
	});

	it('getByEmail', async function() {
		const uuid = uuidv4();
		await this.db.query(sql`
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
				${uuid},
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
		`);
		const userRepository = new UserRepository(this.db);
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
		await this.db.query(sql`
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
				${uuid},
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
		`);
		const apiKeyRepository = new ApiKeyRepository(this.db);
		const userRepository = new UserRepository(this.db);
		const apiKey = await apiKeyRepository.createFromUser(await userRepository.get(uuid));
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
		await this.db.query(sql`
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
				${uuid},
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
		`);
		const userRepository = new UserRepository(this.db);
		const apiKeyRepository = new ApiKeyRepository(this.db);
		const apiKey = await apiKeyRepository.createFromUser(await userRepository.get(uuid));
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
		const userRepository = new UserRepository(this.db);
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
			(await this.db.query(sql`
				SELECT * FROM "User" WHERE "email" = 'unittest@example.com';
			`))[0]
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

	it('create with a successfull callback', async function() {
		const userRepository = new UserRepository(this.db);
		const user = await userRepository.create({ ...this.testUser }, async (user: User) => {
			expect(user).toBeInstanceOf(User);
		});

		const dbUsers = await this.db.query(sql`
			SELECT * FROM "User" WHERE "email" = 'unittest@example.com';
		`);
		expect(dbUsers.length).not.toBe(0);
		expect(dbUsers[0].id).toEqual(user.id);
	});
	it('create with a failed callback', async function() {
		const userRepository = new UserRepository(this.db);
		try {
			await userRepository.create({ ...this.testUser }, async (user: User) => {
				expect(user).toBeInstanceOf(User);
				throw new Error('Testing failure');
			});
		} catch (e) {}

		const dbUsers = await this.db.query(sql`
			SELECT * FROM "User" WHERE "email" = 'unittest@example.com';
		`);
		expect(dbUsers.length).toBe(0);
	});
	it('create does not callback if failed', async function() {
		const userRepository = new UserRepository(this.db);
		await userRepository.create({ ...this.testUser });
		const callback = jasmine.createSpy('callback');
		try {
			await userRepository.create({ ...this.testUser }, callback);
		} catch (e) {}

		expect(callback).not.toHaveBeenCalled();
	});

	it('updateById', async function() {
		const userRepository = new UserRepository(this.db);
		const uuid = uuidv4();
		const password = userRepository.hashPassword(uuid, '123456');
		const date = new Date();
		await this.db.query(sql`
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
				${uuid},
				'unittest@example.com',
				FALSE,
				NULL,
				${password},
				NULL,
				NULL,
				ARRAY['fr'],
				FALSE,
				NULL,
				CURRENT_TIMESTAMP
			);
		`);
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
			(await this.db.query(sql`
				SELECT * FROM "User" WHERE "email" = 'unittest@example.com';
			`))[0]
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
		await this.db.query(sql`
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
				${uuid},
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
		`);
		const userRepository = new UserRepository(this.db);
		await userRepository.deleteByEmail('unittest@example.com');
		const dbUsers = await this.db.query(sql`
			SELECT * FROM "User" WHERE "email" = 'unittest@example.com';
		`);

		expect(dbUsers.length).toBe(0);
	});

	it('hashPassword', async function() {
		const userRepository = new UserRepository(this.db);
		expect(userRepository.hashPassword('a', 'a')).toEqual(userRepository.hashPassword('a', 'a'));
		expect(userRepository.hashPassword('a', 'a')).not.toEqual(userRepository.hashPassword('b', 'a'));
		expect(userRepository.hashPassword('a', 'a')).not.toEqual(userRepository.hashPassword('a', 'b'));
	});

	it('generateEmailVerificationKey', async function() {
		const userRepository = new UserRepository(this.db);
		expect(userRepository.generateEmailVerificationKey()).not.toEqual(userRepository.generateEmailVerificationKey());
		expect(userRepository.generateEmailVerificationKey()).not.toBeNull();
		expect(userRepository.generateEmailVerificationKey().length).not.toEqual(0);
	});

	it('generatePasswordRenewalKey', async function() {
		const userRepository = new UserRepository(this.db);
		expect(userRepository.generatePasswordRenewalKey().passwordResetKey).not.toEqual(
			userRepository.generatePasswordRenewalKey().passwordResetKey,
		);
		expect(userRepository.generatePasswordRenewalKey().passwordResetKey).not.toBeNull();
		expect(userRepository.generatePasswordRenewalKey().passwordResetKey.length).not.toEqual(0);

		expect(userRepository.generatePasswordRenewalKey().passwordResetKeyExpiresAt > new Date()).toEqual(true);
	});
});
