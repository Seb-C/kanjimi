import 'jasmine';
import Word from 'Common/Models/Word';
import Language from 'Common/Types/Language';
import WordTag from 'Common/Types/WordTag';

describe('Word', () => {
	it('getShortTranslation method', async () => {
		const test = (translation: string) => (
			new Word('', '', Language.ENGLISH, translation, [])
		).getShortTranslation();

		expect(test('test')).toBe('test');
		expect(test('two words')).toBe('two words');
		expect(test('test (foo bar)')).toBe('test');
		expect(test('two words {baz}')).toBe('two words');
		expect(test('foo bar {baz')).toBe('foo bar');
	});

	it('API formatting methods', async () => {
		const input = new Word(
			'word',
			'reading',
			Language.FRENCH,
			'translation',
			[WordTag.ADJECTIVE, WordTag.ADVERB],
		);
		const output = Word.fromApi(input.toApi());

		expect(output.word).toBe('word');
		expect(output.reading).toBe('reading');
		expect(output.translationLang).toBe(Language.FRENCH);
		expect(output.translation).toBe('translation');
		expect(output.tags).toEqual([WordTag.ADJECTIVE, WordTag.ADVERB]);

		// Now testing null values
		const input2 = new Word('', '', null, '', []);
		const output2 = Word.fromApi(input2.toApi());
		expect(output2.translationLang).toBe(null);
		expect(output2.tags).toEqual([]);
	});
});
