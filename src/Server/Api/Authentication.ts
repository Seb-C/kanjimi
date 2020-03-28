import { Request, Response } from 'express';
import Database from 'Server/Database/Database';
import User from 'Common/Models/User';
import ApiKey from 'Common/Models/ApiKey';

const authHeaderPrefix = 'Bearer ';

export const getApiKeyFromRequest = async (
	db: Database,
	request: Request,
): Promise<ApiKey|null> => {
	if (!request.headers['authorization']) {
		return null;
	}

	const header = request.headers['authorization'];
	if (header.substring(0, authHeaderPrefix.length) !== authHeaderPrefix) {
		return null;
	}

	const key = header.substring(authHeaderPrefix.length);
	return await db.get(ApiKey, `
		SELECT * FROM "ApiKey" WHERE "key" = \${key};
	`, { key });
};