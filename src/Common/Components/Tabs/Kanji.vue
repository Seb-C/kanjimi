<template>
	<div v-if="loading" class="kanjimi-loader" />
	<div v-else class="kanji-data-container">
		<KanjiComponent
			v-bind:kanji="kanjiData[kanji]"
			v-bind:onClickSubKanji="subKanjiClickHandler"
		/>
		<KanjiComponent
			v-if="subKanji !== null"
			v-bind:kanji="kanjiData[subKanji]"
			v-bind:onClickSubKanji="subKanjiClickHandler"
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
				subKanji: <string|null>null,
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
			subKanjiClickHandler (subKanji: string) {
				if (this.kanjiData[subKanji]) {
					this.subKanji = subKanji;
				}
			},
			async loadData() {
				this.kanjiData = null;
				this.subKanji = null;
				this.loading = true;
				this.kanjiData = await getKanji(this.$root.apiKey.key, this.kanji);
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
		display: grid;
		grid-auto-flow: column;
		min-height: 100%;
		height: 100%;
	}
</style>
