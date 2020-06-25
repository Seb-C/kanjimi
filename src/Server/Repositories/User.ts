import Language from 'Common/Types/Language';
import { Request } from 'express';
import * as PgPromise from 'pg-promise';
import UserModel from 'Common/Models/User';
import * as Crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';

export default class User {
	private db: PgPromise.IDatabase<void>;

	constructor (db: PgPromise.IDatabase<void>) {
		this.db = db;
	}

	async getById (id: string): Promise<UserModel|null> {
		const result = await this.db.oneOrNone(`
			SELECT *
			FROM "User"
			WHERE "id" = \${id};
		`, { id });
		if (!result) {
			return null;
		} else {
			return new UserModel(result);
		}
	}

	async getByEmail (email: string): Promise<UserModel|null> {
		const result = await this.db.oneOrNone(`
			SELECT *
			FROM "User"
			WHERE "email" = \${email};
		`, { email });
		if (!result) {
			return null;
		} else {
			return new UserModel(result);
		}
	}

	async getByApiKey (key: string): Promise<UserModel|null> {
		const result = await this.db.oneOrNone(`
			SELECT "User".*
			FROM "ApiKey"
			INNER JOIN "User" ON "User"."id" = "ApiKey"."userId"
			WHERE "ApiKey"."key" = \${key};
		`, { key });
		if (!result) {
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
		return this.db.tx(async (transaction: PgPromise.ITask<void>) => {
			const uuid = uuidv4();
			const result = await transaction.oneOrNone(`
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
					\${id},
					\${email},
					\${emailVerified},
					\${emailVerificationKey},
					\${password},
					\${passwordResetKey},
					\${passwordResetKeyExpiresAt},
					\${languages},
					\${romanReading},
					\${jlpt},
					\${createdAt}
				)
				RETURNING *;
			`, {
				...attributes,
				id: uuid,
				password: this.hashPassword(uuid, attributes.password),
				createdAt: new Date(),
			});

			const user = new UserModel(result);

			if (transactionCallback !== null) {
				await transactionCallback(user);
			}

			return user;
		});
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
			id: uuid,
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

		const result = await this.db.oneOrNone(`
			UPDATE "User"
			SET ${
				allowedFieldsInSqlQuery
					.filter(fieldName => attributes.hasOwnProperty(fieldName))
					.map(fieldName => `"${fieldName}" = \${${fieldName}}`)
					.join(',')
			}
			WHERE "id" = \${id}
			RETURNING *;
		`, params);

		return new UserModel(result);
	}

	async deleteByEmail (email: string): Promise<void> {
		await this.db.none('DELETE FROM "User" WHERE "email" = ${email};', { email });
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
