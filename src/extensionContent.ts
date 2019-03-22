import CharType from './Misc/CharType';

const containsJapanese = (text: string) => {
	for (let i = 0; i < text.length; i++) {
		if (CharType.isJapanese(text[i])) {
			return true;
		}
	}

	return false;
};

const walker = document.createTreeWalker(
	document.body,
	NodeFilter.SHOW_TEXT,
);

const nodes: Text[] = [];
const texts: string[] = [];

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
		nodes.push(textNode);
		texts.push(text);
	}
}

fetch('http://localhost:3000/tokenize', {
	method: 'POST',
	headers: {
		'Content-Type': 'application/json',
	},
	body: JSON.stringify({
		sentences: texts.slice(0, 50), // TODO
	}),
}).then(response => response.json()).then((data) => {
	console.log(data);
}).catch(console.error);
