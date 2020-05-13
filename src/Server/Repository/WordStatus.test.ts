import 'jasmine';
import Database from 'Server/Database/Database';
import UserRepository from 'Server/Repository/User';
import WordStatusRepository from 'Server/Repository/WordStatus';
import User from 'Common/Models/User';
import WordStatus from 'Common/Models/WordStatus';
import Language from 'Common/Types/Language';

let user: User;

describe('WordStatusRepository', async () => {
	beforeEach(async () => {
		// Clearing previous run if necessary
		const db = new Database();
		const userRepository = new UserRepository(db);
		await userRepository.deleteByEmail('unittest@example.com');
		user = await userRepository.create({
			email: 'unittest@example.com',
			password: '123456',
			languages: [Language.FRENCH],
			romanReading: false,
		});
		await db.close();
	});

	it('getList', async () => {
		const db = new Database();
		await db.exec(`
			INSERT INTO "WordStatus" ("userId", "word", "showFurigana", "showTranslation")
			VALUES (\${userId}, 'word1', TRUE, FALSE);
		`, { userId: user.id });
		await db.exec(`
			INSERT INTO "WordStatus" ("userId", "word", "showFurigana", "showTranslation")
			VALUES (\${userId}, 'word3', FALSE, TRUE);
		`, { userId: user.id });
		const wordStatusRepository = new WordStatusRepository(db);
		const wordStatuses = await wordStatusRepository.getList(user, ['word1', 'word2', 'word3']);

		expect(wordStatuses.length).toBe(2);

		expect((<WordStatus>wordStatuses[0])).toBeInstanceOf(WordStatus);
		expect((<WordStatus>wordStatuses[0]).userId).toBe(user.id);
		expect((<WordStatus>wordStatuses[0]).word).toBe('word1');
		expect((<WordStatus>wordStatuses[0]).showFurigana).toBe(true);
		expect((<WordStatus>wordStatuses[0]).showTranslation).toBe(false);

		expect((<WordStatus>wordStatuses[1])).toBeInstanceOf(WordStatus);
		expect((<WordStatus>wordStatuses[1]).userId).toBe(user.id);
		expect((<WordStatus>wordStatuses[1]).word).toBe('word3');
		expect((<WordStatus>wordStatuses[1]).showFurigana).toBe(false);
		expect((<WordStatus>wordStatuses[1]).showTranslation).toBe(true);

		await db.close();
	});

	it('get', async () => {
		const db = new Database();
		await db.exec(`
			INSERT INTO "WordStatus" ("userId", "word", "showFurigana", "showTranslation")
			VALUES (\${userId}, 'word', TRUE, FALSE);
		`, { userId: user.id });
		const wordStatusRepository = new WordStatusRepository(db);
		const wordStatus = await wordStatusRepository.get(user, 'word');

		expect(wordStatus).not.toBe(null);
		expect((<WordStatus>wordStatus)).toBeInstanceOf(WordStatus);
		expect((<WordStatus>wordStatus).userId).toBe(user.id);
		expect((<WordStatus>wordStatus).word).toBe('word');
		expect((<WordStatus>wordStatus).showFurigana).toBe(true);
		expect((<WordStatus>wordStatus).showTranslation).toBe(false);

		await db.close();
	});

	it('createOrUpdate', async () => {
		const db = new Database();
		const wordStatusRepository = new WordStatusRepository(db);

		// Create case
		let wordStatus = await wordStatusRepository.createOrUpdate(user, 'word', false, true);
		let dbWordStatus = <WordStatus>await db.get(WordStatus, `
			SELECT *
			FROM "WordStatus"
			WHERE "userId" = \${userId}
			AND "word" = 'word';
		`, { userId: user.id });
		expect(wordStatus).toBeInstanceOf(WordStatus);
		expect(dbWordStatus).toEqual(wordStatus);
		expect(wordStatus.userId).toBe(user.id);
		expect(wordStatus.word).toBe('word');
		expect(wordStatus.showFurigana).toBe(false);
		expect(wordStatus.showTranslation).toBe(true);

		wordStatus = await wordStatusRepository.createOrUpdate(user, 'word', true, false);
		dbWordStatus = <WordStatus>await db.get(WordStatus, `
			SELECT *
			FROM "WordStatus"
			WHERE "userId" = \${userId}
			AND "word" = 'word';
		`, { userId: user.id });
		expect(wordStatus).toBeInstanceOf(WordStatus);
		expect(dbWordStatus).toEqual(wordStatus);
		expect(wordStatus.userId).toBe(user.id);
		expect(wordStatus.word).toBe('word');
		expect(wordStatus.showFurigana).toBe(true);
		expect(wordStatus.showTranslation).toBe(false);

		await db.close();
	});

	it('create', async () => {
		const db = new Database();
		const wordStatusRepository = new WordStatusRepository(db);

		const wordStatus = await wordStatusRepository.createOrUpdate(user, 'word', false, true);
		const dbWordStatus = <WordStatus>await db.get(WordStatus, `
			SELECT *
			FROM "WordStatus"
			WHERE "userId" = \${userId}
			AND "word" = 'word';
		`, { userId: user.id });

		expect(wordStatus).toBeInstanceOf(WordStatus);
		expect(dbWordStatus).toEqual(wordStatus);
		expect(wordStatus.userId).toBe(user.id);
		expect(wordStatus.word).toBe('word');
		expect(wordStatus.showFurigana).toBe(false);
		expect(wordStatus.showTranslation).toBe(true);

		await db.close();
	});
});
