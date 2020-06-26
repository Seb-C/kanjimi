import 'jasmine';
import UserActivityRepository from 'Server/Repositories/UserActivity';
import UserRepository from 'Server/Repositories/User';
import User from 'Common/Models/User';

let user: User;

describe('UserActivityRepository', async function() {
	beforeEach(async function() {
		const userRepository = new UserRepository(this.getDatabase());
		user = await userRepository.create({ ...this.testUser });
	});

	it('createOrIncrement (create case)', async function() {
		const date = new Date();
		const userActivityRepository = new UserActivityRepository(this.getDatabase());
		await userActivityRepository.createOrIncrement(user.id, date, 2);
		const userActivity = await this.getDatabase().oneOrNone(`
			SELECT *
			FROM "UserActivity"
			WHERE "userId" = \${userId}
			AND "date" = \${date};
		`, {
			userId: user.id,
			date,
		});

		expect(userActivity.characters).toEqual(2);
	});

	it('createOrIncrement (increment case)', async function() {
		const date = new Date();
		const date2 = new Date();
		date2.setDate(date2.getDate() + 1);
		const userActivityRepository = new UserActivityRepository(this.getDatabase());
		await this.getDatabase().none(`
			INSERT INTO "UserActivity" ("userId", "date", "characters")
			VALUES (\${userId}, \${date}, \${characters});
		`, {
			userId: user.id,
			date,
			characters: 2,
		});
		await this.getDatabase().none(`
			INSERT INTO "UserActivity" ("userId", "date", "characters")
			VALUES (\${userId}, \${date}, \${characters});
		`, {
			userId: user.id,
			date: date2,
			characters: 2,
		});

		await userActivityRepository.createOrIncrement(user.id, date, 3);
		const userActivity = await this.getDatabase().oneOrNone(`
			SELECT *
			FROM "UserActivity"
			WHERE "userId" = \${userId}
			AND "date" = \${date};
		`, {
			userId: user.id,
			date,
		});
		const userActivity2 = await this.getDatabase().oneOrNone(`
			SELECT *
			FROM "UserActivity"
			WHERE "userId" = \${userId}
			AND "date" = \${date};
		`, {
			userId: user.id,
			date: date2,
		});

		expect(userActivity.characters).toEqual(5);
		expect(userActivity2.characters).toEqual(2);
	});

	it('createOrIncrement (checking timezone)', async function() {
		const date = new Date('Fri Jun 26 2020 23:00:00 GMT-0900');
		const userActivityRepository = new UserActivityRepository(this.getDatabase());
		await userActivityRepository.createOrIncrement(user.id, date, 2);
		const userActivity = await this.getDatabase().oneOrNone(`
			SELECT *
			FROM "UserActivity"
			WHERE "userId" = \${userId};
		`, { userId: user.id });

		expect(userActivity.date.toUTCString()).toContain('27 Jun');
	});

	it('get (row exists case)', async function() {
		const date = new Date();
		const userActivityRepository = new UserActivityRepository(this.getDatabase());
		await this.getDatabase().none(`
			INSERT INTO "UserActivity" ("userId", "date", "characters")
			VALUES (\${userId}, \${date}, \${characters});
		`, {
			userId: user.id,
			date,
			characters: 2,
		});

		const activity = await userActivityRepository.get(user.id, date);

		expect(activity).toEqual({ characters: 2 });
	});

	it('get (empty case)', async function() {
		const date = new Date();
		const userActivityRepository = new UserActivityRepository(this.getDatabase());
		const activity = await userActivityRepository.get(user.id, date);

		expect(activity).toEqual({ characters: 0 });
	});
});
