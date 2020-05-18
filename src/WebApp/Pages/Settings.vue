<template>
	<div class="page-settings">
		<h1>Account settings</h1>

		<LanguagesSelector v-model="languages" />
	</div>
</template>
<script lang="ts">
	import Vue from 'vue';
	import LanguagesSelector from 'WebApp/Components/LanguagesSelector.vue';

	export default Vue.extend({
		created() {
			if (this.$root.apiKey === null) {
				this.$root.router.changeRoute('./app/login');
			}
		},
		data() {
			return {
				languages: [],
			};
		},
		components: {
			LanguagesSelector,
		},
	});
</script>
<style scoped>
</style>
