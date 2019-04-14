import Token from 'Lexer/Token/Token';
import Serializer from 'Api/Serializer/Serializer';

const serializer = new Serializer();

export default async (text: string): Promise<Token[]> => {
	const response = await fetch('http://localhost:3000/tokenize', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({ sentence: text }),
	});
	const responseData = await response.json();
	return serializer.fromJsonApi<Token[]>(responseData);
};
