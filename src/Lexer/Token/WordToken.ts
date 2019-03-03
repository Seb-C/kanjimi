import Token from './Token';
import Word from '../../Dictionary/Word';

export default class WordToken extends Token {
	public readonly words: ReadonlyArray<Word>;

	constructor(text: string, words: ReadonlyArray<Word>) {
		super(text);
		this.words = words;
	}
}
