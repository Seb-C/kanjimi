<template>
	<div class="kanjimi kanjimi-tooltip-container">
		<div
			ref="tooltip"
			class="tooltip"
			v-bind:style="tooltipStyles"
		>
			<div class="tooltip-content">
				<readings v-bind:token="token" />
				<conjugations v-if="token.type === TokenType.VERB" v-bind:token="token" />
				<kanjis v-bind:token="token" />
			</div>

			<div
				class="tooltip-close-button"
				v-bind:style="closeButtonStyles"
				v-on:click="handleCloseButtonClick"
			>❌</div>
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
	import TokenType from 'Common/Types/TokenType';
	import Token from 'Common/Models/Token';
	import Kanjis from 'Extension/Components/Kanjis.vue';
	import Readings from 'Extension/Components/Readings.vue';
	import Conjugations from 'Extension/Components/Conjugations.vue';

	const TIP_SIZE = 15;

	export default Vue.extend({
		props: {
			token: { type: Token },
			tokenElement: { type: HTMLElement },
		},
		data() {
			return {
				targetPos: {},
				TokenType,

				// Values that only should not be affected by future dom changes
				windowScrollY: window.scrollY,
				windowHeight: window.innerHeight,
				bodyWidth: document.body.offsetWidth,
			};
		},
		created() {
			this.updateTargetPos();
			window.addEventListener('resize', this.updateTargetPos);
			window.addEventListener('kanjimi-converted-sentences', this.updateTargetPos);
			document.addEventListener('keyup', this.keyPressHandler);
		},
		beforeUpdate() {
			this.updateTargetPos();
		},
		beforeDestroy() {
			window.removeEventListener('resize', this.updateTargetPos);
			window.removeEventListener('kanjimi-converted-sentences', this.updateTargetPos);
			document.removeEventListener('keyup', this.keyPressHandler);
		},
		methods: {
			keyPressHandler(event: KeyboardEvent) {
				if (event.key === 'Escape') {
					event.preventDefault();
					event.stopPropagation();
					this.$root.setTooltip(null);
				}
			},
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
			getTipDiagonal(): number {
				return Math.sqrt((TIP_SIZE * TIP_SIZE) * 2);
			},
			getTooltipHeight(): number {
				return Math.round(this.windowHeight / 2);
			},
			handleCloseButtonClick() {
				this.$root.setTooltip(null);
			},
			showTooltipOnTop(): boolean {
				const tipDiagonal = this.getTipDiagonal();
				const tooltipHeight = this.getTooltipHeight();

				const targetDistanceToTop = this.targetPos.top - this.windowScrollY;
				const targetDistanceToBottom = (this.windowScrollY + this.windowHeight) - this.targetPos.bottom;
				return (
					targetDistanceToTop >= (tooltipHeight + (tipDiagonal / 2))
					|| targetDistanceToTop >= targetDistanceToBottom
				);
			},
		},
		computed: {
			tooltipStyles() {
				const tipDiagonal = this.getTipDiagonal();
				const tooltipWidth = Math.round(this.bodyWidth * 0.4); // Mobile: should take 100%?
				const tooltipHeight = this.getTooltipHeight();

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

				let top: number;
				if (this.showTooltipOnTop()) {
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
				const tipDiagonal = this.getTipDiagonal();
				const tooltipHeight = this.getTooltipHeight();

				let tipLeft = this.targetPos.left + ((this.targetPos.right - this.targetPos.left) / 2) - (TIP_SIZE / 2);

				let tipTop: number; // Haha!
				if (this.showTooltipOnTop()) {
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
			closeButtonStyles() {
				if (this.showTooltipOnTop()) {
					return { bottom: 0 };
				} else {
					return { top: 0 };
				}
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
	.kanjimi-tooltip-container,
	.kanjimi-tooltip-container *,
	.kanjimi-tooltip-container *::before,
	.kanjimi-tooltip-container *::after {
		all: initial;
	}

	.tooltip {
		position: absolute;
		background: #eae4ce;
		z-index: 999999;
		box-sizing: border-box;
		border-radius: 5px;
		border: 1px solid black;
		color: black;
		padding: 5px;
	}

	.tooltip-content {
		overflow-y: auto;
		width: 100%;
		height: 100%;
		display: block;
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

	.tooltip-close-button {
		cursor: pointer;
		position: absolute;
		right: 0;
		padding: 5px;
		line-height: 1rem;
		background: #eae4ce;
		border-radius: 5px;
	}
</style>
