import Database from './Database';
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

const getMigrationScript = (type: MigrationType, migration: string): Promise<string> => {
	return new Promise((resolve, reject) => {
		fs.readFile(`./migrations/${type}/${migration}`, (error, content) => {
			if (error !== null) {
				reject(error);
			} else {
				resolve(content.toString());
			}
		});
	});
};

const db = new Database();

const runMigration = async (type: MigrationType, migration: string): Promise<void> => {
	console.log(`Starting migration "${migration}"`);
	const migrationScript = await getMigrationScript(type, migration);
	await db.exec(
		`
			BEGIN;
			${migrationScript}
			INSERT INTO "Migrations" VALUES (\${name});
			COMMIT;
		`,
		{ name: migration },
	);
	console.log(`Finished migration "${migration}"`);
};

(async () => {
	await db.exec(`
		CREATE TABLE IF NOT EXISTS "Migrations" (
			"name" TEXT PRIMARY KEY NOT NULL
		);
	`);

	const migrations = (await getMigrations(MigrationType.UP)).sort();
	const migrationsDone = (await db.array(Object, `
		SELECT "name"
		FROM "Migrations"
		ORDER BY "name";
	`)).map((row: any) => row.name);

	const migrationsToDo = migrations.filter((migration) => {
		return !migrationsDone.some(
			migrationDone => migrationDone === migration,
		);
	});

	await Promise.all(migrationsToDo.map(
		migration => runMigration(MigrationType.UP, migration),
	));
})().then(() => db.close());
