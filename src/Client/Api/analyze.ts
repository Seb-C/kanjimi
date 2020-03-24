import Token from 'Common/Models/Token/Token';

export default async (strings: string[]): Promise<Token[][]> => {
	const response = await fetch('http://localhost:3000/lexer/analyze', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(strings),
	});
	const responseData = await response.json();

	return responseData.map((tokenList) => {
		return tokenList.map(tokenData => Token.fromApi(tokenData));
	});
};
