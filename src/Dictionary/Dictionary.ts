import Database from '../Database';
import Word from './Word';

export default class Dictionary {
	private words: { [key: string]: Word[] } = {};

	private addWord(word: Word) {
		if (typeof this.words[word.word] === 'undefined') {
			this.words[word.word] = [];
		}

		this.words[word.word].push(word);
	}

	has (text: string): boolean {
		return typeof this.words[text] !== 'undefined';
	}

	get (text: string): ReadonlyArray<Word> {
		return <ReadonlyArray<Word>>this.words[text];
	}

	// async loadFromDatabase(db: Database): Promise<void> {
	// 	return db.stream('SELECT * FROM "Word" LIMIT 50', (s) => {
	// 		console.log(s);
	// 	});
	// 	// TODO
	// }

	mock(words: Word[]) {
		words.forEach(word => this.addWord(word));
	}
}
