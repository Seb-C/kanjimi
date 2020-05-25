import Language from 'Common/Types/Language';
import { Response } from 'express';
import { Request } from 'Server/Request';
import * as Ajv from 'ajv';
import Database from 'Server/Database/Database';
import UserRepository from 'Server/Repository/User';
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

export const create = (db: Database) => async (request: Request, response: Response) => {
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



		// Generate test SMTP service account from ethereal.email
		// Only needed if you don't have a real mail account for testing
		let testAccount = await NodeMailer.createTestAccount();

		let transporter = NodeMailer.createTransport({
			host: 'smtp.ethereal.email',
			port: 587,
			secure: false,
			auth: {
				user: testAccount.user,
				pass: testAccount.pass,
			},
		});

		let info = await transporter.sendMail({
			from: '"Kanjimi" <contact@kanjimi.com>',
			to: "test@example.com",
			subject: "Hello ✔",
			text: "Hello world?",
			html: "<b>Hello world?</b>",
		});

		console.log("Message sent: %s", info.messageId);
		console.log("Preview URL: %s", NodeMailer.getTestMessageUrl(info));



























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
		jlpt: {
			type: ['integer', 'null'],
			minimum: 1,
			maximum: 5,
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
