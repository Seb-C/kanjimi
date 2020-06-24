import { Request } from 'express';
import * as PgPromise from 'pg-promise';
import ApiKeyModel from 'Common/Models/ApiKey';
import * as Crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';

export default class ApiKey {
	private db: PgPromise.IDatabase<void>;

	constructor (db: PgPromise.IDatabase<void>) {
		this.db = db;
	}

	async getById (id: string): Promise<ApiKeyModel|null> {
		const result = await this.db.oneOrNone('SELECT * FROM "ApiKey" WHERE id = ${id};', { id });
		if (!result) {
			return null;
		} else {
			return new ApiKeyModel(result);
		}
	}

	async getByKey (key: string): Promise<ApiKeyModel|null> {
		const result = await this.db.oneOrNone('SELECT * FROM "ApiKey" WHERE key = ${key};', { key });
		if (!result) {
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

		const result = await this.db.oneOrNone(`
			INSERT INTO "ApiKey" ("id", "key", "userId", "createdAt", "expiresAt")
			VALUES (\${id}, \${key}, \${userId}, \${createdAt}, \${expiresAt})
			RETURNING *;
		`, {
			id: uuidv4(),
			key: Crypto.randomBytes(64).toString('base64'),
			userId,
			createdAt: new Date(),
			expiresAt,
		});

		return new ApiKeyModel(result);
	}
}
