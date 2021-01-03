import WordStatusModel from 'Common/Models/WordStatus';
import User from 'Common/Models/User';
import Dictionary from 'Server/Lexer/Dictionary';
import { sql, PgSqlDatabase } from 'kiss-orm';

export default class WordStatus {
	private db: PgSqlDatabase;
	private dictionary: Dictionary;

	constructor (db: PgSqlDatabase, dictionary: Dictionary) {
		this.db = db;
		this.dictionary = dictionary;
	}

	async getList(user: User, words: string[]): Promise<WordStatusModel[]> {
		return (await this.db.query(sql`
			SELECT *
			FROM "WordStatus"
			WHERE "userId" = ${user.id}
			AND "word" = ANY(${words});
		`)).map((row: any) => new WordStatusModel(row));
	}

	async get(user: User, word: string): Promise<WordStatusModel|null> {
		const result = await this.db.query(sql`
			SELECT *
			FROM "WordStatus"
			WHERE "userId" = ${user.id}
			AND "word" = ${word};
		`);
		if (result.length === 0) {
			return null;
		} else {
			return new WordStatusModel(result[0]);
		}
	}

	async createOrUpdate (
		user: User,
		word: string,
		showFurigana: boolean,
		showTranslation: boolean,
	): Promise<WordStatusModel> {
		return this.db.sequence(async sequenceDb => {
			await sequenceDb.query(sql`BEGIN;`);

			try {
				await sequenceDb.query(sql`
					DELETE FROM "WordStatus"
					WHERE "userId" = ${user.id}
					AND "word" = ${word};
				`);

				const result = await sequenceDb.query(sql`
					INSERT INTO "WordStatus" ("userId", "word", "showFurigana", "showTranslation")
					VALUES (${user.id}, ${word}, ${showFurigana}, ${showTranslation})
					RETURNING *;
				`);

				await sequenceDb.query(sql`COMMIT;`);

				return new WordStatusModel(result[0]);
			} catch (error) {
				await sequenceDb.query(sql`ROLLBACK;`);
				throw error;
			}
		});
	}

	async create (
		user: User,
		word: string,
		showFurigana: boolean,
		showTranslation: boolean,
	): Promise<WordStatusModel> {
		const result = await this.db.query(sql`
			INSERT INTO "WordStatus" ("userId", "word", "showFurigana", "showTranslation")
			VALUES (${user.id}, ${word}, ${showFurigana}, ${showTranslation})
			RETURNING *;
		`);

		return new WordStatusModel(result[0]);
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
