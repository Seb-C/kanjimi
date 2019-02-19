import Token from './Token';
import CharType from '../CharType';

export default class PunctuationToken extends Token {
	constructor(text: string) {
		if (CharType.of(text) !== CharType.PUNCTUATION) {
			throw new Error(`${text} is not a punctuation character.`);
		}
		super(text);
	}
}
