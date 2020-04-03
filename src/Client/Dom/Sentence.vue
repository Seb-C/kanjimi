<template>
	<span class="kanjimi kanjimi-sentence">
		<span v-for="(token, i) in tokens" class="token" ref="token">
			<span class="furigana" v-on:click="handleFuriganaClick(token, $refs.token[i], $event)">
				{{ (token.getFurigana() == token.text ? null : token.getFurigana()) || '&nbsp;' }}
			</span>
			<span class="word" v-on:click="handleWordClick(token, $refs.token[i], $event)">
				{{ token.text || '&nbsp;' }}
			</span>
			<span class="translation" v-on:click="handleTranslationClick(token, $refs.token[i], $event)">
				{{ (showTranslation(token) ? token.getTranslation() : null) || '&nbsp;' }}
			</span>
		</span>
	</span>
</template>
<script lang="ts">
	import Vue from 'vue';
	import Token from 'Common/Models/Token';
	import TokenType from 'Common/Types/TokenType';
	import Tooltip from 'Client/Dom/Tooltip.vue';

	export default Vue.extend({
		props: {
			tokens: { type: Array as () => Token[] },
			toggleTooltip: { type: (Function as unknown) as () => (
				(token: Token, tokenElement: Element) => void
			) },
		},
		methods: {
			handleWordClick(token: Token, tokenElement: Element, event: Event) {
				event.preventDefault();
				event.stopPropagation();
				if (!(token.type === TokenType.PUNCTUATION)) {
					this.toggleTooltip(token, tokenElement);
				}
			},
			handleFuriganaClick(token: Token, tokenElement: Element, event: Event) {
				event.preventDefault();
				event.stopPropagation();
			},
			handleTranslationClick(token: Token, tokenElement: Element, event: Event) {
				event.preventDefault();
				event.stopPropagation();
			},
			showTranslation(token: Token) {
				return !(token.type === TokenType.PARTICLE);
			},
		},
		components: {
			Tooltip,
		},
	});
</script>
<style scoped>
	.kanjimi-sentence {
		clear: both;
		display: inline;
	}

	.token {
		display: inline-block;
		line-height: 100%;
	}

	.token .furigana {
		font-size: 0.5rem;
		display: block;
		line-height: 150%;
		margin: 0 2px;
		text-align: center;
		white-space: nowrap;
	}

	.token .word {
		line-height: 100%;
		display: block;
		text-align: center;
		white-space: nowrap;
	}

	.token .translation {
		font-size: 0.5rem;
		display: block;
		line-height: 150%;
		margin: 0 2px;
		text-align: center;
		white-space: nowrap;
	}

	a .kanjimi-sentence:after {
		content: "\1F517";
		display: inline-block;
		vertical-align: top;
		margin: 0.5rem 0.5rem 0.5rem 0;
	}
</style>
