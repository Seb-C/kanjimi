import 'jasmine';
import Lexer from 'Lexer/Lexer';
import Dictionary from 'Dictionary/Dictionary';
import Word from 'Dictionary/Word';
import WordToken from 'Lexer/Token/WordToken';
import Token from 'Lexer/Token/Token';
import VerbToken from 'Lexer/Token/VerbToken';
import ParticleToken from 'Lexer/Token/ParticleToken';
import PunctuationToken from 'Lexer/Token/PunctuationToken';

jasmine.DEFAULT_TIMEOUT_INTERVAL = 30000;

let lexer: Lexer;
describe('Lexer', async () => {
	beforeEach(() => {
		const dictionary = new Dictionary();
		dictionary.add(new Word('私', '', '', '', []));
		dictionary.add(new Word('申す', '', '', '', []));
		dictionary.add(new Word('国立', '', '', '', []));
		dictionary.add(new Word('女性美', '', '', '', []));
		dictionary.add(new Word('術', '', '', '', []));
		dictionary.add(new Word('館', '', '', '', []));
		dictionary.add(new Word('日本', '', '', '', []));
		dictionary.add(new Word('大帝', '', '', '', []));
		dictionary.add(new Word('国憲法', '', '', '', []));
		dictionary.add(new Word('合衆国', '', '', '', []));
		dictionary.add(new Word('最高裁判所', '', '', '', []));
		dictionary.add(new Word('東', '', '', '', []));
		dictionary.add(new Word('ア', '', '', '', []));
		dictionary.add(new Word('アジア', '', '', '', []));
		dictionary.add(new Word('そんな', '', '', '', []));
		dictionary.add(new Word('こと', '', '', '', []));
		dictionary.add(new Word('行く', '', '', '', []));
		dictionary.add(new Word('物', '', '', '', []));
		dictionary.add(new Word('食べる', '', '', '', []));
		dictionary.add(new Word('食べ物', '', '', '', []));
		dictionary.add(new Word('たくさん', '', '', '', []));
		dictionary.add(new Word('感じ', '', '', '', []));
		dictionary.add(new Word('ある', '', '', '', []));
		dictionary.add(new Word('言葉', '', '', '', []));
		dictionary.add(new Word('好き', '', '', '', []));

		lexer = new Lexer(dictionary);
	});

	function testTokensText(expectedTokens: string[]) {
		const result = lexer.analyze(expectedTokens.join(''));
		expect(result.length).toBe(expectedTokens.length);
		expectedTokens.forEach((expectedString, i) => {
			expect(result[i].text).toBe(expectedString);
		});
	}

	it('Basic sentence tokenization', () => {
		testTokensText(['私', 'は', 'セバスティアン', 'と', '申します', '。']);
	});
	it('Token types recognition', () => {
		const result = lexer.analyze('私はセバスティアンと申します。');
		expect(result[0] instanceof WordToken).toBe(true);
		expect(result[1] instanceof ParticleToken).toBe(true);
		expect(result[3] instanceof ParticleToken).toBe(true);
		expect(result[4] instanceof VerbToken).toBe(true);
		expect(result[5] instanceof PunctuationToken).toBe(true);
	});
	it('Verb parts', () => {
		const result = lexer.analyze('私はセバスティアンと申します。');
		expect(result[4] instanceof VerbToken).toBe(true);
		const verb = <VerbToken>result[4];
		expect(verb.conjugation).toBe('します');
		expect(verb.verb).toBe('申');
		expect(verb.forms.map(v => v.dictionaryForm)).toContain('す');
	});
	it('Dictionary words', () => {
		const result = lexer.analyze('私はセバスティアンと申します。');
		const word = <WordToken>result[0];
		const verb = <VerbToken>result[4];
		expect(word.words.length > 0).toBe(true);
		expect(verb.words.length > 0).toBe(true);
	});
	it('Test searchMeaning', () => {
		let result: Token|null = lexer.searchMeaning('食べました');
		expect(result instanceof VerbToken).toBe(true);
		expect((<VerbToken>result).verb).toBe('食');
		expect((<VerbToken>result).conjugation).toBe('べました');
		result = lexer.searchMeaning('好き');
		expect((<Token>result).text).toBe('好き');
		result = lexer.searchMeaning('あいうえおしています');
		expect(result).toBe(null);
	});
	it('Test splitByDictionarySearches', () => {
		const tokens: Token[] = [];
		lexer.splitByDictionarySearches('日本の食べ物が好き', tokens);
		expect(tokens.length).toBe(5);
		expect(tokens[0].text).toBe('日本');
		expect(tokens[1].text).toBe('の');
		expect(tokens[2].text).toBe('食べ物');
		expect(tokens[3].text).toBe('が');
		expect(tokens[4].text).toBe('好き');
	});
	it('Multi-token kanji sequences', () => {
		testTokensText([
			'国立', '女性美', '術', '館', 'と', '日本', '大帝', '国憲法', 'と', '合衆国', '最高裁判所',
			'は', 'たくさん', '感じ', 'が', 'ある', '言葉', '。',
		]);
	});
	it('Specific case with katakana after a kanji', async () => {
		testTokensText(['東', 'アジア']);
	});
	it('Hiragana chains with a particle at the end', async () => {
		testTokensText(['そんな', 'こと', 'で', '行きます']);
	});
	it('Hiragana chains with a particle at the beginning', async () => {
		testTokensText(['私', 'は', 'そんな', '物', 'を', '食べる']);
	});
	it('More test sentences', async () => {
		// console.log(lexer.analyze(
		// 	'TypeScript はマイクロソフトによって開発され、'
		// 	+ 'メンテナンスされているフリーでオープンソース'
		// 	+ 'のプログラミング言語である。',
		// ));

		// console.log(lexer.analyze(`
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
