import 'jasmine';
import Meaning from 'Common/Models/Kanjis/Meaning';
import Language from 'Common/Types/Language';

describe('Meaning', function() {
	it('API formatting methods', function() {
		const input = new Meaning('kanji', 'meaning', Language.FRENCH);
		const output = Meaning.fromApi(JSON.parse(JSON.stringify(input.toApi())));

		expect(input).toEqual(output);
		expect(input.kanji).toBe(output.kanji);
		expect(input.meaning).toBe(output.meaning);
		expect(input.meaningLang).toBe(output.meaningLang);
	});
});
