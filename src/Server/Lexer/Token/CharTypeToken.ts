import Token from 'Server/Lexer/Token/Token';
import CharType from 'Common/Misc/CharType';

export default class CharTypeToken extends Token {
	public readonly charType: CharType;

	constructor(text: string, charType: CharType) {
		super(text);
		this.charType = charType;
	}
}
