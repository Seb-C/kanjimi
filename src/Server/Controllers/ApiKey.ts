import { Response } from 'express';
import { Request } from 'Server/Request';
import * as Ajv from 'ajv';
import Database from 'Server/Database/Database';
import User from 'Common/Models/User';
import UserRepository from 'Server/Repositories/User';
import ApiKeyRepository from 'Server/Repositories/ApiKey';

const createApiKeyValidator = new Ajv({ allErrors: true }).compile({
	type: 'object',
	required: ['email', 'password'],
	additionalProperties: false,
	properties: {
		email: {
			type: 'string',
			minLength: 1,
			format: 'email',
		},
		password: {
			type: 'string',
			minLength: 1,
		},
	},
});

export const create = (db: Database) => async (request: Request, response: Response, next: Function) => {
	if (!createApiKeyValidator(request.body)) {
		return response.status(422).json(createApiKeyValidator.errors);
	}

	const userRepository = new UserRepository(db);
	const user = await userRepository.getByEmail(request.body.email);
	if (
		user === null
		|| user.password !== userRepository.hashPassword(
			user.id,
			request.body.password,
		)
	) {
		return response.status(403).json('Invalid email or password');
	}
	if (!user.emailVerified) {
		return response.status(403).json('The account has not been verified yet. Please check your emails.');
	}

	try {
		const apiKeyRepository = new ApiKeyRepository(db);
		const apiKey = await apiKeyRepository.create((<User>user).id);

		return response.json(apiKey.toApi());
	} catch (exception) {
		if (exception.constraint === 'ApiKey_key_unique') {
			return response.status(500).json('Duplicated key');
		} else {
			return next(exception);
		}
	}
};

export const get = (db: Database) => async (request: Request, response: Response) => {
	const apiKey = await (new ApiKeyRepository(db)).getFromRequest(request);
	if (apiKey === null) {
		return response.status(403).json('Invalid api key');
	}

	return response.json(apiKey.toApi());
};
