import CharType from './Misc/CharType';
import Serializer from './Api/Serializer';
import Token from './Lexer/Token/Token';

const containsJapanese = (text: string) => {
	for (let i = 0; i < text.length; i++) {
		if (CharType.isJapanese(text[i])) {
			return true;
		}
	}

	return false;
};

const serializer = new Serializer();

(async () => {
	const walker = document.createTreeWalker(
		document.body,
		NodeFilter.SHOW_TEXT,
	);

	while (walker.nextNode()) {
		const textNode: Text = <Text>walker.currentNode;
		const text = textNode.data.trim();
		const containerType: string = (<Element>textNode.parentNode).tagName.toLowerCase();
		if (
			text.length > 0
			&& containerType !== 'script'
			&& containerType !== 'style'
			&& containerType !== 'noscript'
			&& containsJapanese(text)
		) {
			const response = await fetch('http://localhost:3000/tokenize', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ sentence: text }),
			});
			const responseData = await response.json();
			const data = serializer.fromJsonApi<Token[]>(responseData);
			console.log(data); // TODO
		}
	}
})().catch(console.error);
