import * as PgPromise from 'pg-promise';

export default class AnalyzeLog {
	private db: PgPromise.IDatabase<void>;

	constructor (db: PgPromise.IDatabase<void>) {
		this.db = db;
	}

	async create (
		sessionId: string,
		url: string,
		characters: number,
		requestedAt: Date,
	) {
		await this.db.none(`
			INSERT INTO "AnalyzeLog" ("id", "sessionId", "url", "characters", "requestedAt")
			VALUES (DEFAULT, \${sessionId}, \${url}, \${characters}, \${requestedAt});
		`, {
			sessionId,
			url,
			characters,
			requestedAt,
		});
	}
}
