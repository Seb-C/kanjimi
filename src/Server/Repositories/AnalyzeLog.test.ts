import 'jasmine';
import AnalyzeLogRepository from 'Server/Repositories/AnalyzeLog';
import { sql } from 'kiss-orm';
import { v4 as uuidv4 } from 'uuid';

describe('AnalyzeLogRepository', async function() {
	beforeEach(async function() {
		await this.db.query(sql`TRUNCATE "AnalyzeLog";`);
	});

	it('create', async function() {
		const sessionId = uuidv4();
		const date = new Date();
		const analyzeLogRepository = new AnalyzeLogRepository(this.db);
		await analyzeLogRepository.create({
			sessionId,
			url: 'https://example.com/japanesePage',
			characters: 42,
			requestedAt: date,
		});
		const analyzeLogs = await this.db.query(sql`
			SELECT * FROM "AnalyzeLog" WHERE "sessionId" = ${sessionId};
		`);

		expect(analyzeLogs.length).not.toBe(0);
		expect(analyzeLogs[0].url).toEqual('https://example.com/japanesePage');
		expect(analyzeLogs[0].characters).toEqual(42);
		expect(analyzeLogs[0].requestedAt).toEqual(date);
	});
});
