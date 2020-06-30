import { Response } from 'express';
import { Request } from 'Server/Request';
import * as PgPromise from 'pg-promise';
import * as NodeMailer from 'nodemailer';

export const get = (db: PgPromise.IDatabase<void>, mailer: NodeMailer.Transporter) => async (request: Request, response: Response, next: Function) => {
	try {
		await db.many('SELECT * FROM "Migrations";');
		await mailer.verify();

		return response.json('OK');
	} catch (error) {
		return next(error);
	}
};
