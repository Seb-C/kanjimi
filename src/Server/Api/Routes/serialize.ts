import Language from 'Common/Types/Language';
import express = require('express');
import * as Ajv from 'ajv';
import ValidationError from 'Server/Api/ValidationError';

const validator = new Ajv({ allErrors: true }).compile({
	type: 'object',
	required: ['data'],
	properties: {
		data: {
			type: 'array',
			minItems: 1,
			items: {
				type: 'string',
			},
		},
	},
});

export default (request: express.Request, response: express.Response) => {
	if (!validator(request.body)) {
		throw new ValidationError(<Ajv.ErrorObject[]>validator.errors);
	}

	const serializer = request.app.get('serializer');
	const unserializer = request.app.get('unserializer');
	const lexer = request.app.get('lexer');

	const sentences: string[] = unserializer.fromJsonApi(request.body);
	const result: any[] = [];
	for (let i = 0; i < sentences.length; i++) {
		result.push(
			serializer.toJsonApi(
				lexer.analyze(
					sentences[i].trim(),
					[Language.FRENCH, Language.ENGLISH],
				),
			),
		);
	}

	response.json(result);
};
