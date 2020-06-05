import 'jasmine';
import CharType from 'Common/Types/CharType';
import TokenType from 'Common/Types/TokenType';
import WordTag from 'Common/Types/WordTag';
import Lexer from 'Server/Lexer/Lexer';
import Dictionary from 'Server/Lexer/Dictionary';
import Word from 'Common/Models/Word';
import Token from 'Common/Models/Token';
import Language from 'Common/Types/Language';

jasmine.DEFAULT_TIMEOUT_INTERVAL = 30000;

let lexer: Lexer;
describe('Lexer', async function() {
	beforeEach(function() {
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
		dictionary.add(new Word('に就いて', 'について', Language.ENGLISH, '', [WordTag.ONLY_KANA]));

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

	it('Basic sentence tokenization', function() {
		testTokensText(['私', 'は', 'セバスティアン', 'と', '申します', '。']);
	});
	it('Token types recognition', function() {
		const result = lexer.analyze('私はセバスティアンと申します。');
		expect(result[0].type).toBe(TokenType.WORD);
		expect(result[1].type).toBe(TokenType.PARTICLE);
		expect(result[3].type).toBe(TokenType.PARTICLE);
		expect(result[4].type).toBe(TokenType.VERB);
		expect(result[5].type).toBe(TokenType.PUNCTUATION);
	});
	it('Verb parts', function() {
		const result = lexer.analyze('私はセバスティアンと申します。');
		expect(result[4].type).toBe(TokenType.VERB);
		expect(result[4].conjugation).toBe('します');
		expect(result[4].verb).toBe('申');
		expect(result[4].forms.map(v => v.dictionaryForm)).toContain('す');
	});
	it('Dictionary words', function() {
		const result = lexer.analyze('私はセバスティアンと申します。');
		expect(result[0].words.length > 0).toBe(true);
		expect(result[4].words.length > 0).toBe(true);
	});
	it('Test searchMeaning', function() {
		const result = <Token>lexer.searchMeaning('食べました');
		expect(result.type).toBe(TokenType.VERB);
		expect(result.verb).toBe('食');
		expect(result.conjugation).toBe('べました');

		const result2 = <Token>lexer.searchMeaning('好き');
		expect(result2.text).toBe('好き');

		const result3 = lexer.searchMeaning('あいうえおしています');
		expect(result3).toBe(null);
	});
	it('Test splitByDictionarySearches', function() {
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
	it('Multi-token kanji sequences', function() {
		testTokensText([
			'国立', '女性美', '術', '館', 'と', '日本', '大帝', '国憲法', 'と', '合衆国', '最高裁判所',
			'は', 'たくさん', '感じ', 'が', 'ある', '言葉', '。',
		]);
	});
	it('Specific case with katakana after a kanji', async function() {
		testTokensText(['東', 'アジア']);
	});
	it('Hiragana chains with a particle at the end', async function() {
		testTokensText(['そんな', 'こと', 'で', '行きます']);
	});
	it('Hiragana chains with a particle at the beginning', async function() {
		testTokensText(['私', 'は', 'そんな', '物', 'を', '食べる']);
	});

	it('Conjugated i-adjective recognition', async function() {
		const result = lexer.analyze('このイベントは高かったです。');
		expect(result[3].type).toBe(TokenType.VERB);
		expect(result[3].conjugation).toBe('かった');
		expect(result[3].verb).toBe('高');
		expect(result[3].forms.map(v => v.dictionaryForm)).toContain('い');
	});
	it('Conjugated shii-adjective recognition', async function() {
		const result = lexer.analyze('このイベントは楽しかったです。');
		expect(result[3].type).toBe(TokenType.VERB);
		expect(result[3].conjugation).toBe('しかった');
		expect(result[3].verb).toBe('楽');
		expect(result[3].forms.map(v => v.dictionaryForm)).toContain('しい');
	});

	it('Testing splitTextByCharType: the tokens text', function() {
		const dictionary = new Dictionary();
		const tokenizer = new Lexer(dictionary);
		const result = tokenizer.splitTextByCharType('私はセバスティアンと申します。');
		expect(result.length).toBe(7);
		expect(result[0].text).toBe('私');
		expect(result[1].text).toBe('は');
		expect(result[2].text).toBe('セバスティアン');
		expect(result[3].text).toBe('と');
		expect(result[4].text).toBe('申');
		expect(result[5].text).toBe('します');
		expect(result[6].text).toBe('。');
	});
	it('Testing splitTextByCharType: the tokens type', function() {
		const dictionary = new Dictionary();
		const tokenizer = new Lexer(dictionary);
		const result = tokenizer.splitTextByCharType('私はセバスティアンと申します。');
		expect(result.length).toBe(7);
		expect(result[0].type).toBe(CharType.KANJI);
		expect(result[1].type).toBe(CharType.HIRAGANA);
		expect(result[2].type).toBe(CharType.KATAKANA);
		expect(result[3].type).toBe(CharType.HIRAGANA);
		expect(result[4].type).toBe(CharType.KANJI);
		expect(result[5].type).toBe(CharType.HIRAGANA);
		expect(result[6].type).toBe(CharType.PUNCTUATION);
	});
	it('Testing the search by dictionary reading', function() {
		const result = lexer.analyze('私については');
		expect(result.length).toBe(3);
		expect(result[1].type).toBe(TokenType.WORD);
		expect(result[1].text).toBe('について');
	});
	it('Specific case (teru conjugation getting matched for all te forms)', function() {
		const dictionary = new Dictionary();
		dictionary.add(new Word('される', 'される', Language.ENGLISH, '', []));
		lexer = new Lexer(dictionary);

		const result = lexer.analyze('されて');
		const forms = result[0].forms.map(form => form.dictionaryForm);
		expect(forms).not.toContain('てる');
	});
	it('Teiru forms', function() {
		const dictionary = new Dictionary();
		dictionary.add(new Word('示す', 'しめす', Language.ENGLISH, '', []));
		lexer = new Lexer(dictionary);

		const result = lexer.analyze('示されていない');
		expect(result.length).toBe(1);
	});
});
