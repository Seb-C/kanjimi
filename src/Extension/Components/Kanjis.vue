<template>
	<div class="kanjis">
		<div
			v-for="kanji of kanjis"
		>
			<img v-bind:src="kanji" />
		</div>
	</div>
</template>
<script lang="ts">
	import Vue from 'vue';
	import Token from 'Common/Models/Token';
	import CharType from 'Common/Types/CharType';

	export default Vue.extend({
		props: {
			token: { type: Token },
		},
		computed: {
			kanjis(): string[] {
				return this.token.text.split('').filter(
					(char: string) => CharType.of(char) === CharType.KANJI
				).map(kanji => (
					`${process.env.KANJIMI_WWW_URL}/img/KanjiVG/0${kanji.charCodeAt(0).toString(16)}.svg`
				));
			},
		},
	});
</script>
<style scoped>
</style>
