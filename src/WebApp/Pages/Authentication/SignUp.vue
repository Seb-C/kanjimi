<template>
	<div class="container flex-fill py-2">
		<div class="row mt-5 page-sign-up">
			<div v-if="created" class="col text-center">
				<div class="mb-4 text-success display-3">
					<i class="far fa-check-circle"></i>
				</div>
				<div class="mb-4">
					<p>Your account has been successfully created.</p>
					<p>We have sent an email to <mark>{{ email }}</mark> containing a confirmation link.</p>
					<p>You will need to click on it before being able to log-in to your account.</p>
				</div>
			</div>
			<div
				v-else
				class="col-12 col-xl-8 offset-xl-2 bg-primary rounded pb-4 px-3 pb-sm-5 px-sm-5 my-5"
			>
				<form v-on:submit="submit" novalidate>
					<RoundLogo title="Sign Up" />

					<fieldset class="form-group row my-4">
						<div class="col-12 col-md-3">
							<h2 class="h5 d-inline-block">
								Email
							</h2>
						</div>
						<div class="col">
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
					</fieldset>

					<fieldset class="form-group row my-4">
						<div class="col-12 col-md-3">
							<h2 class="h5 d-inline-block">
								Password
							</h2>
						</div>
						<div class="col">
							<div class="input-group mb-1">
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

							<div class="input-group">
								<div class="input-group-prepend bg-gray text-black">
									<div class="input-group-text bg-gray text-black">
										<i class="fas fa-redo"></i>
									</div>
								</div>
								<input
									type="password"
									v-bind:class="{ 'form-control': true, 'is-invalid': !!errors.password}"
									name="passwordConfirmation"
									placeholder="Password (confirm)"
									title="Account password (confirm)"
									v-model="passwordConfirmation"
									:disabled="loading"
								/>
							</div>

							<div v-if="!!errors.password" class="invalid-feedback error-password">
								{{ errors.password}}
							</div>
						</div>
					</fieldset>

					<fieldset class="form-group row my-4">
						<div class="col-12 col-md-3">
							<h2 class="h5 d-inline-block">
								Pronunciation
								<small>(Furiganas)</small>
							</h2>
						</div>
						<div class="col">
							<label class="custom-control custom-switch roman-reading-switch">
								<input
									type="checkbox"
									v-bind:class="{
										'custom-control-input': true,
										'is-invalid': !!errors.romanReading,
									}"
									v-model="romanReading"
									:disabled="loading"
								/>
								<span class="custom-control-label">Use roman characters for the pronunciation</span>
							</label>

							<div v-if="!!errors.romanReading" class="invalid-feedback error-romanReading d-block pl-4 ml-3 mb-2">
								{{ errors.romanReading }}
							</div>

							<FuriganaSample v-bind:hasRomanReading="romanReading" />
						</div>
					</fieldset>

					<fieldset class="form-group row my-4">
						<div class="col-12 col-md-3">
							<h2 class="h5 d-inline-block">
								Current level
								<small>(JLPT)</small>
							</h2>
						</div>
						<div class="col">
							<div class="mb-2">
								<JlptLevelSelector
									v-model="jlpt"
									:disabled="loading"
								/>
							</div>

							<div v-if="!!errors.jlpt" class="invalid-feedback error-jlpt d-block mb-2">
								{{ errors.jlpt }}
							</div>

							<div>
								<small>
									This will be used to hide the readings and translations for the words of this level.
									(you can still show it whenever you need)
								</small>
							</div>
						</div>
					</fieldset>

					<fieldset class="form-group row my-4">
						<div class="col-12 col-md-3">
							<h3 class="h5 mb-3 d-inline-block">Languages</h3>
						</div>
						<div class="col">
							<div v-if="!!errors.languages" class="invalid-feedback error-languages d-block mb-2 pl-0">
								{{ errors.languages }}
							</div>

							<LanguagesSelector
								v-model="languages"
								:disabled="loading"
							/>
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
								Sign Up
							</template>
						</button>
					</div>
				</form>
			</div>
		</div>
	</div>
</template>
<script lang="ts">
	import Vue from 'vue';
	import { create as createUser } from 'Common/Api/User';
	import ValidationError from 'Common/Api/Errors/Validation';
	import ConflictError from 'Common/Api/Errors/Conflict';
	import ServerError from 'Common/Api/Errors/Server';
	import LanguagesSelector from 'WebApp/Components/LanguagesSelector.vue';
	import FuriganaSample from 'WebApp/Components/FuriganaSample.vue';
	import JlptLevelSelector from 'WebApp/Components/JlptLevelSelector.vue';
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
				passwordConfirmation: '',
				languages: [],
				romanReading: false,
				jlpt: null,

				errors: {},

				loading: false,
				created: false,
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
					const user = await createUser({
						email: this.email,
						password: this.password,
						languages: this.languages,
						romanReading: this.romanReading,
						jlpt: this.jlpt,
					});
					this.created = true;
				} catch (error) {
					if (error instanceof ValidationError) {
						this.errors = error.getFormErrors();
					} else if (error instanceof ConflictError) {
						this.errors = { bottom: error.error };
					} else if (error instanceof ServerError) {
						console.error('Server error during the user creation request. Response body: ', error.error);
						this.errors = { bottom: 'Sorry, there have been an error. Please try again in a little while.' };
					} else {
						throw error;
					}
				} finally {
					this.loading = false;
				}
			},
		},
		components: {
			LanguagesSelector,
			FuriganaSample,
			JlptLevelSelector,
			RoundLogo,
		},
	});
</script>
<style scoped>
	.invalid-feedback {
		display: block;
		padding-left: 3.5em;
	}

	.page-sign-up >>> .kanjimi-furigana-sample {
		background: var(--white);
		border-color: var(--dark) !important;
	}

	.page-sign-up >>> .roman-reading-switch .custom-control-label::before {
		background: var(--white);
	}
	.page-sign-up >>> .custom-control-input:checked ~ .custom-control-label::before {
		background: var(--secondary);
	}

	.page-sign-up >>> input {
		background: var(--white);
	}

	.page-sign-up >>> .jlpt-level-selector .radio-container::before {
		background: var(--white);
	}

	.page-sign-up >>> .languages-selector .list-group-item {
		background: var(--white);
	}
	.page-sign-up >>> .languages-selector .list-group > .list-group-item:first-child {
		background: var(--light-50) !important;
	}
</style>
