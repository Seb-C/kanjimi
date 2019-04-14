import Lexer from './Lexer';
import Dictionary from './Dictionary';
import Database from './Database';
import Serializer from './Api/Serializer';
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

	const dictionary = new Dictionary(db);
	const lexer = new Lexer(dictionary);
	const serializer = new Serializer();

	const server = express();
	server.use(bodyParser.json());
	server.use(waitForStartupMiddleware);
	server.post('/tokenize', async (request: express.Request, response: express.Response) => {
		const sentence: string = request.body.sentence;
		const tokenized = await lexer.tokenize(sentence);
		const serialized = serializer.toJsonApi(tokenized);
		response.json(serialized);
	});

	const serverClosed: Promise<void> = runServer(server);

	// Ready, processing pending requests
	started = true;
	startupWaiters.forEach(f => f());
	console.log('Server started');

	await serverClosed;
	await db.close();
})().catch(console.error);
