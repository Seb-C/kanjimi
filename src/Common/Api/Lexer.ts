import Token from 'Common/Models/Token';
import Language from 'Common/Types/Language';
import ValidationError from 'Common/Api/Errors/Validation';
import AuthenticationError from 'Common/Api/Errors/Authentication';
import ServerError from 'Common/Api/Errors/Server';
import PaymentRequiredError from 'Common/Api/Errors/PaymentRequired';

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

	try {
		const responseData = await response.json();
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
	} catch (jsonError) {
		throw new ServerError(null);
	}
};
