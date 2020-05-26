import 'jasmine';
import Word from 'Common/Models/Word';
import Language from 'Common/Types/Language';
import WordTag from 'Common/Types/WordTag';

describe('Word', function() {
	it('getShortTranslation method', function() {
		const test = (translation: string) => (
			new Word('', '', Language.ENGLISH, translation, [])
		).getShortTranslation();

		expect(test('test')).toBe('test');
		expect(test('two words')).toBe('two words');
		expect(test('test (foo bar)')).toBe('test');
		expect(test('two words {baz}')).toBe('two words');
		expect(test('foo bar {baz')).toBe('foo bar');
	});

	it('API formatting methods', function() {
		const input = new Word(
			'word',
			'reading',
			Language.FRENCH,
			'translation',
			[WordTag.ADJECTIVE, WordTag.ADVERB],
		);
		const output = Word.fromApi(JSON.parse(JSON.stringify(input.toApi())));

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

	it('getJlptLevel method', function() {
		let word = new Word('', '', Language.FRENCH, '', [WordTag.ADJECTIVE, WordTag.ADVERB]);
		expect(word.getJlptLevel()).toBe(null);

		word = new Word('', '', Language.FRENCH, '', [WordTag.ADJECTIVE, WordTag.JLPT_1]);
		expect(word.getJlptLevel()).toBe(1);

		word = new Word('', '', Language.FRENCH, '', [WordTag.JLPT_2, WordTag.ADVERB]);
		expect(word.getJlptLevel()).toBe(2);

		word = new Word('', '', Language.FRENCH, '', [WordTag.JLPT_3]);
		expect(word.getJlptLevel()).toBe(3);

		word = new Word('', '', Language.FRENCH, '', [WordTag.JLPT_4]);
		expect(word.getJlptLevel()).toBe(4);

		word = new Word('', '', Language.FRENCH, '', [WordTag.JLPT_5]);
		expect(word.getJlptLevel()).toBe(5);

		word = new Word('', '', Language.FRENCH, '', [WordTag.JLPT_3, WordTag.JLPT_4]);
		expect(word.getJlptLevel()).toBe(4);

		word = new Word('', '', Language.FRENCH, '', [WordTag.JLPT_4, WordTag.JLPT_3]);
		expect(word.getJlptLevel()).toBe(4);
	});
});
