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
			v-bind:srcdoc="page"
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
				this.page = await getPage(this.$root.apiKey.key, this.url);
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
