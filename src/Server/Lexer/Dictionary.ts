import Word from 'Common/Models/Word';
import WordTag from 'Common/Types/WordTag';
import Language from 'Common/Types/Language';
import * as FileSystem from 'fs';
import * as Path from 'path';
import * as ReadLine from 'readline';

export default class Dictionary {
	private readonly words: Map<string, Word[]> = new Map();

	async load(): Promise<void[]> {
		const langAndFiles: { lang: Language|null, path: string }[] = [
			{ lang: Language.GERMAN, path: Path.join(__dirname, './data/words-de.csv') },
			{ lang: Language.ENGLISH, path: Path.join(__dirname, './data/words-en.csv') },
			{ lang: Language.SPANISH, path: Path.join(__dirname, './data/words-es.csv') },
			{ lang: Language.FRENCH, path: Path.join(__dirname, './data/words-fr.csv') },
			{ lang: Language.HUNGARIAN, path: Path.join(__dirname, './data/words-hu.csv') },
			{ lang: Language.DUTCH, path: Path.join(__dirname, './data/words-nl.csv') },
			{ lang: Language.RUSSIAN, path: Path.join(__dirname, './data/words-ru.csv') },
			{ lang: Language.SLOVENIAN, path: Path.join(__dirname, './data/words-sl.csv') },
			{ lang: Language.SWEDISH, path: Path.join(__dirname, './data/words-sv.csv') },
			{ lang: null, path: Path.join(__dirname, './data/names.csv') },
		];

		const loaders: Promise<void>[] = langAndFiles.map((file: {
			lang: Language|null,
			path: string,
		}) => {
			return new Promise((resolve) => {
				const dictionaryFileIterator = ReadLine.createInterface({
					input: FileSystem.createReadStream(file.path),
				});

				let headerLine = true;
				dictionaryFileIterator.on('line', (line) => {
					if (headerLine) {
						headerLine = false;
						return;
					}

					this.add(this.csvLineToWord(line, file.lang));
				});

				dictionaryFileIterator.on('close', resolve);
			});
		});

		return Promise.all(loaders);
	}

	csvLineToWord (line: string, lang: Language|null): Word {
		const col = this.parseCsvLine(line);
		return new Word(col[0], col[1], lang, col[2], <WordTag[]>col[3].split('/'));
	}

	parseCsvLine (line: string): string[] {
		const columns = [];

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

				columns.push(colValue);

				// Going to the next column
				colValue = '';
			} else {
				colValue += line[index];
			}

			index++;
		} while (index <= length);

		return columns;
	}

	add (word: Word) {
		if (this.words.has(word.word)) {
			(<Word[]>this.words.get(word.word)).push(word);
		} else {
			this.words.set(word.word, [word]);
		}

		if (
			word.word !== word.reading
			&& word.tags.some(tag => (
				tag === WordTag.ONLY_KANA
				|| tag === WordTag.ONLY_KANA_WRITING
			))
		) {
			// Indexing by reading
			if (this.words.has(word.reading)) {
				(<Word[]>this.words.get(word.reading)).push(word);
			} else {
				this.words.set(word.reading, [word]);
			}
		}
	}

	private filterAndSortLangs(words: Word[], langs: Language[]|null): Word[] {
		if (langs === null) {
			return words;
		} else {
			// We want the result to have the languages ordered like the langs array
			const filteredWords: Word[] = [];
			for (let i = 0; i < langs.length; i++) {
				for (let j = 0; j < words.length; j++) {
					if (words[j].translationLang === langs[i]) {
						filteredWords.push(words[j]);
					}
				}
			}

			// Adding words not associated to a lang
			for (let j = 0; j < words.length; j++) {
				if (words[j].translationLang === null) {
					filteredWords.push(words[j]);
				}
			}

			return filteredWords;
		}
	}

	get (text: string, langs: Language[]|null): ReadonlyArray<Word> {
		return this.filterAndSortLangs(
			this.words.get(text) || [],
			langs,
		);
	}

	has (text: string): boolean {
		return this.words.has(text);
	}
}
