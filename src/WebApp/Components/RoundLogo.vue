<template>
	<div class="col-12 text-center px-5 mb-3">
		<div class="bg-light p-3 rounded-circle border border-dark kanjimi-round-logo">
			<img src="./img/logo/any.svg" alt="Logo" class="mw-100" />
		</div>
		<h1 class="mt-1 mb-0">{{ title }}</h1>
	</div>
</template>
<script lang="ts">
	import Vue from 'vue';

	export default Vue.extend({
		props: {
			title: { type: String },
		},
	});
</script>
<style scoped>
	.kanjimi-round-logo {
		width: 100px;
		margin: auto;
		margin-top: -50px;
	}
</style>
