import { Request, Response } from 'express';
import * as Ajv from 'ajv';
import Database from 'Server/Database/Database';
import User from 'Common/Models/User';
import WordStatus from 'Common/Models/WordStatus';
import UserRepository from 'Server/Repository/User';
import WordStatusRepository from 'Server/Repository/WordStatus';

const wordStatusListValidator = new Ajv({ allErrors: true }).compile({
	type: 'array',
	minItems: 1,
	uniqueItems: true,
	items: {
		type: 'string',
		minLength: 1,
	},
});

export const get = (db: Database) => async (request: Request, response: Response) => {
	const user = await (new UserRepository(db)).getFromRequest(request);
	if (user === null) {
		return response.status(403).json('Invalid api key');
	}

	if (!wordStatusListValidator(request.body)) {
		return response.status(422).json(wordStatusListValidator.errors);
	}

	const wordStatusRepository = new WordStatusRepository(db);
	const wordStatusList = await wordStatusRepository.getList(user, request.body);

	const wordStatusMap: Map<string, WordStatus> = new Map();
	for (let i = 0; i < wordStatusList.length; i++) {
		const wordStatus = wordStatusList[i];
		wordStatusMap.set(wordStatus.word, wordStatus);
	}

	const output = [];
	for (let j = 0; j < request.body.length; j++) {
		const word = request.body[j];
		if (wordStatusMap.has(word)) {
			output.push(wordStatusMap.get(word).toApi());
		} else {
			output.push(new WordStatus({
				userId: user.id,
				word,
				showFurigana: true,
				showTranslation: true,
			}).toApi());
		}
	}

	return response.json(output);
};

const wordStatusValidator = new Ajv({ allErrors: true }).compile({
	type: 'object',
	required: ['word', 'showFurigana', 'showTranslation'],
	additionalProperties: false,
	properties: {
		userId: {
			type: 'string',
		},
		word: {
			type: 'string',
			minLength: 1,
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

	if (!wordStatusValidator(request.body)) {
		return response.status(422).json(wordStatusValidator.errors);
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
