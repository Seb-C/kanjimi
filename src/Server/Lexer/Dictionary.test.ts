import 'jasmine';
import Dictionary from 'Server/Lexer/Dictionary';
import Word from 'Common/Models/Word';
import Language from 'Common/Types/Language';

describe('Dictionary', async function() {
	it('parseCsvLine method', async function() {
		const dictionary = new Dictionary();
		const columns = dictionary.parseCsvLine(
			'あいうえお,aiueo,"""definition""","tag1/tag2/"""""',
		);

		expect(columns).toEqual([
			'あいうえお',
			'aiueo',
			'"definition"',
			'tag1/tag2/""',
		]);
	});

	it('Get specific langs', async function() {
		const dictionary = new Dictionary();
		dictionary.add(new Word('ア', 'あ', Language.ENGLISH, 'translation en', []));
		dictionary.add(new Word('ア', 'あ', Language.SPANISH, 'translation es', []));
		dictionary.add(new Word('ア', 'あ', Language.FRENCH, 'translation fr', []));
		dictionary.add(new Word('ア', 'あ', Language.FRENCH, 'translation fr 2', []));

		expect(dictionary.get('ア', null).length).toBe(4);
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

	it('Get words not associated to a lang', async function() {
		const dictionary = new Dictionary();
		dictionary.add(new Word('ア', 'あ', Language.ENGLISH, 'en', []));
		dictionary.add(new Word('ア', 'あ', null, 'no lang', []));

		expect(dictionary.get('ア', null).length).toBe(2);
		expect(dictionary.get('ア', [Language.ENGLISH]).length).toBe(2);
		expect(dictionary.get('ア', [Language.FRENCH]).length).toBe(1);
		expect(dictionary.get('ア', [Language.FRENCH])[0].translationLang).toBe(null);
	});

	it('Get words by reading', async function() {
		const dictionary = new Dictionary();
		dictionary.add(new Word('ア', 'あ', null, 'a', []));
		dictionary.add(new Word('イ', 'い', null, 'i', []));
		dictionary.add(new Word('ア', '', null, 'a', []));
		dictionary.add(new Word('イ', '', null, 'i', []));
		dictionary.add(new Word('', 'あ', null, 'a', []));
		dictionary.add(new Word('', 'い', null, 'i', []));

		expect(dictionary.get('ア', null).length).toBe(2);
		expect(dictionary.get('イ', null).length).toBe(2);
		expect(dictionary.get('あ', null).length).toBe(0);
		expect(dictionary.get('い', null).length).toBe(0);
	});
});
