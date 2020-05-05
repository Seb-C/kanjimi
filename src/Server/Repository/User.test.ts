import 'jasmine';
import Database from 'Server/Database/Database';
import UserRepository from 'Server/Repository/User';
import User from 'Common/Models/User';
import Language from 'Common/Types/Language';
import { Request } from 'express';
import { v4 as uuidv4 } from 'uuid';

describe('UserRepository', async () => {
	beforeEach(async () => {
		// Clearing previous run if necessary
		const db = new Database();
		const userRepository = new UserRepository(db);
		await userRepository.deleteByEmail('unittest@example.com');
		await db.close();
	});

	it('getById', async () => {
		const db = new Database();
		const uuid = uuidv4();
		await db.exec(`
			INSERT INTO "User" ("id", "email", "emailVerified", "password", "languages", "createdAt")
			VALUES (\${uuid}, 'unittest@example.com', FALSE, 'password', ARRAY['fr'], CURRENT_TIMESTAMP);
		`, { uuid });
		const userRepository = new UserRepository(db);
		const user = await userRepository.getById(uuid);

		expect(user).not.toBe(null);
		expect((<User>user)).toBeInstanceOf(User);
		expect((<User>user).id).toBe(uuid);
		expect((<User>user).email).toBe('unittest@example.com');

		await db.close();
	});

	it('getByEmail', async () => {
		const db = new Database();
		const uuid = uuidv4();
		await db.exec(`
			INSERT INTO "User" ("id", "email", "emailVerified", "password", "languages", "createdAt")
			VALUES (\${uuid}, 'unittest@example.com', FALSE, 'password', ARRAY['fr'], CURRENT_TIMESTAMP);
		`, { uuid });
		const userRepository = new UserRepository(db);
		const user = await userRepository.getByEmail('unittest@example.com');

		expect(user).not.toBe(null);
		expect((<User>user)).toBeInstanceOf(User);
		expect((<User>user).id).toBe(uuid);
		expect((<User>user).email).toBe('unittest@example.com');

		await db.close();
	});

	it('getByApiKey', async () => {
		const db = new Database();
		const uuid = uuidv4();
		await db.exec(`
			INSERT INTO "User" ("id", "email", "emailVerified", "password", "languages", "createdAt")
			VALUES (\${uuid}, 'unittest@example.com', FALSE, 'password', ARRAY['fr'], CURRENT_TIMESTAMP);
		`, { uuid });
		await db.exec(`
			INSERT INTO "ApiKey" ("id", "key", "userId", "createdAt", "expiresAt")
			VALUES (\${id}, 'fakeapikey', \${userId}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
		`, {
			id: uuidv4(),
			userId: uuid,
		});
		const userRepository = new UserRepository(db);
		const user = await userRepository.getByApiKey('fakeapikey');

		expect(user).not.toBe(null);
		expect((<User>user)).toBeInstanceOf(User);
		expect((<User>user).id).toBe(uuid);
		expect((<User>user).email).toBe('unittest@example.com');

		await db.close();
	});

	it('getFromRequest', async () => {
		const db = new Database();
		const uuid = uuidv4();
		await db.exec(`
			INSERT INTO "User" ("id", "email", "emailVerified", "password", "languages", "createdAt")
			VALUES (\${uuid}, 'unittest@example.com', FALSE, 'password', ARRAY['fr'], CURRENT_TIMESTAMP);
		`, { uuid });
		await db.exec(`
			INSERT INTO "ApiKey" ("id", "key", "userId", "createdAt", "expiresAt")
			VALUES (\${id}, 'fakeapikey', \${userId}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
		`, {
			id: uuidv4(),
			userId: uuid,
		});
		const userRepository = new UserRepository(db);
		const user = await userRepository.getFromRequest(<Request><any>{
			headers: {
				authorization: 'Bearer fakeapikey',
			},
		});

		expect(user).not.toBe(null);
		expect((<User>user)).toBeInstanceOf(User);
		expect((<User>user).id).toBe(uuid);
		expect((<User>user).email).toBe('unittest@example.com');

		await db.close();
	});

	it('create', async () => {
		const db = new Database();
		const userRepository = new UserRepository(db);
		const user = await userRepository.create('unittest@example.com', '123456', [Language.FRENCH]);
		const dbUser = await db.get(User, `
			SELECT * FROM "User" WHERE "email" = 'unittest@example.com';
		`);

		expect(dbUser).toEqual(user);
		expect(dbUser).not.toBe(null);
		expect(user).toBeInstanceOf(User);
		expect(user.email).toBe('unittest@example.com');
		expect(user.password).not.toBe('123456');
		expect(user.password).toBe(userRepository.hashPassword(user.id, '123456'));
		expect(user.id).not.toBe('');
		expect(user.languages.length).toBe(1);
		expect(user.languages[0]).toBe(Language.FRENCH);

		await db.close();
	});

	it('deleteByEmail', async () => {
		const db = new Database();
		const uuid = uuidv4();
		await db.exec(`
			INSERT INTO "User" ("id", "email", "emailVerified", "password", "languages", "createdAt")
			VALUES (\${uuid}, 'unittest@example.com', FALSE, 'password', ARRAY['fr'], CURRENT_TIMESTAMP);
		`, { uuid });
		const userRepository = new UserRepository(db);
		await userRepository.deleteByEmail('unittest@example.com');
		const dbUser = await db.get(User, `
			SELECT * FROM "User" WHERE "email" = 'unittest@example.com';
		`);

		expect(dbUser).toBe(null);

		await db.close();
	});

	it('hashPassword', async () => {
		const db = new Database();
		const userRepository = new UserRepository(db);
		expect(userRepository.hashPassword('a', 'a')).toEqual(userRepository.hashPassword('a', 'a'));
		expect(userRepository.hashPassword('a', 'a')).not.toEqual(userRepository.hashPassword('b', 'a'));
		expect(userRepository.hashPassword('a', 'a')).not.toEqual(userRepository.hashPassword('a', 'b'));
		await db.close();
	});
});
