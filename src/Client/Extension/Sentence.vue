<template>
	<span class="kanjimi kanjimi-sentence">
		<token
			v-for="(token, i) in tokens"
			v-bind:token="token"
			:key="i"
		/>
	</span>
</template>
<script lang="ts">
	import Vue from 'vue';
	import TokenModel from 'Common/Models/Token';
	import TokenType from 'Common/Types/TokenType';
	import Token from 'Client/Extension/Token.vue';
	import WordStatus from 'Common/Models/WordStatus';

	export default Vue.extend({
		props: {
			tokens: { type: Array as () => TokenModel[] },
		},
		components: {
			'token': Token,
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
