import CharType from 'Common/Types/CharType';
import Token from 'Common/Models/Token';
import WordStatus from 'Common/Models/WordStatus';
import { analyze } from 'Client/Api/Routes/Lexer';
import {
	get as getWordStatuses,
	createOrUpdate as putWordStatus,
} from 'Client/Api/Routes/WordStatus';
import Vue from 'vue';
import UIContainer from 'Client/Extension/UIContainer.vue';
import Sentence from 'Client/Extension/Sentence.vue';
import { debounce } from 'ts-debounce';

type TooltipData = {
	token: Token,
	tokenElement: Element,
};

export default class PageHandler {
	private processing: boolean = false;
	private store = {
		apiKey: <string|null>null,
		setApiKey: this.setApiKey.bind(this),
		setTooltip: this.setTooltip.bind(this),
		tooltip: <TooltipData|null>null,
		wordStatuses: <{ [key: string]: WordStatus }>{},
		setWordStatus: this.setWordStatus.bind(this),
	};

	async init() {
		const elementToReplace = document.createElement('div');
		document.body.appendChild(elementToReplace);
		new Vue({
			el: elementToReplace,
			render: createElement => createElement(UIContainer),
			data: this.store,
		});

		this.injectLoaderCss();

		// TODO remove this test
		await this.setApiKey('PQKXFg4puvIsoY0/iwVDCNtt6K+iPj7PiK4LlayMOHddJErCcZl2lx8cnB7kT28+MqZX+FTu3efwrqXVqE2dbQ==');
		// await browser.storage.local.set({ key: null });

		await this.loadApiKeyFromStorage();
		browser.storage.onChanged.addListener(async () => {
			await this.loadApiKeyFromStorage.bind(this);

			// Triggering conversion on the page after login in a different tab/page
			this.convertSentences();
		});

		this.convertSentences();
		window.addEventListener('scroll', debounce(this.convertSentences.bind(this), 300));
	}

	async setApiKey (key: string) {
		this.store.apiKey = key;
		await browser.storage.local.set({ key });

		// Triggering conversion on the page after login
		this.convertSentences();
	}

	async loadApiKeyFromStorage () {
		this.store.apiKey = (await browser.storage.local.get('key')).key;
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

					if ((<Element>node).classList.contains('kanjimi')) {
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
				const data = await analyze(this.store.apiKey, strings);

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
					const wordStatuses = await getWordStatuses(this.store.apiKey, Array.from(words.values()));
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

	async setWordStatus(wordStatus: WordStatus, attributes: any) {
		if (this.store.apiKey === null) {
			return;
		}

		const newWordStatus = await putWordStatus(this.store.apiKey, new WordStatus({
			...wordStatus,
			...attributes,
		}));
		Vue.set(this.store.wordStatuses, newWordStatus.word, newWordStatus);
	}

	setTooltip(tooltipData: TooltipData|null) {
		this.store.tooltip = tooltipData;
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
