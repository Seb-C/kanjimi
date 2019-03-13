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
		console.log('myext', textNode);
	}
}
