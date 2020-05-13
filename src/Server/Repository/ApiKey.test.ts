import 'jasmine';
import Database from 'Server/Database/Database';
import UserRepository from 'Server/Repository/User';
import ApiKeyRepository from 'Server/Repository/ApiKey';
import User from 'Common/Models/User';
import ApiKey from 'Common/Models/ApiKey';
import Language from 'Common/Types/Language';
import { Request } from 'express';
import { v4 as uuidv4 } from 'uuid';

let user: User;

describe('ApiKeyRepository', async () => {
	beforeEach(async () => {
		// Clearing previous run if necessary
		const db = new Database();
		const userRepository = new UserRepository(db);
		await userRepository.deleteByEmail('unittest@example.com');
		user = await userRepository.create({
			email: 'unittest@example.com',
			password: '123456',
			languages: [Language.FRENCH],
			romanReading: false,
		});
		await db.close();
	});

	it('getById', async () => {
		const db = new Database();
		const uuid = uuidv4();
		await db.exec(`
			INSERT INTO "ApiKey" ("id", "key", "userId", "createdAt", "expiresAt")
			VALUES (\${id}, 'fakeapikey', \${userId}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
		`, {
			id: uuid,
			userId: user.id,
		});
		const apiKeyRepository = new ApiKeyRepository(db);
		const apiKey = await apiKeyRepository.getById(uuid);

		expect(apiKey).not.toBe(null);
		expect((<ApiKey>apiKey)).toBeInstanceOf(ApiKey);
		expect((<ApiKey>apiKey).id).toBe(uuid);
		expect((<ApiKey>apiKey).userId).toBe(user.id);
		expect((<ApiKey>apiKey).key).toBe('fakeapikey');

		await db.close();
	});

	it('getByKey', async () => {
		const db = new Database();
		const uuid = uuidv4();
		await db.exec(`
			INSERT INTO "ApiKey" ("id", "key", "userId", "createdAt", "expiresAt")
			VALUES (\${id}, 'fakeapikey', \${userId}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
		`, {
			id: uuid,
			userId: user.id,
		});
		const apiKeyRepository = new ApiKeyRepository(db);
		const apiKey = await apiKeyRepository.getByKey('fakeapikey');

		expect(apiKey).not.toBe(null);
		expect((<ApiKey>apiKey)).toBeInstanceOf(ApiKey);
		expect((<ApiKey>apiKey).id).toBe(uuid);
		expect((<ApiKey>apiKey).userId).toBe(user.id);
		expect((<ApiKey>apiKey).key).toBe('fakeapikey');

		await db.close();
	});

	it('getFromRequest', async () => {
		const db = new Database();
		const uuid = uuidv4();
		await db.exec(`
			INSERT INTO "ApiKey" ("id", "key", "userId", "createdAt", "expiresAt")
			VALUES (\${id}, 'fakeapikey', \${userId}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
		`, {
			id: uuid,
			userId: user.id,
		});
		const apiKeyRepository = new ApiKeyRepository(db);
		const apiKey = await apiKeyRepository.getFromRequest(<Request><any>{
			headers: {
				authorization: 'Bearer fakeapikey',
			},
		});

		expect(apiKey).not.toBe(null);
		expect((<ApiKey>apiKey)).toBeInstanceOf(ApiKey);
		expect((<ApiKey>apiKey).id).toBe(uuid);
		expect((<ApiKey>apiKey).userId).toBe(user.id);
		expect((<ApiKey>apiKey).key).toBe('fakeapikey');

		await db.close();
	});

	it('create', async () => {
		const db = new Database();
		const apiKeyRepository = new ApiKeyRepository(db);
		const apiKey = await apiKeyRepository.create(user);
		const dbApiKey = await db.get(ApiKey, `
			SELECT * FROM "ApiKey" WHERE "userId" = \${userId};
		`, { userId: user.id });

		expect(apiKey.expiresAt > apiKey.createdAt).toEqual(true);
		expect(apiKey.key.length > 32).toEqual(true);
		expect(dbApiKey).toEqual(apiKey);
		expect(dbApiKey).not.toBe(null);
		expect(apiKey).toBeInstanceOf(ApiKey);
		expect(apiKey.key).not.toBe('');
		expect(apiKey.id).not.toBe('');
		expect(apiKey.userId).toBe(user.id);

		// Testing the uniqueness of the generated key
		const apiKey2 = await apiKeyRepository.create(user);
		expect(apiKey2.key).not.toEqual(apiKey.key);

		await db.close();
	});
});
