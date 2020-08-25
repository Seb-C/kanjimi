import 'jasmine';
import Dictionary from 'Server/Lexer/Dictionary';
import UserRepository from 'Server/Repositories/User';
import WordStatusRepository from 'Server/Repositories/WordStatus';
import User from 'Common/Models/User';
import WordStatus from 'Common/Models/WordStatus';
import Language from 'Common/Types/Language';
import WordTag from 'Common/Types/WordTag';
import { sql } from 'kiss-orm';

let user: User;

describe('WordStatusRepository', async function() {
	beforeEach(async function() {
		const userRepository = new UserRepository(this.db);
		user = await userRepository.create({ ...this.testUser });
	});

	it('getList', async function() {
		const dictionary = new Dictionary();
		await this.db.query(sql`
			INSERT INTO "WordStatus" ("userId", "word", "showFurigana", "showTranslation")
			VALUES (${user.id}, 'word1', TRUE, FALSE);
		`);
		await this.db.query(sql`
			INSERT INTO "WordStatus" ("userId", "word", "showFurigana", "showTranslation")
			VALUES (${user.id}, 'word3', FALSE, TRUE);
		`);
		const wordStatusRepository = new WordStatusRepository(this.db, dictionary);
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
	});

	it('get', async function() {
		const dictionary = new Dictionary();
		await this.db.query(sql`
			INSERT INTO "WordStatus" ("userId", "word", "showFurigana", "showTranslation")
			VALUES (${user.id}, 'word', TRUE, FALSE);
		`);
		const wordStatusRepository = new WordStatusRepository(this.db, dictionary);
		const wordStatus = await wordStatusRepository.get(user, 'word');

		expect(wordStatus).not.toBe(null);
		expect((<WordStatus>wordStatus)).toBeInstanceOf(WordStatus);
		expect((<WordStatus>wordStatus).userId).toBe(user.id);
		expect((<WordStatus>wordStatus).word).toBe('word');
		expect((<WordStatus>wordStatus).showFurigana).toBe(true);
		expect((<WordStatus>wordStatus).showTranslation).toBe(false);
	});

	it('createOrUpdate', async function() {
		const dictionary = new Dictionary();
		const wordStatusRepository = new WordStatusRepository(this.db, dictionary);

		// Create case
		let wordStatus = await wordStatusRepository.createOrUpdate(user, 'word', false, true);
		let dbWordStatus = new WordStatus((await this.db.query(sql`
			SELECT *
			FROM "WordStatus"
			WHERE "userId" = ${user.id}
			AND "word" = 'word';
		`))[0]);
		expect(wordStatus).toBeInstanceOf(WordStatus);
		expect(dbWordStatus).toEqual(wordStatus);
		expect(wordStatus.userId).toBe(user.id);
		expect(wordStatus.word).toBe('word');
		expect(wordStatus.showFurigana).toBe(false);
		expect(wordStatus.showTranslation).toBe(true);

		wordStatus = await wordStatusRepository.createOrUpdate(user, 'word', true, false);
		dbWordStatus = new WordStatus((await this.db.query(sql`
			SELECT *
			FROM "WordStatus"
			WHERE "userId" = ${user.id}
			AND "word" = 'word';
		`))[0]);
		expect(wordStatus).toBeInstanceOf(WordStatus);
		expect(dbWordStatus).toEqual(wordStatus);
		expect(wordStatus.userId).toBe(user.id);
		expect(wordStatus.word).toBe('word');
		expect(wordStatus.showFurigana).toBe(true);
		expect(wordStatus.showTranslation).toBe(false);
	});

	it('create', async function() {
		const dictionary = new Dictionary();
		const wordStatusRepository = new WordStatusRepository(this.db, dictionary);

		const wordStatus = await wordStatusRepository.createOrUpdate(user, 'word', false, true);
		const dbWordStatus = new WordStatus((await this.db.query(sql`
			SELECT *
			FROM "WordStatus"
			WHERE "userId" = ${user.id}
			AND "word" = 'word';
		`))[0]);

		expect(wordStatus).toBeInstanceOf(WordStatus);
		expect(dbWordStatus).toEqual(wordStatus);
		expect(wordStatus.userId).toBe(user.id);
		expect(wordStatus.word).toBe('word');
		expect(wordStatus.showFurigana).toBe(false);
		expect(wordStatus.showTranslation).toBe(true);
	});

	it('getDefaultWordStatus', async function() {
		const dictionary = new Dictionary();
		const userRepository = new UserRepository(this.db);
		const wordStatusRepository = new WordStatusRepository(this.db, dictionary);
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
		dictionary.add('word', '', Language.ENGLISH, '', [WordTag.JLPT_1]);
		wordStatus = wordStatusRepository.getDefaultWordStatus(user, 'word');
		expect(wordStatus.userId).toBe(user.id);
		expect(wordStatus.word).toBe('word');
		expect(wordStatus.showFurigana).toBe(true);
		expect(wordStatus.showTranslation).toBe(true);

		// Word same level than user
		dictionary.add('word2', '', Language.ENGLISH, '', [WordTag.JLPT_3]);
		wordStatus = wordStatusRepository.getDefaultWordStatus(user, 'word2');
		expect(wordStatus.userId).toBe(user.id);
		expect(wordStatus.word).toBe('word2');
		expect(wordStatus.showFurigana).toBe(false);
		expect(wordStatus.showTranslation).toBe(false);

		// Word inferior level than user
		dictionary.add('word3', '', Language.ENGLISH, '', [WordTag.JLPT_4]);
		wordStatus = wordStatusRepository.getDefaultWordStatus(user, 'word3');
		expect(wordStatus.userId).toBe(user.id);
		expect(wordStatus.word).toBe('word3');
		expect(wordStatus.showFurigana).toBe(false);
		expect(wordStatus.showTranslation).toBe(false);
	});
});
