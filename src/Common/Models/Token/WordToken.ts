import Token from 'Common/Models/Token/Token';
import Word from 'Common/Models/Word';
import Language from 'Common/Types/Language';

export default class WordToken extends Token {
	public readonly words: ReadonlyArray<Word>;

	constructor(text: string, words: ReadonlyArray<Word>) {
		super(text);
		this.words = words;
	}

	public getFurigana(): string {
		if (this.words.length === 0) {
			return '';
		}

		return this.words[0].reading;
	}

	public getTranslation(): string {
		if (this.words.length === 0) {
			return '';
		}

		return this.words[0].getShortTranslation();
	}

	public toApi(): Object {
		return {
			...super.toApi(),
			type: 'WordToken',
			words: this.words.map(word => word.toApi()),
		};
	}

	public static fromApi(data: Object): Token {
		return new WordToken(
			<string>data.text,
			<ReadonlyArray<Word>>data.words.map(word => Word.fromApi(word)),
		);
	}
}
