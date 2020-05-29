import 'jasmine';
import UserRepository from 'Server/Repositories/User';
import User from 'Common/Models/User';
import Language from 'Common/Types/Language';
import { Request } from 'express';
import { v4 as uuidv4 } from 'uuid';

describe('UserRepository', async function() {
	it('getById', async function() {
		const uuid = uuidv4();
		await this.getDatabase().exec(`
			INSERT INTO "User" ("id", "email", "emailVerified", "emailVerificationKey", "password", "languages", "romanReading", "jlpt", "createdAt")
			VALUES (\${uuid}, 'unittest@example.com', FALSE, NULL, 'password', ARRAY['fr'], TRUE, 2, CURRENT_TIMESTAMP);
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
		await this.getDatabase().exec(`
			INSERT INTO "User" ("id", "email", "emailVerified", "emailVerificationKey", "password", "languages", "romanReading", "jlpt", "createdAt")
			VALUES (\${uuid}, 'unittest@example.com', FALSE, NULL, 'password', ARRAY['fr'], FALSE, 2, CURRENT_TIMESTAMP);
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
		await this.getDatabase().exec(`
			INSERT INTO "User" ("id", "email", "emailVerified", "emailVerificationKey", "password", "languages", "romanReading", "jlpt", "createdAt")
			VALUES (\${uuid}, 'unittest@example.com', FALSE, NULL, 'password', ARRAY['fr'], FALSE, 2, CURRENT_TIMESTAMP);
		`, { uuid });
		await this.getDatabase().exec(`
			INSERT INTO "ApiKey" ("id", "key", "userId", "createdAt", "expiresAt")
			VALUES (\${id}, 'fakeapikey', \${userId}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
		`, {
			id: uuidv4(),
			userId: uuid,
		});
		const userRepository = new UserRepository(this.getDatabase());
		const user = await userRepository.getByApiKey('fakeapikey');

		expect(user).not.toBe(null);
		expect((<User>user)).toBeInstanceOf(User);
		expect((<User>user).id).toBe(uuid);
		expect((<User>user).email).toBe('unittest@example.com');
		expect((<User>user).romanReading).toBe(false);
		expect((<User>user).jlpt).toBe(2);
	});

	it('getFromRequest', async function() {
		const uuid = uuidv4();
		await this.getDatabase().exec(`
			INSERT INTO "User" ("id", "email", "emailVerified", "emailVerificationKey", "password", "languages", "romanReading", "jlpt", "createdAt")
			VALUES (\${uuid}, 'unittest@example.com', FALSE, NULL, 'password', ARRAY['fr'], TRUE, 2, CURRENT_TIMESTAMP);
		`, { uuid });
		await this.getDatabase().exec(`
			INSERT INTO "ApiKey" ("id", "key", "userId", "createdAt", "expiresAt")
			VALUES (\${id}, 'fakeapikey', \${userId}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
		`, {
			id: uuidv4(),
			userId: uuid,
		});
		const userRepository = new UserRepository(this.getDatabase());
		const user = await userRepository.getFromRequest(<Request><any>{
			headers: {
				authorization: 'Bearer fakeapikey',
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
		const user = await userRepository.create({
			email: 'unittest@example.com',
			emailVerified: true,
			emailVerificationKey: 'test key',
			password: '123456',
			languages: [Language.FRENCH],
			romanReading: true,
			jlpt: 1,
		});
		const dbUser = await this.getDatabase().get(User, `
			SELECT * FROM "User" WHERE "email" = 'unittest@example.com';
		`);

		expect(dbUser).toEqual(user);
		expect(dbUser).not.toBe(null);
		expect(user).toBeInstanceOf(User);
		expect(user.email).toBe('unittest@example.com');
		expect(user.emailVerified).toBe(true);
		expect(user.emailVerificationKey).toBe('test key');
		expect(user.password).not.toBe('123456');
		expect(user.password).toBe(userRepository.hashPassword(user.id, '123456'));
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
		await this.getDatabase().exec(`
			INSERT INTO "User" ("id", "email", "emailVerified", "emailVerificationKey", "password", "languages", "romanReading", "jlpt", "createdAt")
			VALUES (\${uuid}, 'unittest@example.com', FALSE, NULL, \${password}, ARRAY['fr'], FALSE, NULL, CURRENT_TIMESTAMP);
		`, { uuid, password });
		const user = await userRepository.updateById(uuid, {
			emailVerified: true,
			emailVerificationKey: 'test key',
			password: 'qwerty',
			languages: [Language.ENGLISH, Language.GERMAN],
			romanReading: true,
			jlpt: null,
		});
		const dbUser = await this.getDatabase().get(User, `
			SELECT * FROM "User" WHERE "email" = 'unittest@example.com';
		`);

		expect(user).toBeInstanceOf(User);
		expect(dbUser).toEqual(user);
		expect(user.emailVerified).toBe(true);
		expect(user.emailVerificationKey).toBe('test key');
		expect(user.password).not.toBe(password);
		expect(user.password).toBe(userRepository.hashPassword(uuid, 'qwerty'));
		expect(user.languages.length).toBe(2);
		expect(user.languages[0]).toBe(Language.ENGLISH);
		expect(user.languages[1]).toBe(Language.GERMAN);
	});

	it('deleteByEmail', async function() {
		const uuid = uuidv4();
		await this.getDatabase().exec(`
			INSERT INTO "User" ("id", "email", "emailVerified", "emailVerificationKey", "password", "languages", "romanReading", "jlpt", "createdAt")
			VALUES (\${uuid}, 'unittest@example.com', FALSE, NULL, 'password', ARRAY['fr'], TRUE, NULL, CURRENT_TIMESTAMP);
		`, { uuid });
		const userRepository = new UserRepository(this.getDatabase());
		await userRepository.deleteByEmail('unittest@example.com');
		const dbUser = await this.getDatabase().get(User, `
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
});