<template>
	<div class="kanjimi-login-container">
		TODO login interface
	</div>
</template>
<script lang="ts">
	import Vue from 'vue';

	export default Vue.extend({
		data() {
			return {};
		},
	});
</script>
<style scoped>
	.kanjimi-login-container,
	.kanjimi-login-container *,
	.kanjimi-login-container *::before,
	.kanjimi-login-container *::after {
		all: initial;
	}

	.kanjimi-login-container {
		z-index: 999999;
		position: fixed;
		left: 0;
		right: 0;
		top: 0;
		bottom: 0;
		padding: 1em;
		background: white;
	}
</style>
