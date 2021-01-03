import Language from 'Common/Types/Language';
import { Request } from 'express';
import {
	sql,
	sqlJoin,
	PgSqlDatabase,
	CrudRepository,
	NotFoundError,
	QueryIdentifier,
} from 'kiss-orm';
import UserModel from 'Common/Models/User';
import * as Crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';

type Params = {
	id: string,
	email: string,
	emailVerified: boolean,
	emailVerificationKey: string|null,
	password: string,
	passwordResetKey: string|null,
	passwordResetKeyExpiresAt: Date|null,
	languages: Language[],
	romanReading: boolean,
	jlpt: number|null,
	createdAt: Date,
};

type AllowedParams = Omit<Params, 'id' | 'createdAt'>;

export default class User extends CrudRepository<UserModel, Params, string> {
	constructor (database: PgSqlDatabase) {
		super({
			database,
			table: 'User',
			primaryKey: 'id',
			model: UserModel,
		});
	}

	async getByEmail (email: string): Promise<UserModel> {
		const result = await this.search(sql`"email" = ${email}`);
		if (result.length === 0) {
			throw new NotFoundError(`Did not find a User record for the email "${email}".`);
		} else {
			return this.createModelFromAttributes(result[0]);
		}
	}

	async getByApiKey (key: string): Promise<UserModel> {
		const result = await this.database.query(sql`
			SELECT "User".*
			FROM "ApiKey"
			INNER JOIN "User" ON "User"."id" = "ApiKey"."userId"
			WHERE "ApiKey"."key" = ${key};
		`);
		if (result.length === 0) {
			throw new NotFoundError(`Did not find a User record for the api key "${key}".`);
		} else {
			return this.createModelFromAttributes(result[0]);
		}
	}

	// TODO replace the null return with a proper exception handling?
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

		try {
			const user = await this.getByApiKey(key);
			return user;
		} catch (error) {
			if (error instanceof NotFoundError) {
				return null;
			} else {
				throw error;
			}
		}
	}

	async create (
		attributes: AllowedParams,
		transactionCallback: ((user: UserModel) => Promise<void>)|null = null,
	): Promise<UserModel> {
		return this.database.sequence(async sequenceDb => {
			await sequenceDb.query(sql`BEGIN;`);

			try {
				const uuid = uuidv4();

				const entries = Object.entries({
					...attributes,
					id: uuid,
					createdAt: new Date(),
					password: this.hashPassword(uuid, attributes.password),
				});
				const fields = entries.map(([key, _]: [string, any]) => sql`${new QueryIdentifier(key)}`);
				const values = entries.map(([_, val]: [string, any]) => sql`${val}`);

				const results = await sequenceDb.query(sql`
					INSERT INTO "User" (${sqlJoin(fields, sql`, `)})
					VALUES (${sqlJoin(values, sql`, `)})
					RETURNING *;
				`);

				const user = await this.createModelFromAttributes(results[0]);

				if (transactionCallback !== null) {
					await transactionCallback(user);
				}

				await sequenceDb.query(sql`COMMIT;`);

				return user;
			} catch (error) {
				await sequenceDb.query(sql`ROLLBACK;`);
				throw error;
			}
		});
	}

	async update(user: UserModel, attributes: Partial<AllowedParams>): Promise<UserModel> {
		const params = {
			...attributes,
		};
		if (params.password) {
			params.password = this.hashPassword(user.id, params.password);
		}

		return super.update(user, params);
	}

	async deleteByEmail (email: string): Promise<void> {
		await this.database.query(sql`DELETE FROM "User" WHERE "email" = ${email};`);
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
