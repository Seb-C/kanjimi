<template>
	<div v-bind:style="{
		fontFamily: 'kanjimi-kanji-stroke-orders',
		fontSize: '150px',
	}">{{ token.text }}</div>
</template>
<script lang="ts">
	import Vue from 'vue';
	import Token from 'Common/Models/Token';

	const injectedKanjiFont = false;

	export default Vue.extend({
		props: {
			token: { type: Object as () => Token },
		},
		created() {
			if (!injectedKanjiFont) {
				const style = document.createElement('style');
				style.textContent = `
					@font-face {
						font-family: 'kanjimi-kanji-stroke-orders';
						src: url('${browser.runtime.getURL('/fonts/KanjiStrokeOrders/KanjiStrokeOrders.ttf')}');
					}
				`;
				document.getElementsByTagName('head')[0].appendChild(style);
			}
		},
	});
</script>
<style scoped>
</style>
