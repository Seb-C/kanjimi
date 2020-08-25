import 'jasmine';
import AnalyzeLogRepository from 'Server/Repositories/AnalyzeLog';
import { sql } from 'kiss-orm';
import { v4 as uuidv4 } from 'uuid';

describe('AnalyzeLogRepository', async function() {
	beforeEach(async function() {
		await (await this.getDatabase()).query(sql`TRUNCATE "AnalyzeLog";`);
	});

	it('create', async function() {
		const sessionId = uuidv4();
		const date = new Date();
		const analyzeLogRepository = new AnalyzeLogRepository(await this.getDatabase());
		await analyzeLogRepository.create(
			sessionId,
			'https://example.com/japanesePage',
			42,
			date,
		);
		const analyzeLogs = await (await this.getDatabase()).query(sql`
			SELECT * FROM "AnalyzeLog" WHERE "sessionId" = ${sessionId};
		`);

		expect(analyzeLogs.length).not.toBe(0);
		expect(analyzeLogs[0].url).toEqual('https://example.com/japanesePage');
		expect(analyzeLogs[0].characters).toEqual(42);
		expect(analyzeLogs[0].requestedAt).toEqual(date);
	});
});
