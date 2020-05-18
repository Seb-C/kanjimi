<template>
	<div class="row">
		<div class="col-12 order-2 order-sm-1 col-sm-6 col-md-5 col-lg-4">
			<ul v-bind:class="{
				'list-group': true,
				'empty-list': availableLanguages.length === 0,
			}">
				<li class="list-group-item bg-light">
					<h2 class="h5 m-0">Available dictionaries</h2>
				</li>
				<DragAndDropContainer
					@drop="onAvailableListDrop"
					group-name="languages"
					:get-child-payload="getAvailableListPayload"
				>
					<DragAndDropItem
						v-for="language in availableLanguages"
						:key="language"
					>
						<li
							v-bind:class="{
								'list-group-item': true,
								'list-group-item-action': true,
							}"
							@click="selectLanguage(language)"
							role="switch"
							aria-checked="false"
						>
							<span>
								{{ getLanguageName(language) }}
								<small>({{ getLanguageInfo(language) }})</small>
							</span>
						</li>
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
					<h2 class="h5 m-0">Selected dictionaries</h2>
				</li>
				<DragAndDropContainer
					@drop="onSelectedListDrop"
					group-name="languages"
					:get-child-payload="getSelectedListPayload"
				>
					<DragAndDropItem
						v-for="language in selectedLanguages"
						:key="language"
					>
						<li
							v-bind:class="{
								'list-group-item': true,
								'list-group-item-action': true,
								'd-flex': true,
								'justify-content-between': true,
								'align-items-center': true,
							}"
							v-on:click="unselectLanguage(language)"
							role="switch"
							aria-checked="true"
						>
							<span>
								{{ getLanguageName(language) }}
								<small>({{ getLanguageInfo(language) }})</small>
							</span>

							<span
								v-if="isMainLanguage(language)"
								class="badge badge-secondary badge-pill"
							>
								Main Language
							</span>
						</li>
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
		props: {
			value: { type: Array as () => Language[] },
		},
		data() {
			return {
				availableLanguages: Language.LIST.filter(
					(language: Language) => !this.value.includes(language),
				),
				selectedLanguages: Vue.observable(this.value),
			};
		},
		methods: {
			getLanguageName(language: Language): string {
				return `
					${Language.toUnicodeFlag(language)}
					${LanguageTranslation.name[language]}
				`;
			},
			getLanguageInfo(language: Language): string {
				return LanguageTranslation.entries[language];
			},
			isMainLanguage(language: Language): boolean {
				return this.selectedLanguages[0] === language;
			},
			selectLanguage(language: Language) {
				this.selectedLanguages.push(language);
				this.availableLanguages = this.availableLanguages.filter((l: Language) => l !== language);
				this.$emit('input', this.selectedLanguages);
			},
			unselectLanguage(language: Language) {
				this.selectedLanguages = this.selectedLanguages.filter((l: Language) => l !== language);
				this.availableLanguages.push(language);
				this.$emit('input', this.selectedLanguages);
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

				this.$emit('input', this.selectedLanguages);
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
