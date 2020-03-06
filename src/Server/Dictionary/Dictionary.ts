import Word from 'Server/Dictionary/Word';
import Tag from 'Server/Dictionary/Tag';
import * as FileSystem from 'fs';
import * as Path from 'path';
import * as ReadLine from 'readline';

export default class Dictionary {
	private readonly words: Map<string, Word[]> = new Map();

	async load(): Promise<void[]> {
		const langAndFiles: { lang: string, path: string }[] = [
			{ lang: 'de', path: Path.join(__dirname, './data/words-de.csv') },
			{ lang: 'en', path: Path.join(__dirname, './data/words-en.csv') },
			{ lang: 'es', path: Path.join(__dirname, './data/words-es.csv') },
			{ lang: 'fr', path: Path.join(__dirname, './data/words-fr.csv') },
			{ lang: 'hu', path: Path.join(__dirname, './data/words-hu.csv') },
			{ lang: 'nl', path: Path.join(__dirname, './data/words-nl.csv') },
			{ lang: 'ru', path: Path.join(__dirname, './data/words-ru.csv') },
			{ lang: 'sl', path: Path.join(__dirname, './data/words-sl.csv') },
			{ lang: 'sv', path: Path.join(__dirname, './data/words-sv.csv') },
		];

		const loaders: Promise<void>[] = langAndFiles.map((file: { lang: string, path: string }) => {
			return new Promise((resolve, reject) => {
				const dictionaryFileIterator = ReadLine.createInterface({
					input: FileSystem.createReadStream(file.path),
				});

				let headerLine = true;
				dictionaryFileIterator.on('line', (line) => {
					if (headerLine) {
						headerLine = false;
						return;
					}

					this.add(this.parseCsvLine(line, file.lang));
				});

				dictionaryFileIterator.on('close', resolve);
			});
		});

		return Promise.all(loaders);
	}

	parseCsvLine (line: string, lang: string): Word {
		let word: string = '';
		let reading: string = '';
		let translation: string = '';
		let tags: Tag[] = [];

		let colIndex = 0;
		let colValue = '';
		let index = 0;
		const length = line.length;
		do {
			if (line[index] === ',' || index === length) {
				if (colValue[0] === '"' && colValue[colValue.length - 1] === '"') {
					// Removing quotes
					colValue = colValue.substring(1, colValue.length - 1);

					// Unescaping quotes
					colValue = colValue.replace(/""/g, '"');
				}

				if (colIndex === 0) {
					word = colValue;
				} else if (colIndex === 1) {
					reading = colValue;
				} else if (colIndex === 2) {
					translation = colValue;
				} else if (colIndex === 3) {
					tags = <Tag[]>colValue.split('/');
				}

				// Going to the next column
				colIndex++;
				colValue = '';
			} else {
				colValue += line[index];
			}

			index++;
		} while (index <= length);

		return new Word(word, reading, lang, translation, tags);
	}

	add (word: Word) {
		if (this.words.has(word.word)) {
			(<Word[]>this.words.get(word.word)).push(word);
		} else {
			this.words.set(word.word, [word]);
		}
	}

	get (text: string): ReadonlyArray<Word> {
		return this.words.get(text) || [];
	}

	has (text: string): boolean {
		return this.words.has(text);
	}
}
