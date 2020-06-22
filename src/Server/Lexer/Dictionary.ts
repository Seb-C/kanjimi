import Word from 'Common/Models/Word';
import WordTag from 'Common/Types/WordTag';
import Language from 'Common/Types/Language';
import * as FileSystem from 'fs';
import * as Path from 'path';
import * as ReadLine from 'readline';

export default class Dictionary {
	private readonly words: Map<string, Word[]> = new Map();

	async load() {
		// Loading words (word => [reading, tag[]])
		type TempWord = [string, WordTag[]];
		const wordsWithoutDefinitions: Map<string, TempWord[]> = new Map();
		await new Promise((resolve) => {
			const dictionaryFileReadStream = FileSystem.createReadStream(
				Path.join(process.cwd(), './src/Server/Lexer/data/words.csv'),
			);
			const dictionaryFileIterator = ReadLine.createInterface({
				input: dictionaryFileReadStream,
			});
			dictionaryFileIterator.on('line', (line) => {
				const col = this.parseCsvLine(line);
				const key = col[0];
				const value: TempWord = [col[1], <WordTag[]>col[2].split('/')];

				if (wordsWithoutDefinitions.has(key)) {
					(<TempWord[]>wordsWithoutDefinitions.get(key)).push(value);
				} else {
					wordsWithoutDefinitions.set(key, [value]);
				}
			});
			dictionaryFileIterator.on('close', () => {
				dictionaryFileReadStream.destroy();
				resolve();
			});
		});

		await Promise.all(
			[
				{ lang: Language.GERMAN, path: Path.join(process.cwd(), './src/Server/Lexer/data/definitions-de.csv') },
				{ lang: Language.ENGLISH, path: Path.join(process.cwd(), './src/Server/Lexer/data/definitions-en.csv') },
				{ lang: Language.SPANISH, path: Path.join(process.cwd(), './src/Server/Lexer/data/definitions-es.csv') },
				{ lang: Language.FRENCH, path: Path.join(process.cwd(), './src/Server/Lexer/data/definitions-fr.csv') },
				{ lang: Language.HUNGARIAN, path: Path.join(process.cwd(), './src/Server/Lexer/data/definitions-hu.csv') },
				{ lang: Language.DUTCH, path: Path.join(process.cwd(), './src/Server/Lexer/data/definitions-nl.csv') },
				{ lang: Language.RUSSIAN, path: Path.join(process.cwd(), './src/Server/Lexer/data/definitions-ru.csv') },
				{ lang: Language.SLOVENIAN, path: Path.join(process.cwd(), './src/Server/Lexer/data/definitions-sl.csv') },
				{ lang: Language.SWEDISH, path: Path.join(process.cwd(), './src/Server/Lexer/data/definitions-sv.csv') },
			].map((file) => new Promise((resolve) => {
				const dictionaryFileReadStream = FileSystem.createReadStream(file.path);
				const dictionaryFileIterator = ReadLine.createInterface({
					input: dictionaryFileReadStream,
				});

				dictionaryFileIterator.on('line', (line) => {
					const col = this.parseCsvLine(line);
					const wordWithoutDefinition = wordsWithoutDefinitions.get(col[0]);
					if (!wordWithoutDefinition) {
						throw new Error(`Word ${col[0]} (${file.lang}) has a definition but does not exists.`);
					}

					for (let i = 0; i < wordWithoutDefinition.length; i++) {
						this.add(new Word(
							col[0],
							wordWithoutDefinition[i][0],
							file.lang,
							col[1],
							wordWithoutDefinition[i][1],
						));
					}
				});

				dictionaryFileIterator.on('close', () => {
					dictionaryFileReadStream.destroy();
					resolve();
				});
			}))
		);

		// Loading names
		await new Promise((resolve) => {
			const dictionaryFileReadStream = FileSystem.createReadStream(
				Path.join(process.cwd(), './src/Server/Lexer/data/names.csv'),
			);
			const dictionaryFileIterator = ReadLine.createInterface({
				input: dictionaryFileReadStream,
			});
			dictionaryFileIterator.on('line', (line) => {
				const col = this.parseCsvLine(line);
				this.add(
					new Word(
						col[0],
						col[1],
						null,
						col[2],
						<WordTag[]>col[3].split('/'),
					)
				);
			});
			dictionaryFileIterator.on('close', () => {
				dictionaryFileReadStream.destroy();
				resolve();
			});
		});
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
