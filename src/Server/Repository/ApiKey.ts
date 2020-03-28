import { Request } from 'express';
import Database from 'Server/Database/Database';
import ApiKeyModel from 'Common/Models/ApiKey';
import User from 'Common/Models/User';
import { v4 as uuidv4 } from 'uuid';

export default class ApiKey {
	private db: Database;

	constructor (db: Database) {
		this.db = db;
	}

	async getById (id: string): Promise<ApiKeyModel|null> {
		return this.db.get(ApiKeyModel, 'SELECT * FROM "ApiKey" WHERE id = ${id};', { id });
	}

	async getByKey (key: string): Promise<ApiKeyModel|null> {
		return this.db.get(ApiKeyModel, 'SELECT * FROM "ApiKey" WHERE key = ${key};', { key });
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

	async create (user: User): Promise<ApiKeyModel> {
		return <ApiKeyModel>await this.db.get(ApiKeyModel, `
			INSERT INTO "ApiKey" ("id", "key", "userId", "createdAt", "expiresAt")
			VALUES (\${id}, \${key}, \${userId}, \${createdAt}, \${expiresAt})
			RETURNING *;
		`, {
			id: uuidv4(),
			key: ApiKeyModel.generateKey(),
			userId: user.id,
			createdAt: new Date(),
			expiresAt: ApiKeyModel.createExpiryDate(new Date()),
		});
	}
}
