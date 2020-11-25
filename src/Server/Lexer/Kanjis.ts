import Meaning from 'Common/Models/Kanjis/Meaning';
import Reading from 'Common/Models/Kanjis/Reading';
import Structure from 'Common/Models/Kanjis/Structure'; import Kanji from 'Common/Models/Kanjis/Kanji'; import Language from 'Common/Types/Language';
import * as FileSystem from 'fs';
import * as Path from 'path';
import * as ReadLine from 'readline';
import parseCsvLine from 'Server/Lexer/Utils/parseCsvLine';

export default class Kanjis {
	private readonly meanings: Map<string, Meaning[]> = new Map();
	private readonly readings: Map<string, Reading[]> = new Map();
	private readonly structures: Map<string, Structure> = new Map();

	async load() {
		await Promise.all(
			[
				{ lang: Language.ENGLISH, path: Path.join(process.cwd(), './src/Server/Lexer/data/kanjis-meanings-en.csv') },
				{ lang: Language.SPANISH, path: Path.join(process.cwd(), './src/Server/Lexer/data/kanjis-meanings-es.csv') },
				{ lang: Language.FRENCH, path: Path.join(process.cwd(), './src/Server/Lexer/data/kanjis-meanings-fr.csv') },
			].map((file) => new Promise<void>((resolve) => {
				const meaningsFileReadStream = FileSystem.createReadStream(file.path);
				const meaningsFileIterator = ReadLine.createInterface({
					input: meaningsFileReadStream,
				});

				meaningsFileIterator.on('line', (line) => {
					const col = parseCsvLine(line);
					this.addMeaning(new Meaning(col[0], col[1], file.lang));
				});

				meaningsFileIterator.on('close', () => {
					meaningsFileReadStream.destroy();
					resolve();
				});
			}))
		);

		await new Promise<void>((resolve) => {
			const readingsFileReadStream = FileSystem.createReadStream(
				Path.join(process.cwd(), './src/Server/Lexer/data/kanjis-readings.csv')
			);
			const readingsFileIterator = ReadLine.createInterface({
				input: readingsFileReadStream,
			});

			readingsFileIterator.on('line', (line) => {
				const col = parseCsvLine(line);
				this.addReading(new Reading(col[0], col[1]));
			});

			readingsFileIterator.on('close', () => {
				readingsFileReadStream.destroy();
				resolve();
			});
		});

		await new Promise<void>((resolve) => {
			const structuresFileReadStream = FileSystem.createReadStream(
				Path.join(process.cwd(), './src/Server/Lexer/data/kanjis-structure.jsonl')
			);
			const structuresFileIterator = ReadLine.createInterface({
				input: structuresFileReadStream,
			});

			structuresFileIterator.on('line', (line) => {
				this.addStructure(Structure.fromApi(JSON.parse(line)));
			});

			structuresFileIterator.on('close', () => {
				structuresFileReadStream.destroy();
				resolve();
			});
		});
	}

	public addMeaning(meaning: Meaning) {
		if (this.meanings.has(meaning.kanji)) {
			(<Meaning[]>this.meanings.get(meaning.kanji)).push(meaning);
		} else {
			this.meanings.set(meaning.kanji, [meaning]);
		}
	}

	public addReading(reading: Reading) {
		if (this.readings.has(reading.kanji)) {
			(<Reading[]>this.readings.get(reading.kanji)).push(reading);
		} else {
			this.readings.set(reading.kanji, [reading]);
		}
	}

	public addStructure(structure: Structure) {
		this.structures.set(structure.element, structure);
	}

	private filterAndSortLangs(meanings: Meaning[], langs: ReadonlyArray<Language>|null): Meaning[] {
		if (langs === null) {
			return meanings;
		} else {
			// We want the result to have the languages ordered like the langs array
			const filteredMeanings: Meaning[] = [];
			for (let i = 0; i < langs.length; i++) {
				for (let j = 0; j < meanings.length; j++) {
					if (meanings[j].meaningLang === langs[i]) {
						filteredMeanings.push(meanings[j]);
					}
				}
			}

			return filteredMeanings;
		}
	}

	get (kanji: string, langs: ReadonlyArray<Language>|null): Kanji|null {
		if (!this.has(kanji)) {
			return null;
		}

		let kanjiHex = kanji.charCodeAt(0).toString(16);
		while (kanjiHex.length < 5) {
			kanjiHex = '0' + kanjiHex;
		}
		const fileUrl = `${process.env.KANJIMI_WWW_URL}/img/KanjiVG/${kanjiHex}.svg`;

		const meanings = this.filterAndSortLangs(this.meanings.get(kanji) || [], langs);
		const readings = this.readings.get(kanji) || [];
		const structure = (
			this.structures.get(kanji)
			|| new Structure(kanji, null, [])
		);

		return new Kanji(kanji, meanings, readings, structure, fileUrl);
	}

	/**
	 * This method does not take the langs argument since not having meanings
	 * does not mean that we do not have other data about the kanji.
	 */
	has (kanji: string): boolean {
		return (
			this.meanings.has(kanji)
			|| this.readings.has(kanji)
			|| this.structures.has(kanji)
		);
	}
}
