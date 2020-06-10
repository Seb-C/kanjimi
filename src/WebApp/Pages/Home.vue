<template>
	<div class="page-home">
		<input
			type="text"
			v-model="url"
			v-on:change="changeUrl"
			placeholder="URL"
			class="input-url mb-3"
		/>
		<iframe
			v-if="page !== null"
			class="iframe-page"
			sandbox
			v-bind:src="page"
		/>
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
			};
		},
		created() {
			if (this.$root.apiKey === null) {
				this.$root.router.changeRoute('./app/login');
			}
		},
		methods: {
			async changeUrl(event: Event) {
				const response = await getPage(this.$root.apiKey.key, this.url);
				const page = response.content;
				let charset = response.charset

				if (!charset) {
					const domParser = new DOMParser();
					const doc = domParser.parseFromString(page, 'text/html');
					const metaTags = doc.head.getElementsByTagName('meta');
					for (let i = 0; i < metaTags.length; i++) {
						if (metaTags[i].hasAttribute('charset')) {
							charset = metaTags[i].getAttribute('charset');
							break;
						}
					}
				}
				if (!charset) {
					charset = 'utf-8';
				}

				this.page = `data:text/html;charset=${charset},` + encodeURIComponent(page);
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
</style>
