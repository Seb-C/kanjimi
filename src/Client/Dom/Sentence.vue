<template>
	<span class="kanjimi kanjimi-sentence">
		<span v-for="(token, i) in tokens" class="token" ref="token">
			<span class="furigana" v-on:click="handleFuriganaClick(token, $refs.token[i], $event)">
				<template v-if="showFurigana(token)">{{ token.getFurigana() || '&nbsp;' }}</template>
				<template v-else>&nbsp;</template>
			</span>
			<span class="word" v-on:click="handleWordClick(token, $refs.token[i], $event)">
				{{ token.text || '&nbsp;' }}
			</span>
			<span class="translation" v-on:click="handleTranslationClick(token, $refs.token[i], $event)">
				<template v-if="showTranslation(token)">{{ token.getTranslation() || '&nbsp;' }}</template>
				<template v-else>&nbsp;</template>
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
			toggleTooltip: { type: (Function as unknown) as () => (
				(token: Token, tokenElement: Element) => void
			) },
			wordStatuses: { type: Object as () => Map<string, WordStatus> },
			setWordStatus: { type: (Function as unknown) as () => (
				(wordStatus: WordStatus, attributes: any) => void
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
				if (this.wordStatuses.has(token.text)) {
					const wordStatus = <WordStatus>this.wordStatuses.get(token.text);
					this.setWordStatus(wordStatus, {
						showFurigana: !this.showFurigana(token),
					});
				}
			},
			handleTranslationClick(token: Token, tokenElement: Element, event: Event) {
				event.preventDefault();
				event.stopPropagation();
				if (this.wordStatuses.has(token.text)) {
					const wordStatus = <WordStatus>this.wordStatuses.get(token.text);
					this.setWordStatus(wordStatus, {
						showTranslation: !this.showTranslation(token),
					});
				}
			},
			showFurigana(token: Token) {
				if (token.getFurigana() === token.text) {
					return false;
				}

				if (!this.wordStatuses.has(token.text)) {
					return true;
				}

				return (<WordStatus>this.wordStatuses.get(token.text)).showFurigana;
			},
			showTranslation(token: Token) {
				if (token.type === TokenType.PARTICLE) {
					return false;
				}

				if (!this.wordStatuses.has(token.text)) {
					return true;
				}

				return (<WordStatus>this.wordStatuses.get(token.text)).showTranslation;
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
