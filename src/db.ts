import { IMain, IDatabase, IBaseProtocol } from 'pg-promise';
import * as pgPromise from 'pg-promise'

interface Query extends IBaseProtocol<null> {}

const db: IDatabase<null> = pgPromise()({
	host: 'localhost',
	port: 5432,
	database: 'test',
	user: 'test',
	password: 'test',
})

export const query: Query = db

export const close = async () => {
	return db.$pool.end();
}
