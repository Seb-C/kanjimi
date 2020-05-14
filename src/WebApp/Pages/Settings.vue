<template>
	<div class="page-settings">
		<h1>Account settings</h1>

		<div class="row">
			<div class="col">
				<h2>Available languages</h2>
				<ul class="list-group">
					<li
						v-for="language in languages"
						:key="language"
						v-if="!isSelected(language)"
						class="list-group-item list-group-item-action"
					>
						{{ getLanguageTitle(language) }}
					</li>
				</ul>
			</div>
			<div class="col">
				<h2>Selected languages</h2>
				<ul class="list-group">
					<li
						v-for="language in languages"
						:key="language"
						v-if="isSelected(language)"
						class="list-group-item d-flex justify-content-between align-items-center"
					>
						{{ getLanguageTitle(language) }}
						<span
							v-if="isSelected(language)"
							class="badge badge-primary badge-pill"
						>
							{{ getBadge(language) }}
						</span>
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
				selectedLanguages: ['en'],
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
			getBadge(language: Language): boolean {
				const index = this.selectedLanguages.indexOf(language);
				if (index === 0) {
					return 'Main language';
				} else if (index === 1) {
					return 'Second language';
				} else if (index === 2) {
					return 'Third language';
				} else {
					return (index + 1).toString();
				}
			},
		},
	});
</script>
<style scoped>
	.list-group-item-action {
		cursor: pointer;
	}
</style>
