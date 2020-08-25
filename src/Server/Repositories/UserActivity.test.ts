import 'jasmine';
import UserActivityRepository from 'Server/Repositories/UserActivity';
import UserRepository from 'Server/Repositories/User';
import User from 'Common/Models/User';
import { sql } from 'kiss-orm';

let user: User;

describe('UserActivityRepository', async function() {
	beforeEach(async function() {
		const userRepository = new UserRepository(this.db);
		user = await userRepository.create({ ...this.testUser });
	});

	it('createOrIncrement (create case)', async function() {
		const date = new Date();
		const userActivityRepository = new UserActivityRepository(this.db);
		await userActivityRepository.createOrIncrement(user.id, date, 2);
		const userActivities = await this.db.query(sql`
			SELECT *
			FROM "UserActivity"
			WHERE "userId" = ${user.id}
			AND "date" = ${date};
		`);

		expect(userActivities.length).not.toEqual(0);
		expect(userActivities[0].characters).toEqual(2);
	});

	it('createOrIncrement (increment case)', async function() {
		const date = new Date();
		const date2 = new Date();
		date2.setDate(date2.getDate() + 1);
		const userActivityRepository = new UserActivityRepository(this.db);
		await this.db.query(sql`
			INSERT INTO "UserActivity" ("userId", "date", "characters")
			VALUES (${user.id}, ${date}, 2);
		`);
		await this.db.query(sql`
			INSERT INTO "UserActivity" ("userId", "date", "characters")
			VALUES (${user.id}, ${date2}, 2);
		`);

		await userActivityRepository.createOrIncrement(user.id, date, 3);

		const userActivities = await this.db.query(sql`
			SELECT *
			FROM "UserActivity"
			WHERE "userId" = ${user.id}
			AND "date" = ${date};
		`);
		expect(userActivities.length).not.toEqual(0);
		expect(userActivities[0].characters).toEqual(5);

		const userActivities2 = await this.db.query(sql`
			SELECT *
			FROM "UserActivity"
			WHERE "userId" = ${user.id}
			AND "date" = ${date2};
		`);

		expect(userActivities2.length).not.toEqual(0);
		expect(userActivities2[0].characters).toEqual(2);
	});

	it('createOrIncrement (checking timezone)', async function() {
		const date = new Date('Fri Jun 26 2020 23:00:00 GMT-0900');
		const userActivityRepository = new UserActivityRepository(this.db);
		await userActivityRepository.createOrIncrement(user.id, date, 2);
		const userActivities = await this.db.query(sql`
			SELECT *
			FROM "UserActivity"
			WHERE "userId" = ${user.id};
		`);

		expect(userActivities.length).not.toEqual(0);
		expect(userActivities[0].date.toUTCString()).toContain('27 Jun');
	});

	it('get (row exists case)', async function() {
		const date = new Date();
		const userActivityRepository = new UserActivityRepository(this.db);
		await this.db.query(sql`
			INSERT INTO "UserActivity" ("userId", "date", "characters")
			VALUES (${user.id}, ${date}, 2);
		`);

		const activity = await userActivityRepository.get(user.id, date);

		expect(activity).toEqual({ characters: 2 });
	});

	it('get (empty case)', async function() {
		const date = new Date();
		const userActivityRepository = new UserActivityRepository(this.db);
		const activity = await userActivityRepository.get(user.id, date);

		expect(activity).toEqual({ characters: 0 });
	});
});
