import { Request, Response } from 'express';
import * as Ajv from 'ajv';
import Database from 'Server/Database/Database';
import ApiKey from 'Common/Models/ApiKey';
import User from 'Common/Models/User';
import { v4 as uuidv4 } from 'uuid';
import { getApiKeyFromRequest } from 'Server/Api/Authentication';

const createApiKeyValidator = new Ajv({ allErrors: true }).compile({
	type: 'object',
	required: ['email', 'password'],
	additionalProperties: false,
	properties: {
		email: {
			type: 'string',
			format: 'email',
		},
		password: {
			type: 'string',
		},
	},
});

export const create = (db: Database) => async (request: Request, response: Response) => {
	if (!createApiKeyValidator(request.body)) {
		return response.status(422).json(createApiKeyValidator.errors);
	}

	const user = await db.get(User, `
		SELECT * FROM "User" WHERE email = \${email};
	`, {
		email: request.body.email,
	});
	if (
		user === null
		|| user.password !== User.hashPassword(
			user.id,
			request.body.password,
		)
	) {
		return response.status(403).json('Invalid user or password');
	}

	try {
		const apiKey = <ApiKey>await db.get(ApiKey, `
			INSERT INTO "ApiKey" ("id", "key", "userId", "createdAt", "expiresAt")
			VALUES (\${id}, \${key}, \${userId}, \${createdAt}, \${expiresAt})
			RETURNING *;
		`, {
			id: uuidv4(),
			key: ApiKey.generateKey(),
			userId: (<User>user).id,
			languages: request.body.languages,
			createdAt: new Date(),
			expiresAt: ApiKey.createExpiryDate(new Date()),
		});

		return response.json(apiKey.toApi());
	} catch (exception) {
		if (exception.constraint === 'ApiKey_key_unique') {
			return response.status(500).json('Duplicated key');
		} else {
			throw exception;
		}
	}
};

export const get = (db: Database) => async (request: Request, response: Response) => {
	const apiKey = await getApiKeyFromRequest(db, request);
	if (apiKey === null) {
		return response.status(403).json('Invalid api key');
	}

	return response.json(apiKey.toApi());
};
