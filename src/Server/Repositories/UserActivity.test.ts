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
		const userActivity = await this.getDatabase().get(Object, `
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
		await this.getDatabase().exec(`
			INSERT INTO "UserActivity" ("userId", "date", "characters")
			VALUES (\${userId}, \${date}, \${characters});
		`, {
			userId: user.id,
			date,
			characters: 2,
		});
		await this.getDatabase().exec(`
			INSERT INTO "UserActivity" ("userId", "date", "characters")
			VALUES (\${userId}, \${date}, \${characters});
		`, {
			userId: user.id,
			date: date2,
			characters: 2,
		});

		await userActivityRepository.createOrIncrement(user.id, date, 3);
		const userActivity = await this.getDatabase().get(Object, `
			SELECT *
			FROM "UserActivity"
			WHERE "userId" = \${userId}
			AND "date" = \${date};
		`, {
			userId: user.id,
			date,
		});
		const userActivity2 = await this.getDatabase().get(Object, `
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
});
