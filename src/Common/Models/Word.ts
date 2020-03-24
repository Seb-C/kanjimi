import WordTag from 'Common/Types/WordTag';
import Language from 'Common/Types/Language';

export default class Word {
	public readonly word: string;
	public readonly reading: string;
	public readonly translationLang: Language|null;
	public readonly translation: string;
	public readonly tags: ReadonlyArray<WordTag>;

	constructor(
		word: string,
		reading: string,
		translationLang: Language|null,
		translation: string,
		tags: ReadonlyArray<WordTag>,
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

	public toApi(): any {
		return {
			word: this.word,
			reading: this.reading,
			translationLang: this.translationLang,
			translation: this.translation,
			tags: this.tags,
		};
	}

	public static fromApi(data: any): Word {
		return new Word(
			<string>data.word,
			<string>data.reading,
			<Language|null>data.translationLang,
			<string>data.translation,
			<ReadonlyArray<WordTag>>data.tags,
		);
	}
}
