import 'jasmine';
import Kanji from 'Common/Models/Kanjis/Kanji';
import Meaning from 'Common/Models/Kanjis/Meaning';
import Reading from 'Common/Models/Kanjis/Reading';
import Structure from 'Common/Models/Kanjis/Structure';
import Language from 'Common/Types/Language';
import KanjiPartPosition from 'Common/Types/KanjiPartPosition';

describe('Kanji', function() {
	it('API formatting methods', function() {
		const input = new Kanji(
			'kanji',
			[new Meaning('kanji of meaning', 'meaning', Language.ENGLISH)],
			[new Reading('kanji of reading', 'reading')],
			new Structure('element', KanjiPartPosition.LEFT, []),
			'http://www.kanjimi.com/img/KanjiVG/foo.svg',
		);
		const output = Kanji.fromApi(JSON.parse(JSON.stringify(input.toApi())));

		expect(input).toEqual(output);
		expect(input.kanji).toBe(output.kanji);
		expect(input.meanings).toEqual(output.meanings);
		expect(input.readings).toEqual(output.readings);
		expect(input.structure).toEqual(output.structure);
		expect(input.fileUrl).toBe(output.fileUrl);
	});
});
