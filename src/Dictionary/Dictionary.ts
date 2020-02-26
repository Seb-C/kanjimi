import Word from 'Dictionary/Word';
import Tag from 'Dictionary/Tag';
import * as FileSystem from 'fs';
import * as Path from 'path';
import * as ReadLine from 'readline';

export default class Dictionary {
	private words: Map<string, Word[]> = new Map();

	async load(): Promise<void> {
		return new Promise((resolve, reject) => {
			const dictionaryFileIterator = ReadLine.createInterface({
				input: FileSystem.createReadStream(
					Path.join(__dirname, '../../Dictionary/words.csv'),
				),
			});

			const dictionaryLoadingStart = +new Date();

			let headerLine = true;
			dictionaryFileIterator.on('line', (line) => {
				if (headerLine) {
					headerLine = false;
					return;
				}

				this.add(this.parseCsvLine(line));
			});

			dictionaryFileIterator.on('close', () => {
				console.log('Dictionary loaded in', ((+new Date()) - dictionaryLoadingStart), 'milliseconds.');
				resolve();
			});
		});
	}

	parseCsvLine (line: string): Word {
		let word: string = '';
		let reading: string = '';
		let translationLang: string = '';
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
					translationLang = colValue;
				} else if (colIndex === 3) {
					translation = colValue;
				} else if (colIndex === 4) {
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

		return new Word(word, reading, translationLang, translation, tags);
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
}
