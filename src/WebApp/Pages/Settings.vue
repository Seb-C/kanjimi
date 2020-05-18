<template>
	<div class="page-settings">
		<h1>Account settings</h1>

		<div class="row">
			<div class="col-12 order-2 order-sm-1 col-sm-6 col-md-5 col-lg-4">
				<ul v-bind:class="{
					'list-group': true,
					'empty-list': availableLanguages.length === 0,
				}">
					<li class="list-group-item bg-light">
						<h2 class="h5 m-0">Available languages</h2>
					</li>
					<DragAndDropContainer @drop="onAvailableListDrop" group-name="languages" :get-child-payload="getAvailableListPayload">
						<DragAndDropItem
							v-for="language in availableLanguages"
							:key="language"
							tag="li"
							v-bind:class="{
								'list-group-item': true,
								'list-group-item-action': true,
							}"
							@click="selectLanguage(language)"
						>
							{{ getLanguageTitle(language) }}
						</DragAndDropItem>
						<li
							v-if="availableLanguages.length === 0"
							v-bind:class="{
								'list-group-item': true,
								'list-group-item-light': true,
							}"
						>
							No other language available
						</li>
					</DragAndDropContainer>
				</ul>
			</div>
			<div class="col-12 order-1 order-sm-2 col-sm-6 col-md-5 col-lg-4">
				<ul v-bind:class="{
					'list-group': true,
					'empty-list': selectedLanguages.length === 0,
				}">
					<li class="list-group-item bg-light">
						<h2 class="h5 m-0">Selected languages</h2>
					</li>
					<DragAndDropContainer @drop="onSelectedListDrop" group-name="languages" :get-child-payload="getSelectedListPayload">
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

	import {
		Container as DragAndDropContainer,
		Draggable as DragAndDropItem,
		// @ts-ignore
	} from 'vue-smooth-dnd';

	type DropData = {
		removedIndex: number|null,
		addedIndex: number|null,
		payload: Language,
	};

	export default Vue.extend({
		created() {
			if (this.$root.apiKey === null) {
				this.$root.router.changeRoute('./app/login');
			}
		},
		data() {
			return {
				availableLanguages: Language.LIST,
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
			isMainLanguage(language: Language): boolean {
				return this.selectedLanguages[0] === language;
			},
			selectLanguage(language: Language) {
				this.selectedLanguages.push(language);
				this.availableLanguages = this.availableLanguages.filter((l: Language) => l !== language);
			},
			unselectLanguage(language: Language) {
				this.selectedLanguages = this.selectedLanguages.filter((l: Language) => l !== language);
				this.availableLanguages.push(language);
			},
			getAvailableListPayload(index: number): Language {
				return this.availableLanguages[index];
			},
			getSelectedListPayload(index: number): Language {
				return this.selectedLanguages[index];
			},
			onAvailableListDrop({ removedIndex, addedIndex, payload: language }: DropData) {
				if (removedIndex !== null) {
					this.availableLanguages.splice(removedIndex, 1);
				}

				if (addedIndex !== null) {
					this.availableLanguages.splice(addedIndex, 0, language);
				}
			},
			onSelectedListDrop({ removedIndex, addedIndex, payload: language }: DropData) {
				if (removedIndex !== null) {
					this.selectedLanguages.splice(removedIndex, 1);
				}

				if (addedIndex !== null) {
					this.selectedLanguages.splice(addedIndex, 0, language);
				}
			},
		},
		components: {
			DragAndDropContainer,
			DragAndDropItem,
		},
	});
</script>
<style scoped>
	.list-group {
		min-height: 100%;
	}

	.list-group-item-action {
		cursor: pointer;
	}

	.empty-list .list-group-item:last-child {
		transform: none !important;
	}

	@media (min-width: 576px) { /* --breakpoint-sm */
		.list-group .smooth-dnd-container {
			height: 20em;
			overflow-y: auto;
		}
	}
</style>
