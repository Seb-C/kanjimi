<template>
	<div class="page-verify-email text-center mt-5">
		<template v-if="loading">
			<div class="spinner-border mb-4" role="status"></div>
			<div>
				Please wait while we check your data...
			</div>
		</template>
		<template v-else-if="error !== null">
			<div class="mb-4 text-danger display-3">
				<i class="far fa-times-circle"></i>
			</div>
			<div class="mb-4">
				<p>Sorry, we could not verify your account</p>
				<p>{{ error }}</p>
			</div>
		</template>
		<template v-else>
			<div class="mb-4 text-success display-3">
				<i class="far fa-check-circle"></i>
			</div>
			<div class="mb-4">
				<p>Your email have been successfully validated.</p>
				<p>You can now use your account.</p>
			</div>
			<div>
				<a
					v-on:click="goToLoginPageClickHandler($event)"
					href="./app/login"
					class="btn btn-primary go-to-login"
				>
					Click here to go to the login page
				</a>
			</div>
		</template>
	</div>
</template>
<script lang="ts">
	import Vue from 'vue';
	import { verifyEmail } from 'Common/Api/User';
	import ValidationError from 'Common/Api/Errors/Validation';
	import AuthenticationError from 'Common/Api/Errors/Authentication';
	import NotFoundError from 'Common/Api/Errors/NotFound';
	import ConflictError from 'Common/Api/Errors/Conflict';
	import ServerError from 'Common/Api/Errors/Server';

	export default Vue.extend({
		data() {
			const query = new URLSearchParams(window.location.search);

			return {
				loading: true,
				error: <string|null>null,
				userId: query.get('userId'),
				emailVerificationKey: query.get('emailVerificationKey'),
			};
		},
		async mounted() {
			try {
				await verifyEmail(this.userId, this.emailVerificationKey);
			} catch (error) {
				if (error instanceof ValidationError) {
					this.error = 'Sorry, this URL seems to be wrong';
				} else if (error instanceof AuthenticationError) {
					this.error = 'Sorry, this URL seems to be wrong';
				} else if (error instanceof NotFoundError) {
					this.error = 'The account associated to this link does not exist';
				} else if (error instanceof ConflictError) {
					this.error = null; // Show it as a success
				} else if (error instanceof ServerError) {
					console.error('Server error during the email verification. Response body: ', error.body);
					this.error = 'There have been an unknown error. Please try again in a little while';
				} else {
					throw error;
				}
			} finally {
				this.loading = false;
			}
		},
		methods: {
			goToLoginPageClickHandler(event: Event) {
				this.$root.router.changeRoute(event);
			},
		},
	});
</script>
<style scoped></style>
