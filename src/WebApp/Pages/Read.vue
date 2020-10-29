<template>
	<div class="flex-fill p-0 m-0 page-read d-flex flex-column">
		<iframe
			class="iframe-read flex-fill border-0"
			sandbox="allow-same-origin allow-scripts"
			v-bind:srcdoc="makeDocumentFromText(text)"
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
			return {
				text: <string|null>((<WebAppStore><any>this.$root).router.params.text || null),
			};
		},
		async created() {
			if (this.$root.apiKey === null) {
				this.$root.router.changeRoute('./app/login');
			}
		},
		watch: {
			async '$root.router.params'(newParams, oldParams) {
				this.text = newParams.text;
			},
		},
		methods: {
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
							${text}
						</body>
					</html>
				`;
			},
		},
	});
</script>
<style scoped>
	.iframe-read {
		width: 100%;
	}
</style>
