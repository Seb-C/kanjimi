import 'jasmine';
import { analyze } from 'Client/Api/Routes/Lexer';
import Token from 'Common/Models/Token';
import fetch from 'node-fetch';
import ValidationError from 'Client/Api/Errors/Validation';

describe('Client Lexer', () => {
	beforeEach(async () => {
		(<any>global).fetch = fetch;
	});

	it('analyze (normal case)', async () => {
		const result = await analyze(['first sentence', 'second sentence']);

		expect(result).toBeInstanceOf(Array);
		expect(result.length).toBe(2);
		expect(result[0]).toBeInstanceOf(Array);
		expect(result[1]).toBeInstanceOf(Array);
		expect(result[0][0]).toBeInstanceOf(Token);
		expect(result[1][0]).toBeInstanceOf(Token);
		// No need to test further because it is already done in the models and API tests
	});

	it('analyze (error case)', async () => {
		let error;
		try {
			await analyze([]);
		} catch (e) {
			error = e;
		}

		expect(error).toBeInstanceOf(ValidationError);
	});
});
