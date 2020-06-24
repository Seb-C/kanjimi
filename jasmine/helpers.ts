import 'jasmine';
import fetch from 'node-fetch';
import * as PgPromise from 'pg-promise';
import { promises as FileSystem } from 'fs';
import Language from 'Common/Types/Language';
import * as Ajv from 'ajv';

let database: PgPromise.IDatabase<void>|null = null;

beforeEach(async function() {
	(<any>global).fetch = fetch;

	// Destroying the previous instance here because otherwise
	// jasmine does not await the afterEach function
	if (database !== null) {
		await database.$pool.end();
		database = null;
	}

	this.databaseConfiguration = {
		host: process.env.KANJIMI_DATABASE_HOST,
		port: parseInt(<string>process.env.KANJIMI_DATABASE_PORT),
		database: process.env.KANJIMI_DATABASE_DATA,
		user: process.env.KANJIMI_DATABASE_USER,
		password: process.env.KANJIMI_DATABASE_PASSWORD,
	};

	// Deleting data from previous runs if necessary)
	const db = PgPromise()(this.databaseConfiguration);
	await db.none('DELETE FROM "User" WHERE "email" <> \'contact@kanjimi.com\'');
	await db.$pool.end();

	const existingMails = await FileSystem.readdir('/tmp/mails');
	await Promise.all(existingMails.map(async (mail) => {
		return FileSystem.unlink('/tmp/mails/' + mail);
	}));

	this.getDatabase = (): PgPromise.IDatabase<void> => {
		if (database === null) {
			database = PgPromise()(this.databaseConfiguration);
		}
		return <PgPromise.IDatabase<void>>database;
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
