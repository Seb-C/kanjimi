import Database from 'Database/Database';
import Word from 'Dictionary/Word';
import Tag from 'Dictionary/Tag';

let singleton: Dictionary;

export default class Dictionary {
	private db: Database;
	private tags: { [tag: string]: Tag } = {};

	constructor(db: Database) {
		if (singleton) {
			return singleton;
		} else {
			singleton = this;
		}

		this.db = db;

		// TODO wait for this?
		this.db.iterate(
			Tag,
			async (pos: Tag) => {
				this.tags[pos.tag] = pos;
			},
			'SELECT * FROM "Tag"',
		);
	}

	async get (text: string): Promise<ReadonlyArray<Word>> {
		const words: Word[] = [];

		await this.db.iterate(
			Object,
			async (word: any) => {
				const tags: Tag[] = [];
				word.tags.forEach((tag: string) => {
					if (this.tags[tag]) {
						tags.push(this.tags[tag]);
					}
				}),

				words.push(new Word(<Word>{ ...word, tags }));
			},
			'SELECT * FROM "Word" WHERE "word" = ${text};',
			{ text },
		);

		return words;
	}
}
