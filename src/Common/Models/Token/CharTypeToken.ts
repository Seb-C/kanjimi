import Token from 'Common/Models/Token/Token';
import CharType from 'Common/Types/CharType';

export default class CharTypeToken extends Token {
	public readonly charType: CharType;

	constructor(text: string, charType: CharType) {
		super(text);
		this.charType = charType;
	}
}
