import Database from 'Server/Database/Database';
import WordStatusModel from 'Common/Models/WordStatus';
import User from 'Common/Models/User';
import Dictionary from 'Server/Lexer/Dictionary';

export default class WordStatus {
	private db: Database;
	private dictionary: Dictionary;

	constructor (db: Database, dictionary: Dictionary) {
		this.db = db;
		this.dictionary = dictionary;
	}

	async getList(user: User, words: string[]): Promise<WordStatusModel[]> {
		return await this.db.array(WordStatusModel, `
			SELECT *
			FROM "WordStatus"
			WHERE "userId" = \${userId}
			AND "word" = ANY(\${words});
		`, {
			userId: user.id,
			words,
		});
	}

	async get(user: User, word: string): Promise<WordStatusModel|null> {
		return await this.db.get(WordStatusModel, `
			SELECT *
			FROM "WordStatus"
			WHERE "userId" = \${userId}
			AND "word" = \${word};
		`, {
			userId: user.id,
			word,
		});
	}

	async createOrUpdate (
		user: User,
		word: string,
		showFurigana: boolean,
		showTranslation: boolean,
	): Promise<WordStatusModel> {
		// TODO add a transaction for those two queries

		await this.db.exec(`
			DELETE FROM "WordStatus"
			WHERE "userId" = \${userId}
			AND "word" = \${word};
		`, {
			userId: user.id,
			word,
		});

		return this.create(user, word, showFurigana, showTranslation);
	}

	async create (
		user: User,
		word: string,
		showFurigana: boolean,
		showTranslation: boolean,
	): Promise<WordStatusModel> {
		return <WordStatusModel>await this.db.get(WordStatusModel, `
			INSERT INTO "WordStatus" ("userId", "word", "showFurigana", "showTranslation")
			VALUES (\${userId}, \${word}, \${showFurigana}, \${showTranslation})
			RETURNING *;
		`, {
			userId: user.id,
			word,
			showFurigana,
			showTranslation,
		});
	}

	getDefaultWordStatus(user: User, word: string): WordStatusModel {
		const defaultWordStatus = () => new WordStatusModel({
			userId: user.id,
			word,
			showFurigana: true,
			showTranslation: true,
		});

		if (user.jlpt === null) {
			return defaultWordStatus();
		}

		const dictionaryWords = this.dictionary.get(word, null);
		if (dictionaryWords.length === 0) {
			return defaultWordStatus();
		}

		// Using the first word, assuming all definitions have the same tags
		const wordJlptLevel = dictionaryWords[0].getJlptLevel();
		if (wordJlptLevel === null) {
			return defaultWordStatus();
		}

		if (user.jlpt <= wordJlptLevel) {
			return new WordStatusModel({
				userId: user.id,
				word,
				showFurigana: false,
				showTranslation: false,
			});
		} else {
			return defaultWordStatus();
		}
	}
}
