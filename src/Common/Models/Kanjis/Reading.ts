export default class Reading {
	public readonly kanji: string;
	public readonly reading: string;

	constructor(kanji: string, reading: string) {
		this.kanji = kanji;
		this.reading = reading;
	}

	toApi(): object {
		return {
			kanji: this.kanji,
			reading: this.reading,
		};
	}

	public static fromApi(data: any): Reading {
		return new Reading(data.kanji, data.reading);
	}
}
