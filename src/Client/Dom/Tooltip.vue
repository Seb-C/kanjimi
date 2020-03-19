<template>
	<div v-bind:class="['tooltip-container', appUid]">
		<div
			ref="tooltip"
			class="tooltip"
			v-bind:style="tooltipStyles"
		>
			<readings v-bind:token="token" />
			<conjugations v-if="token instanceof VerbToken" v-bind:token="token" />
			<kanjis v-bind:token="token" v-bind:uid-class="appUid" />
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

	const TIP_SIZE = 15;

	export default Vue.extend({
		props: {
			appUid: { type: String },
			token: { type: Object as () => WordToken },
			tokenElement: { type: Object as () => HTMLElement },
		},
		data() {
			return {
				targetPos: {},
				VerbToken,

				// Values that only should not be affected by future dom changes
				windowScrollY: window.scrollY,
				windowHeight: window.innerHeight,
				bodyWidth: document.body.offsetWidth,
			};
		},
		created() {
			this.updateTargetPos();
			window.addEventListener('resize', this.updateTargetPos);
			window.addEventListener(`${this.appUid}-converted-sentences`, this.updateTargetPos);
		},
		beforeDestroy() {
			window.removeEventListener('resize', this.updateTargetPos);
			window.removeEventListener(`${this.appUid}-converted-sentences`, this.updateTargetPos);
		},
		methods: {
			updateTargetPos() {
				let top = 0;
				let left = 0;
				let currentNode = this.tokenElement;
				do {
					top += currentNode.offsetTop || 0;
					left += currentNode.offsetLeft || 0;
					currentNode = <HTMLElement>currentNode.offsetParent;
				} while (currentNode);

				this.targetPos = {
					left: left,
					top: top,
					right: left + this.tokenElement.offsetWidth,
					bottom: top + this.tokenElement.offsetHeight,
				};
			},
		},
		computed: {
			tooltipStyles() {
				const tipDiagonal = Math.sqrt((TIP_SIZE * TIP_SIZE) * 2);
				const tooltipWidth = Math.round(this.bodyWidth * 0.4); // Mobile: should take 100%?
				const tooltipHeight = Math.round(this.windowHeight / 2);

				let left = this.targetPos.left - ((tooltipWidth - (this.targetPos.right - this.targetPos.left)) / 2);
				if (left < 0) {
					// Making sure it does not go outside the document on the left
					left = 0;
				}

				let right = left + tooltipWidth;
				if (right >= this.bodyWidth) {
					// Making sure it does not go outside the document on the right
					left -= (right - this.bodyWidth);
					right = left + tooltipWidth;
				}

				const targetDistanceToTop = this.targetPos.top - this.windowScrollY;
				const targetDistanceToBottom = (this.windowScrollY + this.windowHeight) - this.targetPos.bottom;
				const showOnTop = (
					targetDistanceToTop >= (tooltipHeight + (tipDiagonal / 2))
					|| targetDistanceToTop >= targetDistanceToBottom
				);

				let top: number;
				if (showOnTop) {
					top = this.targetPos.top - tooltipHeight - (tipDiagonal / 2);
					if (top < 0) {
						// Making sure it does not go over the top of the document
						top = this.targetPos.bottom + (tipDiagonal / 2);
					}
				} else {
					top = this.targetPos.bottom + (tipDiagonal / 2);
				}

				return {
					left: left + 'px',
					top: top + 'px',
					width: (right - left) + 'px',
					height: tooltipHeight + 'px',
				};
			},
			tipStyles() {
				const tipDiagonal = Math.sqrt((TIP_SIZE * TIP_SIZE) * 2);
				const tooltipHeight = Math.round(this.windowHeight / 2);

				let tipLeft = this.targetPos.left + ((this.targetPos.right - this.targetPos.left) / 2) - (TIP_SIZE / 2);

				const targetDistanceToTop = this.targetPos.top - this.windowScrollY;
				const targetDistanceToBottom = (this.windowScrollY + this.windowHeight) - this.targetPos.bottom;
				const showOnTop = (
					targetDistanceToTop >= (tooltipHeight + (tipDiagonal / 2))
					|| targetDistanceToTop >= targetDistanceToBottom
				);

				let tipTop: number; // Haha!
				if (showOnTop) {
					tipTop = this.targetPos.top - tipDiagonal;
					if ((this.targetPos.top - tooltipHeight - (tipDiagonal / 2)) < 0) {
						// Making sure it does not go over the top of the document
						tipTop = this.targetPos.bottom + (tipDiagonal / 4);
					}
				} else {
					tipTop = this.targetPos.bottom + (tipDiagonal / 4);
				}

				return {
					left: tipLeft + 'px',
					top: tipTop + 'px',
					width: TIP_SIZE + 'px',
					height: TIP_SIZE + 'px',
				};
			},
			cursorStyles() {
				return {
					left: this.targetPos.left + 'px',
					top: this.targetPos.top + 'px',
					width: (this.targetPos.right - this.targetPos.left) + 'px',
					height: (this.targetPos.bottom - this.targetPos.top) + 'px',
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
