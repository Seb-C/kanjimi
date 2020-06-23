import Word from 'Common/Models/Word';
import WordTag from 'Common/Types/WordTag';
import Language from 'Common/Types/Language';
import * as FileSystem from 'fs';
import * as Path from 'path';
import * as ReadLine from 'readline';

class LinkedListWord extends Word {
	public next: LinkedListWord|null = null;
}
class LinkedListFirstWord extends LinkedListWord {
	public last: LinkedListWord = this;
}

export default class Dictionary {
	private readonly words: Map<string, LinkedListFirstWord> = new Map();

	async load() {
		// Function used to de-duplicate those structures in memory
		const splittedTagArrays: Map<string, ReadonlyArray<WordTag>> = new Map();
		const getSplittedTagArray = (tags: string): ReadonlyArray<WordTag> => {
			if (!splittedTagArrays.has(tags)) {
				const tagsArray = <ReadonlyArray<WordTag>>tags.split('/');
				splittedTagArrays.set(tags, tagsArray);
			}

			return <ReadonlyArray<WordTag>>splittedTagArrays.get(tags);
		};

		// Loading words (word => [reading, tag[]])
		type TempWord = [string, ReadonlyArray<WordTag>];
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
				const value: TempWord = [col[1], getSplittedTagArray(col[2])];

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
						this.add(
							col[0],
							wordWithoutDefinition[i][0],
							file.lang,
							col[1],
							wordWithoutDefinition[i][1],
						);
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
					col[0],
					col[1],
					null,
					col[2],
					getSplittedTagArray(col[3]),
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

	add (
		wordString: string,
		reading: string,
		translationLang: Language|null,
		translation: string,
		tags: ReadonlyArray<WordTag>,
	) {
		if (this.words.has(wordString)) {
			const firstWord = <LinkedListFirstWord>this.words.get(wordString);
			const word = new LinkedListWord(wordString, reading, translationLang, translation, tags);
			firstWord.last.next = word;
			firstWord.last = word;
		} else {
			const word = new LinkedListFirstWord(wordString, reading, translationLang, translation, tags);
			word.last = word;
			this.words.set(wordString, word);
		}

		if (
			wordString !== reading
			&& tags.some(tag => (
				tag === WordTag.ONLY_KANA
				|| tag === WordTag.ONLY_KANA_WRITING
			))
		) {
			// Indexing by reading
			if (this.words.has(reading)) {
				const firstWord = <LinkedListFirstWord>this.words.get(reading);
				const word = new LinkedListWord(wordString, reading, translationLang, translation, tags);
				firstWord.last.next = word;
				firstWord.last = word;
			} else {
				const word = new LinkedListFirstWord(wordString, reading, translationLang, translation, tags);
				word.last = word;
				this.words.set(reading, word);
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
		if (!this.has(text)) {
			return [];
		}

		// Converting the words list to an array
		const words: Word[] = [];
		let currentWord = <LinkedListWord|null>this.words.get(text);
		do {
			words.push(<Word>currentWord);
		} while ((currentWord = (<LinkedListWord>currentWord).next) !== null);

		return this.filterAndSortLangs(words, langs);
	}

	has (text: string): boolean {
		return this.words.has(text);
	}
}
