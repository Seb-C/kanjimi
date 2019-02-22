import 'jasmine';
import Lexer from '../src/Lexer';
import VerbToken from '../src/Lexer/Token/VerbToken';
import ParticleToken from '../src/Lexer/Token/ParticleToken';
import PunctuationToken from '../src/Lexer/Token/PunctuationToken';

describe('Lexer', () => {
	const lexer = new Lexer();
	it('Basic sentence tokenization', async () => {
		const result = await lexer.tokenize('私はセバスティアンと申します。');
		expect(result.length).toBe(6);
		expect(result[0].getText()).toBe('私');
		expect(result[1].getText()).toBe('は');
		expect(result[2].getText()).toBe('セバスティアン');
		expect(result[3].getText()).toBe('と');
		expect(result[4].getText()).toBe('申します');
		expect(result[5].getText()).toBe('。');
	});
	it('Token types recognition', async () => {
		const result = await lexer.tokenize('私はセバスティアンと申します。');
		expect(result[1] instanceof ParticleToken).toBe(true);
		expect(result[3] instanceof ParticleToken).toBe(true);
		expect(result[4] instanceof VerbToken).toBe(true);
		expect(result[5] instanceof PunctuationToken).toBe(true);
	});
	it('Verb parts', async () => {
		const result = await lexer.tokenize('私はセバスティアンと申します。');
		const verb = <VerbToken>result[4];
		expect(verb.getConjugation()).toBe('します');
		expect(verb.getVerb()).toBe('申');
		expect(verb.getDictionaryConjugationForms().map(v => v.dictionaryForm)).toContain('す');
	});
	it('More test sentences', async () => {
		const result = await lexer.tokenize(
			'TypeScript はマイクロソフトによって開発され、'
			+ 'メンテナンスされているフリーでオープンソース'
			+ 'のプログラミング言語である。',
		);
		console.log(result);
	});
});
