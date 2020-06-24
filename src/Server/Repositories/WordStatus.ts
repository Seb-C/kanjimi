import WordStatusModel from 'Common/Models/WordStatus';
import User from 'Common/Models/User';
import Dictionary from 'Server/Lexer/Dictionary';
import * as PgPromise from 'pg-promise';

export default class WordStatus {
	private db: PgPromise.IDatabase<void>;
	private dictionary: Dictionary;

	constructor (db: PgPromise.IDatabase<void>, dictionary: Dictionary) {
		this.db = db;
		this.dictionary = dictionary;
	}

	async getList(user: User, words: string[]): Promise<WordStatusModel[]> {
		return (await this.db.manyOrNone(`
			SELECT *
			FROM "WordStatus"
			WHERE "userId" = \${userId}
			AND "word" = ANY(\${words});
		`, {
			userId: user.id,
			words,
		})).map((row: any) => new WordStatusModel(row));
	}

	async get(user: User, word: string): Promise<WordStatusModel|null> {
		const result = await this.db.oneOrNone(`
			SELECT *
			FROM "WordStatus"
			WHERE "userId" = \${userId}
			AND "word" = \${word};
		`, {
			userId: user.id,
			word,
		});
		if (!result) {
			return null;
		} else {
			return new WordStatusModel(result);
		}
	}

	async createOrUpdate (
		user: User,
		word: string,
		showFurigana: boolean,
		showTranslation: boolean,
	): Promise<WordStatusModel> {
		// TODO add a transaction for those two queries

		await this.db.none(`
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
		const result = await this.db.oneOrNone(`
			INSERT INTO "WordStatus" ("userId", "word", "showFurigana", "showTranslation")
			VALUES (\${userId}, \${word}, \${showFurigana}, \${showTranslation})
			RETURNING *;
		`, {
			userId: user.id,
			word,
			showFurigana,
			showTranslation,
		});

		return new WordStatusModel(result);
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
