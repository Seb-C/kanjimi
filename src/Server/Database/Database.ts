import * as PgPromise from 'pg-promise';
import * as QueryStream from 'pg-query-stream';

type Buildable<T> = (new (params?: T) => T);

type Params = { [key: string]: any; };

let singleton: Database|null = null;

export default class Database {
	private db: PgPromise.IDatabase<void>;

	constructor() {
		if (singleton !== null) {
			return singleton;
		} else {
			singleton = this;
		}
		this.db = PgPromise()({
			host     :  process.env.DB_HOST || 'database',
			port     :  5432,
			database :  'test',
			user     :  'test',
			password :  'test',
		});
	}

	async exec(sql: string, params: Params = {}): Promise<void> {
		await this.db.none(sql, params);
	}

	async get<T>(resultClass: Buildable<T>, sql: string, params: Params = {}): Promise<T|null> {
		const result = await this.db.oneOrNone(sql, params);
		if (!result) {
			return null;
		} else {
			return new resultClass(result);
		}
	}

	async array<T>(resultClass: Buildable<T>, sql: string, params: Params = {}): Promise<T[]> {
		return (await this.db.manyOrNone(sql, params)).map(
			row => new resultClass(row),
		);
	}

	async iterate<T>(
		resultClass: Buildable<T>,
		callback: ((t: T) => Promise<void>),
		sql: string,
		params: Params = {},
	): Promise<void> {

		// Transforming named params by index...
		let newSql = sql;
		const newParams: any[] = [];
		Object.keys(params).forEach((key: string, i: number) => {
			newSql = newSql.replace(
				new RegExp(`\\$\\{${key}\\}`, 'g'),
				`\$${i + 1}`,
			);
			newParams.push(params[key]);
		});

		const queryStream = new QueryStream(newSql, newParams);
		let chain = Promise.resolve();
		await this.db.stream(queryStream, (stream) => {
			stream.on('data', (row: T) => {
				chain = chain.then(() => callback(row));
			});
		});

		return chain;
	}

	async close () {
		return this.db.$pool.end();
	}
}
