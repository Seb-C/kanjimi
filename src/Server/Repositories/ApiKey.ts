import { Request } from 'express';
import { sql, PgSqlDatabase } from 'kiss-orm';
import ApiKeyModel from 'Common/Models/ApiKey';
import * as Crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';

export default class ApiKey {
	private db: PgSqlDatabase;

	constructor (db: PgSqlDatabase) {
		this.db = db;
	}

	async getById (id: string): Promise<ApiKeyModel|null> {
		const result = await this.db.query(sql`SELECT * FROM "ApiKey" WHERE id = ${id};`);
		if (result.length === 0) {
			return null;
		} else {
			return new ApiKeyModel(result);
		}
	}

	async getByKey (key: string): Promise<ApiKeyModel|null> {
		const result = await this.db.query(sql`SELECT * FROM "ApiKey" WHERE key = ${key};`);
		if (result.length === 0) {
			return null;
		} else {
			return new ApiKeyModel(result);
		}
	}

	async getFromRequest (request: Request): Promise<ApiKeyModel|null> {
		if (!request.headers['authorization']) {
			return null;
		}

		const authHeaderPrefix = 'Bearer ';
		const header = request.headers['authorization'];
		if (header.substring(0, authHeaderPrefix.length) !== authHeaderPrefix) {
			return null;
		}

		const key = header.substring(authHeaderPrefix.length);
		return this.getByKey(key);
	}

	async create (userId: string): Promise<ApiKeyModel> {
		const expiresAt = new Date();
		expiresAt.setDate(expiresAt.getDate() + 365);

		const key = Crypto.randomBytes(64).toString('base64');
		const result = await this.db.query(sql`
			INSERT INTO "ApiKey" ("id", "key", "userId", "createdAt", "expiresAt")
			VALUES (${uuidv4()}, ${key}, ${userId}, ${new Date()}, ${expiresAt})
			RETURNING *;
		`);

		return new ApiKeyModel(result[0]);
	}
}
