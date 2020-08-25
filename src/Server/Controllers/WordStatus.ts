import { Response } from 'express';
import { Request } from 'Server/Request';
import * as Ajv from 'ajv';
import { PgSqlDatabase } from 'kiss-orm';
import Dictionary from 'Server/Lexer/Dictionary';
import WordStatus from 'Common/Models/WordStatus';
import UserRepository from 'Server/Repositories/User';
import WordStatusRepository from 'Server/Repositories/WordStatus';

const wordArrayValidator = new Ajv({ allErrors: true }).compile({
	type: 'array',
	minItems: 1,
	uniqueItems: true,
	items: {
		type: 'string',
		minLength: 1,
	},
});
const wordStatusValidator = new Ajv({ allErrors: true }).compile({
	type: 'object',
	required: ['word', 'showFurigana', 'showTranslation'],
	additionalProperties: false,
	properties: {
		userId: {
			type: 'string',
			format: 'uuid',
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

export const search = (db: PgSqlDatabase, dictionary: Dictionary) => async (request: Request, response: Response) => {
	const user = await (new UserRepository(db)).getFromRequest(request);
	if (user === null) {
		return response.status(403).json('Invalid api key');
	}

	if (!wordArrayValidator(request.body)) {
		return response.status(422).json(wordArrayValidator.errors);
	}

	const wordStatusRepository = new WordStatusRepository(db, dictionary);
	const wordStatusList = await wordStatusRepository.getList(user, request.body);

	const wordStatusMap: Map<string, WordStatus> = new Map();
	for (let i = 0; i < wordStatusList.length; i++) {
		const wordStatus = wordStatusList[i];
		wordStatusMap.set(wordStatus.word, wordStatus);
	}

	const output = [];
	for (let j = 0; j < request.body.length; j++) {
		const word = request.body[j];

		let wordStatus: WordStatus;
		if (wordStatusMap.has(word)) {
			wordStatus = <WordStatus>wordStatusMap.get(word);
		} else {
			wordStatus = wordStatusRepository.getDefaultWordStatus(user, word);
		}

		output.push(wordStatus.toApi());
	}

	return response.json(output);
};

export const createOrUpdate = (db: PgSqlDatabase, dictionary: Dictionary) => async (request: Request, response: Response) => {
	const user = await (new UserRepository(db)).getFromRequest(request);
	if (user === null) {
		return response.status(403).json('Invalid api key');
	}

	if (!wordStatusValidator(request.body)) {
		return response.status(422).json(wordStatusValidator.errors);
	}

	if (!dictionary.has(request.body.word)) {
		return response.status(422).json([{
			keyword: 'unknown',
			dataPath: '.word',
			message: 'The provided word is not in the dictionary',
		}]);
	}

	if (request.body.userId !== user.id) {
		return response.status(403).json('Invalid userId in object.');
	}

	const wordStatusRepository = new WordStatusRepository(db, dictionary);
	const wordStatus = await wordStatusRepository.createOrUpdate(
		user,
		request.body.word,
		request.body.showFurigana,
		request.body.showTranslation,
	);

	return response.json(wordStatus.toApi());
};
