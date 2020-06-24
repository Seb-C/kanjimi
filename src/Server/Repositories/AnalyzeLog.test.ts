import 'jasmine';
import AnalyzeLogRepository from 'Server/Repositories/AnalyzeLog';
import { v4 as uuidv4 } from 'uuid';

describe('AnalyzeLogRepository', async function() {
	beforeEach(async function() {
		await this.getDatabase().none(`TRUNCATE "AnalyzeLog";`);
	});

	it('create', async function() {
		const sessionId = uuidv4();
		const date = new Date();
		const analyzeLogRepository = new AnalyzeLogRepository(this.getDatabase());
		await analyzeLogRepository.create(
			sessionId,
			'https://example.com/japanesePage',
			42,
			date,
		);
		const analyzeLog = await this.getDatabase().oneOrNone(`
			SELECT * FROM "AnalyzeLog" WHERE "sessionId" = \${sessionId};
		`, { sessionId });

		expect(analyzeLog.url).toEqual('https://example.com/japanesePage');
		expect(analyzeLog.characters).toEqual(42);
		expect(analyzeLog.requestedAt).toEqual(date);
	});
});
