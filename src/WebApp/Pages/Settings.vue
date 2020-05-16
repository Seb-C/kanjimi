<template>
	<div class="page-settings">
		<h1>Account settings</h1>

		<div class="row">
			<div class="col-12 order-2 order-sm-1 col-sm-6 col-md-5 col-lg-4">
				<ul class="list-group">
					<li class="list-group-item bg-light">
						<h2 class="h5 m-0">Available languages</h2>
					</li>
					<DragAndDropContainer @drop="onChoicesListDrop" :group-name="languages">
						<DragAndDropItem
							v-for="language in languages"
							:key="language"
							tag="li"
							v-if="!isSelected(language)"
							v-bind:class="{
								'list-group-item': true,
								'list-group-item-action': true,
							}"
							@click="selectLanguage(language)"
						>
							{{ getLanguageTitle(language) }}
						</DragAndDropItem>
					</DragAndDropContainer>
				</ul>
			</div>
			<div class="col-12 order-1 order-sm-2 col-sm-6 col-md-5 col-lg-4">
				<ul class="list-group">
					<li class="list-group-item bg-light">
						<h2 class="h5 m-0">Selected languages</h2>
					</li>
					<DragAndDropContainer @drop="onSelectedListDrop" :group-name="languages">
						<DragAndDropItem
							v-for="language in selectedLanguages"
							:key="language"
							tag="li"
							v-bind:class="{
								'list-group-item': true,
								'list-group-item-action': true,
								'd-flex': true,
								'justify-content-between': true,
								'align-items-center': true,
							}"
							v-on:click="unselectLanguage(language)"
						>
							{{ getLanguageTitle(language) }}
							<span
								v-if="isMainLanguage(language)"
								class="badge badge-secondary badge-pill"
							>
								Main Language
							</span>
						</DragAndDropItem>
						<li
							v-if="selectedLanguages.length === 0"
							v-bind:class="{
								'list-group-item': true,
								'list-group-item-light': true,
							}"
						>
							Please select at least one language
						</li>
					</DragAndDropContainer>
				</ul>
			</div>
		</div>
	</div>
</template>
<script lang="ts">
	import Vue from 'vue';
	import Language from 'Common/Types/Language';
	import LanguageTranslation from 'Common/Translation/Language';

	// @ts-ignore
	import {
		Container as DragAndDropContainer,
		Draggable as DragAndDropItem,
	} from 'vue-smooth-dnd';

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
				test: [],
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
			onChoicesListDrop(item: { removedIndex: number|null, addedIndex: number|null }) {
				console.log('choices', item);
			},
			onSelectedListDrop(item: { removedIndex: number|null, addedIndex: number|null }) {
				console.log('selected', item);
			},
		},
		components: {
			DragAndDropContainer,
			DragAndDropItem,
		},
	});
</script>
<style scoped>
	.list-group-item-action {
		cursor: pointer;
	}
</style>
