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

	it('get', async function() {
		const uuid = uuidv4();
		await this.db.query(sql`
			INSERT INTO "ApiKey" ("id", "key", "userId", "createdAt", "expiresAt")
			VALUES (${uuid}, 'fakeapikey', ${user.id}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
		`);
		const apiKeyRepository = new ApiKeyRepository(this.db);
		const apiKey = await apiKeyRepository.get(uuid);
		expect(apiKey).toBeInstanceOf(ApiKey);
		expect(apiKey.id).toBe(uuid);
		expect(apiKey.userId).toBe(user.id);
		expect(apiKey.key).toBe('fakeapikey');
	});

	it('getByKey', async function() {
		const uuid = uuidv4();
		await this.db.query(sql`
			INSERT INTO "ApiKey" ("id", "key", "userId", "createdAt", "expiresAt")
			VALUES (${uuid}, 'fakeapikey', ${user.id}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
		`);
		const apiKeyRepository = new ApiKeyRepository(this.db);
		const apiKey = await apiKeyRepository.getByKey('fakeapikey');
		expect(apiKey).toBeInstanceOf(ApiKey);
		expect(apiKey.id).toBe(uuid);
		expect(apiKey.userId).toBe(user.id);
		expect(apiKey.key).toBe('fakeapikey');
	});
	it('getByKey - not found', async function() {
		let error = null;
		try {
			const apiKeyRepository = new ApiKeyRepository(this.db);
			await apiKeyRepository.getByKey('wrongapikey');
		} catch (e) {
			error = e;
		}

		expect(error).not.toBeNull();
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

		expect(apiKey).toBeInstanceOf(ApiKey);
		expect(apiKey.id).toBe(uuid);
		expect(apiKey.userId).toBe(user.id);
		expect(apiKey.key).toBe('fakeapikey');
	});
	it('getFromRequest - not found', async function() {
		let error = null;
		try {
			const apiKeyRepository = new ApiKeyRepository(this.db);
			await apiKeyRepository.getFromRequest(<Request><any>{
				headers: {
					authorization: 'Bearer wrongapikey',
				},
			});
		} catch (e) {
			error = e;
		}

		expect(error).not.toBeNull();
	});

	it('createFromUser', async function() {
		const apiKeyRepository = new ApiKeyRepository(this.db);
		const apiKey = await apiKeyRepository.createFromUser(user);
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
		const apiKey2 = await apiKeyRepository.createFromUser(user);
		expect(apiKey2.key).not.toEqual(apiKey.key);
	});
});
