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
			<component v-bind:is="tabs[selectedTabIndex].component" v-bind:token="token" />
		</div>
	</div>
</template>
<script lang="ts">
	import Vue from 'vue';
	import Token from 'Common/Models/Token';
	import TokenType from 'Common/Types/TokenType';
	import Kanjis from 'Extension/Components/Kanjis.vue';
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
			tabs.push({ label: 'Kanjis', component: Kanjis });

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
		border-bottom: 1px solid var(--gray);
		height: auto;
	}

	.tabs .tab {
		position: relative;
		display: inline-block;
		border: 1px solid var(--gray);
		cursor: pointer;
		border-radius: 0.4em 0.4em 0 0;
		padding: 0.1em 0.6em;
		background: var(--light);
		z-index: 0;
	}

	.tabs .tab.active {
		font-weight: bold;
		background: var(--white-50);
		border-top: 3px solid var(--gray);
		border-right: 3px solid var(--dark);
		border-bottom: 1px solid var(--gray);
		border-left: 3px solid var(--gray);
		margin-left: -0.3em;
		margin-right: -0.3em;
		z-index: 1;
	}

	.tabs .tab.active:first-child {
		margin-left: 0;
	}

	.tab-content {
		position: relative;
		display: block;
		padding-top: 0.5em;
	}
</style>
