<template>
	<div class="container flex-fill py-2 page-about">
		<h1>History</h1>

		<p>Hello, I am Sébastien, a French guy living in Tokyo.</p>

		<p>
			I spent many years studying Japanese, and one of the biggest frustrations
			I had was the impossibility to progress by reading.
		</p>
		<p>
			I love reading, and reading in a foreign language is an amazing experience and made me progress really fast when I studied English.
			I wanted to do the same in Japanese, but I found that the Kanjis makes this process very difficult.
		</p>
		<p>
			There was already a ton of applications to study vocabulary, but nothing that could really help me to understand rich and native content.
		</p>
		<p>
			Kanjimi was born during the Coronavirus-pandemic of 2020.
		</p>

		<h1>Contact</h1>

		<p>
			If you have any question, request, problem, bug report, please contact us
			by email at <a href="mailto:contact@kanjimi.com">contact@kanjimi.com</a>.
		</p>
		<p>
			Alternatively, we have a Twitter account <a href="https://twitter.com/Kanjimi">@Kanjimi</a>.
		</p>
		<p>
			Account deletion and requests too see your personal data
			are not automated yet, so please also contact us by email.
		</p>

		<h1>Application</h1>

		<p>Kanjimi is also available as a Progressive Web Application. It is not available in the application stores, but you can install it this way.</p>

		<div class="row border pt-3 pb-3 mb-3">
			<div class="col-12 col-md-4">
				<img
					src="/img/install-pwa/android-google-chrome.png"
					alt="Screenshot of the installation on Google Chrome for Android"
					class="w-100"
				/>
				<hr />
				<p class="text-center mb-4 mb-md-0">
					With Google Chrome for Android, a "Add Kanjimi to Home screen" button will show-up on the botton of your screen.
				</p>
			</div>
			<div class="col-12 col-md-4">
				<img
					src="/img/install-pwa/ios-safari.png"
					alt="Screenshot of the installation on Safari for iOS"
					class="w-100"
				/>
				<hr />
				<p class="text-center mb-4 mb-md-0">
					With Safari for iOS, open the menu and click on the "Add to Home Screen" button.
				</p>
			</div>
			<div class="col-12 col-md-4">
				<img
					src="/img/install-pwa/android-firefox.png"
					alt="Screenshot of the installation on Firefox for Android"
					class="w-100"
				/>
				<hr />
				<p class="text-center mb-4 mb-md-0">
					With Firefox for Android, open the menu and click on the "Install" button.
				</p>
			</div>
		</div>

		<h1>Credits</h1>

		<p>Kanjimi would not be possible without the amazing work of other people, so they deserve to be credited here:</p>
		<ul>
			<li>The <a href="http://edrdg.org/jmdict/j_jmdict.html">JMDict</a> project (multilingual Japanese dictionary)</li>
			<li>The <a href="http://www.edrdg.org/wiki/index.php/KANJIDIC_Project">Kanjidic</a> project (Japanese Kanjis dictionary)</li>

			<li>The <a href="https://www.edrdg.org/enamdict/enamdict_doc.html">ENAMDict</a> project (Japanese names dictionary)</li>
			<li>A <a href="http://ftp.monash.edu/pub/nihongo/">compilation of Japanese-related resources</a> by the Monash university, which was very helpful</li>
			<li>The <a href="http://kanjivg.tagaini.net/">KanjiVG</a> project (Very detailed SVG files about the Japanese Kanjis)</li>
			<li>The <a href="https://en.wiktionary.org/wiki/Appendix:JLPT">JLPT data of Wiktionary</a></li>
		</ul>

		<p>Kanjimi is also built on top of lot of open source projects, including:</p>
		<ul>
			<li><a href="https://www.docker.com/">Docker</a></li>
			<li><a href="https://nodejs.org/">NodeJS</a></li>
			<li><a href="https://www.postgresql.org/">PostgreSQL</a></li>
			<li><a href="https://vuejs.org/">VueJS</a></li>
		</ul>

		<h1>Legal information</h1>

		<ul>
			<li><a href="https://www.iubenda.com/privacy-policy/14085238">Privacy Policy</a></li>
			<li><a href="https://www.iubenda.com/terms-and-conditions/14085238">Terms and Conditions</a></li>
		</ul>
	</div>
</template>
<script lang="ts">
	import Vue from 'vue';

	export default Vue.extend({});
</script>
<style scoped></style>
