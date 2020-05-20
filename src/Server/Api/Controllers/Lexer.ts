import { Response } from 'express';
import { Request } from 'Server/Request';
import * as Ajv from 'ajv';
import Token from 'Common/Models/Token';
import Lexer from 'Server/Lexer/Lexer';
import Language from 'Common/Types/Language';
import Database from 'Server/Database/Database';
import UserRepository from 'Server/Repository/User';

const validator = new Ajv({ allErrors: true }).compile({
	type: 'object',
	required: ['languages', 'strings'],
	additionalProperties: false,
	properties: {
		languages: {
			type: 'array',
			minItems: 1,
			uniqueItems: true,
			items: {
				type: 'string',
				enum: Object.values(Language),
			},
		},
		strings: {
			type: 'array',
			minItems: 1,
			items: {
				type: 'string',
				minLength: 1,
			},
		},
	},
});

export const analyze = (db: Database, lexer: Lexer) => (
	async (request: Request, response: Response) => {
		const user = await (new UserRepository(db)).getFromRequest(request);
		if (user === null) {
			return response.status(403).json('Invalid api key');
		}

		if (!validator(request.body)) {
			return response.status(422).json(validator.errors);
		}

		const languages: Language[] = request.body.languages;
		const sentences: string[] = request.body.strings;
		const result: any[] = [];
		for (let i = 0; i < sentences.length; i++) {
			const tokens: Token[] = lexer.analyze(sentences[i].trim(), languages);
			result.push(tokens.map(token => token.toApi()));
		}

		return response.json(result);
	}
);
