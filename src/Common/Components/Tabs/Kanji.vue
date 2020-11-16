<template>
	<div v-if="loading" class="kanjimi-loader" />
	<div v-else class="kanji-data-container">
		<KanjiComponent
			v-for="(kanji, index) in kanjis"
			:key="index"
			v-bind:kanji="kanji"
			v-on:click="(kanji) => onKanjiClick(kanji, index)"
			v-bind:selected="kanjis[index + 1] || null"
		/>
	</div>
</template>
<script lang="ts">
	import Vue from 'vue';
	import { getKanji } from 'Common/Api/Lexer';
	import Kanji from 'Common/Models/Kanjis/Kanji';
	import KanjiComponent from 'Common/Components/KanjiComponent.vue';

	export default Vue.extend({
		props: {
			kanji: { type: String },
		},
		data() {
			return {
				loading: true,
				kanjiData: <{ [key: string]: Kanji}|null>null,
				kanjis: <string[]>[],
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
			onKanjiClick (kanji: string, index: number) {
				if (this.kanjis[index + 1] && this.kanjis[index + 1].kanji === kanji) {
					this.kanjis.splice(index + 1);
				} else if (this.kanjiData[kanji]) {
					this.kanjis.splice(index + 1);
					this.kanjis.push(this.kanjiData[kanji]);
				}
			},
			async loadData() {
				this.kanjiData = null;
				this.kanjis = [];
				this.loading = true;
				this.kanjiData = await getKanji(this.$root.apiKey.key, this.kanji);
				this.kanjis.push(this.kanjiData[this.kanji]);
				this.loading = false;
			},
		},
		components: {
			KanjiComponent,
		},
	});
</script>
<style scoped>
	.kanji-data-container {
		display: flex;
		flex-direction: row;
		flex-wrap: nowrap;
		max-height: 50vh;
		height: 100%;
		width: 100%;
	}

	.kanji-data-container > *:last-child {
		flex-grow: 1;
	}
</style>
