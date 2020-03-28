import Lexer from 'Server/Lexer/Lexer';
import Dictionary from 'Server/Lexer/Dictionary';
import Database from 'Server/Database/Database';
import * as Express from 'express';
import { Application, Request, Response } from 'express';
import * as BodyParser from 'body-parser';

import * as LexerController from 'Server/Api/Controllers/Lexer';
import * as UserController from 'Server/Api/Controllers/User';
import * as ApiKeyController from 'Server/Api/Controllers/ApiKey';

(async () => {
	const startupWaiters: Function[] = [];
	let started = false;
	const waitForStartupMiddleware = (request: Request, response: Response, next: Function) => {
		if (started) {
			next();
		} else {
			startupWaiters.push(next);
		}
	};

	const application = Express();
	application.use(waitForStartupMiddleware);
	application.use(BodyParser.json({ type: () => true }));
	const serverClosed = new Promise((resolve, reject) => {
		try {
			const server = application.listen(3000);
			server.on('close', resolve);
		} catch (error) {
			reject(error);
		}
	});

	const db = new Database();
	const dictionary = new Dictionary();
	const lexer = new Lexer(dictionary);

	application.post('/lexer/analyze', LexerController.analyze(db, lexer));
	application.post('/user', UserController.create(db));
	application.post('/api-key', ApiKeyController.create(db));
	application.get('/api-key', ApiKeyController.get(db));

	await dictionary.load();

	// Ready, processing pending requests
	started = true;
	startupWaiters.forEach(f => f());
	console.log('Server started');

	await serverClosed;
	await db.close();
})().catch(console.error);
