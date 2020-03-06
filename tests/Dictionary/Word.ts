import 'jasmine';
import Word from 'Server/Dictionary/Word';

describe('Word', () => {
	it('getShortTranslation method', async () => {
		const test = (translation: string) => (
			new Word('', '', '', translation, [])
		).getShortTranslation();

		expect(test('test')).toBe('test');
		expect(test('two words')).toBe('two words');
		expect(test('test (foo bar)')).toBe('test');
		expect(test('two words {baz}')).toBe('two words');
		expect(test('foo bar {baz')).toBe('foo bar');
	});
});
