import Language from 'Common/Types/Language';

export default class Meaning {
	public readonly kanji: string;
	public readonly meaning: string;
	public readonly meaningLang: Language;

	constructor(
		kanji: string,
		meaning: string,
		meaningLang: Language,
	) {
		this.kanji = kanji;
		this.meaning = meaning;
		this.meaningLang = meaningLang;
	}

	toApi(): object {
		return {
			kanji: this.kanji,
			meaning: this.meaning,
			meaningLang: this.meaningLang,
		};
	}

	public static fromApi(data: any): Meaning {
		return new Meaning(
			data.kanji,
			data.meaning,
			data.meaningLang,
		);
	}
}
