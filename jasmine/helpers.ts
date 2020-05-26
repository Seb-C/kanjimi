import 'jasmine';
import fetch from 'node-fetch';
import Database from 'Server/Database/Database';
import { promises as FileSystem } from 'fs';

beforeEach(async () => {
	(<any>global).fetch = fetch;

	// Deleting data from previous runs if necessary)
	const db = new Database();
	await db.exec('DELETE FROM "User" WHERE "email" <> \'contact@kanjimi.com\'');
	await db.close();

	const existingMails = await FileSystem.readdir('/tmp/mails');
	await Promise.all(existingMails.map(async (mail) => {
		return FileSystem.unlink('/tmp/mails/' + mail);
	}));
});
