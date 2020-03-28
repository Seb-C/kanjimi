import Language from 'Common/Types/Language';
import { Request, Response } from 'express';
import * as Ajv from 'ajv';
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
