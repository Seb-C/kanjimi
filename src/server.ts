import Lexer from './Lexer';
import Dictionary from './Dictionary';
import Database from './Database';
import express = require('express');
import bodyParser = require('body-parser');

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
	await dictionary.loadFromDatabase(db);

	const lexer = new Lexer(dictionary);

	const server = express();
	server.use(bodyParser.json());
	server.post('/tokenize', (request: express.Request, response: express.Response) => {
		const sentences: string[] = request.body.sentences;
		response.json(sentences.map(text => lexer.tokenize(text)));
	});
	await runServer(server);

	await db.close();
})();
