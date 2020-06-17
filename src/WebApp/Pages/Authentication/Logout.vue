<template>
	<div class="container flex-fill py-2">
		<div class="page-logout text-center mt-5">
			<div class="mb-4">
				You have successfully been disconnected
			</div>
			<div>
				<a
					v-on:click="goToLoginPageClickHandler($event)"
					href="./app/login"
					class="btn btn-primary go-to-login"
				>
					Click here to login again
				</a>
			</div>
		</div>
	</div>
</template>
<script lang="ts">
	import Vue from 'vue';

	export default Vue.extend({
		async created() {
			if (this.$root.apiKey === null) {
				this.$root.router.changeRoute('./app/login');
			}

			await this.$root.setApiKey(null);
		},
		methods: {
			goToLoginPageClickHandler(event: Event) {
				this.$root.router.changeRoute(event);
			},
		},
	});
</script>
<style scoped></style>
