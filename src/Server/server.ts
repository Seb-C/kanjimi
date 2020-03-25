import Lexer from 'Server/Lexer/Lexer';
import Dictionary from 'Server/Lexer/Dictionary';
import Database from 'Server/Database/Database';
import * as Express from 'express';
import { Application, Request, Response } from 'express';
import * as BodyParser from 'body-parser';
import ValidationError from 'Server/Api/ValidationError';

import * as LexerController from 'Server/Api/Controllers/Lexer';
import * as UserController from 'Server/Api/Controllers/User';

const runServer = async (application: Application): Promise<void> => {
	return new Promise((resolve, reject) => {
		try {
			const server = application.listen(3000);
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
	const waitForStartupMiddleware = (request: Request, response: Response, next: Function) => {
		if (started) {
			next();
		} else {
			startupWaiters.push(next);
		}
	};

	const dictionary = new Dictionary();
	const lexer = new Lexer(dictionary);

	const server = Express();
	server.use(BodyParser.json());
	server.use(waitForStartupMiddleware);
	server.set('db', db);
	server.set('dictionary', dictionary);
	server.set('lexer', lexer);

	server.post('/lexer/analyze', LexerController.analyze);
	server.post('/user', UserController.create);
	// server.post('/token', );
	// server.get('/token', );

	server.use((error: Object, request: Request, response: Response, next: Function) => {
		if (error instanceof ValidationError) {
			response.status(422).send(error.errors);
		} else {
			next(error);
		}
	});

	await dictionary.load();

	const serverClosed: Promise<void> = runServer(server);

	// Ready, processing pending requests
	started = true;
	startupWaiters.forEach(f => f());
	console.log('Server started');

	await serverClosed;
	await db.close();
})().catch(console.error);
