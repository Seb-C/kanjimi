<template>
	<div class="row mt-5 page-change-password">
		<div class="col-12 col-lg-10 col-xl-8 offset-lg-1 offset-xl-2">
			<form
				class="form-row bg-primary-50 rounded pb-4 px-3 pb-sm-5 px-sm-5 my-5"
				v-on:submit="submit"
				novalidate
			>
				<RoundLogo title="Change my password" />

				<template v-if="done" class="col text-center">
					<div class="mb-4 text-success display-3 text-center w-100">
						<i class="far fa-check-circle"></i>
					</div>
					<div class="text-center w-100">
						<p>Your password has successfully been changed.</p>
					</div>
				</template>
				<template v-else>
					<fieldset class="form-group row w-100 mx-0 mt-3 mb-0">
						<div class="col-12 col-md-5 col-lg-4 col-form-label">
							<h2 class="h5 d-inline-block">
								Current password
							</h2>
						</div>
						<div class="col pt-md-2">
							<input
								type="password"
								v-bind:class="{ 'form-control': true, 'mb-1': true, 'is-invalid': !!errors.oldPassword }"
								name="oldPassword"
								placeholder="Current password"
								title="Current password"
								v-model="oldPassword"
								:disabled="loading"
							/>

							<div v-if="!!errors.oldPassword" class="invalid-feedback error-oldPassword d-block">
								{{ errors.oldPassword }}
							</div>
						</div>
					</fieldset>

					<fieldset class="form-group row w-100 mx-0 mt-2 mb-3">
						<div class="col-12 col-md-5 col-lg-4 col-form-label">
							<h2 class="h5 d-inline-block">
								New password
							</h2>
						</div>
						<div class="col pt-md-2">
							<input
								type="password"
								v-bind:class="{ 'form-control': true, 'mb-1': true, 'is-invalid': !!errors.password }"
								name="password"
								placeholder="New password"
								title="New password"
								v-model="password"
								:disabled="loading"
							/>
							<input
								type="password"
								v-bind:class="{ 'form-control': true, 'is-invalid': !!errors.password}"
								name="passwordConfirmation"
								placeholder="New password (confirm)"
								title="New password (confirm)"
								v-model="passwordConfirmation"
								:disabled="loading"
							/>

							<div v-if="!!errors.password" class="invalid-feedback error-password d-block">
								{{ errors.password }}
							</div>
						</div>
					</fieldset>

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
</template>
<script lang="ts">
	import Vue from 'vue';
	import { update as updateUser } from 'Common/Api/User';
	import ValidationError from 'Common/Api/Errors/Validation';
	import AuthenticationError from 'Common/Api/Errors/Authentication';
	import NotFoundError from 'Common/Api/Errors/NotFound';
	import ServerError from 'Common/Api/Errors/Server';
	import RoundLogo from 'WebApp/Components/RoundLogo.vue';

	export default Vue.extend({
		async created() {
			if (this.$root.apiKey === null) {
				this.$root.router.changeRoute('./app/login');
			}
		},
		data() {
			return {
				oldPassword: '',
				password: '',
				passwordConfirmation: '',
				errors: {},
				loading: false,
				done: false,
			};
		},
		methods: {
			async submit(event: Event) {
				event.preventDefault();

				if (this.password !== this.passwordConfirmation) {
					this.errors = { password: 'The two passwords does not match' };
					return;
				}

				this.loading = true;
				try {
					const apiKey = <ApiKey>((<Store><any>this.$root).apiKey);
					await updateUser(apiKey.key, apiKey.userId, {
						oldPassword: this.oldPassword,
						password: this.password,
					});
					this.done = true;
				} catch (error) {
					if (error instanceof ValidationError) {
						this.errors = error.getFormErrors();
					} else if (error instanceof AuthenticationError) {
						this.errors = { bottom: error.error };
					} else if (error instanceof NotFoundError) {
						this.errors = { bottom: 'We were unable to find this account. Please try to refresh the page.' };
					} else if (error instanceof ServerError) {
						console.error('Server error during the change password request. Response body: ', error.body);
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
