import Database from '../Database';
import Word from './Word';
import Sense from './Sense';
import Reading from './Reading';
import Translation from './Translation';
import PartOfSpeech from './PartOfSpeech';

let singleton: Dictionary;

export default class Dictionary {
	private loaded: boolean = false;
	private words: { [key: string]: Word[] } = {};
	private partsOfSpeech: { [tag: string]: PartOfSpeech } = {};
	private translations: { [senseId: number]: Translation[] } = {};
	private senses: { [senseId: number]: Sense } = {};
	private sensesByWordId: { [wordId: number]: Sense[] } = {};
	private readings: { [readingId: number]: Reading } = {};
	private readingsByWordId: { [wordId: number]: Reading[] } = {};

	constructor() {
		if (singleton) {
			return singleton;
		} else {
			singleton = this;
		}
	}

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
		return <ReadonlyArray<Word>>(this.words[text] || []);
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

	protected async loadTranslationsFromDatabase(db: Database): Promise<void> {
		await db.iterate(
			Object,
			async (translation: any) => {
				if (typeof this.translations[translation.senseId] === 'undefined') {
					this.translations[translation.senseId] = [];
				}

				this.translations[translation.senseId].push(
					new Translation(<Translation>translation),
				);
			},
			'SELECT * FROM "dictionary"."Translation"',
		);
	}

	protected async loadSensesFromDatabase(db: Database): Promise<void> {
		await db.iterate(
			Object,
			async (sense: any) => {
				this.senses[sense.id] = new Sense(<Sense>{
					...sense,
					partOfSpeech: sense.partOfSpeech.map((tag: string) => this.partsOfSpeech[tag]),
					translations: (this.translations[sense.id] || []),
				});
			},
			'SELECT * FROM "dictionary"."Sense"',
		);
	}

	protected async loadSenseWordLinkFromDatabase(db: Database): Promise<void> {
		await db.iterate(
			Object,
			async (row: any) => {
				if (typeof this.sensesByWordId[row.wordId] === 'undefined') {
					this.sensesByWordId[row.wordId] = [];
				}

				if (typeof this.senses[row.senseId] !== 'undefined') {
					this.sensesByWordId[row.wordId].push(this.senses[row.senseId]);
				}
			},
			'SELECT * FROM "dictionary"."SenseWord"',
		);
	}

	protected async loadReadingsFromDatabase(db: Database): Promise<void> {
		await db.iterate(
			Object,
			async (reading: any) => {
				this.readings[reading.id] = new Reading(<Reading>reading);
			},
			'SELECT * FROM "dictionary"."Reading"',
		);
	}

	protected async loadReadingWordLinkFromDatabase(db: Database): Promise<void> {
		await db.iterate(
			Object,
			async (row: any) => {
				if (typeof this.readingsByWordId[row.wordId] === 'undefined') {
					this.readingsByWordId[row.wordId] = [];
				}

				if (typeof this.readings[row.readingId] !== 'undefined') {
					this.readingsByWordId[row.wordId].push(this.readings[row.readingId]);
				}
			},
			'SELECT * FROM "dictionary"."ReadingWord"',
		);
	}

	protected async loadWordsFromDatabase(db: Database): Promise<void> {
		await db.iterate(
			Object,
			async (word: any) => {
				if (typeof this.words[word.word] === 'undefined') {
					this.words[word.word] = [];
				}

				this.words[word.word].push(new Word(<Word>{
					...word,
					senses: this.sensesByWordId[word.id] || [],
					readings: this.readingsByWordId[word.id] || [],
				}));
			},
			'SELECT * FROM "dictionary"."Word"',
		);
	}

	async loadFromDatabase(db: Database): Promise<void> {
		if (this.loaded) {
			return;
		}

		console.log('Loading dictionary...');
		await this.loadPartsOfSpeechFromDatabase(db);
		await this.loadTranslationsFromDatabase(db);
		await this.loadSensesFromDatabase(db);
		await this.loadSenseWordLinkFromDatabase(db);
		await this.loadReadingsFromDatabase(db);
		await this.loadReadingWordLinkFromDatabase(db);
		await this.loadWordsFromDatabase(db);
		this.loaded = true;
		console.log('Loaded dictionary.');
	}

	loadFromArray(words: Word[]) {
		words.forEach(word => this.addWord(word));
	}
}
