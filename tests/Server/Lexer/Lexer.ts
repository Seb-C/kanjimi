import 'jasmine';
import CharType from 'Common/Types/CharType';
import Lexer from 'Server/Lexer/Lexer';
import Dictionary from 'Server/Lexer/Dictionary';
import Word from 'Common/Models/Word';
import WordToken from 'Common/Models/Token/WordToken';
import Token from 'Common/Models/Token/Token';
import VerbToken from 'Common/Models/Token/VerbToken';
import ParticleToken from 'Common/Models/Token/ParticleToken';
import PunctuationToken from 'Common/Models/Token/PunctuationToken';
import Language from 'Common/Types/Language';

jasmine.DEFAULT_TIMEOUT_INTERVAL = 30000;

let lexer: Lexer;
describe('Lexer', async () => {
	beforeEach(() => {
		const dictionary = new Dictionary();
		dictionary.add(new Word('私', '', Language.ENGLISH, '', []));
		dictionary.add(new Word('申す', '', Language.ENGLISH, '', []));
		dictionary.add(new Word('国立', '', Language.ENGLISH, '', []));
		dictionary.add(new Word('女性美', '', Language.ENGLISH, '', []));
		dictionary.add(new Word('術', '', Language.ENGLISH, '', []));
		dictionary.add(new Word('館', '', Language.ENGLISH, '', []));
		dictionary.add(new Word('日本', '', Language.ENGLISH, '', []));
		dictionary.add(new Word('大帝', '', Language.ENGLISH, '', []));
		dictionary.add(new Word('国憲法', '', Language.ENGLISH, '', []));
		dictionary.add(new Word('合衆国', '', Language.ENGLISH, '', []));
		dictionary.add(new Word('最高裁判所', '', Language.ENGLISH, '', []));
		dictionary.add(new Word('東', '', Language.ENGLISH, '', []));
		dictionary.add(new Word('ア', '', Language.ENGLISH, '', []));
		dictionary.add(new Word('アジア', '', Language.ENGLISH, '', []));
		dictionary.add(new Word('そんな', '', Language.ENGLISH, '', []));
		dictionary.add(new Word('こと', '', Language.ENGLISH, '', []));
		dictionary.add(new Word('行く', '', Language.ENGLISH, '', []));
		dictionary.add(new Word('物', '', Language.ENGLISH, '', []));
		dictionary.add(new Word('食べる', '', Language.ENGLISH, '', []));
		dictionary.add(new Word('食べ物', '', Language.ENGLISH, '', []));
		dictionary.add(new Word('たくさん', '', Language.ENGLISH, '', []));
		dictionary.add(new Word('感じ', '', Language.ENGLISH, '', []));
		dictionary.add(new Word('ある', '', Language.ENGLISH, '', []));
		dictionary.add(new Word('言葉', '', Language.ENGLISH, '', []));
		dictionary.add(new Word('好き', '', Language.ENGLISH, '', []));
		dictionary.add(new Word('楽しい', '', Language.ENGLISH, '', []));
		dictionary.add(new Word('高い', '', Language.ENGLISH, '', []));
		dictionary.add(new Word('この', '', Language.ENGLISH, '', []));
		dictionary.add(new Word('です', '', Language.ENGLISH, '', []));
		dictionary.add(new Word('に就いて', 'について', Language.ENGLISH, '', []));

		// Adding some particles to the dictionary to assert that
		// it is well recognized as a particle and not as a word
		dictionary.add(new Word('は', '', Language.ENGLISH, '', []));
		dictionary.add(new Word('と', '', Language.ENGLISH, '', []));

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
		const tokens: Token[] = Array.from(
			lexer.splitByDictionarySearches('日本の食べ物が好き'),
		);
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

	it('Conjugated i-adjective recognition', async () => {
		const result = lexer.analyze('このイベントは高かったです。');
		expect(result[3] instanceof VerbToken).toBe(true);
		const adjective = <VerbToken>result[3];
		expect(adjective.conjugation).toBe('かった');
		expect(adjective.verb).toBe('高');
		expect(adjective.forms.map(v => v.dictionaryForm)).toContain('い');
	});
	it('Conjugated shii-adjective recognition', async () => {
		const result = lexer.analyze('このイベントは楽しかったです。');
		expect(result[3] instanceof VerbToken).toBe(true);
		const adjective = <VerbToken>result[3];
		expect(adjective.conjugation).toBe('しかった');
		expect(adjective.verb).toBe('楽');
		expect(adjective.forms.map(v => v.dictionaryForm)).toContain('しい');
	});

	it('Testing tokenizeByCharType: the tokens text', () => {
		const dictionary = new Dictionary();
		const tokenizer = new Lexer(dictionary);
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
	it('Testing tokenizeByCharType: the tokens type', () => {
		const dictionary = new Dictionary();
		const tokenizer = new Lexer(dictionary);
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
	it('Testing the search by dictionary reading', () => {
		const result = lexer.analyze('私については');
		expect(result.length).toBe(3);
		expect(result[1] instanceof WordToken).toBe(true);
		expect(result[1].text).toBe('について');
	});
});
