import CharType from 'Common/Types/CharType';
import Token from 'Common/Models/Token/Token';
import analyze from 'Client/Api/analyze';
const elementVisible = require('element-visible');

export default class DomConverter {
	private processing: boolean = false;

	hasParentClass(node: Node, cssClass: string): boolean {
		let cur: Node = node;

		while (cur !== null) {
			if (cur instanceof Element && (<Element>cur).classList.contains(cssClass)) {
				return true;
			}

			cur = <Node>cur.parentNode;
		}

		return false;
	}

	*getSentencesToConvert(): Iterable<Text> {
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
					&& !this.hasParentClass(node, 'yometai-sentence')
					&& CharType.containsJapanese(text)
					&& elementVisible(node.parentNode, 0.1)
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

	injectStyle() {
		const loaderUrl = (<any>browser).runtime.getURL('loader.svg');

		const style = document.createElement('style');
		style.textContent = `
			.yometai-loader {
				opacity: 0.3;
				background: #AAA;
				position: relative;
			}
			.yometai-loader:after {
				content: "";
				left: 0;
				right: 0;
				top: 0;
				bottom: 0;
				position: absolute;
				background-image: url(${loaderUrl});
				background-position: center;
				background-size: contain;
				background-repeat: no-repeat;
			}

			.yometai-sentence {
				clear: both;
				display: inline;
			}

			.yometai-sentence > .yometai-token {
				display: inline-block;
				text-align: center;
				line-height: 100%;
			}

			.yometai-sentence > .yometai-token .yometai-furigana,
			.yometai-sentence > .yometai-token .yometai-translation {
				font-size: 0.5rem;
				display: block;
				line-height: 150%;
				margin: 0 2px;
			}
		`;
		document.body.appendChild(style);
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
			tokenElement.appendChild(tokenWord);

			const tokenTranslation = document.createElement('span');
			tokenTranslation.classList.add('yometai-translation');
			tokenTranslation.innerText = token.getTranslation() || '\xa0';
			tokenElement.appendChild(tokenTranslation);

			container.appendChild(tokenElement);
		});

		(<Node>node.parentNode).replaceChild(container, node);
	}
}
