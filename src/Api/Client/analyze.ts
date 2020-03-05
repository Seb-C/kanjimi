import Token from 'Lexer/Token/Token';
import Serializer from 'Api/Serializer/Serializer';

const serializer = new Serializer();

export default async (strings: string[]): Promise<Token[][]> => {
	const response = await fetch('http://localhost:3000/analyze', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({ sentences: strings }),
	});
	const responseData = await response.json();

	const sentences: Token[][] = [];
	for (let i = 0; i < responseData.length; i++) {
		const tokenList = serializer.fromJsonApi<Token[]>(responseData[i]);
		sentences.push(tokenList);
	}

	return sentences;
};
