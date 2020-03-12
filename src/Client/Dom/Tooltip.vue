<template>
	<div
		ref="tooltip"
		class="yometai-tooltip"
		v-bind:style="{
			position: 'absolute',
			background: 'red',
			overflowY: 'auto',
			zIndex: 999999,
			...tooltipStyles,
		}"
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
			};
		},
		mounted() {
			const tipHeight = 10;
			const targetPos = this.getElementPosition(this.tokenElement);

			const tooltipWidth = this.$refs.tooltip.offsetWidth;
			const tooltipHeight = this.$refs.tooltip.offsetHeight;

			let left = targetPos.left - Math.round((tooltipWidth - (targetPos.right - targetPos.left)) / 2);
			if (left < 0) {
				// Making sure it does not go outside the document on the left
				left = 0;
			}

			let right = left + tooltipWidth;
			if (right >= window.innerWidth) {
				// Making sure it does not go outside the document on the right
				left -= (right - window.innerWidth);
			}

			const targetDistanceToTop = targetPos.top - window.scrollY;
			const targetDistanceToBottom = (window.scrollY + window.innerHeight) - targetPos.bottom;
			const showOnTop = (
				targetDistanceToTop >= (tooltipHeight + tipHeight)
				|| targetDistanceToTop >= targetDistanceToBottom
			);

			let top: number;
			if (showOnTop) {
				top = targetPos.top - tooltipHeight - tipHeight;
				if (top < 0) {
					// Making sure it does not go over the top of the document
					top = targetPos.bottom + tipHeight;
				}
			} else {
				top = targetPos.bottom + tipHeight;
			}

			this.tooltipStyles = {
				left: left + 'px',
				top: top + 'px',
				width: (right - left) + 'px',
				height: tooltipHeight + 'px',
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
