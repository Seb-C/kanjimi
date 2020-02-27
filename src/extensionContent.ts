import CharType from 'Misc/CharType';
import Serializer from 'Api/Serializer/Serializer';
import Token from 'Lexer/Token/Token';
import analyze from 'Api/Client/analyze';
import { debounce } from 'ts-debounce';
const elementVisible = require('element-visible');

const containsJapanese = (text: string) => {
	// Note: arbitrarily limiting the number of characters for performance reason
	for (let i = 0; i < text.length && i < 20; i++) {
		if (CharType.isJapanese(text[i])) {
			return true;
		}
	}

	return false;
};

const TAG_SENTENCE = 'yometai-sentence';
const TAG_TOKEN = 'yometai-token';
const TAG_FURIGANA = 'yometai-furigana';
const TAG_WORD = 'yometai-word';
const TAG_TRANSLATION = 'yometai-translation';
const style = document.createElement('style');
style.textContent = `
	${TAG_SENTENCE} {
        clear: both;
        margin-bottom: 30px;
        display: inline;
    }

	${TAG_SENTENCE} > ${TAG_TOKEN} {
		display: inline-block;
        margin-bottom: 15px;
        height: 2rem;
        text-align: center;
    }

	${TAG_SENTENCE} > ${TAG_TOKEN} ${TAG_FURIGANA},
	${TAG_SENTENCE} > ${TAG_TOKEN} ${TAG_TRANSLATION} {
        font-size: 0.5rem;
        display: block;
		margin: 0 2px;
    }
`;
document.body.appendChild(style);

customElements.define(TAG_SENTENCE, class extends HTMLElement {});
customElements.define(TAG_TOKEN, class extends HTMLElement {});
customElements.define(TAG_FURIGANA, class extends HTMLElement {});
customElements.define(TAG_WORD, class extends HTMLElement {});
customElements.define(TAG_TRANSLATION, class extends HTMLElement {});

const convertNode = (node: Text, tokens: Token[]) => {
	const container = document.createElement(TAG_SENTENCE);

	tokens.map((token) => {
		const tokenElement = document.createElement(TAG_TOKEN);

		const tokenFurigana = document.createElement(TAG_FURIGANA);
		tokenFurigana.innerText = token.getFurigana() || '\xa0';
		tokenElement.appendChild(tokenFurigana);

		const tokenWord = document.createElement(TAG_WORD);
		tokenWord.innerText = token.text || '\xa0';
		tokenElement.appendChild(tokenWord);

		const tokenTranslation = document.createElement(TAG_TRANSLATION);
		tokenTranslation.innerText = token.getTranslation() || '\xa0';
		tokenElement.appendChild(tokenTranslation);

		container.appendChild(tokenElement);
	});

	(<Node>node.parentNode).replaceChild(container, node);
};

const hasParentTag = (node: Node, tag: string): boolean => {
	let cur: Node = node;

	while (cur !== null) {
		if (cur instanceof Element && (<Element>cur).tagName.toLowerCase() === tag) {
			return true;
		}

		cur = <Node>cur.parentNode;
	}

	return false;
};

const getElementsToConvert = function* (): Iterable<Text> {
	const walker = document.createTreeWalker(
		document.body,
		NodeFilter.SHOW_TEXT,
		{ acceptNode: (node: Node): number => {
			const text = (<Text>node).data.trim();
			const containerType: string = (<Element>node.parentNode).tagName.toLowerCase();
			if (
				text.length > 0
				&& containerType !== 'script'
				&& containerType !== 'style'
				&& containerType !== 'noscript'
				&& containsJapanese(text)
				&& elementVisible(node.parentNode, 0.1)
				&& !hasParentTag(node, TAG_SENTENCE)
			) {
				return NodeFilter.FILTER_ACCEPT;
			}

			return NodeFilter.FILTER_SKIP;
		}},
	);

	// Note: since the walker may stop working in case of dom changes,
	// we need to move the cursor to the next element before yielding
	// the current one.
	walker.nextNode(); // First node is the body, we have to skip it
	let previous = <Text>walker.currentNode;
	while (walker.nextNode()) {
		yield previous;
		previous = <Text>walker.currentNode;
	}
	if (previous !== null && previous instanceof Text) {
		yield previous;
	}
};

let processing = false;
const convertVisibleElements = async () => {
	if (processing) {
		return;
	}

	processing = true;
	for (const textNode of getElementsToConvert()) {
		try {
			const data = await analyze(textNode.data.trim());
			convertNode(textNode, data);
		} catch (e) {
			console.error(e, textNode);
		}
	}
	processing = false;
};

convertVisibleElements(); // Initializing
window.addEventListener('scroll', debounce(
	() => {
		convertVisibleElements();
	},
	300,
));
