import CharType from 'Common/Misc/CharType';
import Serializer from 'Common/Api/Serializer';
import Token from 'Server/Lexer/Token/Token';
import analyze from 'Client/Api/analyze';
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

const CLASS_SENTENCE = 'yometai-sentence';
const CLASS_TOKEN = 'yometai-token';
const CLASS_FURIGANA = 'yometai-furigana';
const CLASS_WORD = 'yometai-word';
const CLASS_TRANSLATION = 'yometai-translation';
const style = document.createElement('style');
style.textContent = `
	.${CLASS_SENTENCE} {
		clear: both;
		margin-bottom: 30px;
		display: inline;
	}

	.${CLASS_SENTENCE} > .${CLASS_TOKEN} {
		display: inline-block;
		margin-bottom: 15px;
		height: 2rem;
		text-align: center;
	}

	.${CLASS_SENTENCE} > .${CLASS_TOKEN} .${CLASS_FURIGANA},
	.${CLASS_SENTENCE} > .${CLASS_TOKEN} .${CLASS_TRANSLATION} {
		font-size: 0.5rem;
		display: block;
		margin: 0 2px;
	}
`;
document.body.appendChild(style);

const convertNode = (node: Text, tokens: Token[]) => {
	const container = document.createElement('span');
	container.classList.add(CLASS_SENTENCE);

	tokens.map((token) => {
		const tokenElement = document.createElement('span');
		tokenElement.classList.add(CLASS_TOKEN);

		const tokenFurigana = document.createElement('span');
		tokenFurigana.classList.add(CLASS_FURIGANA);
		tokenFurigana.innerText = token.getFurigana() || '\xa0';
		tokenElement.appendChild(tokenFurigana);

		const tokenWord = document.createElement('span');
		tokenWord.classList.add(CLASS_WORD);
		tokenWord.innerText = token.text || '\xa0';
		tokenElement.appendChild(tokenWord);

		const tokenTranslation = document.createElement('span');
		tokenTranslation.classList.add(CLASS_TRANSLATION);
		tokenTranslation.innerText = token.getTranslation() || '\xa0';
		tokenElement.appendChild(tokenTranslation);

		container.appendChild(tokenElement);
	});

	(<Node>node.parentNode).replaceChild(container, node);
};

const hasParentClass = (node: Node, cssClass: string): boolean => {
	let cur: Node = node;

	while (cur !== null) {
		if (cur instanceof Element && (<Element>cur).classList.contains(cssClass)) {
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
				&& containerType !== 'textarea'
				&& containsJapanese(text)
				&& elementVisible(node.parentNode, 0.1)
				&& !hasParentClass(node, CLASS_SENTENCE)
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

	const nodes: Text[] = [];
	const strings: string[] = [];
	for (const textNode of getElementsToConvert()) {
		nodes.push(textNode);
		strings.push(textNode.data.trim());
	}

	if (nodes.length > 0) {
		try {
			const data = await analyze(strings);
			for (let i = 0; i < data.length; i++) {
				convertNode(nodes[i], data[i]);
			}
		} catch (e) {
			console.error('Exception: ', e.toString());
			console.error('Strings: ', ...strings);
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
