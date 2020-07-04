<template>
	<div class="container flex-fill py-2">
		<div class="row mt-5 page-login">
			<div class="col-12 col-sm-10 col-md-8 col-xl-6 offset-sm-1 offset-md-2 offset-xl-3">
				<form
					class="form-row bg-primary-50 rounded pb-4 px-3 pb-sm-5 px-sm-5 my-5"
					v-on:submit="submit"
					novalidate
				>
					<RoundLogo title="Log in" />

					<div class="col-12">
						<div class="input-group">
							<div class="input-group-prepend bg-gray text-black">
								<div class="input-group-text bg-gray text-black">
									<i class="fas fa-at"></i>
								</div>
							</div>
							<input
								type="text"
								v-bind:class="{ 'form-control': true, 'is-invalid': !!errors.email }"
								name="email"
								placeholder="Email"
								title="Account email"
								v-model.trim="email"
								:disabled="loading"
							/>
						</div>
						<div v-if="!!errors.email" class="invalid-feedback error-email d-block">
							{{ errors.email }}
						</div>
					</div>

					<div class="col-12 mt-3">
						<div class="input-group">
							<div class="input-group-prepend bg-gray text-black">
								<div class="input-group-text bg-gray text-black">
									<i class="fas fa-key"></i>
								</div>
							</div>
							<input
								type="password"
								v-bind:class="{ 'form-control': true, 'is-invalid': !!errors.password }"
								name="password"
								placeholder="Password"
								title="Account password"
								v-model="password"
								:disabled="loading"
							/>
						</div>
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
								Login
							</template>
						</button>
					</div>

					<div class="col-12 mt-2 text-center">
						<a
							href="./app/request-reset-password"
							v-on:click="onClickRequestResetPasswordLink"
						>Forgot your password?</a>
						<span class="mx-2">·</span>
						<a
							href="./app/sign-up"
							v-on:click="onClickSignUpLink"
						>Sign Up for Kanjimi</a>
					</div>
				</form>
			</div>
		</div>
	</div>
</template>
<script lang="ts">
	import Vue from 'vue';
	import { create as createApiKey } from 'Common/Api/ApiKey';
	import ValidationError from 'Common/Api/Errors/Validation';
	import AuthenticationError from 'Common/Api/Errors/Authentication';
	import ServerError from 'Common/Api/Errors/Server';
	import RoundLogo from 'WebApp/Components/RoundLogo.vue';

	export default Vue.extend({
		created() {
			if (this.$root.apiKey !== null) {
				this.$root.router.changeRoute('./app');
			}
		},
		data() {
			return {
				email: '',
				password: '',
				errors: {},
				loading: false,
			};
		},
		methods: {
			onClickRequestResetPasswordLink(event: Event) {
				this.$root.router.changeRoute(event);
			},
			onClickSignUpLink(event: Event) {
				this.$root.router.changeRoute(event);
			},
			async submit(event: Event) {
				event.preventDefault();
				this.loading = true;
				try {
					const apiKey = await createApiKey({
						email: this.email,
						password: this.password,
					});
					await this.$root.setApiKey(apiKey);
					this.$root.router.changeRoute('./app');
				} catch (error) {
					if (error instanceof ValidationError) {
						this.errors = error.getFormErrors();
					} else if (error instanceof AuthenticationError) {
						this.errors = { bottom: error.error };
					} else if (error instanceof ServerError) {
						console.error('Server error during the login request. Response body: ', error.error);
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
<style scoped>
	.invalid-feedback {
		padding-left: 3.5em;
	}
</style>
