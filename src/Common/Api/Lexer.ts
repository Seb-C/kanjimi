import Token from 'Common/Models/Token';
import Language from 'Common/Types/Language';
import ValidationError from 'Common/Api/Errors/Validation';
import AuthenticationError from 'Common/Api/Errors/Authentication';
import ServerError from 'Common/Api/Errors/Server';

export const analyze = async (
	key: string,
	data: {
		languages: Language[],
		strings: string[],
	},
	pageUri?: string,
): Promise<Token[][]> => {
	const response = await fetch(`${process.env.KANJIMI_API_URL}/lexer/analyze`, {
		method: 'POST',
		headers: <any>{
			Authorization: `Bearer ${key}`,
			'X-Kanjimi-Page-Uri': pageUri,
		},
		body: JSON.stringify(data),
	});

	const responseData = await response.json();

	if (response.status === 422) {
		throw new ValidationError(responseData);
	}
	if (response.status === 403) {
		throw new AuthenticationError(responseData);
	}
	if (response.status >= 500 && response.status < 600) {
		throw new ServerError(await response.text());
	}

	return responseData.map((tokenList: any) => {
		return tokenList.map((tokenData: any) => Token.fromApi(tokenData));
	});
};
