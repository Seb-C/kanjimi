import Token from 'Common/Models/Token';
import Language from 'Common/Types/Language';
import ValidationError from 'Common/Api/Errors/Validation';
import AuthenticationError from 'Common/Api/Errors/Authentication';
import ServerError from 'Common/Api/Errors/Server';
import NotFoundError from 'Common/Api/Errors/NotFound';
import PaymentRequiredError from 'Common/Api/Errors/PaymentRequired';
import Kanji from 'Common/Models/Kanjis/Kanji';

export const analyze = async (
	key: string,
	data: {
		languages: Language[],
		strings: string[],
		pageUrl?: string,
		sessionId?: string,
	},
): Promise<Token[][]> => {
	const response = await fetch(`${process.env.KANJIMI_API_URL}/lexer/analyze`, {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${key}`,
		},
		body: JSON.stringify(data),
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
	if (response.status === 402) {
		throw new PaymentRequiredError(responseData);
	}
	if (response.status >= 500 && response.status < 600) {
		throw new ServerError(responseData);
	}

	return responseData.map((tokenList: any) => {
		return tokenList.map((tokenData: any) => Token.fromApi(tokenData));
	});
};

export const getKanji = async (
	key: string,
	kanji: string,
): Promise<{ [key: string]: Kanji }> => {
	const response = await fetch(`${process.env.KANJIMI_API_URL}/lexer/kanji/${encodeURIComponent(kanji)}`, {
		method: 'GET',
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
	if (response.status === 404) {
		throw new NotFoundError(responseData);
	}
	if (response.status >= 500 && response.status < 600) {
		throw new ServerError(responseData);
	}

	const formattedResponse: { [key: string]: Kanji } = {};
	Object.entries(responseData).forEach(([key, value]: [string, any]) => {
		formattedResponse[key] = Kanji.fromApi(value);
	});
	return formattedResponse;
};
