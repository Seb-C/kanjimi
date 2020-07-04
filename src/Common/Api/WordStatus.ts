import ValidationError from 'Common/Api/Errors/Validation';
import AuthenticationError from 'Common/Api/Errors/Authentication';
import ServerError from 'Common/Api/Errors/Server';
import WordStatus from 'Common/Models/WordStatus';

export const search = async (key: string, strings: string[]): Promise<WordStatus[]> => {
	const response = await fetch(`${process.env.KANJIMI_API_URL}/word-status/search`, {
		method: 'POST',
		body: JSON.stringify(strings),
		headers: {
			Authorization: `Bearer ${key}`,
		},
	});

	let responseData: any;
	try {
		responseData = await response.json();
	} catch (jsonError) {
		throw new ServerError(null);
	}

	if (response.status === 422) {
		throw new ValidationError(responseData);
	}
	if (response.status === 403) {
		throw new AuthenticationError(responseData);
	}
	if (response.status >= 500 && response.status < 600) {
		throw new ServerError(responseData);
	}

	return responseData.map((wordStatusData: any) => WordStatus.fromApi(wordStatusData));
};

export const createOrUpdate = async (key: string, wordStatus: WordStatus): Promise<WordStatus> => {
	const response = await fetch(`${process.env.KANJIMI_API_URL}/word-status`, {
		method: 'PUT',
		headers: {
			Authorization: `Bearer ${key}`,
		},
		body: JSON.stringify({
			userId: wordStatus.userId,
			word: wordStatus.word,
			showFurigana: wordStatus.showFurigana,
			showTranslation: wordStatus.showTranslation,
		}),
	});

	let responseData: any;
	try {
		responseData = await response.json();
	} catch (jsonError) {
		throw new ServerError(null);
	}

	if (response.status === 422) {
		throw new ValidationError(responseData);
	}
	if (response.status === 403) {
		throw new AuthenticationError(responseData);
	}
	if (response.status >= 500 && response.status < 600) {
		throw new ServerError(responseData);
	}

	return WordStatus.fromApi(responseData);
};
