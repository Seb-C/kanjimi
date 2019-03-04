import Database from '../Database';
import Word from './Word';
import Sense from './Sense';
import PartOfSpeech from './PartOfSpeech';

export default class Dictionary {
	private words: { [key: string]: Word[] } = {};
	private partsOfSpeech: { [tag: string]: PartOfSpeech } = {};
	private senses: { [wordId: number]: Sense[] } = {};

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

	protected async loadPartsOfSpeechFromDatabase(db: Database): Promise<void> {
		await db.iterate(
			PartOfSpeech,
			async (pos: PartOfSpeech) => {
				this.partsOfSpeech[pos.tag] = pos;
			},
			'SELECT * FROM "dictionary"."PartOfSpeech"',
		);
	}

	protected async loadSensesFromDatabase(db: Database): Promise<void> {
		await db.iterate(
			Object,
			async (sense: any) => {
				console.log(new Sense(<Sense>{
					...sense,
					partOfSpeech: sense.partOfSpeech.map((tag: string) => this.partsOfSpeech[tag]),
				}));
			},
			'SELECT * FROM "dictionary"."Sense" LIMIT 50',
		);
	}

	async loadFromDatabase(db: Database): Promise<void> {
		this.loadPartsOfSpeechFromDatabase(db);
		this.loadSensesFromDatabase(db);

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
