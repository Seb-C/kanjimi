import Token from 'Common/Models/Token/Token';
import CharType from 'Common/Types/CharType';

export default class PunctuationToken extends Token {
	constructor(text: string) {
		if (typeof text === 'string' && CharType.of(text) !== CharType.PUNCTUATION) {
			throw new Error(`${text} is not a punctuation character.`);
		}
		super(text);
	}
}
