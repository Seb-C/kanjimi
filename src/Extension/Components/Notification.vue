<template>
	<div>
		<div class="kanjimi notification">
			<img
				v-bind:src="iconUrl"
				title="Kanjimi"
				alt="Kanjimi"
				class="notification-icon"
			/>
			<div class="notification-text-container">
				<span class="notification-message">
					{{ message }}
				</span>
				<a
					v-if="link !== null"
					v-on:click="onClickLink"
					class="notification-link"
				>
					{{ link.text }}
				</a>
			</div>
		</div>
	</div>
</template>
<script lang="ts">
	import Vue from 'vue';

	export default Vue.extend({
		props: {
			message: { type: String },
			link: { type: Object as () => {
				text: string,
				onClick: Function,
			}},
		},
		data() {
			return {
				iconUrl: browser.runtime.getURL('/images/logo.svg'),
			};
		},
		methods: {
			onClickLink(event: Event) {
				event.preventDefault();
				this.link.onClick();
			},
		},
	});
</script>
<style scoped>
	.notification {
		position: fixed;
		top: 1em;
		width: 20em;
		max-width: 100vw;
		background: var(--dark);
		border: 1px solid var(--white);
		color: var(--white);
		font-family: sans-serif;
		text-align: center;
		left: 50vw;
		transform: translateX(-50%);
	}

	.notification-icon {
		display: block;
		float: left;
		width: 1.5em;
		height: 1.5em;
		margin: 0.3em 0.5em 0.3em 0.3em;
		padding: 0.2em;
		border-radius: 0.2em;
		background: var(--white);
	}

	.notification-text-container {
		display: block;
		margin: 0.3em;
	}

	.notification-message {
		display: block;
	}

	.notification-link {
		display: block;
		text-decoration: underline;
		color: var(--primary);
		cursor: pointer;
	}
</style>
