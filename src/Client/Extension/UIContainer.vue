<template>
	<login v-if="showLogin" />
	<tooltip v-else-if="showTooltip" v-bind="getTooltipProps" />
</template>
<script lang="ts">
	import Vue from 'vue';
	import Tooltip from 'Client/Extension/Tooltip.vue';
	import Login from 'Client/Extension/Login.vue';

	export default Vue.extend({
		data() {
			return {};
		},
		computed: {
			showLogin() {
				return this.$root.apiKey === null;
			},
			showTooltip() {
				return this.$root.tooltip !== null;
			},
			getTooltipProps() {
				return this.$root.tooltip;
			},
		},
		components: {
			'tooltip': Tooltip,
			'login': Login,
		},
	});
</script>
<style scoped>
</style>
