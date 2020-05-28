<template>
	<div
		v-bind:class="{
			'row': true,
			'jlpt-level-selector': true,
			'disabled': disabled,
		}"
	>
		<label
			v-for="level in jlptLevels"
			class="col-2 mx-0 px-0 text-center option-container"
			v-on:mousemove="mouseMoveLabel"
		>
			<div class="label1 px-1 text-nowrap">{{ level.label1 }}</div>
			<div class="radio-container text-center my-1">
				<input
					type="radio"
					v-bind:value="level.value"
					v-model="selectedValue"
					v-on:change="debouncedOnChange"
					v-bind:disabled="disabled"
				/>
				<span class="radio-replacement">
					<i v-bind:class="'icon ' + level.icon"></i>
				</span>
			</div>
			<div class="label2 px-1 text-nowrap">{{ level.label2 }}</div>
		</label>
	</div>
</template>
<script lang="ts">
	import Vue from 'vue';
	import { debounce } from 'ts-debounce';

	type JlptLevelOption = {
		value: number|null,
		label1: string,
		label2: string,
		icon: string,
	};

	export default Vue.extend({
		props: {
			value: { type: Number as () => number|null },
			disabled: { type: Boolean },
		},
		data() {
			return {
				selectedValue: this.value,

				jlptLevels: <JlptLevelOption[]>[
					{ value: null, label1: 'I don\'t know', label2: '', icon: 'fas fa-dizzy' },
					{ value: 5, label1: '5', label2: 'Beginner', icon: 'fas fa-surprise' },
					{ value: 4, label1: '4', label2: '', icon: 'fas fa-grin-stars' },
					{ value: 3, label1: '3', label2: 'Intermediate', icon: 'fas fa-smile' },
					{ value: 2, label1: '2', label2: '', icon: 'fas fa-grin-alt' },
					{ value: 1, label1: '1', label2: 'Expert', icon: 'fas fa-laugh-beam' },
				],

				debouncedOnChange: debounce(() => {
					this.$emit('input', (<any>this).selectedValue);
					this.$emit('change');
				}, 500),
			};
		},
		methods: {
			mouseMoveLabel(event: MouseEvent) {
				if (event.buttons > 0 && !this.disabled) {
					(<HTMLElement>event.target).click();
				}
			},
		},
	});
</script>
<style scoped>
	.jlpt-level-selector {
		user-select: none;
		margin-left: 0;
		margin-right: 0;
	}
	.jlpt-level-selector .option-container:focus-within {
		outline: 1px dotted var(--black);
	}
	.jlpt-level-selector .radio-container {
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
	}
	.jlpt-level-selector.disabled .radio-container {
		cursor: not-allowed;
	}
	.jlpt-level-selector .radio-container input {
		position: absolute;
		opacity: 0;
	}
	.jlpt-level-selector .radio-container .radio-replacement {
		position: relative;
		display: block;
		width: 32px;
		height: 32px;
		margin: auto;
	}
	.jlpt-level-selector .radio-container .radio-replacement .icon {
		display: none;
	}
	.jlpt-level-selector .radio-container input:checked ~ .radio-replacement {
		display: flex;
		align-items: center;
		justify-content: center;
		background: var(--secondary);
		border-radius: 50%;
	}
	.jlpt-level-selector .radio-container input:checked ~ .radio-replacement .icon {
		position: relative;
		display: block;
		font-size: 28px;
		color: var(--primary);
	}

	.jlpt-level-selector.disabled .radio-container input:checked ~ .radio-replacement {
		background: var(--black);
	}
	.jlpt-level-selector.disabled .radio-container input:checked ~ .radio-replacement .icon {
		color: var(--gray);
	}

	.jlpt-level-selector .radio-container::before {
		content: "";
		position: absolute;
		background: var(--gray);
		top: 25%;
		bottom: 25%;
		left: 0;
		right: 0;
	}
	.jlpt-level-selector label:first-child .radio-container::before {
		border-radius: 0.5em 0 0 0.5em;
		left: calc(50% - 0.5em);
	}
	.jlpt-level-selector label:last-child .radio-container::before {
		border-radius: 0 0.5em 0.5em 0;
		right: calc(50% - 0.5em);
	}

	.label1, .label2 {
		font-size: 0.9em;
	}
	@media (min-width: 576px) { /* --breakpoint-sm */
		.label1, .label2 {
			font-size: inherit;
		}
	}
</style>
