import Language from 'Common/Types/Language';
import { Request, Response } from 'express';
import * as Ajv from 'ajv';
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
