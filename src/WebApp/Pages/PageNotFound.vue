<template>
	<div class="page-not-found text-center mt-5">
		<div class="mb-4">
			The requested page was not found
		</div>
		<div>
			<a
				v-if="!isLoggedIn"
				v-on:click="goToLoginPageClickHandler($event)"
				href="./app/login"
				class="btn btn-primary"
			>
				Go to the login page
			</a>
		</div>
	</div>
</template>
<script lang="ts">
	import Vue from 'vue';

	export default Vue.extend({
		methods: {
			goToLoginPageClickHandler(event: Event) {
				this.$root.router.changeRoute(event);
			},
		},
		computed: {
			isLoggedIn() {
				return this.$root.apiKey !== null;
			},
		},
	});
</script>
<style scoped></style>
