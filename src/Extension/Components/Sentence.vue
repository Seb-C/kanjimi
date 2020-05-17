<template>
	<span class="kanjimi kanjimi-sentence">
		<Token
			v-for="(token, i) in tokens"
			v-bind:token="token"
			:key="i"
		/>
	</span>
</template>
<script lang="ts">
	import Vue from 'vue';
	import TokenModel from 'Common/Models/Token';
	import Token from 'Extension/Components/Token.vue';

	export default Vue.extend({
		props: {
			tokens: { type: Array as () => TokenModel[] },
		},
		components: {
			Token,
		},
	});
</script>
<style scoped>
	.kanjimi-sentence {
		clear: both;
		display: inline;
	}

	a .kanjimi-sentence:after {
		content: "\1F517";
		display: inline-block;
		vertical-align: top;
		margin: 0.5em 0.5em 0.5em 0;
	}
</style>
