<template>
	<div class="page-settings">
		<h1>Account settings</h1>

		<div class="row">
			<div class="col-12 order-2 order-sm-1 col-sm-6 col-md-5 col-lg-4">
				<ul class="list-group">
					<li class="list-group-item bg-light">
						<h2 class="h5 m-0">Available languages</h2>
					</li>
					<li
						v-for="language in languages"
						v-if="!isSelected(language)"
						class="list-group-item list-group-item-action"
						v-on:click="selectLanguage(language)"
					>
						{{ getLanguageTitle(language) }}
					</li>
				</ul>
			</div>
			<div class="col-12 order-1 order-sm-2 col-sm-6 col-md-5 col-lg-4">
				<ul class="list-group">
					<li class="list-group-item bg-light">
						<h2 class="h5 m-0">Selected languages</h2>
					</li>
					<li
						v-for="language in selectedLanguages"
						class="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
						v-on:click="unselectLanguage(language)"
					>
						{{ getLanguageTitle(language) }}
						<span
							v-if="isMainLanguage(language)"
							class="badge badge-secondary badge-pill"
						>
							Main Language
						</span>
					</li>
					<li
						v-if="selectedLanguages.length === 0"
						class="list-group-item list-group-item-light"
					>
						Please select at least one language
					</li>
				</ul>
			</div>
		</div>
	</div>
</template>
<script lang="ts">
	import Vue from 'vue';
	import Language from 'Common/Types/Language';
	import LanguageTranslation from 'Common/Translation/Language';

	export default Vue.extend({
		created() {
			if (this.$root.apiKey === null) {
				this.$root.router.changeRoute('./app/login');
			}
		},
		data() {
			return {
				languages: Language.LIST,
				selectedLanguages: <Language[]>Vue.observable([]),
			};
		},
		methods: {
			getLanguageTitle(language: Language): string {
				return `
					${Language.toUnicodeFlag(language)}
					${LanguageTranslation[language]}
				`;
			},
			isSelected(language: Language): boolean {
				return this.selectedLanguages.includes(language);
			},
			isMainLanguage(language: Language): boolean {
				return this.selectedLanguages[0] === language;
			},
			selectLanguage(language: Language) {
				this.selectedLanguages.push(language);
			},
			unselectLanguage(language: Language) {
				this.selectedLanguages = this.selectedLanguages.filter(
					(selectedLanguage: Language) => selectedLanguage !== language
				);
			},
		},
	});
</script>
<style scoped>
	.list-group-item-action {
		cursor: pointer;
	}
</style>
