<template>
	<div>
		<div
			ref="tooltip"
			class="yometai-tooltip"
			v-bind:style="tooltipStyles"
		>
			<div>{{ token.text }}</div>
			<div v-bind:style="{
				fontFamily: 'yometai-kanji-stroke-orders',
				fontSize: '150px',
			}">{{ token.text }}</div>

			<ul>
				<li v-for="word in token.words">
					{{ word.reading }}
					{{ word.translationLang }}
					{{ word.translation }}
				</li>
			</ul>
		</div>
		<div
			ref="tip"
			class="yometai-tooltip-tip"
			v-bind:style="tipStyles"
		></div>
	</div>
</template>
<script lang="ts">
	import Vue from 'vue';

	export default Vue.extend({
		props: [
			'token',
			'tokenElement',
		],
		data() {
			return {
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
			};
		},
		mounted() {
			const tipDiagonal = Math.sqrt((this.tipSize * this.tipSize) * 2);
			const targetPos = this.getElementPosition(this.tokenElement);

			const tooltipWidth = this.$refs.tooltip.offsetWidth;
			const tooltipHeight = this.$refs.tooltip.offsetHeight;

			let tipLeft = targetPos.left + ((targetPos.right - targetPos.left) / 2) - (tipDiagonal / 2);

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
