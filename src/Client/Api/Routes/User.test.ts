import 'jasmine';
import { create } from 'Client/Api/Routes/User';
import User from 'Common/Models/User';
import Language from 'Common/Types/Language';
import fetch from 'node-fetch';
import ValidationError from 'Client/Api/Errors/Validation';
import DuplicateError from 'Client/Api/Errors/Duplicate';
import Database from 'Server/Database/Database';
import UserRepository from 'Server/Repository/User';

describe('Client User', () => {
	beforeEach(async () => {
		(<any>global).fetch = fetch;

		// Clearing previous run if necessary
		const db = new Database();
		const userRepository = new UserRepository(db);
		await userRepository.deleteByEmail('unittest@example.com');
		await db.close();
	});

	it('create (normal and duplicate error cases)', async () => {
		const result = await create({
			email: 'unittest@example.com',
			password: '123456',
			languages: [Language.ENGLISH],
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
			});
		} catch (e) {
			error = e;
		}

		expect(error).toBeInstanceOf(DuplicateError);
	});

	it('create (validation error case)', async () => {
		let error;
		try {
			await create({
				email: 'not an email',
				password: '123456',
				languages: [Language.ENGLISH],
			});
		} catch (e) {
			error = e;
		}

		expect(error).toBeInstanceOf(ValidationError);
	});
});
