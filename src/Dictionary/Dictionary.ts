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

	async loadFromDatabase(db: Database): Promise<void> {
		if (this.loaded) {
			return;
		}

		console.log('Loading dictionary...');

		const partsOfSpeech: { [tag: string]: PartOfSpeech } = {};
		await db.iterate(
			PartOfSpeech,
			async (pos: PartOfSpeech) => {
				partsOfSpeech[pos.tag] = pos;
			},
			'SELECT * FROM "dictionary"."PartOfSpeech"',
		);

		await db.iterate(
			Object,
			async (word: any) => {
				if (typeof this.words[word.word] === 'undefined') {
					this.words[word.word] = [];
				}

				this.words[word.word].push(new Word(<Word>{
					...word,
					partOfSpeech: sense.partOfSpeech.map((tag: string) => partsOfSpeech[tag]),
				}));
			},
			'SELECT * FROM "dictionary"."Word"',
		);

		this.loaded = true;
		console.log('Loaded dictionary.');
	}

	loadFromArray(words: Word[]) {
		words.forEach(word => this.addWord(word));
	}
}
