import Token from './Token';
import Word from '../../Dictionary/Word';

export default class WordToken extends Token {
	public readonly words: ReadonlyArray<Word>;

	constructor(text: string, words: ReadonlyArray<Word>) {
		super(text);
		this.words = words;
	}

	private getBestWord(): Word|null {
		// TODO depending on the user + better algorithm
		for (const i = 0; i < this.words.length; i++) {
			if (this.words[i].translationLang === 'fra') {
				return this.words[i];
			}
		}
		for (const i = 0; i < this.words.length; i++) {
			if (this.words[i].translationLang === 'eng') {
				return this.words[i];
			}
		}

		return this.words[0];
	}

	public getFurigana(): string {
		const word = this.getBestWord();
		if (word === null) {
			return '';
		}

		return word.reading;
	}

	public getTranslation(): string {
		const word = this.getBestWord();
		if (word === null) {
			return '';
		}

		return word.translation;
	}
}
