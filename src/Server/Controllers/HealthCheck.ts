import { Response } from 'express';
import { Request } from 'Server/Request';
import { sql, PgSqlDatabase } from 'kiss-orm';
import * as NodeMailer from 'nodemailer';

export const get = (db: PgSqlDatabase, mailer: NodeMailer.Transporter) => async (request: Request, response: Response, next: Function) => {
	try {
		await db.query(sql`SELECT * FROM "Migrations";`);
		await mailer.verify();

		return response.json('OK');
	} catch (error) {
		return next(error);
	}
};
