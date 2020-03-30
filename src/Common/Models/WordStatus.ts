export default class WordStatus {
	public readonly userId: string;
	public readonly word: string;
	public readonly showFurigana: boolean;
	public readonly showTranslation: boolean;

	constructor(attributes: object) {
		Object.assign(this, attributes);
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
