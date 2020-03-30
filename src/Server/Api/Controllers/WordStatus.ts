import { Request, Response } from 'express';
import * as Ajv from 'ajv';
import Database from 'Server/Database/Database';
import User from 'Common/Models/User';
import WordStatus from 'Common/Models/WordStatus';
import UserRepository from 'Server/Repository/User';

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

	// TODO add a transaction for those two queries

	await db.exec(`
		DELETE FROM "WordStatus"
		WHERE "userId" = \${userId}
		AND "word" = \${word};
	`, {
		userId: user.id,
		word: request.body.word,
	});

	const wordStatus = <WordStatus>await db.get(WordStatus, `
		INSERT INTO "WordStatus" ("userId", "word", "showFurigana", "showTranslation")
		VALUES (\${userId}, \${word}, \${showFurigana}, \${showTranslation})
		RETURNING *;
	`, {
		userId: user.id,
		word: request.body.word,
		showFurigana: request.body.showFurigana,
		showTranslation: request.body.showTranslation,
	});

	return response.json(wordStatus.toApi());
};
