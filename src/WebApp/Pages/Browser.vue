<template>
	<div class="flex-fill p-0 m-0 page-browser d-flex flex-column">
		<div class="pb-2 px-2 bg-dark">
			<form v-on:submit="onFormSubmit">
				<input
					type="url"
					v-model="url"
					placeholder="URL"
					class="input-url"
				/>
			</form>
		</div>
		<template v-if="page !== null">
			<iframe
				class="iframe-page flex-fill border-0"
				sandbox="allow-scripts"
				v-bind:src="page"
				@load="iframeLoaded"
				v-bind:class="{
					'loading': !pageLoaded,
				}"
			/>

			<div v-if="!pageLoaded" class="d-flex flex-fill justify-content-center">
				<span class="spinner-border iframe-loading-spinner" role="status" aria-hidden="true"></span>
				<span class="sr-only">Loading...</span>
			</div>
		</template>
	</div>
</template>
<script lang="ts">
	import Vue from 'vue';
	import { get as getPage } from 'Common/Api/Page';

	export default Vue.extend({
		data() {
			return {
				url: <string|null>null,
				page: <string|null>null,
				pageLoaded: false,
			};
		},
		created() {
			if (this.$root.apiKey === null) {
				this.$root.router.changeRoute('./app/login');
			}
		},
		methods: {
			iframeLoaded(event: Event) {
				this.pageLoaded = true;
			},
			async onFormSubmit(event: Event) {
				event.preventDefault();
				await this.changeUrl(this.url);
			},
			async changeUrl(url: string) {
				const response = await getPage(this.$root.apiKey.key, url);
				const page = response.content;
				let charset = response.charset

				const domParser = new DOMParser();
				const doc = domParser.parseFromString(page, 'text/html');

				// Converting links to absolute
				const pageUrl = new URL(url);
				doc.querySelectorAll('[href]').forEach((element) => {
					const href = <string>(element.getAttribute('href'));
					if (href.substring(0, 2) === '//') {
						element.setAttribute('href', pageUrl.protocol + href);
					} else if (href[0] === '/') {
						element.setAttribute('href', pageUrl.origin + href);
					}
				});
				doc.querySelectorAll('[src]').forEach((element) => {
					const src = <string>(element.getAttribute('src'));
					if (src.substring(0, 2) === '//') {
						element.setAttribute('src', pageUrl.protocol + src);
					} else if (src[0] === '/') {
						element.setAttribute('src', pageUrl.origin + src);
					}
				});

				if (!charset) {
					const metaTags = doc.head.getElementsByTagName('meta');
					for (let i = 0; i < metaTags.length; i++) {
						if (metaTags[i].hasAttribute('charset')) {
							charset = metaTags[i].getAttribute('charset');
							break;
						}
					}
				}

				const modifiedPage = new XMLSerializer().serializeToString(doc);
				this.url = url;
				this.page = `data:text/html;charset=${charset || 'utf-8'},` + encodeURIComponent(modifiedPage);
				this.pageLoaded = false;
			},
		},
	});
</script>
<style scoped>
	.input-url {
		display: block;
		width: 100%;
	}

	.iframe-page {
		width: 100%;
	}

	.iframe-page.loading {
		visibility: hidden;
		height: 0;
	}

	.iframe-loading-spinner {
		width: 5em;
		height: 5em;
	}
</style>
