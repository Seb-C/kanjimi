import Language from 'Common/Types/Language';
import { Response } from 'express';
import { Request } from 'Server/Request';
import * as Ajv from 'ajv';
import * as PgPromise from 'pg-promise';
import UserRepository from 'Server/Repositories/User';
import User from 'Common/Models/User';
import * as NodeMailer from 'nodemailer';

export const get = (db: PgPromise.IDatabase<void>) => async (request: Request, response: Response) => {
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
export const create = (db: PgPromise.IDatabase<void>, mailer: NodeMailer.Transporter) => async (request: Request, response: Response, next: Function) => {
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
			passwordResetKey: null,
			passwordResetKeyExpiresAt: null,
		}, async (user: User) => {
			// Cannot send the email before creating the account because it would allow to spam duplicate emails
			try {
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
						+ "\r\n"
						+ "Thanks,\r\n"
						+ "\r\n"
						+ "Kanjimi"
					),
				});
			} catch (error) {
				// Setting it here because we cannot return from the callback
				response.status(500).json('Error while sending the validation email.');
				throw error;
			}
		});

		return response.json(user.toApi());
	} catch (exception) {
		if (exception.constraint === 'User_email_unique') {
			return response.status(409).json(
				'A member is already registered with this email',
			);
		} else if(response.headersSent) {
			console.error(exception);
		} else if(!response.headersSent) {
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
export const verifyEmail = (db: PgPromise.IDatabase<void>) => async (request: Request, response: Response, next: Function) => {
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
			return response.status(403).json('The verification key is invalid.');
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
	dependencies: {
		password: ['oldPassword'],
	},
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
		password: {
			type: 'string',
			minLength: 1,
		},
		oldPassword: {
			type: 'string',
			minLength: 1,
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
export const update = (db: PgPromise.IDatabase<void>) => async (request: Request, response: Response, next: Function) => {
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

		if (
			request.body.password
			&& requestedUser.password !== userRepository.hashPassword(
				requestedUser.id,
				request.body.oldPassword,
			)
		) {
			return response.status(403).json('The old password is invalid');
		}

		const updatedUser = await userRepository.updateById(requestedUser.id, {
			...request.body,
			oldPassword: undefined,
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

const requestResetPasswordRequestValidator = new Ajv({ allErrors: true }).compile({
	type: 'object',
	required: ['email'],
	additionalProperties: false,
	properties: {
		email: {
			type: 'string',
			minLength: 1,
			format: 'email',
		},
	},
});
export const requestResetPassword = (db: PgPromise.IDatabase<void>, mailer: NodeMailer.Transporter) => async (request: Request, response: Response, next: Function) => {
	if (!requestResetPasswordRequestValidator(request.body)) {
		return response.status(422).json(requestResetPasswordRequestValidator.errors);
	}

	const userRepository = new UserRepository(db);

	try {
		const user = await userRepository.getByEmail(request.body.email);
		if (
			user !== null
			&& user.emailVerified
			&& (
				user.passwordResetKeyExpiresAt === null
				|| new Date() > user.passwordResetKeyExpiresAt
			)
		) {
			const {
				passwordResetKey,
				passwordResetKeyExpiresAt,
			} = userRepository.generatePasswordRenewalKey();

			// Sending the email before so that we don't modify the database if it fails
			try {
				await mailer.sendMail({
					to: user.email,
					subject: 'Reset your password',
					text: (
						+ "We received a request to reset the password of your Kanjimi account.\r\n"
						+ "To do so, please click on the following link and set the new password:\r\n"
						+ "\r\n"
						+ `${process.env.KANJIMI_WWW_URL}/app/reset-password?userId=${user.id}&passwordResetKey=${passwordResetKey}\r\n`
						+ "\r\n"
						+ "This link will expire in 1 hour. If you did not request this, please ignore this message.\r\n"
						+ "\r\n"
						+ "Thanks,\r\n"
						+ "\r\n"
						+ "Kanjimi"
					),
				});
			} catch (error) {
				console.error(error);
				return response.status(500).json('Error while sending the reset password email.');
			}

			await userRepository.updateById(user.id, {
				passwordResetKey,
				passwordResetKeyExpiresAt,
			});
		}

		// Sending the same neutral response in every case for security
		return response.json('If this address exist, it will receive an email with instructions to set a new password.');
	} catch (error) {
		return next(error);
	}
};

const resetPasswordValidator = new Ajv({ allErrors: true }).compile({
	type: 'object',
	required: ['passwordResetKey', 'password'],
	additionalProperties: false,
	minProperties: 1,
	properties: {
		passwordResetKey: {
			type: 'string',
			minLength: 1,
		},
		password: {
			type: 'string',
			minLength: 1,
		},
	},
});
export const resetPassword = (db: PgPromise.IDatabase<void>) => async (request: Request, response: Response, next: Function) => {
	if (!resetPasswordValidator(request.body)) {
		return response.status(422).json(resetPasswordValidator.errors);
	}

	const userRepository = new UserRepository(db);

	try {
		const requestedUser = await userRepository.getById(request.params.userId);
		if (requestedUser === null) {
			return response.status(404).json('User not found');
		}
		if (request.body.passwordResetKey !== requestedUser.passwordResetKey) {
			return response.status(403).json('The key is invalid');
		}
		if (
			requestedUser.passwordResetKeyExpiresAt !== null
			&& requestedUser.passwordResetKeyExpiresAt < new Date()
		) {
			return response.status(403).json('This key has expired');
		}

		const updatedUser = await userRepository.updateById(requestedUser.id, {
			password: request.body.password,
			passwordResetKey: null,
			passwordResetKeyExpiresAt: null,
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
