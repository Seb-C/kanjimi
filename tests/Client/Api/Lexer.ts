import 'jasmine';
import { analyze } from 'Client/Api/Lexer';
import Token from 'Common/Models/Token';
import fetch from 'node-fetch';
import { ApiError, ApiErrorType } from 'Client/Api/Errors';

describe('Client Lexer', () => {
	it('analyze (normal case)', async () => {
		(<any>global).fetch = fetch;
		const result = await analyze(['first sentence', 'second sentence']);

		expect(result).toBeInstanceOf(Array);
		expect(result.length).toBe(2);
		expect(result[0]).toBeInstanceOf(Array);
		expect(result[1]).toBeInstanceOf(Array);
		expect(result[0][0]).toBeInstanceOf(Token);
		expect(result[1][0]).toBeInstanceOf(Token);
		// No need to test further because it is already done in the models and API tests
	});

	it('analyze (normal case)', async () => {
		let error;
		try {
			(<any>global).fetch = fetch;
			await analyze([]);
		} catch (e) {
			error = e;
		}

		expect(error).toBeInstanceOf(ApiError);
		expect(error.type).toBe(ApiErrorType.VALIDATION);
	});
});
