import Language from 'Common/Types/Language';
import { Request, Response } from 'express';
import * as Ajv from 'ajv';
import Token from 'Common/Models/Token';
import Lexer from 'Server/Lexer/Lexer';

const validator = new Ajv({ allErrors: true }).compile({
	type: 'array',
	minItems: 1,
	items: {
		type: 'string',
	},
});

export const analyze = (lexer: Lexer) => (request: Request, response: Response) => {
	if (!validator(request.body)) {
		return response.status(422).json(validator.errors);
	}

	const sentences: string[] = request.body;
	const result: any[] = [];
	for (let i = 0; i < sentences.length; i++) {
		const tokens: Token[] = lexer.analyze(
			sentences[i].trim(),
			[Language.FRENCH, Language.ENGLISH],
		);
		result.push(tokens.map(token => token.toApi()));
	}

	return response.json(result);
};
