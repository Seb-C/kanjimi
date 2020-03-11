<template>
	<div
		ref="tooltip"
		v-bind:style="{
			position: 'absolute',
			background: 'red',
			top: tooltipStyles.y1,
			left: tooltipStyles.x1,
			bottom: tooltipStyles.y2,
			right: tooltipStyles.x2,
		}"
	>
		Hello World!
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
					x1: -1000,
					y1: -1000,
					x2: -1000,
					y2: -1000,
				},
			};
		},
		mounted() {
			const targetPos = this.getElementPosition(this.tokenElement);
			const tooltipSize = this.getElementSize(this.$refs.tooltip);

			// TODO calculate the tooltip position
			// should be on the top, unless there is no space
			// should be horizontally centered, unless there is no space
			// TODO possible to do some hot-reload? or properly remove everything when uninstalling extension
			console.log(targetPos, tooltipSize);

			this.$tooltipStyles = {
				x1: targetPos.x1,
				y1: targetPos.y1 - 50,
				x2: targetPos.x1 + tooltipSize.width,
				y2: targetPos.y1 + tooltipSize.height,
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
					x1: left,
					y1: top,
					x2: left + element.offsetWidth,
					y2: top + element.offsetHeight,
				};
			},
			getElementSize(element: HTMLElement) {
				return {
					width: element.offsetWidth,
					height: element.offsetHeight,
				};
			},
		},
	});
</script>
