<template>
	<div class="kanjimi kanjimi-tooltip-container" v-on:click="onTooltipRootElementClick">
		<div
			ref="tooltip"
			class="tooltip"
			v-bind:style="tooltipStyles"
		>
			<div class="tooltip-content">
				<Readings v-bind:token="token" />
				<Conjugations v-if="token.type === TokenType.VERB" v-bind:token="token" />
				<Kanjis v-bind:token="token" />
			</div>

			<div
				class="tooltip-close-button"
				v-bind:style="closeButtonStyles"
				v-on:click="handleCloseButtonClick"
			></div>
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
				windowWidth: window.innerWidth,
				windowHeight: window.innerHeight,
			};
		},
		created() {
			this.updateTargetPos();
			window.addEventListener('resize', this.updateTargetPos);
			window.addEventListener('kanjimi-converted-sentences', this.updateTargetPos);
			document.addEventListener('keyup', this.keyPressHandler);
			document.body.addEventListener('click', this.onBodyClick);
			document.body.addEventListener('keyup', this.onBodyKeyPress);
		},
		beforeUpdate() {
			this.updateTargetPos();
		},
		beforeDestroy() {
			window.removeEventListener('resize', this.updateTargetPos);
			window.removeEventListener('kanjimi-converted-sentences', this.updateTargetPos);
			document.removeEventListener('keyup', this.keyPressHandler);
			document.body.removeEventListener('click', this.onBodyClick);
			document.body.removeEventListener('keyup', this.onBodyKeyPress);
		},
		methods: {
			onTooltipRootElementClick(event: Event) {
				// Preventing the propagation to the body
				event.stopPropagation();
			},
			onBodyClick(event: Event) {
				event.preventDefault();
				event.stopPropagation();
				this.$root.setTooltip(null);
			},
			onBodyKeyPress(event: KeyboardEvent) {
				if (event.key === 'Escape') {
					event.preventDefault();
					event.stopPropagation();
					this.$root.setTooltip(null);
				}
			},
			keyPressHandler(event: KeyboardEvent) {
				if (event.key === 'Escape') {
					event.preventDefault();
					event.stopPropagation();
					this.$root.setTooltip(null);
				}
			},
			updateTargetPos() {
				const rect = this.tokenElement.getBoundingClientRect();
				const left = window.scrollX + rect.left;
				const top = window.scrollY + rect.top;

				this.targetPos = {
					left: left,
					top: top,
					right: left + rect.width,
					bottom: top + rect.height,
				};
			},
			getTipDiagonal(): number {
				return Math.sqrt((TIP_SIZE * TIP_SIZE) * 2);
			},
			getTooltipWidth(): number {
				if (this.windowWidth >= 1200) { // Bootstrap xl breakpoint
					return Math.round(this.windowWidth * 0.4);
				} else if (this.windowWidth >= 992) { // Bootstrap lg breakpoint
					return Math.round(this.windowWidth * 0.5);
				} else if (this.windowWidth >= 768) { // Bootstrap md breakpoint
					return Math.round(this.windowWidth * 0.6);
				} else if (this.windowWidth >= 576) { // Bootstrap sm breakpoint
					return Math.round(this.windowWidth * 0.8);
				} else { // Bootstrap xs breakpoint
					return Math.round(this.windowWidth * 1);
				}
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
				const tooltipWidth = this.getTooltipWidth();
				const tooltipHeight = this.getTooltipHeight();

				let left = this.targetPos.left - ((tooltipWidth - (this.targetPos.right - this.targetPos.left)) / 2);
				if (left < 0) {
					// Making sure it does not go outside the document on the left
					left = 0;
				}

				let right = left + tooltipWidth;
				if (right >= this.windowWidth) {
					// Making sure it does not go outside the document on the right
					left -= (right - this.windowWidth);
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
			Kanjis,
			Readings,
			Conjugations,
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
		background: var(--primary);
		z-index: 999999;
		box-sizing: border-box;
		border-radius: 5px;
		border: 1px solid var(--black);
		color: var(--black);
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
		background: var(--primary);
		z-index: 999998;
		transform-origin: center;
		transform: rotate(45deg);
		border: 1px solid var(--black);
	}

	.tooltip-cursor {
		box-sizing: border-box;
		position: absolute;
		border: 2px dashed var(--red);;
		outline: 2px dashed var(--secondary);
		pointer-events: none;
		z-index: 999999;
	}

	.tooltip-close-button {
		cursor: pointer;
		position: absolute;
		right: 0;
		padding: 5px;
		line-height: 1rem;
		background: var(--primary);
		color: var(--red);
		border-radius: 5px;
		width: 1em;
		height: 1em;
	}

	.tooltip-close-button::before,
	.tooltip-close-button::after {
		cursor: pointer;
		content: "";
		height: 0.2em;
		width: 1.3em;
		top: 0.7em;
		left: 0.2em;
		background-color: var(--red);
		position: absolute;
		border-radius: 2px;
		transform-origin: center;
	}
	.tooltip-close-button::before {
		transform: rotate(45deg);
	}
	.tooltip-close-button::after {
		transform: rotate(-45deg);
	}
</style>
