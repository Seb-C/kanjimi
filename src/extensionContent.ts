import CharType from './Misc/CharType';
import Serializer from './Api/Serializer';
import Token from './Lexer/Token/Token';
import tokenize from './Api/tokenize';
const elementVisible = require('element-visible');

const containsJapanese = (text: string) => {
	for (let i = 0; i < text.length; i++) {
		if (CharType.isJapanese(text[i])) {
			return true;
		}
	}

	return false;
};

const TAG_SENTENCE = 'yometai-sentence';
const TAG_TOKEN = 'yometai-token';
const style = document.createElement('style');
style.textContent = `
	${TAG_SENTENCE} {
        clear: both;
        margin-bottom: 30px;
        display: block;
    }
	${TAG_SENTENCE} > ${TAG_TOKEN} {
        float: left;
        margin-bottom: 15px;
        height: 2rem;
        text-align: center;
    }

    ${TAG_SENTENCE} > ${TAG_TOKEN}:nth-child(odd) {
        background: #DDDDDD;
    }

	${TAG_SENTENCE} > ${TAG_TOKEN} .furigana,
	${TAG_SENTENCE} > ${TAG_TOKEN} .meaning {
        font-size: 0.5rem;
        display: block;
    }
`;
document.body.appendChild(style);

customElements.define(TAG_SENTENCE, class extends HTMLElement {});
customElements.define(TAG_TOKEN, class extends HTMLElement {});

const convertNode = (node: Text, tokens: Token[]) => {
	const container = document.createElement(TAG_SENTENCE);

	tokens.map((token) => {
		const span = document.createElement(TAG_TOKEN);

		const furigana = 'xx';
		const meaning = 'xx';

		span.innerHTML = `
			<span class="furigana">${furigana}</span>
			${token.text}
			<span class="meaning">${meaning}</span>
		`;

		container.appendChild(span);
	});

	(<Node>node.parentNode).replaceChild(container, node);
};

const hasParentTag = (node: Node, tag: string): boolean => {
	let cur: Node = node;

	do {
		if ((<Element>cur).tagName.toLowerCase() === tag) {
			return true;
		}

		cur = <Node>cur.parentNode;
	} while (cur !== null);

	return false;
};

const getElementsToConvert = (): Text[] => {
	const walker = document.createTreeWalker(
		document.body,
		NodeFilter.SHOW_TEXT,
	);

	const elements: Text[] = [];
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
			&& elementVisible(textNode.parentNode)
			&& !hasParentTag(textNode, TAG_SENTENCE)
		) {
			elements.push(textNode);
		}
	}

	return elements;
};

const convertVisibleElements = async () => {
	const elements = getElementsToConvert();
	for (let i = 0; i < elements.length; i++) {
		try {
			const textNode = elements[i];
			const text = textNode.data.trim();
			const data = await tokenize(text);
			convertNode(textNode, data);
		} catch (e) {
			console.error(e);
		}
	}
};

convertVisibleElements(); // Initializing
// window.addEventListener('scroll', () => {
// 	convertVisibleElements();
// });
