import 'jasmine';
import {
	get,
	create,
	verifyEmail,
	update,
	requestResetPassword,
	resetPassword,
} from 'Common/Api/User';
import User from 'Common/Models/User';
import Language from 'Common/Types/Language';
import ValidationError from 'Common/Api/Errors/Validation';
import AuthenticationError from 'Common/Api/Errors/Authentication';
import ConflictError from 'Common/Api/Errors/Conflict';
import NotFoundError from 'Common/Api/Errors/NotFound';
import UserRepository from 'Server/Repositories/User';
import ApiKeyRepository from 'Server/Repositories/ApiKey';

describe('Client User', async function() {
	it('get (normal case)', async function() {
		const userRepository = new UserRepository(this.db);
		const apiKeyRepository = new ApiKeyRepository(this.db);
		const user = await userRepository.create({ ...this.testUser });
		const apiKey = await apiKeyRepository.create(user.id);

		const result = await get(apiKey.key, user.id);

		expect(result).toBeInstanceOf(User);
		expect(result.id).toEqual(user.id);
	});

	it('get (authentication error case)', async function() {
		let error;
		try {
			await get('wrongtoken', 'any id should fail');
		} catch (e) {
			error = e;
		}

		expect(error).toBeInstanceOf(AuthenticationError);
	});

	it('create (normal and duplicate error cases)', async function() {
		const result = await create({
			email: 'unittest@example.com',
			password: '123456',
			languages: [Language.ENGLISH],
			romanReading: false,
			jlpt: null,
		});

		expect(result).toBeInstanceOf(User);
		expect(result.email).toBe('unittest@example.com');
		// No need to test further this response because it is already done in the models and API tests

		let error;
		try {
			await create({
				email: 'unittest@example.com',
				password: '123456',
				languages: [Language.ENGLISH],
				romanReading: false,
				jlpt: null,
			});
		} catch (e) {
			error = e;
		}

		expect(error).toBeInstanceOf(ConflictError);
	});

	it('create (validation error case)', async function() {
		let error;
		try {
			await create({
				email: 'not an email',
				password: '123456',
				languages: [Language.ENGLISH],
				romanReading: false,
				jlpt: null,
			});
		} catch (e) {
			error = e;
		}

		expect(error).toBeInstanceOf(ValidationError);
	});

	it('verifyEmail (normal case)', async function() {
		const userRepository = new UserRepository(this.db);
		const user = await userRepository.create({
			...this.testUser,
			emailVerified: false,
			emailVerificationKey: 'verification_key',
		});

		const result = await verifyEmail(user.id, 'verification_key');

		expect(result).toBeInstanceOf(User);
		expect(result.emailVerified).toEqual(true);
	});

	it('verifyEmail (authentication error case)', async function() {
		const userRepository = new UserRepository(this.db);
		const user = await userRepository.create({
			...this.testUser,
			emailVerified: false,
			emailVerificationKey: 'verification_key',
		});

		let error;
		try {
			await verifyEmail(user.id, 'wrong_verification_key');
		} catch (e) {
			error = e;
		}

		expect(error).toBeInstanceOf(AuthenticationError);
	});

	it('verifyEmail (validation error case)', async function() {
		const userRepository = new UserRepository(this.db);
		const user = await userRepository.create({
			...this.testUser,
			emailVerified: false,
			emailVerificationKey: 'verification_key',
		});

		let error;
		try {
			await verifyEmail(user.id, <string><any>null);
		} catch (e) {
			error = e;
		}

		expect(error).toBeInstanceOf(ValidationError);
	});

	it('verifyEmail (already done error case)', async function() {
		const userRepository = new UserRepository(this.db);
		const user = await userRepository.create({
			...this.testUser,
			emailVerified: true,
			emailVerificationKey: null,
		});

		let error;
		try {
			await verifyEmail(user.id, 'verification_key');
		} catch (e) {
			error = e;
		}

		expect(error).toBeInstanceOf(ConflictError);
	});

	it('verifyEmail (not found error case)', async function() {
		let error;
		try {
			await verifyEmail('00000000-0000-0000-0000-000000000000', 'verification_key');
		} catch (e) {
			error = e;
		}

		expect(error).toBeInstanceOf(NotFoundError);
	});

	it('update (normal case)', async function() {
		const userRepository = new UserRepository(this.db);
		const apiKeyRepository = new ApiKeyRepository(this.db);
		const user = await userRepository.create({
			...this.testUser,
			languages: [Language.FRENCH],
			romanReading: true,
			jlpt: null,
			password: '123456',
		});
		const apiKey = await apiKeyRepository.create(user.id);

		const result = await update(apiKey.key, user.id, {
			languages: [Language.ENGLISH, Language.FRENCH],
			romanReading: false,
			jlpt: null,
			oldPassword: '123456',
			password: 'qwerty',
		});

		expect(result).toBeInstanceOf(User);
		expect(result.languages).toEqual([Language.ENGLISH, Language.FRENCH]);
	});

	it('update (authentication error case)', async function() {
		let error;
		try {
			await update('wrongtoken', 'any id should fail', { languages: [Language.FRENCH] });
		} catch (e) {
			error = e;
		}

		expect(error).toBeInstanceOf(AuthenticationError);
	});

	it('update (validation error case)', async function() {
		const userRepository = new UserRepository(this.db);
		const apiKeyRepository = new ApiKeyRepository(this.db);
		const user = await userRepository.create({ ...this.testUser });
		const apiKey = await apiKeyRepository.create(user.id);

		let error;
		try {
			await update(apiKey.key, user.id, {});
		} catch (e) {
			error = e;
		}

		expect(error).toBeInstanceOf(ValidationError);
	});

	it('update (not found error case)', async function() {
		const userRepository = new UserRepository(this.db);
		const apiKeyRepository = new ApiKeyRepository(this.db);
		const user = await userRepository.create({ ...this.testUser });
		const apiKey = await apiKeyRepository.create(user.id);

		let error;
		try {
			await update(apiKey.key, '00000000-0000-0000-0000-000000000000', {
				languages: [Language.ENGLISH, Language.FRENCH],
				romanReading: false,
				jlpt: null,
			});
		} catch (e) {
			error = e;
		}

		expect(error).toBeInstanceOf(NotFoundError);
	});

	it('requestResetPassword (normal case)', async function() {
		const userRepository = new UserRepository(this.db);
		await userRepository.create({
			...this.testUser,
			email: 'unittest@example.com',
			emailVerified: true,
			passwordResetKey: null,
			passwordResetKeyExpiresAt: null,
		});

		const result = await requestResetPassword('unittest@example.com');

		expect(typeof result).toBe('string');
	});

	it('requestResetPassword (validation error case)', async function() {
		let error;
		try {
			await requestResetPassword(<string><any>null);
		} catch (e) {
			error = e;
		}

		expect(error).toBeInstanceOf(ValidationError);
	});

	it('resetPassword (normal case)', async function() {
		const expiresAt = new Date();
		expiresAt.setHours(expiresAt.getHours() + 24);

		const userRepository = new UserRepository(this.db);
		const user = await userRepository.create({
			...this.testUser,
			password: '123456',
			passwordResetKey: 'test_key',
			passwordResetKeyExpiresAt: expiresAt,
		});

		const result = await resetPassword(user.id, {
			password: 'qwerty',
			passwordResetKey: 'test_key',
		});

		expect(result).toBeInstanceOf(User);
	});

	it('resetPassword (authentication error case)', async function() {
		const userRepository = new UserRepository(this.db);
		const user = await userRepository.create({
			...this.testUser,
			password: '123456',
			passwordResetKey: 'test_key',
			passwordResetKeyExpiresAt: new Date(),
		});

		let error;
		try {
			await resetPassword(user.id, {
				password: 'qwerty',
				passwordResetKey: 'wrong_key',
			});
		} catch (e) {
			error = e;
		}

		expect(error).toBeInstanceOf(AuthenticationError);
	});

	it('resetPassword (validation error case)', async function() {
		const userRepository = new UserRepository(this.db);
		const user = await userRepository.create({ ...this.testUser });

		let error;
		try {
			await resetPassword(user.id, <any>{});
		} catch (e) {
			error = e;
		}

		expect(error).toBeInstanceOf(ValidationError);
	});

	it('resetPassword (not found error case)', async function() {
		let error;
		try {
			await resetPassword('wrong id', {
				password: 'qwerty',
				passwordResetKey: 'wrong_key',
			});
		} catch (e) {
			error = e;
		}

		expect(error).toBeInstanceOf(NotFoundError);
	});
});
