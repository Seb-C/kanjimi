import 'jasmine';
import fetch from 'node-fetch';
import Database from 'Server/Database/Database';
import { promises as FileSystem } from 'fs';

let database: Database|null = null;

beforeEach(async function() {
	(<any>global).fetch = fetch;

	// Destroying the previous instance here because otherwise
	// jasmine does not await the afterEach function
	if (database !== null) {
		await database.close();
		database = null;
	}

	// Deleting data from previous runs if necessary)
	const db = new Database();
	await db.exec('DELETE FROM "User" WHERE "email" <> \'contact@kanjimi.com\'');
	await db.close();

	const existingMails = await FileSystem.readdir('/tmp/mails');
	await Promise.all(existingMails.map(async (mail) => {
		return FileSystem.unlink('/tmp/mails/' + mail);
	}));

	this.getDatabase = (): Database => {
		if (database === null) {
			database = new Database();
		}
		return <Database>database;
	};
});
