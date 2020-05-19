<template>
	<div class="page-settings">
		<form>
			<h1>Account settings</h1>

			<fieldset class="form-group row my-4">
				<div class="col-12 col-md-3 col-lg-2 col-form-label">
					<h2 class="h5 d-inline-block">
						Pronunciation
						<small>(Furiganas)</small>
					</h2>

					<component v-bind:is="romanReadingStatus" />
				</div>
				<div class="col pt-md-2">
					<label class="custom-control custom-switch">
						<input
							type="checkbox"
							class="custom-control-input"
							v-model="romanReading"
							v-on:change="changeRomanReading"
							v-bind:disabled="isFormDisabled"
						/>
						<span class="custom-control-label">Use roman characters for the pronunciation</span>
					</label>

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
					<LanguagesSelector
						v-model="languages"
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
	import { update as updateUser } from 'Common/Client/Routes/User';

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

				romanReadingStatus: <Vue.VueConstructor|null>null,
				languagesStatus: <Vue.VueConstructor|null>null,
			};
		},
		computed: {
			isFormDisabled() {
				return this.romanReadingStatus === SavingSpinner;
			},
			sampleFurigana() {
				return this.romanReading ? 'nihongo' : 'にほんご';
			},
		},
		methods: {
			async changeRomanReading(event: Event) {
				const checked: boolean = (<HTMLInputElement>event.target).checked;
				this.romanReadingStatus = SavingSpinner;
				const updatedUser = await updateUser(
					this.$root.apiKey.key,
					this.$root.user.id,
					{ romanReading: checked },
				);
				// TODO handle errors
				this.$root.setUser(updatedUser);
				this.romanReadingStatus = SavedSpinner;
				// TODO handle duplicate conflict with this time out
				setTimeout(() => this.romanReadingStatus = null, 3000);
				// TODO do the same for the languages
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
