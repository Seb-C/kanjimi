import 'jasmine';
import { analyze } from 'Client/Api/Lexer';
import Token from 'Common/Models/Token';
import fetch from 'node-fetch';

describe('Client Lexer', () => {
	it('analyze', async () => {
		(<any>global).fetch = fetch;
		const result = await analyze(['first sentence', 'second sentence']);

		expect(result instanceof Array).toBe(true);
		expect(result.length).toBe(2);
		expect(result[0] instanceof Array).toBe(true);
		expect(result[1] instanceof Array).toBe(true);
		expect(result[0][0] instanceof Token).toBe(true);
		expect(result[1][0] instanceof Token).toBe(true);
		// No need to test further because it is already done in the models and API tests
	});
});
