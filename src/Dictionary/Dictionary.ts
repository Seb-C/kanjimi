import Database from '../Database';
import Word from './Word';
import PartOfSpeech from './PartOfSpeech';

let singleton: Dictionary;

export default class Dictionary {
	private db: Database;
	private partsOfSpeech: { [tag: string]: PartOfSpeech } = {};

	constructor(db: Database) {
		if (singleton) {
			return singleton;
		} else {
			singleton = this;
		}

		this.db = db;

		// TODO wait for this?
		this.db.iterate(
			PartOfSpeech,
			async (pos: PartOfSpeech) => {
				this.partsOfSpeech[pos.tag] = pos;
			},
			'SELECT * FROM "PartOfSpeech"',
		);
	}

	async get (text: string): Promise<ReadonlyArray<Word>> {
		const words: Word[] = [];

		await this.db.iterate(
			Object,
			async (word: any) => {
				const partOfSpeech: PartOfSpeech[] = [];
				word.partOfSpeech.forEach((tag: string) => {
					if (this.partsOfSpeech[tag]) {
						partOfSpeech.push(this.partsOfSpeech[tag]);
					}
				}),

				words.push(new Word(<Word>{ ...word, partOfSpeech }));
			},
			'SELECT * FROM "Word" WHERE "word" = ${text};',
			{ text },
		);

		return words;
	}
}
