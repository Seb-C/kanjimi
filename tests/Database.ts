import 'jasmine';
import Database from 'Database/Database';

const db = new Database();

class Test {
	public id: number;
	public text: string;
	public number: number;
	public date: Date;
	public textNullable: string|null;
	public numberNullable: number|null;
	public dateNullable: Date|null;

	constructor (params?: Test) {
		Object.assign(this, params);
	}
}

describe('Database', () => {
	beforeEach(async () => {
		await db.exec(`
			CREATE TEMPORARY TABLE "Test" (
				"id" SERIAL PRIMARY KEY NOT NULL,
				"text" TEXT NOT NULL,
				"number" INTEGER NOT NULL,
				"date" DATE NOT NULL,
				"textNullable" TEXT,
				"numberNullable" INTEGER,
				"dateNullable" DATE
			);

			INSERT INTO "Test" VALUES
				(DEFAULT, 'test 1', 1, DATE 'yesterday', 'test2 1', NULL, NOW()),
				(DEFAULT, 'test 2', 2, DATE 'tomorrow',  NULL,      20,   NULL),
				(DEFAULT, 'test 3', 3, DATE 'yesterday', NULL,      NULL, NOW()),
				(DEFAULT, 'test 4', 4, DATE 'tomorrow',  'test2 4', 40,   NULL);
		`);
	});

	afterEach(async () => {
		await db.exec('DROP TABLE "Test";');
	});

	it('Simple query', async () => {
		const resultNullable = await db.get(
			Test,
			'SELECT * FROM "Test" WHERE "id" = ${id}',
			{ id: 1 },
		);
		expect(resultNullable).not.toBe(null);
		const result = <Test>resultNullable;
		expect(result.text).toBe('test 1');
		expect(result.number).toBe(1);
		expect(result.date);
		expect(result.textNullable).toBe('test2 1');
		expect(result.numberNullable).toBe(null);
		expect(result.dateNullable).not.toBe(null);
	});

	it('Array query', async () => {
		const result = await db.array(Test, 'SELECT * FROM "Test"');
		expect(result.length).toBe(4);
		expect(result[0].id).toBeGreaterThan(0);
		expect(result[1].id).toBeGreaterThan(0);
		expect(result[2].id).toBeGreaterThan(0);
		expect(result[3].id).toBeGreaterThan(0);
	});

	it('Function query', async () => {
		let count = 0;
		const metIds: number[] = [];
		const result = await db.iterate(
			Test,
			async (row) => {
				count++;
				expect(row.id).toBeGreaterThan(0);
				expect(metIds.includes(row.id)).toBe(false);
				metIds.push(row.id);
			},
			'SELECT * FROM "Test" LIMIT ${limit}',
			{ limit: 3 },
		);
		expect(count).toBe(3);
	});
});
