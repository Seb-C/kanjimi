import Language from 'Common/Types/Language';
import { Response } from 'express';
import { Request } from 'Server/Request';
import * as Ajv from 'ajv';
import Database from 'Server/Database/Database';
import UserRepository from 'Server/Repositories/User';
import * as NodeMailer from 'nodemailer';

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
	required: ['email', 'password', 'languages', 'romanReading', 'jlpt'],
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
		jlpt: {
			type: ['integer', 'null'],
			minimum: 1,
			maximum: 5,
		},
	},
});
export const create = (db: Database, mailer: NodeMailer.Transporter) => async (request: Request, response: Response, next: Function) => {
	if (!createUserValidator(request.body)) {
		return response.status(422).json(createUserValidator.errors);
	}

	try {
		const userRepository = new UserRepository(db);
		const emailVerificationKey = userRepository.generateEmailVerificationKey();

		const user = await userRepository.create({
			...request.body,
			emailVerified: false,
			emailVerificationKey,
		});

		// TODO add a transaction and a rollback if the email throws an exception
		// Cannot send the email before creating the account because it would allow to spam duplicate emails
		await mailer.sendMail({
			to: user.email,
			subject: 'Please confirm your account creation',
			text: (
				"Welcome to Kanjimi!\r\n"
				+ "\r\n"
				+ "Your new account has successfully been created.\r\n"
				+ "To confirm your email address, please click on the following link:\r\n"
				+ "\r\n"
				+ `${process.env.KANJIMI_WWW_URL}/app/verify-email?userId=${user.id}&emailVerificationKey=${emailVerificationKey}\r\n`
				+ "\r\n"
				+ "If you did not request this or if this is a mistake, please ignore this message.\r\n"
			),
		});

		return response.json(user.toApi());
	} catch (exception) {
		if (exception.constraint === 'User_email_unique') {
			return response.status(409).json(
				'A member is already registered with this email',
			);
		} else {
			return next(exception);
		}
	}
};

const createEmailVerificationRequestValidator = new Ajv({ allErrors: true }).compile({
	type: 'object',
	required: ['emailVerificationKey'],
	additionalProperties: false,
	properties: {
		emailVerificationKey: {
			type: 'string',
			minLength: 1,
		},
	},
});
export const verifyEmail = (db: Database) => async (request: Request, response: Response, next: Function) => {
	if (!createEmailVerificationRequestValidator(request.body)) {
		return response.status(422).json(createEmailVerificationRequestValidator.errors);
	}

	const userRepository = new UserRepository(db);

	try {
		const user = await userRepository.getById(request.params.userId);
		if (user === null) {
			return response.status(404).json('User not found');
		}
		if (user.emailVerified) {
			return response.status(409).json('This email have already been verified.');
		}
		if (user.emailVerificationKey !== request.body.emailVerificationKey) {
			return response.status(403).json('You are not allowed access to this object');
		}

		const updatedUser = await userRepository.updateById(user.id, {
			emailVerified: true,
			emailVerificationKey: null,
		});

		return response.json(updatedUser.toApi());
	} catch (error) {
		if (error.routine === 'string_to_uuid') {
			return response.status(404).json('Invalid id');
		} else {
			return next(error);
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
		jlpt: {
			type: ['integer', 'null'],
			minimum: 1,
			maximum: 5,
		},
	},
});
export const update = (db: Database) => async (request: Request, response: Response, next: Function) => {
	if (!updateUserValidator(request.body)) {
		return response.status(422).json(updateUserValidator.errors);
	}

	const userRepository = new UserRepository(db);

	const authenticatedUser = await userRepository.getFromRequest(request);
	if (authenticatedUser === null) {
		return response.status(403).json('Invalid api key');
	}

	try {
		const requestedUser = await userRepository.getById(request.params.userId);
		if (requestedUser === null) {
			return response.status(404).json('User not found');
		}
		if (requestedUser.id !== authenticatedUser.id) {
			return response.status(403).json('You are not allowed access to this object');
		}

		const updatedUser = await userRepository.updateById(requestedUser.id, { ...request.body });

		return response.json(updatedUser.toApi());
	} catch (error) {
		if (error.routine === 'string_to_uuid') {
			return response.status(404).json('Invalid id');
		} else {
			return next(error);
		}
	}
};