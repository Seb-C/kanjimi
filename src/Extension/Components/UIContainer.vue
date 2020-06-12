<template>
	<div v-if="showNotification || showTooltip" class="kanjimi-ui-container">
		<Tooltip v-if="showTooltip" v-bind="getTooltipProps" />
		<Notification v-if="showNotification" v-bind="getNotificationProps" />
	</div>
</template>
<script lang="ts">
	import Vue from 'vue';
	import Tooltip from 'Extension/Components/Tooltip.vue';
	import Notification from 'Extension/Components/Notification.vue';

	export default Vue.extend({
		data() {
			return {};
		},
		computed: {
			showTooltip() {
				return this.$root.tooltip !== null;
			},
			showNotification() {
				return this.$root.notification !== null;
			},
			getTooltipProps() {
				return this.$root.tooltip;
			},
			getNotificationProps() {
				return this.$root.notification;
			},
		},
		components: {
			Tooltip,
			Notification,
		},
	});
</script>
<style scoped>
	.kanjimi-ui-container,
	.kanjimi-ui-container *,
	.kanjimi-ui-container *::before,
	.kanjimi-ui-container *::after {
		all: initial;
	}

	.kanjimi-ui-container {
		--primary: #FFC857;
		--primary-50: rgba(255, 200, 87, 0.8);
		--secondary: #064789;
		--black: #1d1905;
		--gray: #DCDCDC;
		--dark: #393E41;
		--dark-50: rgba(57, 62, 65, 0.8);
		--white: #FFFCF5;
		--white-50: rgba(255, 252, 245, 0.8);
		--light: #FFF8E8;
		--light-50: rgba(255, 248, 232, 0.8);
		--red: #C53A3A;
	}
</style>
