import * as Https from 'https';
import * as FileSystem from 'fs';
import * as Path from 'path';
import Lexer from 'Server/Lexer/Lexer';
import Dictionary from 'Server/Lexer/Dictionary';
import * as PgPromise from 'pg-promise';
import * as Express from 'express';
import { Response } from 'express';
import { Request } from 'Server/Request';
import * as BodyParser from 'body-parser';
import * as NodeMailer from 'nodemailer';

import * as HealthCheckController from 'Server/Controllers/HealthCheck';
import * as LexerController from 'Server/Controllers/Lexer';
import * as UserController from 'Server/Controllers/User';
import * as ApiKeyController from 'Server/Controllers/ApiKey';
import * as WordStatusController from 'Server/Controllers/WordStatus';
//import * as PageController from 'Server/Controllers/Page';

(async () => {
	const application = Express();
	application.disable('etag'); // Disable caching
	application.use((request: Request, response: Response, next: Function) => {
		// Logging requests
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
	});
	application.use(BodyParser.json({ type: () => true }));
	application.use(function (error: any, request: Request, response: Response, next: Function) {
		if (error.type === 'entity.parse.failed' && request.url.startsWith('/api/')) {
			return response.status(422).json([{
				keyword: 'JSON syntax',
				message: error.message,
			}]);
		} else {
			return next(error);
		}
	});

	const db = <PgPromise.IDatabase<void>>PgPromise()({
		host: <string>process.env.KANJIMI_DATABASE_HOST,
		port: parseInt(<string>process.env.KANJIMI_DATABASE_PORT),
		database: <string>process.env.KANJIMI_DATABASE_DATA,
		user: <string>process.env.KANJIMI_DATABASE_USER,
		password: <string>process.env.KANJIMI_DATABASE_PASSWORD,
	});
	const dictionary = new Dictionary();
	const lexer = new Lexer(dictionary);

	const smtpAuth = {
		user: process.env.KANJIMI_SMTP_USER,
		pass: process.env.KANJIMI_SMTP_PASS,
	};
	const mailer = NodeMailer.createTransport(<NodeMailer.TransportOptions>{
		host: process.env.KANJIMI_SMTP_HOST,
		port: parseInt(<string>process.env.KANJIMI_SMTP_PORT),
		secure: (process.env.KANJIMI_SMTP_SECURE === 'true'),
		auth: smtpAuth.user ? smtpAuth : undefined,
	}, { from: '"Kanjimi" <contact@kanjimi.com>' });

	// This one must not be redirected to the right origin
	application.get('/api/health-check', HealthCheckController.get(db, mailer));

	// Redirecting to origin if the domain or protocol are wrong
	application.all('/*', function (request: Request, response: Response, next: Function) {
		const requestOrigin = request.protocol + '://' + request.headers.host;
		if (!requestOrigin.startsWith(<string>process.env.KANJIMI_WWW_URL)) {
			return response.redirect(301, process.env.KANJIMI_WWW_URL + request.url);
		} else {
			return next();
		}
	});

	application.all('/test-pages/*', (request: Request, response: Response, next: Function) => {
		if (process.env.KANJIMI_ALLOW_TEST_PAGES === 'true') {
			return next();
		} else {
			return response.status(403).end();
		}
	});
	application.use('', Express.static('www'));
	application.use('/app/*', Express.static('www/app/index.html'));

	application.all('/api/*', (request: Request, response: Response, next: Function) => {
		response.set('Access-Control-Allow-Origin', '*');
		return next();
	});

	application.post('/api/lexer/analyze', LexerController.analyze(db, lexer));

	application.post('/api/user', UserController.create(db, mailer));
	application.post('/api/user/request-reset-password', UserController.requestResetPassword(db, mailer));
	application.patch('/api/user/:userId/verify-email', UserController.verifyEmail(db));
	application.patch('/api/user/:userId/reset-password', UserController.resetPassword(db));
	application.patch('/api/user/:userId', UserController.update(db));
	application.get('/api/user/:userId', UserController.get(db));

	application.post('/api/api-key', ApiKeyController.create(db));
	application.get('/api/api-key', ApiKeyController.get(db));

	application.post('/api/word-status/search', WordStatusController.search(db, dictionary));
	application.put('/api/word-status', WordStatusController.createOrUpdate(db, dictionary));

	//application.get('/api/page', PageController.get(db));

	await dictionary.load();

	const server = Https.createServer({
		key: FileSystem.readFileSync(Path.join(process.cwd(), <string>process.env.KANJIMI_SERVER_CERTIFICATE_KEY)).toString(),
		cert: FileSystem.readFileSync(Path.join(process.cwd(), <string>process.env.KANJIMI_SERVER_CERTIFICATE_CRT)).toString(),
	}, application);

	server.listen(parseInt(<string>process.env.KANJIMI_SERVER_PORT));
	console.log('Server started');

	await new Promise((resolve) => {
		server.on('close', resolve);
	});
	await db.$pool.end();
})().catch(console.error);
