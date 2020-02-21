import 'jasmine';
import Dictionary from 'Dictionary/Dictionary';

describe('Dictionary', () => {
	it('parseCsvLine method', async () => {
		const dictionary = new Dictionary();
		const word = dictionary.parseCsvLine('あいうえお,aiueo,eng,"""definition""","tag1/tag2/"""""');

		expect(word.word).toBe('あいうえお');
		expect(word.reading).toBe('aiueo');
		expect(word.translationLang).toBe('eng');
		expect(word.translation).toBe('"definition"');
		expect(word.tags.length).toBe(3);
		expect(word.tags[0]).toBe('tag1');
		expect(word.tags[1]).toBe('tag2');
		expect(word.tags[2]).toBe('""');
	});
});
