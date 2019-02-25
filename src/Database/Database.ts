import * as PgPromise from 'pg-promise';

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

	query<T>(sql: string, params: object): Promise<T> {

	}

	async close () {
		return db.$pool.end();
	}
}

/*
 * {@link Database#none none},
 * {@link Database#one one},
 * {@link Database#oneOrNone oneOrNone},
 * {@link Database#many many},
 * {@link Database#manyOrNone manyOrNone},
TODO sql transactions instead of method
*/
