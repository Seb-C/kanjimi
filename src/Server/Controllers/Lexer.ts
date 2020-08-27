import { Response } from 'express';
import { Request } from 'Server/Request';
import * as Ajv from 'ajv';
import Kanji from 'Common/Models/Kanjis/Kanji';
import Structure from 'Common/Models/Kanjis/Structure';
import Token from 'Common/Models/Token';
import Lexer from 'Server/Lexer/Lexer';
import Language from 'Common/Types/Language';
import Kanjis from 'Server/Lexer/Kanjis';
import CharType from 'Common/Types/CharType';
import { PgSqlDatabase } from 'kiss-orm';
import UserRepository from 'Server/Repositories/User';
import UserActivityRepository from 'Server/Repositories/UserActivity';
import AnalyzeLogRepository from 'Server/Repositories/AnalyzeLog';

const analyzeRequestValidator = new Ajv({ allErrors: true }).compile({
	type: 'object',
	required: ['languages', 'strings'],
	dependencies: {
		pageUrl: ['sessionId'],
		sessionId: ['pageUrl'],
	},
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
		pageUrl: {
			type: 'string',
			format: 'uri',
		},
		sessionId: {
			type: 'string',
			format: 'uuid',
		},
	},
});

export const analyze = (db: PgSqlDatabase, lexer: Lexer) => (
	async (request: Request, response: Response) => {
		const user = await (new UserRepository(db)).getFromRequest(request);
		if (user === null) {
			return response.status(403).json('Invalid api key');
		}

		if (!analyzeRequestValidator(request.body)) {
			return response.status(422).json(analyzeRequestValidator.errors);
		}

		const languages: Language[] = request.body.languages;
		const sentences: string[] = request.body.strings;
		let characters = 0;
		const result: any[] = [];
		for (let i = 0; i < sentences.length; i++) {
			characters += sentences[i].length;
			const tokens: Token[] = lexer.analyze(sentences[i].trim(), languages);
			result.push(tokens.map(token => token.toApi()));
		}

		// Note: if not allowed (exceeded free plan), should return 402
		// with the notification message in the json body
		await (new UserActivityRepository(db)).createOrIncrement(
			user.id,
			new Date(),
			characters,
		);

		const pageUrl = request.body.pageUrl || null;
		const sessionId = request.body.sessionId || null;
		if (pageUrl !== null && sessionId !== null) {
			await (new AnalyzeLogRepository(db)).create({
				sessionId,
				url: pageUrl,
				characters,
				requestedAt: new Date(),
			});
		}

		return response.json(result);
	}
);

export const getKanji = (db: PgSqlDatabase, kanjis: Kanjis) => (
	async (request: Request, response: Response) => {
		const user = await (new UserRepository(db)).getFromRequest(request);
		if (user === null) {
			return response.status(403).json('Invalid api key');
		}

		const kanji: string = request.params.kanji;
		if (typeof kanji !== 'string' || kanji.length !== 1 || CharType.of(kanji) !== CharType.KANJI) {
			return response.status(422).json([{
				keyword: 'type',
				message: 'This is not a valid Kanji',
			}]);
		}

		if (!kanjis.has(kanji)) {
			return response.status(404).json('Unknown Kanji');
		}

		const outputKanjis: Kanji[] = [];
		const recursivelyFindSubComponents = (structure: Structure) => {
			structure.components.forEach((component: Structure|string) => {
				if (typeof component === 'string') {
					if (kanjis.has(component)) {
						outputKanjis.push(<Kanji>kanjis.get(component, user.languages));
					}
				} else {
					if (kanjis.has(component.element)) {
						outputKanjis.push(<Kanji>kanjis.get(component.element, user.languages));
					}
					recursivelyFindSubComponents(component);
				}
			});
		};
		const requestedKanji = <Kanji>kanjis.get(kanji, user.languages);
		outputKanjis.push(requestedKanji);
		recursivelyFindSubComponents(requestedKanji.structure);

		const outputKanjisObject: { [key: string]: object } = {};
		outputKanjis.forEach((kanji) => {
			outputKanjisObject[kanji.kanji] = kanji.toApi();
		});
		return response.json(outputKanjisObject);
	}
);
