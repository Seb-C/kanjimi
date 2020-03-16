<template>
	<div v-bind:style="{
		fontFamily: kanjiFontName,
		fontSize: '150px',
	}">{{ token.text }}</div>
</template>
<script lang="ts">
	import Vue from 'vue';
	import WordToken from 'Common/Models/Token/WordToken';

	const injectedKanjiFonts: string[] = [];
	const getKanjiFontName = (uidClass: string): string => {
		const fontName = `${uidClass}-kanji-stroke-orders`;
		if (!injectedKanjiFonts.includes(uidClass)) {
			const style = document.createElement('style');
			style.textContent = `
				@font-face {
					font-family: '${fontName}';
					src: url('${browser.runtime.getURL('/fonts/KanjiStrokeOrders/KanjiStrokeOrders.ttf')}');
				}
			`;
			document.getElementsByTagName('head')[0].appendChild(style);
			injectedKanjiFonts.push(uidClass);
		}

		return fontName;
	};

	export default Vue.extend({
		props: {
			uidClass: { type: String },
			token: { type: Object as () => WordToken },
		},
		data() {
			return {
				kanjiFontName: getKanjiFontName(this.uidClass),
			};
		},
	});
</script>
<style scoped>
</style>
