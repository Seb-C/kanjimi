import { sql, PgSqlDatabase } from 'kiss-orm';

export default class UserActivity {
	private db: PgSqlDatabase;

	constructor (db: PgSqlDatabase) {
		this.db = db;
	}

	async createOrIncrement (
		userId: string,
		date: Date,
		characters: number,
	) {
		await this.db.query(sql`
			INSERT INTO "UserActivity" ("userId", "date", "characters")
			VALUES (${userId}, ${date}, ${characters})
			ON CONFLICT ON CONSTRAINT "UserActivity_primary_key" DO UPDATE
			SET "characters" = "UserActivity"."characters" + ${characters};
		`);
	}

	async get (userId: string, date: Date): Promise<{ characters: number }> {
		const activity: any = await this.db.query(sql`
			SELECT *
			FROM "UserActivity"
			WHERE "userId" = ${userId}
			AND "date" = ${date};
		`);
		if (activity.length === 0) {
			return {
				characters: 0,
			};
		}

		return {
			characters: activity[0].characters,
		};
	}
}
