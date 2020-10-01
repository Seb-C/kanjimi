<template>
	<div v-if="loading" class="kanjimi-loader" />
	<div v-else class="kanji" v-html="svg" />
</template>
<script lang="ts">
	import Vue from 'vue';
	import { getKanji } from 'Common/Api/Lexer';
	import Kanji from 'Common/Models/Kanjis/Kanji';

	export default Vue.extend({
		props: {
			kanji: { type: String },
		},
		data() {
			return {
				loading: true,
				svg: <string|null>null,
				kanjiData: <{ [key: string]: Kanji}|null>null,
			};
		},
		created() {
			this.loadData();
		},
		watch: {
			kanji(newVal, oldVal) {
				this.loadData();
			}
		},
		methods: {
			async loadData() {
				this.loading = true;
				this.kanjiData = await getKanji(this.$root.apiKey.key, this.kanji);
				console.log(await getKanji(this.$root.apiKey.key, this.kanji));

				const mainKanji = <Kanji>this.kanjiData[this.kanji];
				const svg = await (await fetch(mainKanji.fileUrl)).text();

				const domParser = new DOMParser();
				const svgDocument = domParser.parseFromString(svg, 'image/svg+xml');

				this.svg = svgDocument.documentElement.outerHTML;

				this.loading = false;
			},
		},
	});
</script>
<style scoped>
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
