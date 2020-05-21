import Token from 'Common/Models/Token';
import Language from 'Common/Types/Language';
import ValidationError from 'Common/Client/Errors/Validation';
import AuthenticationError from 'Common/Client/Errors/Authentication';
import ServerError from 'Common/Client/Errors/Server';

export const analyze = async (key: string, data: {
	languages: Language[],
	strings: string[],
}): Promise<Token[][]> => {
	const response = await fetch(`${process.env.KANJIMI_API_URL}/lexer/analyze`, {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${key}`,
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