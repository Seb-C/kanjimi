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
			<div
				class="notification-close-button"
				v-on:click="onClickCloseButton"
			/>
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
			onClickCloseButton(event: Event) {
				event.preventDefault();
				this.$root.setNotification(null);
			},
		},
	});
</script>
<style scoped>
	.notification {
		position: fixed;
		top: 1em;
		width: 25em;
		max-width: 100vw;
		background: var(--dark);
		border: 1px solid var(--white);
		font-family: sans-serif;
		text-align: center;
		left: 50vw;
		transform: translateX(-50%);
		z-index: 999999;
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

	.notification .notification-text-container {
		display: block;
		margin: 0.3em;
	}

	.notification-message {
		color: var(--white);
		display: block;
	}

	.notification-link {
		display: block;
		text-decoration: underline;
		color: var(--primary);
		cursor: pointer;
	}

	.notification-close-button {
		cursor: pointer;
		position: absolute;
		top: 0;
		right: 0;
		background: var(--dark);
		color: var(--red);
		width: 0.7em;
		height: 0.7em;
		z-index: 999999;
	}

	.notification-close-button::before,
	.notification-close-button::after {
		cursor: pointer;
		content: "";
		height: 0.15em;
		width: 0.8em;
		top: 0.3em;
		right: 0;
		background-color: var(--white);
		position: absolute;
		border-radius: 2px;
		transform-origin: center;
	}
	.notification-close-button::before {
		transform: rotate(45deg);
	}
	.notification-close-button::after {
		transform: rotate(-45deg);
	}
</style>
