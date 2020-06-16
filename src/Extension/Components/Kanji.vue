<template>
	<div v-if="svg === null" class="kanjimi-loader" />
	<div v-else class="kanji" v-html="svg" />
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
		},
		methods: {
			async loadSvg() {
				const url = `${process.env.KANJIMI_WWW_URL}/img/KanjiVG/0${this.kanji.charCodeAt(0).toString(16)}.svg`;
				const response = await fetch(url);
				const svg = await response.text();

				const domParser = new DOMParser();
				const svgDocument = domParser.parseFromString(svg, 'image/svg+xml');

				this.svg = svgDocument.rootElement.outerHTML;
			},
		},
	});
</script>
<style scoped>
	.kanji >>> svg,
	.kanji >>> svg * {
		all: unset;
	}

	.kanji {
		display: block;
		min-height: 100%;
		height: 100%;
		text-align: center;
	}

	.kanji >>> svg {
		width: auto;
		height: 100%;
	}

	.kanji >>> svg text {
		font-size: 0.5em;
	}
</style>
