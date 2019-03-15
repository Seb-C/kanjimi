import Lexer from './Lexer';
import Dictionary from './Dictionary';
import Database from './Database';
import express = require('express');

const runServer = async (application: express.Application): Promise<void> => {
	return new Promise((resolve, reject) => {
		try {
			const server = application.listen(80);
			server.on('close', resolve);
		} catch (error) {
			reject(error);
		}
	});
};

(async () => {
	const db = new Database();

	const dictionary = new Dictionary();
	// await dictionary.loadFromDatabase(db);

	const lexer = new Lexer(dictionary);

	// console.dir(lexer.tokenize('私はセバスティアンと申します。'), { depth: null });

	const server = express();
	server.get('/', (req, res) => res.send('Hello World!'));
	await runServer(server);

	await db.close();
})();
