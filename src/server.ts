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

	const startupWaiters: Function[] = [];
	let started = false;
	const waitForStartupMiddleware = (
		request: express.Request,
		response: express.Response,
		next: Function,
	) => {
		if (started) {
			next();
		} else {
			startupWaiters.push(next);
		}
	};

	const dictionary = new Dictionary();
	const lexer = new Lexer(dictionary);

	const server = express();
	server.use(bodyParser.json());
	server.use(waitForStartupMiddleware);
	server.post('/tokenize', (request: express.Request, response: express.Response) => {
		const sentences: string[] = request.body.sentences;
		response.json(sentences.map(text => lexer.tokenize(text)));
	});

	const serverClosed: Promise<void> = runServer(server);

	await dictionary.loadFromDatabase(db);

	// Ready, processing pending requests
	started = true;
	startupWaiters.forEach(f => f());

	await serverClosed;
	await db.close();
})().catch(console.error);
