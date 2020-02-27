import Token from 'Lexer/Token/Token';
import CharType from 'Misc/CharType';

export default class CharTypeToken extends Token {
	public readonly charType: CharType;

	constructor(text: string, charType: CharType) {
		super(text);
		this.charType = charType;
	}
}
