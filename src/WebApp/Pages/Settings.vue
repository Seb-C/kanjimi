<template>
	<div class="page-settings">
		<form>
			<h1>Account settings</h1>

			<fieldset class="form-group row my-4">
				<div class="col-12 col-md-3 col-lg-2 col-form-label">
					<h2 class="h5">
						Pronunciation
						<small>(Furiganas)</small>
					</h2>
				</div>
				<div class="col pt-md-2">
					<label class="custom-control custom-switch">
						<input type="checkbox" class="custom-control-input" v-model="romanReadings">
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
					<h3 class="h5 mb-3">Languages</h3>
				</div>
				<div class="col">
					<LanguagesSelector v-model="languages" />
				</div>
			</fieldset>
		</form>
	</div>
</template>
<script lang="ts">
	import Vue from 'vue';
	import LanguagesSelector from 'WebApp/Components/LanguagesSelector.vue';

	export default Vue.extend({
		created() {
			if (this.$root.apiKey === null) {
				this.$root.router.changeRoute('./app/login');
			}
		},
		data() {
			return {
				languages: [],
				romanReadings: false,
			};
		},
		computed: {
			sampleFurigana() {
				return this.romanReadings ? 'nihongo' : 'にほんご';
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
</style>
