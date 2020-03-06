import 'jasmine';
import Dictionary from 'Server/Lexer/Dictionary';

describe('Dictionary', () => {
	it('parseCsvLine method', async () => {
		const dictionary = new Dictionary();
		const word = dictionary.parseCsvLine('あいうえお,aiueo,"""definition""","tag1/tag2/"""""', 'en');

		expect(word.word).toBe('あいうえお');
		expect(word.reading).toBe('aiueo');
		expect(word.translationLang).toBe('en');
		expect(word.translation).toBe('"definition"');
		expect(word.tags.length).toBe(3);
		expect(word.tags[0]).toBe('tag1');
		expect(word.tags[1]).toBe('tag2');
		expect(word.tags[2]).toBe('""');
	});
});
