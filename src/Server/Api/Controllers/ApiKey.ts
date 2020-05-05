import { Response } from 'express';
import { Request } from 'Server/Request';
import * as Ajv from 'ajv';
import Database from 'Server/Database/Database';
import User from 'Common/Models/User';
import UserRepository from 'Server/Repository/User';
import ApiKeyRepository from 'Server/Repository/ApiKey';

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

export const create = (db: Database) => async (request: Request, response: Response) => {
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
		return response.status(403).json('Invalid user or password');
	}

	try {
		const apiKeyRepository = new ApiKeyRepository(db);
		const apiKey = await apiKeyRepository.create(<User>user);

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
	const apiKey = await (new ApiKeyRepository(db)).getFromRequest(request);
	if (apiKey === null) {
		return response.status(403).json('Invalid api key');
	}

	return response.json(apiKey.toApi());
};
