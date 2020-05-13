import Language from 'Common/Types/Language';
import { Response } from 'express';
import { Request } from 'Server/Request';
import * as Ajv from 'ajv';
import Database from 'Server/Database/Database';
import UserRepository from 'Server/Repository/User';

export const get = (db: Database) => async (request: Request, response: Response) => {
	const userRepository = new UserRepository(db);

	const user = await userRepository.getFromRequest(request);
	if (user === null) {
		return response.status(403).json('Invalid api key');
	}
	if (!request.params.userId || request.params.userId !== user.id) {
		return response.status(403).json('You are not allowed access to this object');
	}

	return response.json(user.toApi());
};

const createUserValidator = new Ajv({ allErrors: true }).compile({
	type: 'object',
	required: ['email', 'password', 'languages', 'romanReading'],
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
		languages: {
			type: 'array',
			minItems: 1,
			uniqueItems: true,
			items: {
				type: 'string',
				enum: Object.values(Language),
			},
		},
		romanReading: {
			type: 'boolean',
		},
	},
});

export const create = (db: Database) => async (request: Request, response: Response) => {
	if (!createUserValidator(request.body)) {
		return response.status(422).json(createUserValidator.errors);
	}

	try {
		const userRepository = new UserRepository(db);
		const user = await userRepository.create({ ...request.body });

		return response.json(user.toApi());
	} catch (exception) {
		if (exception.constraint === 'User_email_unique') {
			return response.status(409).json(
				'A member is already registered with this email',
			);
		} else {
			throw exception;
		}
	}
};

const updateUserValidator = new Ajv({ allErrors: true }).compile({
	type: 'object',
	additionalProperties: false,
	minProperties: 1,
	properties: {
		languages: {
			type: 'array',
			minItems: 1,
			uniqueItems: true,
			items: {
				type: 'string',
				enum: Object.values(Language),
			},
		},
		romanReading: {
			type: 'boolean',
		},
	},
});

export const update = (db: Database) => async (request: Request, response: Response) => {
	if (!updateUserValidator(request.body)) {
		return response.status(422).json(updateUserValidator.errors);
	}

	const userRepository = new UserRepository(db);

	const user = await userRepository.getFromRequest(request);
	if (user === null) {
		return response.status(403).json('Invalid api key');
	}
	if (!request.params.userId || request.params.userId !== user.id) {
		return response.status(403).json('You are not allowed access to this object');
	}

	const updatedUser = await userRepository.updateById(user.id, { ...request.body });

	return response.json(updatedUser.toApi());
};
