<template>
	<div v-bind:class="['tooltip-container', uidClass]">
		<div
			ref="tooltip"
			class="tooltip"
			v-bind:style="tooltipStyles"
		>
			<readings v-bind:token="token" v-bind:uid-class="uidClass" />
			<conjugations v-if="token instanceof VerbToken" v-bind:token="token" v-bind:uid-class="uidClass" />
			<kanjis v-bind:token="token" v-bind:uid-class="uidClass" />
		</div>
		<div
			class="tooltip-tip"
			v-bind:style="tipStyles"
		></div>
		<div
			class="tooltip-cursor"
			v-bind:style="cursorStyles"
		></div>
	</div>
</template>
<script lang="ts">
	import Vue from 'vue';
	import Word from 'Common/Models/Word';
	import Language from 'Common/Types/Language';
	import WordToken from 'Common/Models/Token/WordToken';
	import VerbToken from 'Common/Models/Token/VerbToken';
	import Kanjis from 'Client/Dom/Kanjis.vue';
	import Readings from 'Client/Dom/Readings.vue';
	import Conjugations from 'Client/Dom/Conjugations.vue';

	export default Vue.extend({
		props: {
			uidClass: { type: String },
			token: { type: Object as () => WordToken },
			tokenElement: { type: Object as () => HTMLElement },
		},
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
				cursorStyles: {
					top: '-999999px',
					left: '-999999px',
				},
				VerbToken,
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
		components: {
			'kanjis': Kanjis,
			'readings': Readings,
			'conjugations': Conjugations,
		},
	});
</script>
<style scoped>
	.tooltip-container,
	.tooltip-container *,
	.tooltip-container *::before,
	.tooltip-container *::after {
		all: initial;
	}

	.tooltip {
		position: absolute;
		background: #eae4ce;
		overflow-y: auto;
		z-index: 999999;
		box-sizing: border-box;
		border-radius: 5px;
		border: 1px solid black;
		color: black;
		padding: 5px;
	}

	.tooltip-tip {
		position: absolute;
		background: #eae4ce;
		z-index: 999998;
		transform-origin: center;
		transform: rotate(45deg);
		border: 1px solid black;
	}

	.tooltip-cursor {
		box-sizing: border-box;
		position: absolute;
		border: 2px dashed #C53A3A;
		pointer-events: none;
	}
</style>
