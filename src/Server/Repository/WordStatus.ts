import { Request } from 'express';
import Database from 'Server/Database/Database';
import WordStatusModel from 'Common/Models/WordStatus';
import User from 'Common/Models/User';
import * as Crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';

export default class WordStatus {
	private db: Database;

	constructor (db: Database) {
		this.db = db;
	}

	async getList(user: User, words: string[]): Promise<WordStatusModel[]> {
		return await this.db.array(WordStatusModel, `
			SELECT *
			FROM "WordStatus"
			WHERE "userId" = \${userId}
			AND "word" IN \${words};
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
}
