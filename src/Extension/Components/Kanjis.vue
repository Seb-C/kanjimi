<template>
	<div v-if="images === null" class="kanjimi-loader">
		Loading...
	</div>
	<div v-else class="kanjis">
		<div v-for="image of images">
			<svg v-html="image" />
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
		data() {
			return {
				kanjis: this.token.text.split('').filter(
					(char: string) => CharType.of(char) === CharType.KANJI
				),
				images: <string[]|null>null,
			};
		},
		async created() {
			this.images = await Promise.all(
				this.kanjis.map(async (kanji: string) => {
					const url = `${process.env.KANJIMI_WWW_URL}/img/KanjiVG/0${kanji.charCodeAt(0).toString(16)}.svg`;
					const response = await fetch(url);
					const svg = await response.text();
					return svg;
				}),
			);
		},
	});
</script>
<style scoped>
	.kanjis >>> svg,
	.kanjis >>> svg * {
		all: unset;
	}

	.kanjis >>> svg text {
		font-size: 0.5em;
	}
</style>
