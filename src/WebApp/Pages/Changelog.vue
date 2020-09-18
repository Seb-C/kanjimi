<template>
	<div class="container flex-fill py-2 page-changelog">
		<h1>Changelog</h1>

		<h2>2020年09月18日+</h2>
		<ul>
			<li>Dropping Cloudflare to improve the performance</li>
			<li>Fixed a visual bug when inspecting a Kanji</li>
			<li>Fixed a mis-aligned login button on mobile</li>
			<li>Fixed a bug on some pages where the tooltip was too small to be usable</li>
			<li>Reduced the visual latency when showing or hiding a definition or furigana</li>
		</ul>

		<h2>2020年07月28日</h2>
		<ul>
			<li>Releasing the in-app browser, which does not require the extensions</li>
			<li>The in-app browser does not work with Javascript sites</li>
		</ul>

		<h2>2020年07月20日</h2>
		<ul>
			<li>Added a button to enable the extension at will, instead of having it always enabled</li>
			<li>Reducing the permissions needed by the extension</li>
		</ul>

		<h2>2020年07月11日</h2>
		<ul>
			<li>Finishing setting up Kanjimi</li>
			<li>Publishing Kanjimi to the extension stores</li>
		</ul>
	</div>
</template>
<script lang="ts">
	import Vue from 'vue';

	export default Vue.extend({});
</script>
<style scoped>
	h1 {
		font-size: 3rem;
	}

	h2 {
		font-size: 1.5rem;
		margin-top: 1.5rem;
	}
</style>
