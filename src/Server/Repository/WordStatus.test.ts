import 'jasmine';
import Database from 'Server/Database/Database';
import Dictionary from 'Server/Lexer/Dictionary';
import UserRepository from 'Server/Repository/User';
import WordStatusRepository from 'Server/Repository/WordStatus';
import User from 'Common/Models/User';
import WordStatus from 'Common/Models/WordStatus';
import Language from 'Common/Types/Language';
import WordTag from 'Common/Types/WordTag';
import Word from 'Common/Models/Word';

let user: User;

describe('WordStatusRepository', async () => {
	beforeEach(async () => {
		// Clearing previous run if necessary
		const db = new Database();
		const userRepository = new UserRepository(db);
		await userRepository.deleteByEmail('unittest@example.com');
		user = await userRepository.create({
			email: 'unittest@example.com',
			emailVerified: false,
			password: '123456',
			languages: [Language.FRENCH],
			romanReading: false,
			jlpt: null,
		});
		await db.close();
	});

	it('getList', async () => {
		const db = new Database();
		const dictionary = new Dictionary();
		await db.exec(`
			INSERT INTO "WordStatus" ("userId", "word", "showFurigana", "showTranslation")
			VALUES (\${userId}, 'word1', TRUE, FALSE);
		`, { userId: user.id });
		await db.exec(`
			INSERT INTO "WordStatus" ("userId", "word", "showFurigana", "showTranslation")
			VALUES (\${userId}, 'word3', FALSE, TRUE);
		`, { userId: user.id });
		const wordStatusRepository = new WordStatusRepository(db, dictionary);
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
		const dictionary = new Dictionary();
		await db.exec(`
			INSERT INTO "WordStatus" ("userId", "word", "showFurigana", "showTranslation")
			VALUES (\${userId}, 'word', TRUE, FALSE);
		`, { userId: user.id });
		const wordStatusRepository = new WordStatusRepository(db, dictionary);
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
		const dictionary = new Dictionary();
		const wordStatusRepository = new WordStatusRepository(db, dictionary);

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
		const dictionary = new Dictionary();
		const wordStatusRepository = new WordStatusRepository(db, dictionary);

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

	it('getDefaultWordStatus', async () => {
		const db = new Database();
		const dictionary = new Dictionary();
		const userRepository = new UserRepository(db);
		const wordStatusRepository = new WordStatusRepository(db, dictionary);
		let wordStatus: WordStatus;

		// User does not have a JLPT level
		wordStatus = wordStatusRepository.getDefaultWordStatus(user, 'word');
		expect(wordStatus.userId).toBe(user.id);
		expect(wordStatus.word).toBe('word');
		expect(wordStatus.showFurigana).toBe(true);
		expect(wordStatus.showTranslation).toBe(true);

		// Word not in dictionary
		user = await userRepository.updateById(user.id, { jlpt: 3 });
		wordStatus = wordStatusRepository.getDefaultWordStatus(user, 'word');
		expect(wordStatus.userId).toBe(user.id);
		expect(wordStatus.word).toBe('word');
		expect(wordStatus.showFurigana).toBe(true);
		expect(wordStatus.showTranslation).toBe(true);

		// Word does not have a jlpt level
		wordStatus = wordStatusRepository.getDefaultWordStatus(user, 'word');
		expect(wordStatus.userId).toBe(user.id);
		expect(wordStatus.word).toBe('word');
		expect(wordStatus.showFurigana).toBe(true);
		expect(wordStatus.showTranslation).toBe(true);

		// Word higher level than user
		dictionary.add(new Word('word', '', Language.ENGLISH, '', [WordTag.JLPT_1]));
		wordStatus = wordStatusRepository.getDefaultWordStatus(user, 'word');
		expect(wordStatus.userId).toBe(user.id);
		expect(wordStatus.word).toBe('word');
		expect(wordStatus.showFurigana).toBe(true);
		expect(wordStatus.showTranslation).toBe(true);

		// Word same level than user
		dictionary.add(new Word('word2', '', Language.ENGLISH, '', [WordTag.JLPT_3]));
		wordStatus = wordStatusRepository.getDefaultWordStatus(user, 'word2');
		expect(wordStatus.userId).toBe(user.id);
		expect(wordStatus.word).toBe('word2');
		expect(wordStatus.showFurigana).toBe(false);
		expect(wordStatus.showTranslation).toBe(false);

		// Word inferior level than user
		dictionary.add(new Word('word3', '', Language.ENGLISH, '', [WordTag.JLPT_4]));
		wordStatus = wordStatusRepository.getDefaultWordStatus(user, 'word3');
		expect(wordStatus.userId).toBe(user.id);
		expect(wordStatus.word).toBe('word3');
		expect(wordStatus.showFurigana).toBe(false);
		expect(wordStatus.showTranslation).toBe(false);

		await db.close();
	});
});
