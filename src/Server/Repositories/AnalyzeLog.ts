import AnalyzeLogModel from 'Common/Models/AnalyzeLog';
import { PgSqlDatabase, CrudRepository } from 'kiss-orm';

type Params = {
	sessionId: string,
	url: string,
	characters: number,
	requestedAt: Date,
};

export default class AnalyzeLog extends CrudRepository<AnalyzeLogModel, Params, number> {
	constructor (database: PgSqlDatabase) {
		super({
			database,
			table: 'AnalyzeLog',
			primaryKey: 'id',
			model: AnalyzeLogModel,
		});
	}
}
