import Token from 'Server/Lexer/Token/Token';
import CharType from 'Common/Misc/CharType';

export default class PunctuationToken extends Token {
	constructor(text: string) {
		if (typeof text === 'string' && CharType.of(text) !== CharType.PUNCTUATION) {
			throw new Error(`${text} is not a punctuation character.`);
		}
		super(text);
	}
}
