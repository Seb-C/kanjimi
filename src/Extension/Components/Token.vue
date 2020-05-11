<template>
	<span class="token" ref="tokenElement">
		<span
			v-bind:class="{
				'furigana': true,
				'shown': hasFurigana && showFurigana,
				'hidden': hasFurigana && !showFurigana,
				'none': !hasFurigana,
			}"
			v-on:click="handleFuriganaClick($event)"
		>
			{{ token.getFurigana() || '&nbsp;' }}
		</span>
		<span class="word" v-on:click="handleWordClick($event)">
			{{ token.text || '&nbsp;' }}
		</span>
		<span
			v-bind:class="{
				'translation': true,
				'shown': hasTranslation && showTranslation,
				'hidden': hasTranslation && !showTranslation,
				'none': !hasTranslation,
			}"
			v-on:click="handleTranslationClick($event)"
		>
			{{ token.getTranslation() || '&nbsp;' }}
		</span>
	</span>
</template>
<script lang="ts">
	import Vue from 'vue';
	import Token from 'Common/Models/Token';
	import TokenType from 'Common/Types/TokenType';
	import WordStatus from 'Common/Models/WordStatus';

	export default Vue.extend({
		props: {
			token: { type: Token },
		},
		methods: {
			handleWordClick(event: Event) {
				event.preventDefault();
				event.stopPropagation();
				if (!(this.token.type === TokenType.PUNCTUATION)) {
					if (this.$root.tooltip !== null && this.$root.tooltip.token === this.token) {
						this.$root.setTooltip(null);
					} else {
						this.$root.setTooltip({
							token: this.token,
							tokenElement: this.$refs.tokenElement
						});
					}
				}
			},
			async handleFuriganaClick(event: Event) {
				event.preventDefault();
				event.stopPropagation();
				if (this.$root.wordStatuses[this.token.text]) {
					const wordStatus = <WordStatus>this.$root.wordStatuses[this.token.text];
					await this.$root.setWordStatus(wordStatus, {
						showFurigana: !this.showFurigana,
					});
				}
			},
			async handleTranslationClick(event: Event) {
				event.preventDefault();
				event.stopPropagation();
				if (this.$root.wordStatuses[this.token.text]) {
					const wordStatus = <WordStatus>this.$root.wordStatuses[this.token.text];
					await this.$root.setWordStatus(wordStatus, {
						showTranslation: !this.showTranslation,
					});
				}
			},
		},
		computed: {
			hasFurigana() {
				return this.token.getFurigana() !== this.token.text;
			},
			hasTranslation() {
				return this.token.type !== TokenType.PARTICLE;
			},
			showFurigana() {
				if (!this.$root.wordStatuses[this.token.text]) {
					return true;
				}

				return (<WordStatus>this.$root.wordStatuses[this.token.text]).showFurigana;
			},
			showTranslation() {
				if (!this.$root.wordStatuses[this.token.text]) {
					return true;
				}

				return (<WordStatus>this.$root.wordStatuses[this.token.text]).showTranslation;
			},
		},
	});
</script>
<style scoped>
	.token {
		display: inline-block;
		line-height: 100%;
	}

	.token .furigana {
		font-size: 0.5em;
		display: block;
		line-height: 150%;
		margin: 0 2px;
		text-align: center;
		white-space: nowrap;
		cursor: pointer;
	}

	.token .furigana.hidden {
		/* Hide it but keep the pointer reactivity and bounding-box */
		background-color: currentColor;
		color: currentColor;
	}

	.token .furigana.none {
		/**
		 * Hide it, disable pointer reactivity and bounding-box
		 * (but we need to keep the height)
		 */
		visibility: hidden;
		width: 1px;
	}

	.token .word {
		line-height: 1em;
		display: block;
		text-align: center;
		white-space: nowrap;
		margin: 0 0 0.1em 0;
		cursor: zoom-in;
	}

	.token .translation {
		font-size: 0.5em;
		display: block;
		line-height: 150%;
		margin: 0px 2px;
		text-align: center;
		white-space: nowrap;
		cursor: pointer;
	}

	.token .translation.hidden {
		/*
		 * Hide it but keep the pointer reactivity and bounding-box
		 */
		background-color: currentColor;
		color: currentColor;
	}

	.token .translation.none {
		/**
		 * Hide it, disable pointer reactivity and bounding-box
		 * (but we need to keep the height)
		 */
		visibility: hidden;
		width: 1px;
	}
</style>
