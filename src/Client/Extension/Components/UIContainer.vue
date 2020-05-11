<template>
	<tooltip v-if="showTooltip" v-bind="getTooltipProps" />
</template>
<script lang="ts">
	import Vue from 'vue';
	import Tooltip from 'Client/Extension/Components/Tooltip.vue';

	export default Vue.extend({
		data() {
			return {};
		},
		computed: {
			showTooltip() {
				return this.$root.tooltip !== null;
			},
			getTooltipProps() {
				return this.$root.tooltip;
			},
		},
		components: {
			'tooltip': Tooltip,
		},
	});
</script>
<style scoped>
</style>
