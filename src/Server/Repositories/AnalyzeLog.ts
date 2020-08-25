import { sql, PgSqlDatabase } from 'kiss-orm';

export default class AnalyzeLog {
	private db: PgSqlDatabase;

	constructor (db: PgSqlDatabase) {
		this.db = db;
	}

	async create (
		sessionId: string,
		url: string,
		characters: number,
		requestedAt: Date,
	) {
		await this.db.query(sql`
			INSERT INTO "AnalyzeLog" ("id", "sessionId", "url", "characters", "requestedAt")
			VALUES (DEFAULT, ${sessionId}, ${url}, ${characters}, ${requestedAt});
		`);
	}
}
