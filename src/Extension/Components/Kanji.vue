<template>
	<div v-if="svg === null" class="kanjimi-loader" />
	<div v-else class="kanji">
		<svg v-html="svg" />
	</div>
</template>
<script lang="ts">
	import Vue from 'vue';

	export default Vue.extend({
		props: {
			kanji: { type: String },
		},
		data() {
			return {
				svg: <string|null>null,
			};
		},
		created() {
			this.loadSvg();
		},
		watch: {
			kanji(newVal, oldVal) {
				this.loadSvg();
			}
		}
		methods: {
			async loadSvg() {
				const url = `${process.env.KANJIMI_WWW_URL}/img/KanjiVG/0${this.kanji.charCodeAt(0).toString(16)}.svg`;
				const response = await fetch(url);
				this.svg = await response.text();
			},
		},
	});
</script>
<style scoped>
	.kanji >>> svg,
	.kanji >>> svg * {
		all: unset;
	}

	.kanji >>> svg text {
		font-size: 0.5em;
	}
</style>
