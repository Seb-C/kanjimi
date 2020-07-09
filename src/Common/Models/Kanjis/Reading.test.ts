import 'jasmine';
import Reading from 'Common/Models/Kanjis/Reading';

describe('Reading', function() {
	it('API formatting methods', function() {
		const input = new Reading('kanji', 'reading');
		const output = Reading.fromApi(JSON.parse(JSON.stringify(input.toApi())));

		expect(input).toEqual(output);
		expect(input.kanji).toBe(output.kanji);
		expect(input.reading).toBe(output.reading);
	});
});
