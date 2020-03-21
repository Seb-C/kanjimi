import Lexer from 'Server/Lexer/Lexer';
import Dictionary from 'Server/Lexer/Dictionary';
import Database from 'Server/Database/Database';
import Serializer from 'Common/Api/Serializer';
import Unserializer from 'Common/Api/Unserializer';
import * as Express from 'express';
import { Application, Request, Response } from 'express';
import * as BodyParser from 'body-parser';
import ValidationError from 'Server/Api/ValidationError';

import * as LexerController from 'Server/Api/Controllers/Lexer';

const runServer = async (application: Application): Promise<void> => {
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
	const waitForStartupMiddleware = (request: Request, response: Response, next: Function) => {
		if (started) {
			next();
		} else {
			startupWaiters.push(next);
		}
	};

	const dictionary = new Dictionary();
	const lexer = new Lexer(dictionary);
	const serializer = new Serializer();
	const unserializer = new Unserializer();

	const server = Express();
	server.use(BodyParser.json());
	server.use(waitForStartupMiddleware);
	server.set('db', db);
	server.set('dictionary', dictionary);
	server.set('lexer', lexer);
	server.set('serializer', serializer);
	server.set('unserializer', unserializer);

	server.post('/lexer/analyze', LexerController.analyze);

	// server.get('/user', );
	// server.post('/user', );
	// server.get('/user/:id', );
	// server.patch('/user/:id', );
	// server.delete('/user/:id', );

	server.use((error: Object, request: Request, response: Response, next: Function) => {
		if (error instanceof ValidationError) {
			response.status(422).send({
				errors: error.errors.map(err => ({
					id: err.schemaPath,
					title: err.keyword,
					detail: err.message,
					source: {
						pointer: err.dataPath,
						parameter: err.propertyName,
					},
					meta: err.params,
				})),
			});
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
