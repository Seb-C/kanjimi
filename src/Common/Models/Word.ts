import WordTagType from 'Common/Types/WordTagType';

export default class Word {
	public readonly word: string;
	public readonly reading: string;
	public readonly translationLang: string;
	public readonly translation: string;
	public readonly tags: ReadonlyArray<WordTagType>;

	constructor(
		word: string,
		reading: string,
		translationLang: string,
		translation: string,
		tags: ReadonlyArray<WordTagType>,
	) {
		this.word = word;
		this.reading = reading;
		this.translationLang = translationLang;
		this.translation = translation;
		this.tags = tags;
	}

	getShortTranslation(): string {
		return this.translation.replace(/^([^{(]+).*$/, '$1').trim();
	}
}
