import { Response } from 'express';
import { Request } from 'Server/Request';
import fetch from 'node-fetch';
import Database from 'Server/Database/Database';
import UserRepository from 'Server/Repositories/User';
import * as Ajv from 'ajv';
import * as URL from 'url';

const getPageQueryValidator = new Ajv({ allErrors: true }).compile({
	type: 'object',
	required: ['url'],
	additionalProperties: false,
	properties: {
		url: {
			type: 'string',
			minLength: 1,
			format: 'uri',
		},
	},
});

export const get = (db: Database) => async (request: Request, response: Response) => {
	if (!getPageQueryValidator(request.query)) {
		return response.status(422).json(getPageQueryValidator.errors);
	}

	const user = await (new UserRepository(db)).getFromRequest(request);
	if (user === null) {
		return response.status(403).json('Invalid api key');
	}

	const data = await fetch(request.query.url, {
		method: 'GET',
		redirect: 'error',
		headers: {
			'User-Agent': <string>(request.get('User-Agent')),
			'X-Forwarded-For': request.ip,
			'X-Forwarded-Host': <string>(URL.parse(<string>process.env.KANJIMI_API_URL).host),
		},
	});

	// TODO filter the size
	// TODO transfer content
	// TODO fix errors, test in a sandboxed iframe, handle properly all the cache headers

	response.set('Content-Type', data.headers['Content-Type']);
	response.set('Cache-Control', 'max-age=3600');
	response.status(data.status);
	return response.send(buffer);
};
