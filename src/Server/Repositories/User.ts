import Language from 'Common/Types/Language';
import { Request } from 'express';
import { sql, sqlJoin, PgSqlDatabase } from 'kiss-orm';
import UserModel from 'Common/Models/User';
import * as Crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';

export default class User {
	private db: PgSqlDatabase;

	constructor (db: PgSqlDatabase) {
		this.db = db;
	}

	async getById (id: string): Promise<UserModel|null> {
		const result = await this.db.query(sql`
			SELECT *
			FROM "User"
			WHERE "id" = ${id};
		`);
		if (result.length === 0) {
			return null;
		} else {
			return new UserModel(result);
		}
	}

	async getByEmail (email: string): Promise<UserModel|null> {
		const result = await this.db.query(sql`
			SELECT *
			FROM "User"
			WHERE "email" = ${email};
		`);
		if (result.length === 0) {
			return null;
		} else {
			return new UserModel(result);
		}
	}

	async getByApiKey (key: string): Promise<UserModel|null> {
		const result = await this.db.query(sql`
			SELECT "User".*
			FROM "ApiKey"
			INNER JOIN "User" ON "User"."id" = "ApiKey"."userId"
			WHERE "ApiKey"."key" = ${key};
		`);
		if (result.length === 0) {
			return null;
		} else {
			return new UserModel(result);
		}
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

	async create (
		attributes: {
			email: string,
			emailVerified: boolean,
			emailVerificationKey: string|null,
			password: string,
			passwordResetKey: string|null,
			passwordResetKeyExpiresAt: Date|null,
			languages: Language[],
			romanReading: boolean,
			jlpt: number|null,
		},
		transactionCallback: ((user: UserModel) => Promise<void>)|null = null,
	): Promise<UserModel> {
		await this.db.query(sql`BEGIN;`);

		try {
			const uuid = uuidv4();
			const result = await this.db.query(sql`
				INSERT INTO "User" (
					"id",
					"email",
					"emailVerified",
					"emailVerificationKey",
					"password",
					"passwordResetKey",
					"passwordResetKeyExpiresAt",
					"languages",
					"romanReading",
					"jlpt",
					"createdAt"
				) VALUES (
					${uuid},
					${attributes.email},
					${attributes.emailVerified},
					${attributes.emailVerificationKey},
					${this.hashPassword(uuid, attributes.password)},
					${attributes.passwordResetKey},
					${attributes.passwordResetKeyExpiresAt},
					${attributes.languages},
					${attributes.romanReading},
					${attributes.jlpt},
					${new Date()}
				)
				RETURNING *;
			`);

			const user = new UserModel(result[0]);

			if (transactionCallback !== null) {
				await transactionCallback(user);
			}

			await this.db.query(sql`COMMIT;`);

			return user;
		} catch (error) {
			await this.db.query(sql`ROLLBACK;`);
			throw error;
		}
	}

	async updateById (uuid: string, attributes: {
		password?: string,
		passwordResetKey?: string|null,
		passwordResetKeyExpiresAt?: Date|null,
		emailVerified?: boolean,
		emailVerificationKey?: string|null,
		languages?: Language[],
		romanReading?: boolean,
		jlpt?: number|null,
	}): Promise<UserModel> {
		const params = {
			...attributes,
		};
		if (params.password) {
			params.password = this.hashPassword(uuid, params.password);
		}

		const allowedFieldsInSqlQuery = [
			'password',
			'passwordResetKey',
			'passwordResetKeyExpiresAt',
			'emailVerified',
			'emailVerificationKey',
			'languages',
			'romanReading',
			'jlpt',
		];

		const result = await this.db.query(sql`
			UPDATE "User"
			SET ${sqlJoin((
				allowedFieldsInSqlQuery
					.filter(fieldName => attributes.hasOwnProperty(fieldName))
					.map(fieldName => sql`"${fieldName}" = ${fieldName}`)
			), sql`, `)}
			WHERE "id" = ${uuid}
			RETURNING *;
		`);

		return new UserModel(result);
	}

	async deleteByEmail (email: string): Promise<void> {
		await this.db.query(sql`DELETE FROM "User" WHERE "email" = ${email};`);
	}

	hashPassword (uuid: string, password: string): string {
		const hash = Crypto.createHash('sha256');
		hash.update(password + uuid);
		return hash.digest('base64');
	}

	generateEmailVerificationKey(): string {
		return Crypto.randomBytes(64).toString('base64');
	}

	generatePasswordRenewalKey(): {
		passwordResetKey: string,
		passwordResetKeyExpiresAt: Date,
	} {
		const expiresAt = new Date();
		expiresAt.setHours(expiresAt.getHours() + 1);

		return {
			passwordResetKey: Crypto.randomBytes(64).toString('base64'),
			passwordResetKeyExpiresAt: expiresAt,
		};
	}
}
