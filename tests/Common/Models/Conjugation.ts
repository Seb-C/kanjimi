import 'jasmine';
import Conjugation from 'Common/Models/Conjugation';
import ConjugationType from 'Common/Types/ConjugationType';

describe('Conjugation', () => {
	it('API formatting methods', async () => {
		const input = new Conjugation(
			'conjugation',
			'dictionary form',
			ConjugationType.IMPERATIVE,
		);
		const output = Conjugation.fromApi(JSON.parse(JSON.stringify(input.toApi())));

		expect(output.conjugation).toBe('conjugation');
		expect(output.dictionaryForm).toBe('dictionary form');
		expect(output.type).toBe(ConjugationType.IMPERATIVE);
	});
});
