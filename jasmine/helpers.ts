import 'jasmine';
import fetch from 'node-fetch';
import { sql, PgSqlDatabase } from 'kiss-orm';
import { promises as FileSystem } from 'fs';
import Language from 'Common/Types/Language';
import * as Ajv from 'ajv';

let database: PgSqlDatabase|null = null;

beforeEach(async function() {
	(<any>global).fetch = fetch;

	if (database === null) {
		database = new PgSqlDatabase({
			host: process.env.KANJIMI_DATABASE_HOST,
			port: parseInt(<string>process.env.KANJIMI_DATABASE_PORT),
			database: process.env.KANJIMI_DATABASE_DATABASE,
			user: process.env.KANJIMI_DATABASE_USER,
			password: process.env.KANJIMI_DATABASE_PASSWORD,
			ssl: (process.env.KANJIMI_DATABASE_USE_SSL === 'true' ? { rejectUnauthorized: false } : false),
		});
		await database.connect();
	}

	// Deleting data from previous runs if necessary
	await database.query(sql`DELETE FROM "User" WHERE "email" <> 'contact@kanjimi.com'`);

	const existingMails = await FileSystem.readdir('/tmp/mails');
	await Promise.all(existingMails.map(async (mail) => {
		return FileSystem.unlink('/tmp/mails/' + mail);
	}));

	this.getDatabase = async (): Promise<PgSqlDatabase> => {
		return <PgSqlDatabase>database;
	};

	this.testUser = {
		email: 'unittest@example.com',
		emailVerified: false,
		emailVerificationKey: null,
		password: '123456',
		passwordResetKey: null,
		passwordResetKeyExpiresAt: null,
		languages: [Language.FRENCH],
		romanReading: false,
		jlpt: null,
	};

	this.validationErrorResponseValidator = new Ajv({ allErrors: true }).compile({
		type: 'array',
		items: {
			type: 'object',
			additionalProperties: true,
			required: ['message'],
			properties: {
				message: {
					type: 'string',
				},
			},
		},
	});
});
