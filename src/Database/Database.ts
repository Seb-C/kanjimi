import * as PgPromise from 'pg-promise';

type Buildable<T> = (new (params?: T) => T);

export default class Database {
	private db;
	constructor() {
		super();
		this.db = PgPromise()({
			host     :  'localhost',
			port     :  5432,
			database :  'test',
			user     :  'test',
			password :  'test',
		});
	}

	async exec(sql: string, params: object): Promise<void> {
		console.log('done');
		// TODO
	}
	async get<T>(sql: string, params: object, resultClass: Buildable<T>): Promise<T|null> {
		return new resultClass();
		// TODO
	}
	async array<T>(sql: string, params: object, resultClass: Buildable<T>): Promise<T[]> {
		return [new resultClass()];
		// TODO
	}
	async iterate<T>(
		sql: string,
		params: object,
		resultClass: Buildable<T>,
		callback: ((t: T) => Promise<void>),
	): Promise<void[]> {
		return Promise.all([
			await callback(new resultClass()),
			await callback(new resultClass()),
			await callback(new resultClass()),
		]);
		// TODO
	}

	async close () {
		return db.$pool.end();
	}
}

/*
TODO sql transactions instead of method
*/
