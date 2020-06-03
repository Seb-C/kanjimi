<template>
	<div class="row mt-5 page-request-reset-password">
		<div class="col-12 col-sm-10 col-md-8 col-xl-6 offset-sm-1 offset-md-2 offset-xl-3">
			<form
				class="form-row bg-primary-50 rounded pb-4 px-3 pb-sm-5 px-sm-5 my-5"
				v-on:submit="submit"
				novalidate
			>
				<RoundLogo title="Password reset" />

				<template v-if="done" class="col text-center">
					<div class="mb-4 text-success display-3 text-center w-100">
						<i class="far fa-check-circle"></i>
					</div>
					<div class="text-center">
						<p>If this account exists, an email has been sent with instructions to reset your Kanjimi password.</p>
						<p class="mt-3 mb-0">
							<small>
								You did not receive it?
								<a
									href="./app/request-reset-password"
									v-on:click="onClickTryAgain"
								>Try again</a>
							</small>
						</p>
					</div>
				</template>
				<template v-else>
					<div class="col-12">
						<input
							type="text"
							v-bind:class="{ 'form-control': true, 'is-invalid': !!errors.email }"
							name="email"
							placeholder="Email"
							title="Account email"
							v-model.trim="email"
							:disabled="loading"
						/>
						<div v-if="!!errors.email" class="invalid-feedback error-email d-block">
							{{ errors.email }}
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
								Reset my password
							</template>
						</button>
					</div>
				</template>
			</form>
		</div>
	</div>
</template>
<script lang="ts">
	import Vue from 'vue';
	import { requestResetPassword } from 'Common/Api/User';
	import ValidationError from 'Common/Api/Errors/Validation';
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
				errors: {},
				loading: false,
				done: false,
			};
		},
		methods: {
			onClickTryAgain(event: Event) {
				event.preventDefault();
				this.done = false;
			},
			async submit(event: Event) {
				event.preventDefault();
				this.loading = true;
				try {
					await requestResetPassword(this.email);
					this.done = true;
				} catch (error) {
					if (error instanceof ValidationError) {
						this.errors = error.getFormErrors();
					} else if (error instanceof ServerError) {
						console.error('Server error during the request reset password request. Response body: ', error.body);
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
