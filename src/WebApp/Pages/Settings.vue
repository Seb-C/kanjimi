<template>
	<div class="page-settings">
		<form @submit="$event.preventDefault()">
			<h1>Account settings</h1>

			<div v-if="!!errors.top" class="invalid-feedback error-romanReading d-block">
				{{ errors.top }}
			</div>

			<fieldset class="form-group row my-4">
				<div class="col-12 col-md-3 col-lg-2 col-form-label">
					<h2 class="h5 d-inline-block">
						Pronunciation
						<small>(Furiganas)</small>
					</h2>

					<component v-bind:is="romanReadingStatus" />
				</div>
				<div class="col pt-md-2">
					<label class="custom-control custom-switch roman-reading-switch">
						<input
							type="checkbox"
							v-bind:class="{
								'custom-control-input': true,
								'is-invalid': !!errors.romanReading,
							}"
							v-model="romanReading"
							v-on:change="changeRomanReading"
							v-bind:disabled="isFormDisabled"
						/>
						<span class="custom-control-label">Use roman characters for the pronunciation</span>
					</label>

					<div v-if="!!errors.romanReading" class="invalid-feedback error-romanReading d-block pl-4 ml-3 mb-2">
						{{ errors.romanReading }}
					</div>

					<div class="row">
						<div class="col-3 col-sm-2 col-xl-1 align-self-center">
							Example:
						</div>
						<div class="col">
							<div class="furigana-sample border rounded p-1">
								<div class="furigana">{{ sampleFurigana }}</div>
								<div class="word">日本語</div>
								<div class="translation">Japanese</div>
							</div>
						</div>
					</div>
				</div>
			</fieldset>

			<fieldset class="form-group row my-4">
				<div class="col-12 col-md-3 col-lg-2 col-form-label">
					<h3 class="h5 mb-3 d-inline-block">Languages</h3>

					<component v-bind:is="languagesStatus" />
				</div>
				<div class="col">
					<div v-if="!!errors.languages" class="invalid-feedback error-romanReading d-block mb-2">
						{{ errors.languages }}
					</div>

					<LanguagesSelector
						v-model="languages"
						v-on:change="changeLanguages"
						v-bind:disabled="isFormDisabled"
					/>
				</div>
			</fieldset>
		</form>
	</div>
</template>
<script lang="ts">
	import Vue from 'vue';
	import Store from 'WebApp/Store';
	import LanguagesSelector from 'WebApp/Components/LanguagesSelector.vue';
	import SavingSpinner from 'WebApp/Components/Spinners/Saving.vue';
	import SavedSpinner from 'WebApp/Components/Spinners/Saved.vue';
	import FailedSpinner from 'WebApp/Components/Spinners/Failed.vue';
	import { update as updateUser } from 'Common/Client/Routes/User';
	import ApiKey from 'Common/Models/ApiKey';
	import ValidationError from 'Common/Client/Errors/Validation';
	import AuthenticationError from 'Common/Client/Errors/Authentication';
	import ServerError from 'Common/Client/Errors/Server';

	export default Vue.extend({
		created() {
			if (this.$root.apiKey === null) {
				this.$root.router.changeRoute('./app/login');
			}
		},
		data() {
			const user = (<Store><any>this.$root).user;
			return {
				romanReading: user?.romanReading || false,
				languages: user?.languages || [],
				isFormDisabled: false,

				romanReadingStatus: <Vue.VueConstructor|null>null,
				languagesStatus: <Vue.VueConstructor|null>null,

				errors: {
					top: null,
					romanReading: null,
					languages: null,
				},
			};
		},
		computed: {
			sampleFurigana() {
				return this.romanReading ? 'nihongo' : 'にほんご';
			},
		},
		methods: {
			async changeRomanReading(event: Event) {
				this.romanReadingStatus = SavingSpinner;
				this.errors.romanReading = null;
				await this.saveUserChanges();
				if (this.errors.romanReading === null) {
					this.romanReadingStatus = SavedSpinner;
				} else {
					this.romanReadingStatus = FailedSpinner;
				}
			},
			async changeLanguages(event: Event) {
				this.languagesStatus = SavingSpinner;
				this.errors.languages = null;
				await this.saveUserChanges();
				if (this.errors.languages === null) {
					this.languagesStatus = SavedSpinner;
				} else {
					this.languagesStatus = FailedSpinner;
				}
			},
			async saveUserChanges() {
				this.formDisabled = true;

				const apiKey = <ApiKey>((<Store><any>this.$root).apiKey);

				try {
					this.errors.top = null;

					const updatedUser = await updateUser(apiKey.key, apiKey.userId, {
						romanReading: this.romanReading,
						languages: this.languages,
					});

					this.$root.setUser(updatedUser);
				} catch (error) {
					if (error instanceof ValidationError) {
						this.errors = error.getFormErrors();
					} else if (error instanceof AuthenticationError) {
						this.errors = { top: error.error };
					} else if (error instanceof ServerError) {
						console.error('Server error during user settings change. Response body: ', error.body);
						this.errors = { top: 'There have been an unknown error. Please try again in a little while' };
					} else {
						throw error;
					}
				} finally {
					this.formDisabled = false;
				}
			},
		},
		components: {
			LanguagesSelector,
		},
	});
</script>
<style scoped>
	.furigana-sample {
		display: inline-block;
		font-size: 1.3em;
	}

	.furigana-sample .furigana {
		font-size: 0.5em;
		display: block;
		line-height: 150%;
		margin: 0 2px;
		text-align: center;
	}
	.furigana-sample .word {
		line-height: 1em;
		text-align: center;
		margin: 0 0 0.1em 0;
	}
	.furigana-sample .translation {
		font-size: 0.5em;
		display: block;
		line-height: 150%;
		margin: 0 2px;
		text-align: center;
	}

	input[disabled] ~ .custom-control-label {
		cursor: not-allowed;
	}
</style>
