import 'jasmine';
import CharTypeTokenizer from 'Lexer/CharTypeTokenizer';
import CharType from 'Misc/CharType';

describe('Lexer', async () => {
	it('Testing the tokens text', () => {
		const tokenizer = new CharTypeTokenizer();
		const result = tokenizer.tokenizeByCharType('私はセバスティアンと申します。');
		expect(result.length).toBe(7);
		expect(result[0].text).toBe('私');
		expect(result[1].text).toBe('は');
		expect(result[2].text).toBe('セバスティアン');
		expect(result[3].text).toBe('と');
		expect(result[4].text).toBe('申');
		expect(result[5].text).toBe('します');
		expect(result[6].text).toBe('。');
	});

	it('Testing the tokens type', () => {
		const tokenizer = new CharTypeTokenizer();
		const result = tokenizer.tokenizeByCharType('私はセバスティアンと申します。');
		expect(result.length).toBe(7);
		expect(result[0].charType).toBe(CharType.KANJI);
		expect(result[1].charType).toBe(CharType.HIRAGANA);
		expect(result[2].charType).toBe(CharType.KATAKANA);
		expect(result[3].charType).toBe(CharType.HIRAGANA);
		expect(result[4].charType).toBe(CharType.KANJI);
		expect(result[5].charType).toBe(CharType.HIRAGANA);
		expect(result[6].charType).toBe(CharType.PUNCTUATION);
	});
});
