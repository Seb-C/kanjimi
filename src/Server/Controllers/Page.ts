import { Response } from 'express';
import { Request } from 'Server/Request';
import fetch from 'node-fetch';
import { PgSqlDatabase } from 'kiss-orm';
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

export const get = (db: PgSqlDatabase) => async (request: Request, response: Response) => {
	if (!getPageQueryValidator(request.query)) {
		return response.status(422).json(getPageQueryValidator.errors);
	}

	const user = await (new UserRepository(db)).getFromRequest(request);
	if (user === null) {
		return response.status(403).json('Invalid api key');
	}

	try {
		const data = await fetch(request.query.url, {
			method: 'GET',
			follow: 3,
			size: 1000000,
			headers: {
				'User-Agent': <string>(request.get('User-Agent')),
				'X-Forwarded-For': request.ip,
				'X-Forwarded-Host': <string>(URL.parse(<string>process.env.KANJIMI_API_URL).host),
			},
		});

		const contentType = data.headers.get('Content-Type');
		if (typeof contentType === 'string' && !contentType.startsWith('text/html')) {
			return response.status(403).json('Access to this type of resource is not allowed (only text/html).');
		}

		response.writeHead(200, {
			'Content-Type': <string>contentType,
			'Content-Location': data.url,
		});

		const streamingResponse = new Promise<void>((resolve) => {
			let sentBytes = 0;
			data.body.on('data', function(buffer) {
				response.write(buffer);
				sentBytes += buffer.length

				if (sentBytes > 1000000) {
					response.end();
					(<any>data).body.destroy();
					resolve();
					console.error(`The page [${request.query.url}] got truncated bacause it was too big.`);
				}
			});
			data.body.on('end', function() {
				response.end();
				resolve();
			});
		});

		return streamingResponse;
	} catch (error) {
		return response.status(500).json(error.message);
	}
};
