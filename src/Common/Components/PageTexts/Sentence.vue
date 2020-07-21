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
	import Token from 'Common/Components/PageTexts/Token.vue';

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
		--primary: #FFC857;
		--primary-50: rgba(255, 200, 87, 0.8);
		--secondary: #064789;
		--black: #1d1905;
		--gray: #DCDCDC;
		--dark: #393E41;
		--dark-50: rgba(57, 62, 65, 0.8);
		--white: #FFFCF5;
		--white-50: rgba(255, 252, 245, 0.8);
		--light: #FFF8E8;
		--light-50: rgba(255, 248, 232, 0.8);
		--red: #C53A3A;
	}

	.kanjimi-sentence {
		clear: both;
		display: inline;
		text-shadow: none;
	}

	a .kanjimi-sentence:after {
		content: "\1F517";
		display: inline-block;
		vertical-align: top;
		margin: 0.5em 0.5em 0.5em 0;
	}
</style>
