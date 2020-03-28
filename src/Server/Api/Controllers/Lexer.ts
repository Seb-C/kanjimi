import { Request, Response } from 'express';
import * as Ajv from 'ajv';
import Token from 'Common/Models/Token';
import Lexer from 'Server/Lexer/Lexer';
import User from 'Common/Models/User';
import Database from 'Server/Database/Database';
import { getUserFromRequest } from 'Server/Api/Authentication';

const validator = new Ajv({ allErrors: true }).compile({
	type: 'array',
	minItems: 1,
	items: {
		type: 'string',
	},
});

export const analyze = (db: Database, lexer: Lexer) => (
	async (request: Request, response: Response) => {
		const user = await getUserFromRequest(db, request);
		if (user === null) {
			return response.status(403).json('Invalid api key');
		}

		if (!validator(request.body)) {
			return response.status(422).json(validator.errors);
		}

		const sentences: string[] = request.body;
		const result: any[] = [];
		for (let i = 0; i < sentences.length; i++) {
			const tokens: Token[] = lexer.analyze(sentences[i].trim(), user.languages);
			result.push(tokens.map(token => token.toApi()));
		}

		return response.json(result);
	}
);
