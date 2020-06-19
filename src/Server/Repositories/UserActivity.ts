import Database from 'Server/Database/Database';

export default class UserActivity {
	private db: Database;

	constructor (db: Database) {
		this.db = db;
	}

	async createOrIncrement (
		userId: string,
		date: Date,
		characters: number,
	) {
		await this.db.exec(`
			INSERT INTO "UserActivity" ("userId", "date", "characters")
			VALUES (\${userId}, \${date}, \${characters})
			ON CONFLICT ON CONSTRAINT "UserActivity_primary_key" DO UPDATE
			SET "characters" = "UserActivity"."characters" + \${characters};
		`, {
			userId,
			date,
			characters,
		});
	}
}
