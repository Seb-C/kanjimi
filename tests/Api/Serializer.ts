import 'jasmine';
import Serializer from 'Api/Serializer/Serializer';
import Word from 'Dictionary/Word';
import Tag from 'Dictionary/Tag';

jasmine.DEFAULT_TIMEOUT_INTERVAL = 30000;

describe('Api Serializer', () => {
	it('All', async () => {
		const serializer = new Serializer();
		const word = new Word('食べる', 'たべる', 'en', 'to eat', [Tag.UNCLASSIFIED]);

		const serialized: any = serializer.toJsonApi(word);
		expect(serialized.data).toBeDefined();
		expect(serialized.data.attributes).toBeDefined();
		expect(serialized.data.type).toBe('Word');

		const data = serializer.fromJsonApi<Word>(serialized);
		expect(data.constructor).toBe(Word);
		expect(data.word).toBe('食べる');
		expect(data.reading).toBe('たべる');
		expect(data.translationLang).toBe('en');
		expect(data.translation).toBe('to eat');
		expect(data.tags[0]).toBe(Tag.UNCLASSIFIED);
	});
});
