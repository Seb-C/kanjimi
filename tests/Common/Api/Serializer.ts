import 'jasmine';
import Serializer from 'Common/Api/Serializer';
import Unserializer from 'Common/Api/Unserializer';
import Word from 'Common/Models/Word';
import WordTagType from 'Common/Types/WordTagType';
import Language from 'Common/Types/Language';

jasmine.DEFAULT_TIMEOUT_INTERVAL = 30000;

describe('Api Serializer', () => {
	it('All', async () => {
		const word = new Word('食べる', 'たべる', Language.ENGLISH, 'to eat', [WordTagType.UNCLASSIFIED]);

		const serialized: any = (new Serializer()).toJsonApi(word);
		expect(serialized.data).toBeDefined();
		expect(serialized.data.attributes).toBeDefined();
		expect(serialized.data.type).toBe('Word');

		const data = (new Unserializer()).fromJsonApi<Word>(serialized);
		expect(data.constructor).toBe(Word);
		expect(data.word).toBe('食べる');
		expect(data.reading).toBe('たべる');
		expect(data.translationLang).toBe('en');
		expect(data.translation).toBe('to eat');
		expect(data.tags[0]).toBe(WordTagType.UNCLASSIFIED);
	});

	it('Unserialize an array of arrays', async () => {
		const word = new Word('食べる', 'たべる', Language.ENGLISH, 'to eat', [WordTagType.UNCLASSIFIED]);

		const serialized: any = (new Serializer()).toJsonApi([[word]]);

		const data = (new Unserializer()).fromJsonApi<Word[][]>(serialized);
		expect(data.length).toBe(1);
		expect(data[0].length).toBe(1);
		expect(data[0][0].constructor).toBe(Word);
	});
});
