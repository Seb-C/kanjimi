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
		const apiKey = await apiKeyRepository.createFromUser(user);

		const result = await get(apiKey.key, user.id);

		expect(result).toBeInstanceOf(User);
		expect(result.id).toEqual(user.id);
	});

	it('get (authentication error case)', async function() {
		await expectAsync(
			get('wrongtoken', 'any id should fail')
		).toBeRejectedWithError(AuthenticationError);
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

		await expectAsync(
			create({
				email: 'unittest@example.com',
				password: '123456',
				languages: [Language.ENGLISH],
				romanReading: false,
				jlpt: null,
			})
		).toBeRejectedWithError(ConflictError);
	});

	it('create (validation error case)', async function() {
		await expectAsync(
			create({
				email: 'not an email',
				password: '123456',
				languages: [Language.ENGLISH],
				romanReading: false,
				jlpt: null,
			})
		).toBeRejectedWithError(ValidationError);
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

		await expectAsync(
			verifyEmail(user.id, 'wrong_verification_key')
		).toBeRejectedWithError(AuthenticationError);
	});

	it('verifyEmail (validation error case)', async function() {
		const userRepository = new UserRepository(this.db);
		const user = await userRepository.create({
			...this.testUser,
			emailVerified: false,
			emailVerificationKey: 'verification_key',
		});

		await expectAsync(
			verifyEmail(user.id, <string><any>null)
		).toBeRejectedWithError(ValidationError);
	});

	it('verifyEmail (already done error case)', async function() {
		const userRepository = new UserRepository(this.db);
		const user = await userRepository.create({
			...this.testUser,
			emailVerified: true,
			emailVerificationKey: null,
		});

		await expectAsync(
			verifyEmail(user.id, 'verification_key')
		).toBeRejectedWithError(ConflictError);
	});

	it('verifyEmail (not found error case)', async function() {
		await expectAsync(
			verifyEmail('00000000-0000-0000-0000-000000000000', 'verification_key')
		).toBeRejectedWithError(NotFoundError);
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
		const apiKey = await apiKeyRepository.createFromUser(user);

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
		await expectAsync(
			update('wrongtoken', 'any id should fail', { languages: [Language.FRENCH] })
		).toBeRejectedWithError(AuthenticationError);
	});

	it('update (validation error case)', async function() {
		const userRepository = new UserRepository(this.db);
		const apiKeyRepository = new ApiKeyRepository(this.db);
		const user = await userRepository.create({ ...this.testUser });
		const apiKey = await apiKeyRepository.createFromUser(user);

		await expectAsync(update(apiKey.key, user.id, {})).toBeRejectedWithError(ValidationError);
	});

	it('update (not found error case)', async function() {
		const userRepository = new UserRepository(this.db);
		const apiKeyRepository = new ApiKeyRepository(this.db);
		const user = await userRepository.create({ ...this.testUser });
		const apiKey = await apiKeyRepository.createFromUser(user);

		await expectAsync(
			update(apiKey.key, '00000000-0000-0000-0000-000000000000', {
				languages: [Language.ENGLISH, Language.FRENCH],
				romanReading: false,
				jlpt: null,
			})
		).toBeRejectedWithError(NotFoundError);
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
		await expectAsync(
			requestResetPassword(<string><any>null)
		).toBeRejectedWithError(ValidationError);
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

		await expectAsync(
			resetPassword(user.id, {
				password: 'qwerty',
				passwordResetKey: 'wrong_key',
			})
		).toBeRejectedWithError(AuthenticationError);
	});

	it('resetPassword (validation error case)', async function() {
		const userRepository = new UserRepository(this.db);
		const user = await userRepository.create({ ...this.testUser });

		await expectAsync(
			resetPassword(user.id, <any>{})
		).toBeRejectedWithError(ValidationError);
	});

	it('resetPassword (not found error case)', async function() {
		await expectAsync(
			resetPassword('wrong id', {
				password: 'qwerty',
				passwordResetKey: 'wrong_key',
			})
		).toBeRejectedWithError(NotFoundError);
	});
});
