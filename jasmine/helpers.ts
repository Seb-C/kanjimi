import 'jasmine';
import fetch from 'node-fetch';
import Database from 'Server/Database/Database';
import { promises as FileSystem } from 'fs';
import Language from 'Common/Types/Language';
import * as Ajv from 'ajv';

let database: Database|null = null;

beforeEach(async function() {
	(<any>global).fetch = fetch;

	// Destroying the previous instance here because otherwise
	// jasmine does not await the afterEach function
	if (database !== null) {
		await database.close();
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
	const db = new Database(this.databaseConfiguration);
	await db.exec('DELETE FROM "User" WHERE "email" <> \'contact@kanjimi.com\'');
	await db.close();

	const existingMails = await FileSystem.readdir('/tmp/mails');
	await Promise.all(existingMails.map(async (mail) => {
		return FileSystem.unlink('/tmp/mails/' + mail);
	}));

	this.getDatabase = (): Database => {
		if (database === null) {
			database = new Database(this.databaseConfiguration);
		}
		return <Database>database;
	};

	this.testUser = {
		email: 'unittest@example.com',
		emailVerified: false,
		emailVerificationKey: null,
		password: '123456',
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
