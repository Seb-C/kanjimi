import Meaning from 'Common/Models/Kanjis/Meaning';
import Reading from 'Common/Models/Kanjis/Reading';
import Structure from 'Common/Models/Kanjis/Structure';

export default class Kanji {
	public readonly kanji: string;
	public readonly meanings: ReadonlyArray<Meaning>;
	public readonly readings: ReadonlyArray<Reading>;
	public readonly structure: Structure;
	public readonly fileUrl: string;

	constructor(
		kanji: string,
		meanings: ReadonlyArray<Meaning>,
		readings: ReadonlyArray<Reading>,
		structure: Structure,
		fileUrl: string,
	) {
		this.kanji = kanji;
		this.meanings = meanings;
		this.readings = readings;
		this.structure = structure;
		this.fileUrl = fileUrl;
	}

	toApi(): object {
		return {
			kanji: this.kanji,
			meanings: this.meanings.map(meaning => meaning.toApi()),
			readings: this.readings.map(reading => reading.toApi()),
			structure: this.structure.toApi(),
			fileUrl: this.fileUrl,
		};
	}

	public static fromApi(data: any): Kanji {
		return new Kanji(
			data.kanji,
			data.meanings.map((meaning: object) => Meaning.fromApi(meaning)),
			data.readings.map((reading: object) => Reading.fromApi(reading)),
			Structure.fromApi(data.structure),
			data.fileUrl,
		);
	}
}
