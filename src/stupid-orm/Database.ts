import { Client } from 'pg';
import Query from './Queries/Query';

export default class Database {
	public readonly client: Client;

	// TODO extend config type?
	constructor(config: any) {
		this.client = new Client(config);
	}

	async connect() {
		await this.client.connect()
	}

	async disconnect() {
		await this.client.end()
	}

	async query(query: Query): Promise<Array<{ [key: string]: any }>> {
		const indexToPlaceholder = (i: number) => '$' + (i + 1);
		const formatIdentifier = (s: string) => '"' + s + '"';

		const compiledQuery = query.compile(indexToPlaceholder, formatIdentifier);
		const result = await this.client.query(
			compiledQuery.sql,
			<any[]><any>compiledQuery.params,
		);

		return result.rows;
	}
}