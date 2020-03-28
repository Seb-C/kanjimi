import Language from 'Common/Types/Language';
import { Request } from 'express';
import Database from 'Server/Database/Database';
import UserModel from 'Common/Models/User';
import { v4 as uuidv4 } from 'uuid';

export default class User {
	private db: Database;

	constructor (db: Database) {
		this.db = db;
	}

	async getById (id: string): Promise<UserModel|null> {
		return this.db.get(UserModel, 'SELECT * FROM "User" WHERE id = ${id};', { id });
	}

	async getByEmail (email: string): Promise<UserModel|null> {
		return this.db.get(UserModel, 'SELECT * FROM "User" WHERE email = ${email};', { email });
	}

	async getByApiKey (key: string): Promise<UserModel|null> {
		return this.db.get(UserModel, `
			SELECT "User".*
			FROM "ApiKey"
			INNER JOIN "User" ON "User"."id" = "ApiKey"."userId"
			WHERE "ApiKey"."key" = \${key};
		`, { key });
	}

	async getFromRequest (request: Request): Promise<UserModel|null> {
		if (!request.headers['authorization']) {
			return null;
		}

		const authHeaderPrefix = 'Bearer ';
		const header = request.headers['authorization'];
		if (header.substring(0, authHeaderPrefix.length) !== authHeaderPrefix) {
			return null;
		}

		const key = header.substring(authHeaderPrefix.length);
		return this.getByApiKey(key);
	}

	async create (email: string, password: string, languages: Language[]): Promise<UserModel> {
		const uuid = uuidv4();
		return <UserModel>await this.db.get(UserModel, `
			INSERT INTO "User" ("id", "email", "emailVerified", "password", "languages", "createdAt")
			VALUES (\${id}, \${email}, FALSE, \${password}, \${languages}, \${createdAt})
			RETURNING *;
		`, {
			id: uuid,
			email,
			password: UserModel.hashPassword(uuid, password),
			languages,
			createdAt: new Date(),
		});
	}

	async deleteByEmail (email: string): Promise<void> {
		await this.db.exec('DELETE FROM "User" WHERE "email" = ${email};', { email });
	}
}
