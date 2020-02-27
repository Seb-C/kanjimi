import 'jasmine';
import CharTypeTokenizer from 'Lexer/CharTypeTokenizer';

describe('Lexer', async () => {
	it('Basic sentence tokenization', () => {
		const tokenizer = new CharTypeTokenizer();
		const result = tokenizer.tokenize('私はセバスティアンと申します。');
		expect(result.length).toBe(7);
		expect(result[0].text).toBe('私');
		expect(result[1].text).toBe('は');
		expect(result[2].text).toBe('セバスティアン');
		expect(result[3].text).toBe('と');
		expect(result[4].text).toBe('申');
		expect(result[5].text).toBe('します');
		expect(result[6].text).toBe('。');
	});
});
