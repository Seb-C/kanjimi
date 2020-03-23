import Language from 'Common/Types/Language';
import { Request, Response } from 'express';
import * as Ajv from 'ajv';
import ValidationError from 'Server/Api/ValidationError';
import Database from 'Server/Database/Database';

const createUserValidator = new Ajv({ allErrors: true }).compile({
	type: 'object',
	required: ['data'],
	properties: {
		data: {
			type: 'object',
			required: ['type', 'attributes'],
			properties: {
				type: {
					type: 'string',
					enum: ['User'],
				},
				attributes: {
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
				},
			},
		},
	},
});

export const create = async (request: Request, response: Response) => {
	if (!createUserValidator(request.body)) {
		throw new ValidationError(<Ajv.ErrorObject[]>createUserValidator.errors);
	}

	const user: User = unserializer.fromJsonApi(request.body);
	const db = request.app.get('db');

	await db.exec(`
		INSERT INTO "User" (email, emailVerified, password, languages, createdAt)
		VALUES (\${email}, FALSE, \${password}, \${languages}, CURRENT_TIMESTAMP);
	`, {
		email: user.email,
		password: User.hashPassword(user.password),
		languages: user.languages,
	});

	response.json(serializer.toJsonApi(user));
};
