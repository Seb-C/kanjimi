<template>
	<div class="page-settings">
		<h1>Account settings</h1>

		<div class="row">
			<div class="col-12 order-2 order-sm-1 col-sm-6 col-md-5 col-lg-4">
				<ul class="list-group">
					<li class="list-group-item bg-light">
						<h2 class="h5 m-0">Available languages</h2>
					</li>
					<template v-for="language in languages">
						<li
							v-if="!isSelected(language)"
							v-bind:class="{
								'list-group-item': true,
								'list-group-item-action': true,
								'active': draggingLanguage === language,
							}"
							v-on:click="selectLanguage(language)"
							draggable="true"
							v-on:dragstart="languageDragStart(language, $event)"
							v-on:dragend="languageDragEnd(language, $event)"
							v-on:dragover="languageDragOver(language, $event)"
							v-on:dragenter="languageDragEnter(language, $event)"
							v-on:drop="drop(language, $event)"
						>
							{{ getLanguageTitle(language) }}
						</li>
					</template>
				</ul>
			</div>
			<div class="col-12 order-1 order-sm-2 col-sm-6 col-md-5 col-lg-4">
				<ul class="list-group">
					<li class="list-group-item bg-light">
						<h2 class="h5 m-0">Selected languages</h2>
					</li>
					<li
						v-if="showDropShadow(null)"
						class="list-group-item list-group-item-light"
						v-on:dragover="dropShadowDragOver($event)"
						v-on:dragenter="dropShadowDragEnter($event)"
						v-on:drop="drop(null, $event)"
					>&nbsp;</li>
					<template v-for="language in selectedLanguages">
						<li
							v-bind:class="{
								'list-group-item': true,
								'list-group-item-action': true,
								'd-flex': true,
								'justify-content-between': true,
								'align-items-center': true,
								'active': draggingLanguage === language,
							}"
							v-on:click="unselectLanguage(language)"
							draggable="true"
							v-on:dragstart="languageDragStart(language, $event)"
							v-on:dragend="languageDragEnd(language, $event)"
							v-on:dragover="languageDragOver(language, $event)"
							v-on:dragenter="languageDragEnter(language, $event)"
							v-on:drop="drop(language, $event)"
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
							v-if="showDropShadow(language)"
							class="list-group-item list-group-item-light"
							v-on:dragover="dropShadowDragOver($event)"
							v-on:dragenter="dropShadowDragEnter($event)"
							v-on:drop="drop(null, $event)"
						>&nbsp;</li>
					</template>
					<li
						v-if="selectedLanguages.length === 0"
						v-bind:class="{
							'list-group-item': true,
							'list-group-item-light': true,
						}"
						draggable="false"
						v-on:dragover="languageDragOver(null, $event)"
						v-on:dragenter="languageDragEnter(null, $event)"
						v-on:drop="drop(null, $event)"
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
				draggingLanguage: <Language|null>null,
				hasDropShadow: false,
				dropShadowAfterLanguage: <Language|null>null,
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
			showDropShadow(language: Language|null): boolean {
				return (
					this.hasDropShadow
					&& this.dropShadowAfterLanguage === language
					&& !(this.selectedLanguages.length === 0 && language === null)
				);
			},
			isValidDropTarget(language: Language|null, event: DragEvent) {
				return (
					this.draggingLanguage !== null
					&& language !== this.draggingLanguage
				);
			},
			languageDragStart(language: Language, event: DragEvent) {
				this.draggingLanguage = language;
			},
			languageDragEnd(language: Language, event: DragEvent) {
				this.draggingLanguage = null;
				this.hasDropShadow = false;
				this.dropShadowAfterLanguage = null;
			},
			dropShadowDragEnter(event: DragEvent) {
				event.preventDefault();
			},
			dropShadowDragOver(event: DragEvent) {
				event.preventDefault();
			},
			languageDragOver(language: Language|null, event: DragEvent) {
				if (this.isValidDropTarget(language, event)) {
					event.preventDefault();
					this.hasDropShadow = true;
					this.dropShadowAfterLanguage = language;

					// Should be placed before
					if ((<any>event).layerY < ((<HTMLElement>event.target).offsetHeight / 2)) {
						const selectedIndex = this.selectedLanguages.indexOf(language);
						if (selectedIndex < 0) {
							this.hasDropShadow = false;
							this.dropShadowAfterLanguage = null;
						} else if (selectedIndex === 0) {
							this.dropShadowAfterLanguage = null;
						} else {
							this.dropShadowAfterLanguage = this.selectedLanguages[selectedIndex - 1];
						}
					}
				}
			},
			languageDragEnter(language: Language|null, event: DragEvent) {
				if (this.isValidDropTarget(language, event)) {
					event.preventDefault();
				}
			},
			drop(language: Language|null, event: DragEvent) {
				if (
					!this.hasDropShadow
					&& this.dropShadowAfterLanguage === null
					&& this.isSelected(this.draggingLanguage)
				) {
					this.unselectLanguage(this.draggingLanguage);
				} else if (this.dropShadowAfterLanguage === null) {
					this.selectedLanguages.unshift(this.draggingLanguage);
				} else if (this.isSelected(this.dropShadowAfterLanguage)) {
					const targetLanguageIndex = this.selectedLanguages.indexOf(this.dropShadowAfterLanguage);
					this.selectedLanguages = [
						...this.selectedLanguages.slice(0, targetLanguageIndex + 1),
						this.draggingLanguage,
						...this.selectedLanguages.slice(targetLanguageIndex + 1),
					];
				} else {
					this.unselectLanguage(this.draggingLanguage);
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
