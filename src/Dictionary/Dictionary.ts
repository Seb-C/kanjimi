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

	async loadFromDatabase(db: Database): Promise<void> {
		const senses: {
			[wordId: number]: Sense,
		} = {};
		await db.iterate(
			Sense,
			async (sense: Sense) => {
				console.log(sense);
			},
			'SELECT * FROM "dictionary"."Sense" LIMIT 50',
		);

		await db.iterate(
			Word,
			async (word: Word) => {
				console.log(word);
			},
			'SELECT * FROM "dictionary"."Word" LIMIT 50',
		);
	}

	loadFromArray(words: Word[]) {
		words.forEach(word => this.addWord(word));
	}
}
