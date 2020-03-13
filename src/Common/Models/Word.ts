import WordTagType from 'Common/Types/WordTagType';
import Language from 'Common/Types/Language';

export default class Word {
	public readonly word: string;
	public readonly reading: string;
	public readonly translationLang: Language;
	public readonly translation: string;
	public readonly tags: ReadonlyArray<WordTagType>;

	constructor(
		word: string,
		reading: string,
		translationLang: Language,
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
