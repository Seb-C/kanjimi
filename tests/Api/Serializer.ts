import 'jasmine';
import Serializer from 'Api/Serializer/Serializer';
import Dictionary from 'Dictionary/Dictionary';
import Word from 'Dictionary/Word';

jasmine.DEFAULT_TIMEOUT_INTERVAL = 30000;

describe('Api Serializer', () => {
	it('All', () => {
		const serializer = new Serializer();
		const dictionary = new Dictionary();
		const word = dictionary.get('食べる')[0];

		const serialized: any = serializer.toJsonApi(word);
		expect(serialized.data).toBeDefined();
		expect(serialized.data.attributes).toBeDefined();
		expect(serialized.data.type).toBe('Word');

		const data = serializer.fromJsonApi<Word>(serialized);
		expect(data.constructor).toBe(Word);
		expect(data.word).toBe('食べる');
	});
});
