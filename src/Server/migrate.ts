import Database from 'Server/Database/Database';
import Lexer from 'Server/Lexer/Lexer';
import * as fs from 'fs';

const getMigrations = (): Promise<string[]> => {
	return new Promise((resolve, reject) => {
		fs.readdir('./src/Server/Database/Migrations', (error, files) => {
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

const getMigrationScript = (migration: string): Promise<string> => {
	return new Promise((resolve, reject) => {
		fs.readFile(`./src/Server/Database/Migrations/${migration}`, (error, content) => {
			if (error !== null) {
				reject(error);
			} else {
				resolve(content.toString());
			}
		});
	});
};

const db = new Database();

const runMigration = async (migration: string): Promise<void> => {
	console.log(`Starting migration "${migration}"`);
	const migrationScript = await getMigrationScript(migration);
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

	const migrations = (await getMigrations()).sort();
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
		migration => runMigration(migration),
	));
})().then(() => db.close());
