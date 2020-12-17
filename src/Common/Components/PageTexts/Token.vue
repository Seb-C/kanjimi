<template>
	<span class="token" ref="tokenElement" v-on:click="handleTokenClick">
		<span
			v-bind:class="{
				'furigana': true,
				'shown': hasFurigana && showFurigana,
				'hidden': hasFurigana && !showFurigana,
				'none': !hasFurigana,
			}"
			v-on:click="handleFuriganaClick($event)"
			v-bind:aria-hidden="!hasFurigana || !showFurigana"
		>{{
			getFurigana() || '&nbsp;'
		}}</span>
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
			v-bind:aria-hidden="!hasTranslation || !showTranslation"
		>{{
			getTranslation() || '&nbsp;'
		}}</span>
	</span>
</template>
<script lang="ts">
	import Vue from 'vue';
	import Token from 'Common/Models/Token';
	import TokenType from 'Common/Types/TokenType';
	import WordStatus from 'Common/Models/WordStatus';
	import CharType from 'Common/Types/CharType';

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
			handleTokenClick (event: Event) {
				event.preventDefault();
				event.stopPropagation();
			},
			getFurigana() {
				let furigana = this.token.getFurigana();
				if (furigana === null) {
					return null;
				}

				furigana = CharType.katakanaToHiragana(furigana);
				if (this.$root.user.romanReading) {
					furigana = CharType.hiraganaToRoman(furigana);
				}

				return furigana;
			},
			getTranslation() {
				return this.token.getTranslation();
			},
		},
		computed: {
			hasFurigana() {
				return this.getFurigana() !== this.token.text;
			},
			showFurigana() {
				if (!this.$root.wordStatuses[this.token.text]) {
					return true;
				}

				return (<WordStatus>this.$root.wordStatuses[this.token.text]).showFurigana;
			},

			hasTranslation() {
				return this.token.type !== TokenType.PARTICLE;
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
		width: auto;
		text-align: center;
		position: relative;
		white-space: normal;

		/** Required to disallow click on the sentence between tokens */
		padding: 0;
		margin: 0;
	}

	.token .furigana {
		border-radius: 0.3em;
		font-size: 0.5em;
		display: block;
		line-height: 1.5em;
		margin: 0 2px;
		text-align: center;
		white-space: nowrap;
		cursor: pointer;
		padding: 0;
		background-color: inherit;
	}

	.token .furigana:hover {
		z-index: 999999;
		transform: scale(2);
		transform-origin: center 130%;
		background-color: var(--primary);
		color: var(--black);
		box-shadow: 0px 0px 0px 2px var(--black);
	}

	.token .furigana.hidden {
		display: block !important;
		visibility: visible !important;
		opacity: 100% !important;

		/* Hide it but keep the pointer reactivity and bounding-box */
		background-color: currentColor;
		color: currentColor;
	}
	.token .furigana.hidden::first-line {
		/* Making the text invisible without affecting the currentColor */
		color: rgba(0, 0, 0, 0);
	}

	.token .furigana.hidden:hover,
	.token .furigana:empty {
		/* No zooming if empty or hidden */
		transform: none;
		box-shadow: none;
	}

	.token .furigana.none {
		/**
		 * Hide it, disable pointer reactivity and bounding-box
		 * (but we need to keep the height)
		 */
		visibility: hidden !important;
		width: 1px !important;
	}

	.token .word {
		line-height: 1.1em;
		display: block;
		text-align: center;
		white-space: nowrap;
		margin: 1px 0 1px 0;
		cursor: zoom-in;
		padding: 0;
		background-color: inherit;
		font-size: 1em;
	}

	.token .translation {
		border-radius: 0.3em;
		font-size: 0.5em;
		display: block;
		line-height: 1.5em;
		margin: 0px 2px;
		text-align: center;
		white-space: nowrap;
		cursor: pointer;
		padding: 0;
		background-color: inherit;
	}

	.token .translation:hover {
		z-index: 999999;
		transform: scale(2);
		transform-origin: center -30%;
		background-color: var(--primary);
		color: var(--black);
		box-shadow: 0px 0px 0px 2px var(--black);
	}

	.token .translation.hidden {
		display: block !important;
		visibility: visible !important;
		opacity: 100% !important;

		/* Hide it but keep the pointer reactivity and bounding-box */
		background-color: currentColor;
		color: currentColor;
	}
	.token .translation.hidden::first-line {
		color: rgba(0, 0, 0, 0);
	}
	.token .translation.hidden:hover {
		transform: none;
		box-shadow: none;
	}

	.token .translation.none {
		/**
		 * Hide it, disable pointer reactivity and bounding-box
		 * (but we need to keep the height)
		 */
		visibility: hidden !important;
		width: 1px !important;
	}
</style>
