import 'jasmine';
import Conjugation from 'Common/Models/Conjugation';
import Token from 'Common/Models/Token';
import ConjugationType from 'Common/Types/ConjugationType';
import Word from 'Common/Models/Word';
import TokenType from 'Common/Types/TokenType';
import Language from 'Common/Types/Language';

describe('Token', function() {
	it('API formatting methods', async function() {
		const input = new Token(
			'text',
			TokenType.PARTICLE,
			[
				new Word('', '', Language.FRENCH, '', []),
				new Word('', '', Language.SPANISH, '', []),
			],
			'verb',
			'conjugation',
			[
				new Conjugation('', '', ConjugationType.PAST),
				new Conjugation('', '', ConjugationType.CONDITIONAL),
			],
		);
		const output = Token.fromApi(JSON.parse(JSON.stringify(input.toApi())));

		expect(output.text).toBe('text');
		expect(output.type).toBe(TokenType.PARTICLE);
		expect(output.words.length).toBe(2);
		expect(output.words[0].translationLang).toBe(Language.FRENCH);
		expect(output.words[1].translationLang).toBe(Language.SPANISH);
		expect(output.verb).toBe('verb');
		expect(output.conjugation).toBe('conjugation');
		expect(output.forms.length).toBe(2);
		expect(output.forms[0].type).toBe(ConjugationType.PAST);
		expect(output.forms[1].type).toBe(ConjugationType.CONDITIONAL);

		// Now testing the null values
		const input2 = new Token('', TokenType.PARTICLE, [], null, null, []);
		const output2 = Token.fromApi(JSON.parse(JSON.stringify(input2.toApi())));

		expect(output2.words.length).toBe(0);
		expect(output2.verb).toBe(null);
		expect(output2.conjugation).toBe(null);
		expect(output2.forms.length).toBe(0);
	});
	it('getTranslation', async function() {
		const token = new Token('text', TokenType.PARTICLE, [
			new Word('', '', Language.FRENCH, 'test translation', []),
		]);

		expect(token.getTranslation()).toBe('test translation');
	});
	it('getFurigana', async function() {
		const token = new Token('text', TokenType.PARTICLE, [
			new Word('', 'test reading', Language.FRENCH, '', []),
		]);

		expect(token.getFurigana()).toBe('test reading');
	});
	it('getFurigana - conjugated verb', async function() {
		const token = new Token('text', TokenType.PARTICLE, [
			new Word('食べる', 'たべる', Language.FRENCH, '', []),
		], 'verb', 'conjugation', [
			new Conjugation('べた', 'べた', ConjugationType.PAST),
		]);

		expect(token.getFurigana()).toBe('たべた');
	});
});
