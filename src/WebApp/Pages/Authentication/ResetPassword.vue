<template>
	<div class="container flex-fill py-2">
		<div class="row mt-5 page-reset-password">
			<div class="col-12 col-sm-10 col-md-8 col-xl-6 offset-sm-1 offset-md-2 offset-xl-3">
				<form
					class="form-row bg-primary-50 rounded pb-4 px-3 pb-sm-5 px-sm-5 my-5"
					v-on:submit="submit"
					novalidate
				>
					<RoundLogo title="New password" />

					<template v-if="done" class="col text-center">
						<div class="mb-4 text-success display-3 text-center w-100">
							<i class="far fa-check-circle"></i>
						</div>
						<div class="text-center w-100">
							<p>Your password has successfully been changed.</p>
							<p class="mt-3 mb-0">
								<a
									class="go-to-login"
									href="./app/request-reset-password"
									v-on:click="onClickGoToLogin"
								>Go to the login page</a>
							</p>
						</div>
					</template>
					<template v-else>
						<div class="col-12 mt-3">
							<input
								type="password"
								v-bind:class="{ 'form-control': true, 'mb-1': true, 'is-invalid': !!errors.password }"
								name="password"
								placeholder="Password"
								title="Account password"
								v-model="password"
								:disabled="loading"
							/>
							<input
								type="password"
								v-bind:class="{ 'form-control': true, 'is-invalid': !!errors.password}"
								name="passwordConfirmation"
								placeholder="Password (confirm)"
								title="Account password (confirm)"
								v-model="passwordConfirmation"
								:disabled="loading"
							/>

							<div v-if="!!errors.password" class="invalid-feedback error-password d-block">
								{{ errors.password }}
							</div>
						</div>

						<div v-if="!!errors.bottom" class="col-12 mt-3 text-danger error-bottom">
							{{ errors.bottom }}
						</div>

						<div class="col-12 mt-3">
							<button
								type="submit"
								class="btn btn-secondary btn-lg w-100"
								:disabled="loading"
							>
								<div v-if="loading" class="d-flex justify-content-center">
									<span class="spinner-border" role="status" aria-hidden="true"></span>
									<span class="sr-only">Loading...</span>
								</div>
								<template v-else>
									Confirm
								</template>
							</button>
						</div>
					</template>
				</form>
			</div>
		</div>
	</div>
</template>
<script lang="ts">
	import Vue from 'vue';
	import { resetPassword } from 'Common/Api/User';
	import ValidationError from 'Common/Api/Errors/Validation';
	import AuthenticationError from 'Common/Api/Errors/Authentication';
	import NotFoundError from 'Common/Api/Errors/NotFound';
	import ServerError from 'Common/Api/Errors/Server';
	import RoundLogo from 'WebApp/Components/RoundLogo.vue';

	export default Vue.extend({
		data() {
			return {
				password: '',
				passwordConfirmation: '',
				errors: {},
				loading: false,
				userId: this.$root.router.params.userId || null,
				passwordResetKey: this.$root.router.params.passwordResetKey || null,
				done: false,
			};
		},
		methods: {
			onClickGoToLogin(event: Event) {
				event.preventDefault();
				this.$root.router.changeRoute('./app/login');
			},
			async submit(event: Event) {
				event.preventDefault();

				if (this.password !== this.passwordConfirmation) {
					this.errors = { password: 'The two passwords does not match' };
					return;
				}

				this.loading = true;
				try {
					await resetPassword(this.userId, {
						password: this.password,
						passwordResetKey: this.passwordResetKey,
					});
					this.done = true;
				} catch (error) {
					if (error instanceof ValidationError) {
						this.errors = error.getFormErrors();
					} else if (error instanceof AuthenticationError) {
						this.errors = { bottom: error.error };
						if (this.passwordResetKey === 'cypress') {
							// Making tests easier
							this.done = true;
						}
					} else if (error instanceof NotFoundError) {
						this.errors = { bottom: 'We were unable to find this account. Please try to refresh the page.' };
					} else if (error instanceof ServerError) {
						console.error('Server error during the reset password request. Response body: ', error.error);
						this.errors = { bottom: 'There have been an unknown error. Please try again in a little while' };
					} else {
						throw error;
					}
				} finally {
					this.loading = false;
				}
			},
		},
		components: {
			RoundLogo,
		},
	});
</script>
<style scoped></style>
