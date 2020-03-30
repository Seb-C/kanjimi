import { Request, Response } from 'express';
import * as Ajv from 'ajv';
import Database from 'Server/Database/Database';
import User from 'Common/Models/User';
import WordStatus from 'Common/Models/WordStatus';
import UserRepository from 'Server/Repository/User';
import WordStatusRepository from 'Server/Repository/WordStatus';

const wordStatusesValidator = new Ajv({ allErrors: true }).compile({
	type: 'object',
	required: ['word', 'showFurigana', 'showTranslation'],
	additionalProperties: false,
	properties: {
		userId: {
			type: 'string',
		},
		word: {
			type: 'string',
		},
		showFurigana: {
			type: 'boolean',
		},
		showTranslation: {
			type: 'boolean',
		},
	},
});

export const createOrUpdate = (db: Database) => async (request: Request, response: Response) => {
	const user = await (new UserRepository(db)).getFromRequest(request);
	if (user === null) {
		return response.status(403).json('Invalid api key');
	}

	if (!wordStatusesValidator(request.body)) {
		return response.status(422).json(wordStatusesValidator.errors);
	}

	if (request.body.userId !== user.id) {
		return response.status(403).json('Invalid userId in object.');
	}

	const wordStatusRepository = new WordStatusRepository(db);
	const wordStatus = await wordStatusRepository.createOrUpdate(
		user,
		request.body.word,
		request.body.showFurigana,
		request.body.showTranslation,
	);

	return response.json(wordStatus.toApi());
};
