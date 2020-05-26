import 'jasmine';
import { get, create, verifyEmail, update } from 'Common/Api/User';
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
		const userRepository = new UserRepository(this.getDatabase());
		const apiKeyRepository = new ApiKeyRepository(this.getDatabase());
		const user = await userRepository.create({ ...this.testUser });
		const apiKey = await apiKeyRepository.create(user);

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
		const userRepository = new UserRepository(this.getDatabase());
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
		const userRepository = new UserRepository(this.getDatabase());
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
		const userRepository = new UserRepository(this.getDatabase());
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
		const userRepository = new UserRepository(this.getDatabase());
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
		const userRepository = new UserRepository(this.getDatabase());
		const apiKeyRepository = new ApiKeyRepository(this.getDatabase());
		const user = await userRepository.create({
			...this.testUser,
			languages: [Language.FRENCH],
			romanReading: true,
			jlpt: null,
		});
		const apiKey = await apiKeyRepository.create(user);

		const result = await update(apiKey.key, user.id, {
			languages: [Language.ENGLISH, Language.FRENCH],
			romanReading: false,
			jlpt: null,
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
		const userRepository = new UserRepository(this.getDatabase());
		const apiKeyRepository = new ApiKeyRepository(this.getDatabase());
		const user = await userRepository.create({ ...this.testUser });
		const apiKey = await apiKeyRepository.create(user);

		let error;
		try {
			await update(apiKey.key, user.id, {});
		} catch (e) {
			error = e;
		}

		expect(error).toBeInstanceOf(ValidationError);
	});
});
