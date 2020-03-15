<template>
	<div class="yometai-tooltip-container">
		<div
			ref="tooltip"
			class="yometai-tooltip"
			v-bind:style="tooltipStyles"
		>
			<ul class="yometai-readings">
				<li v-for="[reading, wordsByLanguage] of wordsByReadingAndLanguage">
					<span class="yometai-token">
						<span class="yometai-furigana">{{ reading }}</span>
						<span class="yometai-word">{{ token.text }}</span>
					</span>
					<div class="yometai-reading-translations">
						<div v-for="[lang, words] of wordsByLanguage" class="yometai-reading-translation">
							<span class="yometai-reading-translation-flag">
								{{ lang === null ? '' : Language.toUnicodeFlag(lang) }}
							</span>
							<ol>
								<li v-for="word in words">
									{{ word.translation }}
								</li>
							</ol>
						</div>
					</div>
				</li>
			</ul>

			<div v-bind:style="{
				fontFamily: 'yometai-kanji-stroke-orders',
				fontSize: '150px',
			}">{{ token.text }}</div>
		</div>
		<div
			class="yometai-tooltip-tip"
			v-bind:style="tipStyles"
		></div>
		<div
			class="yometai-tooltip-cursor"
			v-bind:style="cursorStyles"
		></div>
	</div>
</template>
<script lang="ts">
	import Vue from 'vue';
	import Word from 'Common/Models/Word';
	import Language from 'Common/Types/Language';
	import WordToken from 'Common/Models/Token/WordToken';

	export default Vue.extend({
		props: {
			token: { type: Object as () => WordToken },
			tokenElement: { type: Object as () => HTMLElement },
		},
		data() {
			const wordsByReadingAndLanguage: Map<string, Map<Language|null, Word[]>> = new Map();
			this.token.words.forEach((word) => {
				if (!wordsByReadingAndLanguage.has(word.reading)) {
					wordsByReadingAndLanguage.set(word.reading, new Map());
				}
				const wordsByLanguage = (<Map<Language|null, Word[]>>wordsByReadingAndLanguage.get(word.reading));

				if (!wordsByLanguage.has(word.translationLang)) {
					wordsByLanguage.set(word.translationLang, []);
				}
				const words = (<Word[]>wordsByLanguage.get(word.translationLang));

				words.push(word);
			});

			return {
				Language,
				wordsByReadingAndLanguage,
				tooltipStyles: {
					top: '-999999px',
					left: '-999999px',
					width: 'auto',
					height: 'auto',
					maxHeight: '50vh',
					maxWidth: '100vw',
				},
				tipSize: 15,
				tipStyles: {
					top: '-999999px',
					left: '-999999px',
				},
				cursorStyles: {
					top: '-999999px',
					left: '-999999px',
				},
			};
		},
		mounted() {
			const tipDiagonal = Math.sqrt((this.tipSize * this.tipSize) * 2);
			const targetPos = this.getElementPosition(this.tokenElement);

			const tooltipWidth = this.$refs.tooltip.offsetWidth;
			const tooltipHeight = this.$refs.tooltip.offsetHeight;

			let tipLeft = targetPos.left + ((targetPos.right - targetPos.left) / 2) - (this.tipSize / 2);

			let left = targetPos.left - ((tooltipWidth - (targetPos.right - targetPos.left)) / 2);
			if (left < 0) {
				// Making sure it does not go outside the document on the left
				left = 0;
			}

			let right = left + tooltipWidth;
			if (right >= document.body.offsetWidth) {
				// Making sure it does not go outside the document on the right
				left -= (right - document.body.offsetWidth);
				right = left + tooltipWidth;
			}

			const targetDistanceToTop = targetPos.top - window.scrollY;
			const targetDistanceToBottom = (window.scrollY + window.innerHeight) - targetPos.bottom;
			const showOnTop = (
				targetDistanceToTop >= (tooltipHeight + (tipDiagonal / 2))
				|| targetDistanceToTop >= targetDistanceToBottom
			);

			let tipTop: number; // Haha!
			let top: number;
			if (showOnTop) {
				tipTop = targetPos.top - tipDiagonal;
				top = targetPos.top - tooltipHeight - (tipDiagonal / 2);
				if (top < 0) {
					// Making sure it does not go over the top of the document
					tipTop = targetPos.bottom + (tipDiagonal / 4);
					top = targetPos.bottom + (tipDiagonal / 2);
				}
			} else {
				tipTop = targetPos.bottom + (tipDiagonal / 4);
				top = targetPos.bottom + (tipDiagonal / 2);
			}

			this.tooltipStyles = {
				left: left + 'px',
				top: top + 'px',
				width: (right - left) + 'px',
				height: tooltipHeight + 'px',
			};

			this.tipStyles = {
				left: tipLeft + 'px',
				top: tipTop + 'px',
				width: this.tipSize + 'px',
				height: this.tipSize + 'px',
			};

			this.cursorStyles = {
				left: targetPos.left + 'px',
				top: targetPos.top + 'px',
				width: (targetPos.right - targetPos.left) + 'px',
				height: (targetPos.bottom - targetPos.top) + 'px',
			};
		},
		methods: {
			getElementPosition(element: HTMLElement) {
				let top = 0;
				let left = 0;

				let currentNode = element;
				do {
					top += currentNode.offsetTop || 0;
					left += currentNode.offsetLeft || 0;
					currentNode = <HTMLElement>currentNode.offsetParent;
				} while (currentNode);

				return {
					left: left,
					top: top,
					right: left + element.offsetWidth,
					bottom: top + element.offsetHeight,
				};
			},
		},
	});
</script>
