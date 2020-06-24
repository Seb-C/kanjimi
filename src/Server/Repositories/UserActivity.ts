import * as PgPromise from 'pg-promise';

export default class UserActivity {
	private db: PgPromise.IDatabase<void>;

	constructor (db: PgPromise.IDatabase<void>) {
		this.db = db;
	}

	async createOrIncrement (
		userId: string,
		date: Date,
		characters: number,
	) {
		await this.db.none(`
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

	async get (userId: string, date: Date): Promise<{ characters: number }> {
		const activity: any = await this.db.oneOrNone(`
			SELECT *
			FROM "UserActivity"
			WHERE "userId" = \${userId}
			AND "date" = \${date};
		`, { userId, date });
		if (activity === null) {
			return {
				characters: 0,
			};
		}

		return {
			characters: activity.characters,
		};
	}
}
