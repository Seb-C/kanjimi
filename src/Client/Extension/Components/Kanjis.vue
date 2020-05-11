<template>
	<div class="kanjis">
		<div
			class="kanji"
			v-bind:style="{
				fontFamily: 'kanjimi-kanji-stroke-orders',
				fontSize: '150px',
			}"
			v-for="kanji of kanjis"
		>{{ kanji }}</div>
	</div>
</template>
<script lang="ts">
	import Vue from 'vue';
	import Token from 'Common/Models/Token';
	import CharType from 'Common/Types/CharType';

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
		computed: {
			kanjis(): string[] {
				return this.token.text.split('').filter(
					(char: string) => CharType.of(char) === CharType.KANJI
				);
			},
		},
	});
</script>
<style scoped>
</style>
