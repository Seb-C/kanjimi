<template>
	<div class="container flex-fill py-2 page-changelog">
		<h1>Changelog</h1>

		<h2>2020年12月17日</h2>
		<ul>
			<li>Fixing a bug where there was too much space between a word and it's definitions</li>
			<li>Fixing a bug where words were not vertically aligned and some definitions were invisible</li>
		</ul>

		<h2>2020年12月16日</h2>
		<ul>
			<li>Adding a feature (not available in the extension) allowing to use Kanjimi on any Japanese text (not only websites)</li>
			<li>Kanjimi is now installable as a Progressive Web Application. Go to the <a href="/app/about">About Kanjimi</a> page to see how you can install it.</li>
			<li>Fixing a bug preventing any conjugated verbs or adjectives from being hidden</li>
			<li>Fixing some minor layout bugs</li>
			<li>Fixing the Kanji being invisible on some pages, due to the tooltip being too tall</li>
		</ul>

		<h2>2020年10月15日</h2>
		<ul>
			<li>Made the sample sites more visible on the homepage (after login)</li>
			<li>Added more information about the individual Kanjis, along with the possibility to click and see the details of it's components</li>
			<li>Added a button to open an URL externally from the in-app browser</li>
			<li>Fixed bugs related to the in-app browser (including problems with Safari)</li>
		</ul>

		<h2>2020年09月24日</h2>
		<ul>
			<li>Created the Changelog page</li>
			<li>Dropped Cloudflare to improve the performance</li>
			<li>Abandoned the attempt to publish Kanjimi on the Opera addons store</li>
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
