import Lexer from 'Server/Lexer/Lexer';
import Dictionary from 'Server/Lexer/Dictionary';
import Kanjis from 'Server/Lexer/Kanjis';
import migrations from 'Server/migrations';
import { PgSqlDatabase } from 'kiss-orm';
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
import * as PageController from 'Server/Controllers/Page';

(async () => {
	const application = Express();
	application.disable('etag'); // Disable caching
	application.disable('x-powered-by');
	application.use(BodyParser.json({ type: () => true }));
	application.use(function (error: any, request: Request, response: Response, next: Function) {
		if (error.type === 'entity.parse.failed') {
			return response.status(422).json([{
				keyword: 'JSON syntax',
				message: error.message,
			}]);
		} else {
			return next(error);
		}
	});

	const db = new PgSqlDatabase({
		host: <string>process.env.KANJIMI_DATABASE_HOST,
		port: parseInt(<string>process.env.KANJIMI_DATABASE_PORT),
		database: <string>process.env.KANJIMI_DATABASE_DATABASE,
		user: <string>process.env.KANJIMI_DATABASE_USER,
		password: <string>process.env.KANJIMI_DATABASE_PASSWORD,
		ssl: (process.env.KANJIMI_DATABASE_USE_SSL === 'true' ? { rejectUnauthorized: false } : false),
	});

	await db.migrate(migrations);

	const kanjis = new Kanjis();
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
	application.get('/health-check', HealthCheckController.get(db, mailer));

	application.all('/*', (request: Request, response: Response, next: Function) => {
		response.set('Access-Control-Allow-Origin', '*');
		return next();
	});

	application.post('/lexer/analyze', LexerController.analyze(db, lexer));
	application.get('/lexer/kanji/:kanji', LexerController.getKanji(db, kanjis));

	application.post('/user', UserController.create(db, mailer));
	application.post('/user/request-reset-password', UserController.requestResetPassword(db, mailer));
	application.patch('/user/:userId/verify-email', UserController.verifyEmail(db));
	application.patch('/user/:userId/reset-password', UserController.resetPassword(db));
	application.patch('/user/:userId', UserController.update(db));
	application.get('/user/:userId', UserController.get(db));

	application.post('/api-key', ApiKeyController.create(db));
	application.get('/api-key', ApiKeyController.get(db));

	application.post('/word-status/search', WordStatusController.search(db, dictionary));
	application.put('/word-status', WordStatusController.createOrUpdate(db, dictionary));

	application.get('/page', PageController.get(db));

	await kanjis.load();
	await dictionary.load();

	if (global.gc) {
		global.gc();
	}

	const server = application.listen(parseInt(<string>process.env.KANJIMI_SERVER_PORT));
	console.log('Server started');

	await new Promise((resolve) => {
		server.on('close', resolve);
	});
	await db.disconnect();
})().catch(console.error);
