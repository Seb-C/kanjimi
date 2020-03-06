import Token from 'Common/Models/Token/Token';
import Word from 'Common/Models/Word';

export default class WordToken extends Token {
	public readonly words: ReadonlyArray<Word>;

	constructor(text: string, words: ReadonlyArray<Word>) {
		super(text);
		this.words = words;
	}

	private getBestWord(): Word|null {
		for (let i = 0; i < this.words.length; i++) {
			if (this.words[i].translationLang === 'fr') {
				return this.words[i];
			}
		}
		for (let i = 0; i < this.words.length; i++) {
			if (this.words[i].translationLang === 'en') {
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

		return word.getShortTranslation();
	}
}
