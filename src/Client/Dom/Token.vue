<template>
	<span class="token" ref="tokenElement">
		<span
			v-bind:class="['furigana', showFurigana ? 'shown' : 'hidden']"
			v-on:click="handleFuriganaClick($event)"
			v-bind:style="furiganaStyle"
		>
			{{ token.getFurigana() || '&nbsp;' }}
		</span>
		<span class="word" v-on:click="handleWordClick($event)">
			{{ token.text || '&nbsp;' }}
		</span>
		<span
			v-bind:class="['translation', showTranslation ? 'shown' : 'hidden']"
			v-on:click="handleTranslationClick($event)"
			v-bind:style="translationStyle"
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
			token: { type: Object as () => Token },
		},
		methods: {
			handleWordClick(event: Event) {
				event.preventDefault();
				event.stopPropagation();
				if (!(this.token.type === TokenType.PUNCTUATION)) {
					this.$root.toggleTooltip(this.token, this.$refs.tokenElement);
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
			currentTextColor() {
				const tokenComputedStyles = window.getComputedStyle(this.$root.$el);
				return tokenComputedStyles.getPropertyValue('color');
			},
			furiganaStyle() {
				if (!this.hasFurigana) {
					// Hide it, disable pointer reactivity and bounding-box (but we need to keep the height)
					return { visibility: 'hidden', width: '1px' };
				} else if (!this.showFurigana) {
					// Hide it but keep the pointer reactivity and bounding-box
					return { backgroundColor: this.currentTextColor, color: this.currentTextColor };
				} else {
					return {};
				}
			},
			translationStyle() {
				if (!this.hasTranslation) {
					// Hide it, disable pointer reactivity and bounding-box (but we need to keep the height)
					return { visibility: 'hidden', width: '1px' };
				} else if (!this.showTranslation) {
					// Hide it but keep the pointer reactivity and bounding-box
					return { backgroundColor: this.currentTextColor, color: this.currentTextColor };
				} else {
					return {};
				}
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
		font-size: 0.5rem;
		display: block;
		line-height: 150%;
		margin: 0 2px;
		text-align: center;
		white-space: nowrap;
		cursor: help;
	}

	.token .word {
		line-height: 1em;
		display: block;
		text-align: center;
		white-space: nowrap;
		margin: 0 0 0.1em 0;
	}

	.token .translation {
		font-size: 0.5rem;
		display: block;
		line-height: 150%;
		margin: 0px 2px;
		text-align: center;
		white-space: nowrap;
		cursor: help;
	}
</style>
