<template>
	<div class="row">
		<div class="d-inline-block align-self-center pl-3">
			Example:
		</div>
		<div class="d-inline-block pl-3">
			<div class="kanjimi-furigana-sample border rounded p-1">
				<div class="furigana">{{ sampleFurigana }}</div>
				<div class="word">日本語</div>
				<div class="translation">Japanese</div>
			</div>
		</div>
	</div>
</template>
<script lang="ts">
	import Vue from 'vue';

	export default Vue.extend({
		props: {
			hasRomanReading: { type: Boolean },
		},
		computed: {
			sampleFurigana() {
				return this.hasRomanReading ? 'nihongo' : 'にほんご';
			},
		},
	});
</script>
<style scoped>
	.kanjimi-furigana-sample {
		display: inline-block;
		font-size: 1.3em;
	}

	.kanjimi-furigana-sample .furigana {
		font-size: 0.5em;
		display: block;
		line-height: 150%;
		margin: 0 2px;
		text-align: center;
	}
	.kanjimi-furigana-sample .word {
		line-height: 1em;
		text-align: center;
		margin: 0 0 0.1em 0;
	}
	.kanjimi-furigana-sample .translation {
		font-size: 0.5em;
		display: block;
		line-height: 150%;
		margin: 0 2px;
		text-align: center;
	}
</style>
