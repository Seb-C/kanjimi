import Token from 'Common/Models/Token/Token';
import Unserializer from 'Common/Api/Unserializer';
import Serializer from 'Common/Api/Serializer';

const serializer = new Serializer();
const unserializer = new Unserializer();

export default async (strings: string[]): Promise<Token[][]> => {
	const response = await fetch('http://localhost:3000/analyze', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(serializer.toJsonApi(strings)),
	});
	const responseData = await response.json();

	const sentences: Token[][] = [];
	for (let i = 0; i < responseData.length; i++) {
		const tokenList = unserializer.fromJsonApi<Token[]>(responseData[i]);
		sentences.push(tokenList);
	}

	return sentences;
};
