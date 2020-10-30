<template>
	<div class="container flex-fill py-2 page-analyze">
		<div class="form-container row">
			<div class="col-9 col-md-10 textarea-container">
				<textarea
					class="form-control"
					placeholder="You can write or paste any Japanese text here to analyze and read it using Kanjimi."
					title="You can write or paste any Japanese text here to analyze and read it using Kanjimi."
					v-model="inputText"
				></textarea>
			</div>
			<div class="col-3 col-md-2 button-container">
				<button
					class="form-control btn btn-primary h-100"
					@click="onAnalyzeTextClick"
				>Analyze this text</button>
			</div>
		</div>
		<hr />
		<iframe
			v-if="analyzedText !== null"
			class="iframe-analyze flex-fill border-0"
			sandbox="allow-same-origin allow-scripts"
			v-bind:srcdoc="makeDocumentFromText(analyzedText)"
			@load="iframeLoaded"
		/>
	</div>
</template>
<script lang="ts">
	import Vue from 'vue';
	import PageHandler from 'Common/PageHandler';
	import ExtensionStore from 'Common/Store';
	import WebAppStore from 'WebApp/Store';
	import BrowserStorage from 'Common/Storage/BrowserStorage';

	export default Vue.extend({
		data() {
			const text: string|null = (<WebAppStore><any>this.$root).router.params.text || null;

			return {
				inputText: text,
				analyzedText: text,
			};
		},
		async created() {
			if (this.$root.apiKey === null) {
				this.$root.router.changeRoute('./app/login');
			}
		},
		watch: {
			async '$root.router.params'(newParams, oldParams) {
				this.inputText = newParams.text || null;
				this.analyzedText = newParams.text || null;
			},
		},
		methods: {
			onAnalyzeTextClick() {
				this.$root.router.changeRoute(`./app/analyze?text=${encodeURIComponent(this.inputText)}`);
			},
			iframeLoaded(event: Event) {
				const win = <Window>(<HTMLIFrameElement>event.target).contentWindow;

				const store = new ExtensionStore(win, BrowserStorage);
				const pageHandler = new PageHandler(win, store, null);

				(async () => {
					try {
						await store.loadApiKeyFromStorage(false);
						store.notifyIfLoggedOut();
						if (store.apiKey !== null && win.document.visibilityState === 'visible') {
							await pageHandler.convertSentences();
						}
					} catch (error) {
						console.error(error);
					}
				})();

				pageHandler.injectUIContainer();
				pageHandler.injectLoaderCss();
				pageHandler.bindPageEvents();
			},
			makeDocumentFromText(text: string) {
				return `<!DOCTYPE html>
					<html>
						<head>
							<meta charset="utf-8" />
							<link rel="stylesheet" href="${process.env.KANJIMI_WWW_URL}/css/browser.build.css" />
						</head>
						<body>
							${
								text
									.split(/\r?\n/)
									.map((text) => {
										const textNode = document.createTextNode(text);
										var textNodeContainer = document.createElement('p');
										textNodeContainer.appendChild(textNode);
										return textNodeContainer.innerHTML;
									})
									.join('<br />')
							}
						</body>
					</html>
				`;
			},
		},
	});
</script>
<style scoped>
	.textarea-container {
		padding-right: 0;
	}

	.textarea-container textarea {
		resize: none;
		height: 7rem;
	}

	hr {
		margin: 0.5rem 0 0.5rem 0;
	}

	.iframe-analyze {
		width: 100%;
	}
</style>
