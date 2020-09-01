import { Request } from 'express';
import {
	sql,
	PgSqlDatabase,
	CrudRepository,
	NotFoundError,
} from 'kiss-orm';
import ApiKeyModel from 'Common/Models/ApiKey';
import UserModel from 'Common/Models/User';
import * as Crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';

type Params = {
	id: string,
	key: string,
	userId: string,
	createdAt: Date,
	expiresAt: Date,
};

export default class ApiKey extends CrudRepository<ApiKeyModel, Params, string> {
	constructor (database: PgSqlDatabase) {
		super({
			database,
			table: 'ApiKey',
			primaryKey: 'id',
			model: ApiKeyModel,
		});
	}

	async getByKey (key: string): Promise<ApiKeyModel> {
		const result = await this.search(sql`"key" = ${key}`);
		if (result.length === 0) {
			throw new NotFoundError(`Did not find an ApiKey record for the key "${key}".`);
		} else {
			return result[0];
		}
	}

	async getFromRequest (request: Request): Promise<ApiKeyModel> {
		if (!request.headers['authorization']) {
			// TODO use a specific validation error type intead of NotFoundError?
			throw new NotFoundError('Please specify the Authorization header');
		}

		const authHeaderPrefix = 'Bearer ';
		const header = request.headers['authorization'];
		if (header.substring(0, authHeaderPrefix.length) !== authHeaderPrefix) {
			// TODO use a specific validation error type intead of NotFoundError?
			throw new NotFoundError('The Authorization header only supports a Bearer token.');
		}

		const key = header.substring(authHeaderPrefix.length);
		return this.getByKey(key);
	}

	async createFromUser (user: UserModel): Promise<ApiKeyModel> {
		const expiresAt = new Date();
		expiresAt.setDate(expiresAt.getDate() + 365);

		const key = Crypto.randomBytes(64).toString('base64');

		return this.create({
			id: uuidv4(),
			userId: user.id,
			createdAt: new Date(),
			key,
			expiresAt,
		});
	}
}
