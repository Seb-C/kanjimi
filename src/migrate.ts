import { close, query } from './db';
import Lexer from './Lexer';
import * as fs from 'fs';

enum MigrationType {
	UP = 'up',
	DOWN = 'down',
}

const getMigrations = (type: MigrationType): Promise<string[]> => {
	return new Promise((resolve, reject) => {
		fs.readdir(`./migrations/${type}`, (error, files) => {
			if (error !== null) {
				reject(error);
			} else {
				resolve(files.filter(
					file => /^[0-9]+_.*\.sql$/.test(file),
				));
			}
		});
	});
};

const runMigration = async (migration: string): Promise<void> => {
	console.log(migration);
	// TODO message in the terminal
	// TODO insert into migrations values ('001_create_dictionary.sql')
	// TODO execute the file
	// TODO transaction
	// TODO insert entry in the migration database (within the transaction)
};

(async () => {
	await query.none(`
		CREATE TABLE IF NOT EXISTS "migrations" (
			"name" TEXT PRIMARY KEY NOT NULL
		);
	`);

	const migrations = (await getMigrations(MigrationType.UP)).sort();
	const migrationsDone = (await query.manyOrNone(`
		SELECT "name"
		FROM "migrations"
		ORDER BY "name";
	`)).map(row => row.name);

	console.log(migrationsDone);

	const migrationsToDo = migrations.filter((migration) => {
		return !migrationsDone.some(
			migrationDone => migrationDone === migration,
		);
	});

	await Promise.all(migrationsToDo.map(runMigration));
})().then(close);
