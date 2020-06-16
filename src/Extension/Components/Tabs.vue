<template>
	<div>
		<div class="tabs" role="tablist">
			<div
				v-for="(tab, tabIndex) in tabs"
				v-bind:class="{ 'tab': true, 'active': selectedTabIndex === tabIndex }"
				tabindex="0"
				v-on:click="onTabClick($event, tabIndex)"
				role="tab"
				aria-selected="selectedTabIndex === tabIndex"
			>
				{{ tab.label }}
			</div>
		</div>

		<div class="tab-content" role="tabpanel">
			<div class="tab-content-scrollable-area">
				<component
					v-bind:is="tabs[selectedTabIndex].component"
					v-bind="{ token, ...tabs[selectedTabIndex].props }"
				/>
			</div>
		</div>
	</div>
</template>
<script lang="ts">
	import Vue from 'vue';
	import Token from 'Common/Models/Token';
	import TokenType from 'Common/Types/TokenType';
	import CharType from 'Common/Types/CharType';
	import Kanji from 'Extension/Components/Kanji.vue';
	import Readings from 'Extension/Components/Readings.vue';
	import Conjugations from 'Extension/Components/Conjugations.vue';

	export default Vue.extend({
		props: {
			token: { type: Token },
		},
		data() {
			const tabs = [];
			tabs.push({ label: 'Definitions', component: Readings });
			if (this.token.type === TokenType.VERB) {
				tabs.push({ label: 'Conjugations', component: Conjugations });
			}

			this.token.text.split('').forEach((char: string) => {
				if (CharType.of(char) === CharType.KANJI) {
					tabs.push({
						label: char,
						component: Kanji,
						props: {
							kanji: char,
						},
					});
				}
			});

			return {
				tabs,
				selectedTabIndex: 0,
			};
		},
		methods: {
			onTabClick(event: Event, tabIndex: number) {
				this.selectedTabIndex = tabIndex;
			},
		},
	});
</script>
<style scoped>
	.tabs {
		display: block;
		position: relative;
		height: auto;
		z-index: 1;
		margin-top: -3px;
	}

	.tabs .tab {
		position: relative;
		display: inline-block;
		border: 0.075em solid var(--gray);
		border-bottom: 0;
		cursor: pointer;
		border-radius: 0.4em 0.4em 0 0;
		padding: 0.1em 0.6em;
		background: var(--white-50);
		z-index: 2;
	}

	.tabs .tab.active {
		font-weight: bold;
		background: var(--light);
		border-top: 0.15em solid var(--gray);
		border-right: 0.15em solid var(--dark);
		border-bottom: 0;
		border-left: 0.15em solid var(--gray);
		margin-left: -0.3em;
		margin-right: -0.3em;
		z-index: 3;
		padding-top: 0.4em;
		transform: translateY(0.1475em);
	}

	.tabs .tab.active:first-child {
		margin-left: 0;
	}

	.tab-content {
		z-index: 0;
		position: relative;
		display: block;
		height: calc(100% - 2em);
		background: var(--light);
		border: 0.15em solid var(--gray);
		border-radius: 0 0.3em 0.3em 0.3em;
	}

	.tab-content .tab-content-scrollable-area {
		display: block;
		padding: 0.5em;
		overflow-y: auto;
		height: 100%;
		box-sizing: border-box;
	}
</style>
