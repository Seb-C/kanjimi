import Word from 'Dictionary/Word';
import Tag from 'Dictionary/Tag';
import * as FileSystem from 'fs';
import * as Path from 'path';
import * as ReadLine from 'readline';

let singleton: Dictionary;

export default class Dictionary {
	private tags: { [tag: string]: Tag } = {};
	private words: { [text: string]: Word[] } = {};

	constructor() {
		if (singleton) {
			return singleton;
		} else {
			singleton = this;
		}
	}

	async load(): Promise<void> {
		const dictionaryFileIterator = ReadLine.createInterface({
			input: FileSystem.createReadStream(
				Path.join(__dirname, '../../Dictionary/words.csv'),
			),
		});

		for await (const line of dictionaryFileIterator) {
			// TODO load words as efficiently as possible
			console.log(`Line from file: ${line}`);
		}

		// TODO remove this.tags, have a type and an enum instead
	}

	get (text: string): ReadonlyArray<Word> {
		return this.words[text] || [];
	}
}
