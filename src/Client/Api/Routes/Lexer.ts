import Token from 'Common/Models/Token';
import ValidationError from 'Client/Api/Errors/Validation';
import AuthenticationError from 'Client/Api/Errors/Authentication';
import ServerError from 'Client/Api/Errors/Server';

export const analyze = async (key: string, strings: string[]): Promise<Token[][]> => {
	const response = await fetch('http://localhost:3000/lexer/analyze', {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${key}`,
		},
		body: JSON.stringify(strings),
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
