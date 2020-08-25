import 'jasmine';
import UserRepository from 'Server/Repositories/User';
import ApiKeyRepository from 'Server/Repositories/ApiKey';
import User from 'Common/Models/User';
import ApiKey from 'Common/Models/ApiKey';
import { sql } from 'kiss-orm';
import { Request } from 'express';
import { v4 as uuidv4 } from 'uuid';

let user: User;

describe('ApiKeyRepository', async function() {
	beforeEach(async function() {
		const userRepository = new UserRepository(this.db);
		user = await userRepository.create({ ...this.testUser });
	});

	it('getById', async function() {
		const uuid = uuidv4();
		await this.db.query(sql`
			INSERT INTO "ApiKey" ("id", "key", "userId", "createdAt", "expiresAt")
			VALUES (${uuid}, 'fakeapikey', ${user.id}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
		`);
		const apiKeyRepository = new ApiKeyRepository(this.db);
		const apiKey = await apiKeyRepository.getById(uuid);

		expect(apiKey).not.toBe(null);
		expect((<ApiKey>apiKey)).toBeInstanceOf(ApiKey);
		expect((<ApiKey>apiKey).id).toBe(uuid);
		expect((<ApiKey>apiKey).userId).toBe(user.id);
		expect((<ApiKey>apiKey).key).toBe('fakeapikey');
	});

	it('getByKey', async function() {
		const uuid = uuidv4();
		await this.db.query(sql`
			INSERT INTO "ApiKey" ("id", "key", "userId", "createdAt", "expiresAt")
			VALUES (${uuid}, 'fakeapikey', ${user.id}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
		`);
		const apiKeyRepository = new ApiKeyRepository(this.db);
		const apiKey = await apiKeyRepository.getByKey('fakeapikey');

		expect(apiKey).not.toBe(null);
		expect((<ApiKey>apiKey)).toBeInstanceOf(ApiKey);
		expect((<ApiKey>apiKey).id).toBe(uuid);
		expect((<ApiKey>apiKey).userId).toBe(user.id);
		expect((<ApiKey>apiKey).key).toBe('fakeapikey');
	});

	it('getFromRequest', async function() {
		const uuid = uuidv4();
		await this.db.query(sql`
			INSERT INTO "ApiKey" ("id", "key", "userId", "createdAt", "expiresAt")
			VALUES (${uuid}, 'fakeapikey', ${user.id}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
		`);
		const apiKeyRepository = new ApiKeyRepository(this.db);
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
	});

	it('create', async function() {
		const apiKeyRepository = new ApiKeyRepository(this.db);
		const apiKey = await apiKeyRepository.create(user.id);
		const dbApiKey = new ApiKey(
			(await this.db.query(sql`
				SELECT * FROM "ApiKey" WHERE "userId" = ${user.id};
			`))[0]
		);

		expect(apiKey.expiresAt > apiKey.createdAt).toEqual(true);
		expect(apiKey.key.length > 32).toEqual(true);
		expect(dbApiKey).toEqual(apiKey);
		expect(apiKey).toBeInstanceOf(ApiKey);
		expect(apiKey.key).not.toBe('');
		expect(apiKey.id).not.toBe('');
		expect(apiKey.userId).toBe(user.id);

		// Testing the uniqueness of the generated key
		const apiKey2 = await apiKeyRepository.create(user.id);
		expect(apiKey2.key).not.toEqual(apiKey.key);
	});
});
