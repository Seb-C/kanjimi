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
	const getKanjiFontName = (appUid: string): string => {
		const fontName = `${appUid}-kanji-stroke-orders`;
		if (!injectedKanjiFonts.includes(appUid)) {
			const style = document.createElement('style');
			style.textContent = `
				@font-face {
					font-family: '${fontName}';
					src: url('${browser.runtime.getURL('/fonts/KanjiStrokeOrders/KanjiStrokeOrders.ttf')}');
				}
			`;
			document.getElementsByTagName('head')[0].appendChild(style);
			injectedKanjiFonts.push(appUid);
		}

		return fontName;
	};

	export default Vue.extend({
		props: {
			appUid: { type: String },
			token: { type: Object as () => WordToken },
		},
		data() {
			return {
				kanjiFontName: getKanjiFontName(this.appUid),
			};
		},
	});
</script>
<style scoped>
</style>
