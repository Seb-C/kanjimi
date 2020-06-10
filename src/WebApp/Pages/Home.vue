<template>
	<div class="page-home d-flex flex-column">
		<input
			type="text"
			v-model="url"
			v-on:change="changeUrl"
			placeholder="URL"
			class="input-url mb-3"
		/>
		<template v-if="page !== null">
			<iframe
				class="iframe-page"
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
			iframeLoaded() {
				this.pageLoaded = true;
			},
			async changeUrl(event: Event) {
				const response = await getPage(this.$root.apiKey.key, this.url);
				const page = response.content;
				let charset = response.charset

				const domParser = new DOMParser();
				const doc = domParser.parseFromString(page, 'text/html');

				// Converting links to absolute
				const pageOrigin = (new URL(this.url)).origin;

				doc.querySelectorAll('[href]').forEach((element) => {
					const href = element.getAttribute('href');
					if (href[0] === '/') {
						element.setAttribute('href', pageOrigin + href);
					}
				});
				doc.querySelectorAll('[src]').forEach((element) => {
					const src = element.getAttribute('src');
					if (src[0] === '/') {
						element.setAttribute('src', pageOrigin + src);
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
		height: 500px; /* TODO */
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
