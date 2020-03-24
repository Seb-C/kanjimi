import Language from 'Common/Types/Language';
import { Request, Response } from 'express';
import * as Ajv from 'ajv';
import ValidationError from 'Server/Api/ValidationError';
import Token from 'Common/Models/Token/Token';

const validator = new Ajv({ allErrors: true }).compile({
	type: 'array',
	minItems: 1,
	items: {
		type: 'string',
	},
});

export const analyze = (request: Request, response: Response) => {
	if (!validator(request.body)) {
		throw new ValidationError(<Ajv.ErrorObject[]>validator.errors);
	}

	const lexer = request.app.get('lexer');

	const sentences: string[] = request.body;
	const result: any[] = [];
	for (let i = 0; i < sentences.length; i++) {
		const tokens: Token[] = lexer.analyze(
			sentences[i].trim(),
			[Language.FRENCH, Language.ENGLISH],
		);
		result.push(tokens.map(token => token.toApi()));
	}

	response.json(result);
};
