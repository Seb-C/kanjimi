import * as PgPromise from 'pg-promise';

interface Query extends PgPromise.IBaseProtocol<null> {}

const db: PgPromise.IDatabase<null> = PgPromise()({
	host: 'localhost',
	port: 5432,
	database: 'test',
	user: 'test',
	password: 'test',
});

export const query: Query = db;

export const close = async () => {
	return db.$pool.end();
};
