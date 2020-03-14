import 'jasmine';
import Dictionary from 'Server/Lexer/Dictionary';
import Word from 'Common/Models/Word';
import Language from 'Common/Types/Language';

describe('Dictionary', () => {
	it('parseCsvLine method', async () => {
		const dictionary = new Dictionary();
		const word = dictionary.parseCsvLine(
			'あいうえお,aiueo,"""definition""","tag1/tag2/"""""',
			Language.ENGLISH,
		);

		expect(word.word).toBe('あいうえお');
		expect(word.reading).toBe('aiueo');
		expect(word.translationLang).toBe(Language.ENGLISH);
		expect(word.translation).toBe('"definition"');
		expect(word.tags.length).toBe(3);
		expect(word.tags[0]).toBe('tag1');
		expect(word.tags[1]).toBe('tag2');
		expect(word.tags[2]).toBe('""');
	});

	it('Get specific langs', async () => {
		const dictionary = new Dictionary();
		dictionary.add(new Word('ア', 'あ', Language.ENGLISH, 'translation en', []));
		dictionary.add(new Word('ア', 'あ', Language.SPANISH, 'translation es', []));
		dictionary.add(new Word('ア', 'あ', Language.FRENCH, 'translation fr', []));
		dictionary.add(new Word('ア', 'あ', Language.FRENCH, 'translation fr 2', []));

		expect(dictionary.get('ア').length).toBe(4);
		expect(dictionary.get('ア', [Language.FRENCH]).length).toBe(2);
		expect(dictionary.get('ア', [Language.SPANISH]).length).toBe(1);
		expect(dictionary.get('ア', [Language.ENGLISH]).length).toBe(1);

		const multiLangResult = dictionary.get('ア', [Language.FRENCH, Language.ENGLISH]);
		expect(multiLangResult.length).toBe(3);

		expect(multiLangResult[0].translationLang).toBe(Language.FRENCH);
		expect(multiLangResult[1].translationLang).toBe(Language.FRENCH);
		expect(multiLangResult[2].translationLang).toBe(Language.ENGLISH);

		expect(multiLangResult[0].translation).toBe('translation fr');
		expect(multiLangResult[1].translation).toBe('translation fr 2');
		expect(multiLangResult[2].translation).toBe('translation en');
	});

	it('Get words not associated to a lang', async () => {
		const dictionary = new Dictionary();
		dictionary.add(new Word('ア', 'あ', Language.ENGLISH, 'en', []));
		dictionary.add(new Word('ア', 'あ', null, 'no lang', []));

		expect(dictionary.get('ア').length).toBe(2);
		expect(dictionary.get('ア', [Language.ENGLISH]).length).toBe(2);
		expect(dictionary.get('ア', [Language.FRENCH]).length).toBe(1);
		expect(dictionary.get('ア', [Language.FRENCH])[0].translationLang).toBe(null);
	});
});
