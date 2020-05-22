import Lexer from 'Server/Lexer/Lexer';
import Dictionary from 'Server/Lexer/Dictionary';
import Database from 'Server/Database/Database';
import * as Express from 'express';
import { Response } from 'express';
import { Request } from 'Server/Request';
import * as BodyParser from 'body-parser';
import * as URL from 'url';

import * as LexerController from 'Server/Api/Controllers/Lexer';
import * as UserController from 'Server/Api/Controllers/User';
import * as ApiKeyController from 'Server/Api/Controllers/ApiKey';
import * as WordStatusController from 'Server/Api/Controllers/WordStatus';

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
	const jsonQueryStrings = (request: Request, response: Response, next: Function) => {
		const query = URL.parse(request.originalUrl).query;
		if (query) {
			try {
				request.query = JSON.parse(unescape(query));
			} catch {
				request.query = null;
			}
		} else {
			request.query = null;
		}

		next();
	};
	const logRequestMiddleware = (request: Request, response: Response, next: Function) => {
		const startTime = +new Date();
		response.on('finish', () => {
			const responseTime = +new Date() - startTime;
			let url = request.originalUrl;
			const queryStringStart = url.indexOf('?');
			if (queryStringStart >= 0) {
				url = url.substring(0, queryStringStart) + '?[...]';
			}

			console.log(`HTTP ${request.method} ${url} = ${response.statusCode} (${responseTime}ms)`);
		});
		next();
	};

	const application = Express();
	application.use(logRequestMiddleware);
	application.use(waitForStartupMiddleware);
	application.use(BodyParser.json({ type: () => true }));
	application.use(jsonQueryStrings);
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

	application.use('/www', Express.static('www'));
	application.use('/www/app/*', Express.static('www/app/index.html'));

	application.post('/lexer/analyze', LexerController.analyze(db, lexer));

	application.post('/user', UserController.create(db));
	application.patch('/user/:userId', UserController.update(db));
	application.get('/user/:userId', UserController.get(db));

	application.post('/api-key', ApiKeyController.create(db));
	application.get('/api-key', ApiKeyController.get(db));

	application.get('/word-status', WordStatusController.get(db, dictionary));
	application.put('/word-status', WordStatusController.createOrUpdate(db, dictionary));

	await dictionary.load();

	// Ready, processing pending requests
	started = true;
	startupWaiters.forEach(f => f());
	console.log('Server started');

	await serverClosed;
	await db.close();
})().catch(console.error);
