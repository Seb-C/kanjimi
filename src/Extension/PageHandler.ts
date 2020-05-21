import CharType from 'Common/Types/CharType';
import Token from 'Common/Models/Token';
import User from 'Common/Models/User';
import Store from 'Extension/Store';
import { analyze } from 'Common/Client/Routes/Lexer';
import {
	get as getWordStatuses,
} from 'Common/Client/Routes/WordStatus';
import Vue from 'vue';
import UIContainer from 'Extension/Components/UIContainer.vue';
import Sentence from 'Extension/Components/Sentence.vue';

export default class PageHandler {
	private processing: boolean = false;
	private store: Store;

	constructor (store: Store) {
		this.store = store;
	}

	injectUIContainer() {
		const elementToReplace = document.createElement('div');
		document.body.appendChild(elementToReplace);
		new Vue({
			el: elementToReplace,
			render: createElement => createElement(UIContainer),
			data: this.store,
		});
	}

	*getSentencesToConvert(): Iterable<Text> {
		const walker = document.createTreeWalker(
			document.body,
			NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT,
			{ acceptNode: (node: Node): number => {
				if (node instanceof Element) {
					if (
						node.tagName === 'SCRIPT'
						|| node.tagName === 'STYLE'
						|| node.tagName === 'NOSCRIPT'
						|| node.tagName === 'TEXTAREA'
						|| node.tagName === 'BUTTON'
					) {
						return NodeFilter.FILTER_REJECT;
					}

					if (
						typeof node.className === 'string'
						&& node.className.includes('kanjimi')
					) {
						return NodeFilter.FILTER_REJECT;
					}

					if (!this.isElementVisible(<HTMLElement>node)) {
						return NodeFilter.FILTER_REJECT;
					}

					if (!this.isElementOnScreen(<HTMLElement>node)) {
						if ((<HTMLElement>node).offsetWidth === 0 || (<HTMLElement>node).offsetHeight === 0) {
							// Rejecting would include absolute elements being
							// inside elements that are outside screen
							return NodeFilter.FILTER_SKIP;
						} else {
							return NodeFilter.FILTER_REJECT;
						}
					}

					return NodeFilter.FILTER_SKIP;
				} else {
					const text = (<Text>node).data.trim();

					if (text.length === 0) {
						return NodeFilter.FILTER_SKIP;
					}

					if (!CharType.containsJapanese(text)) {
						return NodeFilter.FILTER_SKIP;
					}

					return NodeFilter.FILTER_ACCEPT;
				}
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
	}

	isElementVisible (node: HTMLElement): boolean {
		return (
			node.style.opacity !== '0'
			&& node.style.display !== 'none'
			&& node.style.visibility !== 'hidden'
		);
	}

	isElementOnScreen (node: HTMLElement): boolean {
		let top = 0;
		let left = 0;
		let currentNode = node;
		do {
			top += currentNode.offsetTop || 0;
			left += currentNode.offsetLeft || 0;
			currentNode = <HTMLElement>currentNode.offsetParent;
		} while (currentNode);

		return !(
			top > window.scrollY + window.innerHeight
			|| top + node.offsetHeight < window.scrollY
			|| left > window.scrollX + window.innerWidth
			|| left + node.offsetWidth < window.scrollX
		);
	}

	async convertSentences() {
		if (this.store.apiKey === null) {
			return;
		}

		if (this.processing) {
			return;
		}

		this.processing = true;

		const texts = this.getSentencesToConvert();

		const nodes: Text[] = [];
		const strings: string[] = [];
		for (const textNode of texts) {
			(<Element>textNode.parentNode).classList.add('kanjimi-loader');
			nodes.push(textNode);
			strings.push(textNode.data.trim());
		}

		if (strings.length > 0) {
			try {
				const data = await analyze(this.store.apiKey.key, {
					languages: [...(<User>this.store.user).languages],
					strings,
				});

				const words: Set<string> = new Set();
				for (let i = 0; i < data.length; i++) {
					for (let j = 0; j < data[i].length; j++) {
						const token: Token = data[i][j];

						if (this.store.wordStatuses[token.text]) {
							continue;
						}

						words.add(token.text);
					}
				}

				if (words.size > 0) {
					const wordStatuses = await getWordStatuses(this.store.apiKey.key, Array.from(words.values()));
					for (let i = 0; i < wordStatuses.length; i++) {
						const wordStatus = wordStatuses[i];
						Vue.set(this.store.wordStatuses, wordStatus.word, wordStatus);
					}
				}

				for (let i = 0; i < data.length; i++) {
					(<Element>nodes[i].parentNode).classList.remove('kanjimi-loader');
					this.convertSentence(nodes[i], data[i]);
				}

				window.dispatchEvent(new Event('kanjimi-converted-sentences'));
			} catch (e) {
				// Not filtering the error type because all 3 are handled the same way
				console.error('Exception: ', e.toString());
				console.error('Strings: ', ...strings);

				for (let i = 0; i < nodes.length; i++) {
					(<Element>nodes[i].parentNode).classList.remove('kanjimi-loader');
				}
			}
		}

		this.processing = false;
	}

	convertSentence(node: Text, tokens: Token[]) {
		const container = document.createElement('span');
		(<Node>node.parentNode).replaceChild(container, node);

		new Vue({
			el: container,
			render: createElement => createElement(Sentence, {
				props: {
					tokens,
				},
			}),
			data: this.store,
		});
	}

	injectLoaderCss() {
		const style = document.createElement('style');
		style.textContent = `
			.kanjimi-loader {
				opacity: 0.3;
				background: #AAA;
				position: relative;
			}
			.kanjimi-loader:after {
				content: "";
				position: absolute;

				border-radius: 50%;
				border: 0.25em solid currentColor;
				border-right-color: transparent;

				width: 1em;
				height: 1em;

				left: calc(50% - 0.5em);
				top: calc(50% - 0.5em);

				animation: kanjimi-loader-animation 0.75s linear infinite;
				transform-origin: center;
			}
			@keyframes kanjimi-loader-animation {
				from {
					transform: rotate(0deg);
				}
				to {
					transform: rotate(360deg);
				}
			}
		`;
		document.getElementsByTagName('head')[0].appendChild(style);
	}
}
