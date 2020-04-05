<template>
	<span class="kanjimi kanjimi-sentence">
		<span v-for="(token, i) in tokens" class="token" ref="token">
			<span
				class="furigana"
				v-on:click="handleFuriganaClick(token, $refs.token[i], $event)"
				v-bind:style="getFuriganaStyle(token)"
			>
				{{ token.getFurigana() || '&nbsp;' }}
			</span>
			<span class="word" v-on:click="handleWordClick(token, $refs.token[i], $event)">
				{{ token.text || '&nbsp;' }}
			</span>
			<span
				class="translation"
				v-on:click="handleTranslationClick(token, $refs.token[i], $event)"
				v-bind:style="getTranslationStyle(token)"
			>
				{{ token.getTranslation() || '&nbsp;' }}
			</span>
		</span>
	</span>
</template>
<script lang="ts">
	import Vue from 'vue';
	import Token from 'Common/Models/Token';
	import TokenType from 'Common/Types/TokenType';
	import Tooltip from 'Client/Dom/Tooltip.vue';
	import WordStatus from 'Common/Models/WordStatus';

	export default Vue.extend({
		props: {
			tokens: { type: Array as () => Token[] },
		},
		methods: {
			handleWordClick(token: Token, tokenElement: Element, event: Event) {
				event.preventDefault();
				event.stopPropagation();
				if (!(token.type === TokenType.PUNCTUATION)) {
					this.$root.toggleTooltip(token, tokenElement);
				}
			},
			async handleFuriganaClick(token: Token, tokenElement: Element, event: Event) {
				event.preventDefault();
				event.stopPropagation();
				if (this.$root.wordStatuses[token.text]) {
					const wordStatus = <WordStatus>this.$root.wordStatuses[token.text];
					await this.$root.setWordStatus(wordStatus, {
						showFurigana: !this.showFurigana(token),
					});
				}
			},
			async handleTranslationClick(token: Token, tokenElement: Element, event: Event) {
				event.preventDefault();
				event.stopPropagation();
				if (this.$root.wordStatuses[token.text]) {
					const wordStatus = <WordStatus>this.$root.wordStatuses[token.text];
					await this.$root.setWordStatus(wordStatus, {
						showTranslation: !this.showTranslation(token),
					});
				}
			},
			hasFurigana(token: Token) {
				return token.getFurigana() !== token.text;
			},
			hasTranslation(token: Token) {
				return token.type !== TokenType.PARTICLE;
			},
			showFurigana(token: Token) {
				if (!this.$root.wordStatuses[token.text]) {
					return true;
				}

				return (<WordStatus>this.$root.wordStatuses[token.text]).showFurigana;
			},
			showTranslation(token: Token) {
				if (!this.$root.wordStatuses[token.text]) {
					return true;
				}

				return (<WordStatus>this.$root.wordStatuses[token.text]).showTranslation;
			},
			getFuriganaStyle(token: Token) {
				if (!this.hasFurigana(token)) {
					// Hide it, disable pointer reactivity and bounding-box (but we need to keep the height)
					return { visibility: 'hidden', width: '1px' };
				} else if (!this.showFurigana(token)) {
					// Hide it but keep the pointer reactivity and bounding-box
					return { opacity: 0 };
				} else {
					return {};
				}
			},
			getTranslationStyle(token: Token) {
				if (!this.hasTranslation(token)) {
					// Hide it, disable pointer reactivity and bounding-box (but we need to keep the height)
					return { visibility: 'hidden', width: '1px' };
				} else if (!this.showTranslation(token)) {
					// Hide it but keep the pointer reactivity and bounding-box
					return { opacity: 0 };
				} else {
					return {};
				}
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
		cursor: help;
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
		cursor: help;
	}

	a .kanjimi-sentence:after {
		content: "\1F517";
		display: inline-block;
		vertical-align: top;
		margin: 0.5rem 0.5rem 0.5rem 0;
	}
</style>
