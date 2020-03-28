import 'jasmine';
import { create, get } from 'Client/Api/Routes/ApiKey';
import ApiKey from 'Common/Models/ApiKey';
import User from 'Common/Models/User';
import fetch from 'node-fetch';
import ValidationError from 'Client/Api/Errors/Validation';
import ForbiddenError from 'Client/Api/Errors/Forbidden';
import Database from 'Server/Database/Database';
import { v4 as uuidv4 } from 'uuid';

let user: User;

describe('Client ApiKey', () => {
	beforeEach(async () => {
		(<any>global).fetch = fetch;

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

	it('create (normal case)', async () => {
		const result = await create({
			email: 'unittest@example.com',
			password: '123456',
		});

		expect(result).toBeInstanceOf(ApiKey);
		// No need to test further this response because it is already done in the models and API tests
	});

	it('create (validation error case)', async () => {
		let error;
		try {
			await create({
				email: 'not an email',
				password: '123456',
			});
		} catch (e) {
			error = e;
		}

		expect(error).toBeInstanceOf(ValidationError);
	});

	it('create (invalid credentials case)', async () => {
		let error;
		try {
			await create({
				email: 'invalidemail@example.com',
				password: '123456',
			});
		} catch (e) {
			error = e;
		}

		expect(error).toBeInstanceOf(ForbiddenError);
	});

	it('get (normal case)', async () => {
		const uuid = uuidv4();
		const db = (new Database());
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

		const resultApiKey = await get(apiKey.key);

		expect(resultApiKey).toEqual(apiKey);
	});

	it('get (invalid token case)', async () => {
		let error;
		try {
			await get(ApiKey.generateKey());
		} catch (e) {
			error = e;
		}

		expect(error).toBeInstanceOf(ForbiddenError);
	});
});
