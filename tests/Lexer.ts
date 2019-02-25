import 'jasmine';
import Lexer from '../src/Lexer';
import Dictionary from '../src/Dictionary';
import VerbToken from '../src/Lexer/Token/VerbToken';
import ParticleToken from '../src/Lexer/Token/ParticleToken';
import PunctuationToken from '../src/Lexer/Token/PunctuationToken';

describe('Lexer', () => {
	const dictionary = new Dictionary();
	const lexer = new Lexer(dictionary);
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
		// console.log(await lexer.tokenize(
		// 	'TypeScript はマイクロソフトによって開発され、'
		// 	+ 'メンテナンスされているフリーでオープンソース'
		// 	+ 'のプログラミング言語である。',
		// ));

		// console.log(await lexer.tokenize(`
		// 	「日本」という漢字による国号の表記は、日本列島が中国大陸から見て東の果て、
		// 	つまり「日の本（ひのもと）」に位置することに由来するのではないかとされる[3]。
		// 	近代の二つの憲法の表題は、「日本国憲法」および「大日本帝国憲法」であるが、
		// 	国号を「日本国」または「日本」と直接かつ明確に規定した法令は存在しない。
		// 	[疑問点 – ノート]ただし、日本工業規格 (Japanese Industrial Standard) では日本国、
		// 	英語表記をJapanと規定。更に、国際規格 (ISO) では3文字略号をJPN、2文字略号をJPと規定している。
		// 	また、日本国外務省から発給される旅券の表紙には「日本国」の表記と十六一重表菊[4] を提示している。
		// 	法令で日本を指し示す表記には統一されておらず日本、日本国、本邦、わが国、などが混在している。
		// `));
	});
});
