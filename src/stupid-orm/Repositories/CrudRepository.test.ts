import 'jasmine';
import NotFoundError from '../Errors/NotFoundError';
import TooManyResultsError from '../Errors/TooManyResultsError';
import Database from '../Database';
import { sql } from '..';
import CrudRepository from './CrudRepository';

class TestModel {
	public readonly id: number;
	public readonly text: string;
	public readonly number: number;
	public readonly date: Date;

	constructor (attributes: any) {
		this.id = attributes.id;
		this.text = attributes.text;
		this.number = attributes.number;
		this.date = attributes.date;
	}
}

class TestRepository extends CrudRepository<TestModel> {
	constructor(database: Database) {
		super({
			database,
			table: 'Test',
			primaryKey: 'id',
			model: TestModel,
		});
	}
}

class TestScopedRepository extends CrudRepository<TestModel> {
	constructor(database: Database) {
		super({
			database,
			table: 'Test',
			primaryKey: 'id',
			model: TestModel,
			scope: sql`number = 42`,
		});
	}
}

describe('CrudRepository', () => {
	let db: Database;
	let repository: TestRepository;
	let scopedRepository: TestScopedRepository;

	beforeAll(async () => {
		db = new Database({
			host: 'database',
			port: 5432,
			database: 'test',
			user: 'test',
			password: 'test'
		});
		await db.connect();
	});
	afterAll(async () => {
		await db.disconnect();
	});

	beforeEach(async () => {
		await db.query(sql`
			CREATE TEMPORARY TABLE "Test" (
				"id" INTEGER NOT NULL,
				"text" TEXT NOT NULL,
				"number" INTEGER NOT NULL,
				"date" DATE NOT NULL
			);
		`);

		repository = new TestRepository(db);
		scopedRepository = new TestScopedRepository(db);
	});
	afterEach(async () => {
		await db.query(sql`DROP TABLE "Test";`);
	});

	it('get - normal case', async () => {
		await db.query(sql`
			INSERT INTO "Test" VALUES
				(1, 'test 1', 11, DATE 'yesterday'),
				(2, 'test 2', 12, DATE 'tomorrow');
		`);

		const result = await repository.get(2);
		expect(result).toBeInstanceOf(TestModel);
		expect(result.id).toEqual(2);
		expect(result.text).toEqual('test 2');
		expect(result.number).toEqual(12);
		expect(result.date).toBeInstanceOf(Date);
	});
	it('get - not found case', async () => {
		let error = null;
		try {
			await repository.get(1);
		} catch (e) {
			error = e;
		}

		expect(error).toBeInstanceOf(NotFoundError);
	});
	it('get - too many results case', async () => {
		await db.query(sql`
			INSERT INTO "Test" VALUES
				(1, 'test 1', 11, DATE 'yesterday'),
				(1, 'test 1', 11, DATE 'yesterday');
		`);

		let error = null;
		try {
			await repository.get(1);
		} catch (e) {
			error = e;
		}

		expect(error).toBeInstanceOf(TooManyResultsError);
	});

	it('get - scoped case', async () => {
		await db.query(sql`
			INSERT INTO "Test" VALUES
				(1, 'test 1', 42, DATE 'yesterday'),
				(1, 'test 2', 12, DATE 'tomorrow');
		`);

		const result = await scopedRepository.get(1);
		expect(result.text).toEqual('test 1');
	});
	it('get - not found in scope case', async () => {
		await db.query(sql`INSERT INTO "Test" VALUES (1, 'test 2', 12, DATE 'tomorrow');`);

		let error = null;
		try {
			await scopedRepository.get(1);
		} catch (e) {
			error = e;
		}

		expect(error).toBeInstanceOf(NotFoundError);
	});

	it('search - normal case without filters', async () => {
		await db.query(sql`
			INSERT INTO "Test" VALUES
				(1, 'test 1', 11, DATE 'yesterday'),
				(2, 'test 2', 12, DATE 'tomorrow');
		`);

		const results = await repository.search();
		expect(results.length).toEqual(2);

		expect(results[0]).toBeInstanceOf(TestModel);
		expect(results[0].id).toEqual(1);
		expect(results[0].text).toEqual('test 1');
		expect(results[0].number).toEqual(11);
		expect(results[0].date).toBeInstanceOf(Date);

		expect(results[1]).toBeInstanceOf(TestModel);
		expect(results[1].id).toEqual(2);
		expect(results[1].text).toEqual('test 2');
		expect(results[1].number).toEqual(12);
		expect(results[1].date).toBeInstanceOf(Date);
	});
	it('search - no results case', async () => {
		const results = await repository.search();
		expect(results.length).toEqual(0);
	});
	it('search - with a filter', async () => {
		await db.query(sql`
			INSERT INTO "Test" VALUES
				(1, 'test 1', 11, DATE 'yesterday'),
				(2, 'test 2', 12, DATE 'tomorrow'),
				(3, 'test 3', 13, DATE 'today');
		`);

		const results = await repository.search(sql`number > 11 AND text LIKE '%2'`);
		expect(results.length).toEqual(1);
		expect(results[0].id).toEqual(2);
	});
	it('search - with an order', async () => {
		await db.query(sql`
			INSERT INTO "Test" VALUES
				(1, 'test 1', 11, DATE 'yesterday'),
				(2, 'test 2', 12, DATE 'tomorrow');
		`);

		const results = await repository.search(null, sql`number DESC`);
		expect(results.length).toEqual(2);
		expect(results[0].id).toEqual(2);
		expect(results[1].id).toEqual(1);
	});
	it('search - with a filter and order', async () => {
		await db.query(sql`
			INSERT INTO "Test" VALUES
				(1, 'test 1', 11, DATE 'yesterday'),
				(2, 'test 2', 12, DATE 'tomorrow'),
				(3, 'test 3', 13, DATE 'today');
		`);

		const results = await repository.search(sql`number > 11`, sql`number DESC`);
		expect(results.length).toEqual(2);
		expect(results[0].id).toEqual(3);
		expect(results[1].id).toEqual(2);
	});
	it('search - scoped', async () => {
		await db.query(sql`
			INSERT INTO "Test" VALUES
				(1, 'test 1', 42, DATE 'yesterday'),
				(2, 'test 2', 42, DATE 'tomorrow'),
				(3, 'test 3', 13, DATE 'today');
		`);

		const results = await scopedRepository.search();
		expect(results.length).toEqual(2);
		expect(results[0].id).toEqual(1);
		expect(results[1].id).toEqual(2);
	});
	it('search - scoped and filtered', async () => {
		await db.query(sql`
			INSERT INTO "Test" VALUES
				(1, 'test 1', 42, DATE 'yesterday'),
				(2, 'test 2', 42, DATE 'tomorrow'),
				(3, 'test 3', 13, DATE 'today');
		`);

		const results = await scopedRepository.search(sql`text = 'test 2'`);
		expect(results.length).toEqual(1);
		expect(results[0].id).toEqual(2);
	});

	it('create - normal case', async () => {
		const result = await repository.create({
			id: 2,
			text: 'test 2',
			number: 12,
			date: new Date(),
		});
		expect(result).toBeInstanceOf(TestModel);
		expect(result.id).toEqual(2);
		expect(result.text).toEqual('test 2');
		expect(result.number).toEqual(12);
		expect(result.date).toBeInstanceOf(Date);
	});

	it('update - normal case', async () => {
		await db.query(sql`INSERT INTO "Test" VALUES (1, 'test 1', 11, DATE 'yesterday');`);
		const model = new TestModel({
			id: 1,
			text: 'test 1',
			number: 11,
			date: new Date(),
		});

		const result = await repository.update(model, {
			text: 'test 2',
		});

		expect(result).toBeInstanceOf(TestModel);
		expect(result.id).toEqual(1);
		expect(result.text).toEqual('test 2');
		expect(result.number).toEqual(11);
	});
	it('update - not found case', async () => {
		const model = new TestModel({
			id: 1,
			text: 'test 1',
			number: 11,
			date: new Date(),
		});

		let error = null;
		try {
			await repository.update(model, { text: 'test 2' });
		} catch (e) {
			error = e;
		}

		expect(error).toBeInstanceOf(NotFoundError);
	});
	it('update - too many results case', async () => {
		await db.query(sql`
			INSERT INTO "Test" VALUES
				(1, 'test 1', 11, DATE 'yesterday'),
				(1, 'test 1', 11, DATE 'yesterday');
		`);

		const model = new TestModel({
			id: 1,
			text: 'test 1',
			number: 11,
			date: new Date(),
		});

		let error = null;
		try {
			await repository.update(model, { text: 'test 2' })
		} catch (e) {
			error = e;
		}

		expect(error).toBeInstanceOf(TooManyResultsError);
	});

	it('delete - normal case', async () => {
		await db.query(sql`INSERT INTO "Test" VALUES (1, 'test 1', 11, DATE 'yesterday');`);
		const model = new TestModel({
			id: 1,
			text: 'test 1',
			number: 11,
			date: new Date(),
		});

		await repository.delete(model);
	});

	it('reuses and updates the same instances', async () => {
		await db.query(sql`INSERT INTO "Test" VALUES (1, 'test 1', 11, DATE 'yesterday');`);

		const model1 = await repository.get(1);
		const model2 = (await repository.search(sql`id = 1`))[0];
		expect(model1).toBe(model2);

		const model3 = await repository.update(model1, { text: 'new text' });
		expect(model3).toBe(model1);

		expect(model1.text).toEqual('new text');
		expect(model2.text).toEqual('new text');
	});
});
