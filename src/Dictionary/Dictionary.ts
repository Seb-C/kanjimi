import Word from 'Dictionary/Word';
import Tag from 'Dictionary/Tag';
import * as FileSystem from 'fs';
import * as Path from 'path';
import * as ReadLine from 'readline';

let singleton: Dictionary;

export default class Dictionary {
	private words: { [text: string]: Word[] } = {};

	constructor() {
		if (singleton) {
			return singleton;
		} else {
			singleton = this;
		}
	}

	async load(): Promise<void> {
		return new Promise((resolve, reject) => {
			const dictionaryFileIterator = ReadLine.createInterface({
				input: FileSystem.createReadStream(
					Path.join(__dirname, '../../Dictionary/words.csv'),
				),
			});

			let headerLine = true;
			dictionaryFileIterator.on('line', (line) => {
				if (headerLine) {
					headerLine = false;
					return;
				}

				const word = this.parseCsvLine(line);

				if (!this.words[word.word]) {
					this.words[word.word] = [];
				}

				this.words[word.word].push(word);
			});

			dictionaryFileIterator.on('close', () => {
				resolve();
			});
		});
	}

	parseCsvLine (line: string): Word {
		const wordAttributes: {
			word: string
			reading: string
			translationLang: string
			translation: string
			tags: Tag[],
		} = {
			word: '',
			reading: '',
			translationLang: '',
			translation: '',
			tags: [],
		};
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
					wordAttributes.word = colValue;
				} else if (colIndex === 1) {
					wordAttributes.reading = colValue;
				} else if (colIndex === 2) {
					wordAttributes.translationLang = colValue;
				} else if (colIndex === 3) {
					wordAttributes.translation = colValue;
				} else if (colIndex === 4) {
					wordAttributes.tags = <Tag[]>colValue.split('/');
				}

				// Going to the next column
				colIndex++;
				colValue = '';
			} else {
				colValue += line[index];
			}

			index++;
		} while (index <= length);

		return new Word(<Word><any>wordAttributes);
	}

	get (text: string): ReadonlyArray<Word> {
		return this.words[text] || [];
	}
}
