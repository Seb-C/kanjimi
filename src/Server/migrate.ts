import { sql, PgSqlDatabase } from 'kiss-orm';
import * as fs from 'fs';

const getMigrations = (): Promise<string[]> => {
	return new Promise((resolve, reject) => {
		fs.readdir('./src/Server/Migrations', (error, files) => {
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
		fs.readFile(`./src/Server/Migrations/${migration}`, (error, content) => {
			if (error !== null) {
				reject(error);
			} else {
				resolve(content.toString());
			}
		});
	});
};

const db = new PgSqlDatabase({
	host: <string>process.env.KANJIMI_DATABASE_HOST,
	port: parseInt(<string>process.env.KANJIMI_DATABASE_PORT),
	database: <string>process.env.KANJIMI_DATABASE_DATABASE,
	user: <string>process.env.KANJIMI_DATABASE_USER,
	password: <string>process.env.KANJIMI_DATABASE_PASSWORD,
	ssl: (process.env.KANJIMI_DATABASE_USE_SSL === 'true' ? { rejectUnauthorized: false } : false),
});

const runMigration = async (migration: string): Promise<void> => {
	console.log(`Starting migration "${migration}"`);
	const migrationScript = await getMigrationScript(migration);
	await db.query(sql`
		BEGIN;
		${migrationScript}
		INSERT INTO "Migrations" VALUES (${migration});
		COMMIT;
	`);
	console.log(`Finished migration "${migration}"`);
};

(async () => {
	await db.connect();

	await db.query(sql`
		CREATE TABLE IF NOT EXISTS "Migrations" (
			"name" TEXT PRIMARY KEY NOT NULL
		);
	`);

	const migrations = (await getMigrations()).sort();
	const migrationsDone = (await db.query(sql`
		SELECT "name"
		FROM "Migrations"
		ORDER BY "name";
	`)).map((row: any) => row.name);

	const migrationsToDo = migrations.filter((migration) => {
		return !migrationsDone.some(
			migrationDone => migrationDone === migration,
		);
	});

	for (let i = 0; i < migrationsToDo.length; i++) {
		await runMigration(migrationsToDo[i]);
	}

	await db.disconnect();
})().catch((error: Error) => {
	console.error(error);
	process.exit(1);
});
