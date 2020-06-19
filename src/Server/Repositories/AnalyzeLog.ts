import Database from 'Server/Database/Database';

export default class AnalyzeLog {
	private db: Database;

	constructor (db: Database) {
		this.db = db;
	}

	async create (
		sessionId: string,
		url: string,
		characters: number,
		requestedAt: Date,
	) {
		await this.db.exec(`
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
