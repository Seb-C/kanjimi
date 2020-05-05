export default class WordStatus {
	public readonly userId: string;
	public readonly word: string;
	public readonly showFurigana: boolean;
	public readonly showTranslation: boolean;

	constructor(attributes: any) {
		this.userId = attributes.userId;
		this.word = attributes.word;
		this.showFurigana = attributes.showFurigana;
		this.showTranslation = attributes.showTranslation;
	}

	toApi(): object {
		return {
			userId: this.userId,
			word: this.word,
			showFurigana: this.showFurigana,
			showTranslation: this.showTranslation,
		};
	}

	public static fromApi(data: any): WordStatus {
		return new WordStatus(<object>data);
	}
}
