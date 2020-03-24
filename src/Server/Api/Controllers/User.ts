import Language from 'Common/Types/Language';
import { Request, Response } from 'express';
import * as Ajv from 'ajv';
import ValidationError from 'Server/Api/ValidationError';
import Database from 'Server/Database/Database';

const createUserValidator = new Ajv({ allErrors: true }).compile({
	type: 'object',
	required: ['email', 'password', 'languages'],
	additionalProperties: false,
	properties: {
		email: {
			type: 'string',
			format: 'email',
		},
		password: {
			type: 'string',
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
	},
});

export const create = async (request: Request, response: Response) => {
	if (!createUserValidator(request.body)) {
		throw new ValidationError(<Ajv.ErrorObject[]>createUserValidator.errors);
	}

	const db = request.app.get('db');
	const user = await db.get(User, `
		INSERT INTO "User" ("email", "emailVerified", "password", "languages", "createdAt")
		VALUES (\${email}, FALSE, \${password}, \${languages}, CURRENT_TIMESTAMP)
		RETURNING *;
	`, {
		email: request.body.email,
		password: User.hashPassword(request.body.password),
		languages: request.body.languages,
	});

	response.json(user.toApi());
};