import CharType from 'Common/Types/CharType';
import Token from 'Common/Models/Token/Token';
import analyze from 'Client/Api/analyze';
import Vue from 'vue';
import Tooltip from 'Client/Dom/Tooltip.vue';

export default class DomConverter {
	private processing: boolean = false;

	private tooltip: Vue|null = null;

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

					if ((<Element>node).classList.contains('yometai-sentence')) {
						return NodeFilter.FILTER_REJECT;
					}

					if ((<Element>node).classList.contains('yometai-tooltip')) {
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

	async convertSentences(texts: Iterable<Text>) {
		if (this.processing) {
			return;
		}

		this.processing = true;

		const nodes: Text[] = [];
		const strings: string[] = [];
		for (const textNode of texts) {
			(<Element>textNode.parentNode).classList.add('yometai-loader');
			nodes.push(textNode);
			strings.push(textNode.data.trim());
		}

		if (strings.length > 0) {
			try {
				const data = await analyze(strings);
				for (let i = 0; i < data.length; i++) {
					(<Element>nodes[i].parentNode).classList.remove('yometai-loader');
					this.convertSentence(nodes[i], data[i]);
				}
			} catch (e) {
				console.error('Exception: ', e.toString());
				console.error('Strings: ', ...strings);
			}
		}

		this.processing = false;
	}

	convertSentence(node: Text, tokens: Token[]) {
		const container = document.createElement('span');
		container.classList.add('yometai-sentence');

		tokens.map((token) => {
			const tokenElement = document.createElement('span');
			tokenElement.classList.add('yometai-token');

			const tokenFurigana = document.createElement('span');
			tokenFurigana.classList.add('yometai-furigana');
			tokenFurigana.innerText = token.getFurigana() || '\xa0';
			tokenElement.appendChild(tokenFurigana);

			const tokenWord = document.createElement('span');
			tokenWord.classList.add('yometai-word');
			tokenWord.innerText = token.text || '\xa0';
			tokenWord.addEventListener('click', (event) => {
				event.stopPropagation();
				this.handleWordClick(token, tokenElement);
			});
			tokenElement.appendChild(tokenWord);

			const tokenTranslation = document.createElement('span');
			tokenTranslation.classList.add('yometai-translation');
			tokenTranslation.innerText = token.getTranslation() || '\xa0';
			tokenElement.appendChild(tokenTranslation);

			container.appendChild(tokenElement);
		});

		(<Node>node.parentNode).replaceChild(container, node);
	}

	handleWordClick(token: Token, tokenElement: Element) {
		if (this.tooltip === null) {
			this.openTooltip(token, tokenElement);
		} else if (this.tooltip.$children[0].$props.token.text === token.text) {
			this.closeTooltip();
		} else {
			this.closeTooltip();
			this.openTooltip(token, tokenElement);
		}
	}

	openTooltip(token: Token, tokenElement: Element) {
		const container = document.createElement('div');
		document.body.appendChild(container);

		// Vue replaces the container, so no need to save the reference
		this.tooltip = new Vue({
			el: container,
			render: createElement => createElement(Tooltip, {
				props: {
					token,
					tokenElement,
				},
			}),
		});
	}

	closeTooltip() {
		if (this.tooltip !== null) {
			document.body.removeChild(this.tooltip.$el);
			this.tooltip.$destroy();
			this.tooltip = null;
		}
	}
}