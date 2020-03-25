import Token from 'Common/Models/Token';

export const analyze = async (strings: string[]): Promise<Token[][]> => {
	const response = await fetch('http://localhost:3000/lexer/analyze', {
		method: 'POST',
		body: JSON.stringify(strings),
	});
	const responseData = await response.json();

	return responseData.map((tokenList: any) => {
		return tokenList.map((tokenData: any) => Token.fromApi(tokenData));
	});
};
