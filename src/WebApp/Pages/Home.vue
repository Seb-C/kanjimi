<template>
	<div class="container flex-fill py-2 page-home">
		TODO home page
	</div>
</template>
<script lang="ts">
	import Vue from 'vue';

	export default Vue.extend({
		created() {
			if (this.$root.apiKey === null) {
				this.$root.router.changeRoute('./app/login');
			}
		},
	});
</script>
<style scoped></style>
