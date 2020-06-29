<template>
	<div class="container flex-fill py-2 page-home text-center">
		<h1 class="mt-4 mb-4">Welcome, and thank you for using Kanjimi</h1>
		<div class="row">
			<div class="col col-lg-8 offset-lg-2">
				<div class="alert alert-primary p-3" role="alert">
					<p>Kanjimi is currently free to use because it is a beta version.</p>
					<p class="mb-0">If you notice any problems or bugs, please contact us at <a href="contact@kanjimi.com">contact@kanjimi.com</a>.</p>
				</div>

				<template v-if="installed">
					<p class="mt-2 mb-3 text-left">
						<i class="far fa-check-circle text-success"></i>
						Kanjimi is installed and ready to be used.
					</p>
					<p class="samples text-left">
						<i class="far fa-question-circle text-primary"></i>
						If you don't know where to start, what about reading
						<a href="https://ja.wikipedia.org/wiki/Special:Random">a random Wikipedia article</a>
						or <a href="https://news.yahoo.co.jp/">the news</a>?
					</p>
				</template>
				<template v-else>
					<p class="mt-4">To get started, please install our browser extension:</p>
					<p>(Links coming soon)</p>
				</template>
			</div>
		</div>
	</div>
</template>
<script lang="ts">
	import Vue from 'vue';

	export default Vue.extend({
		data() {
			return {
				installed: document.body.hasAttribute('data-extension-installed'),
			};
		},
		created() {
			if (this.$root.apiKey === null) {
				this.$root.router.changeRoute('./app/login');
			}
		},
	});
</script>
<style scoped>
	i.text-success {
		font-size: 1.3em;
	}
	i.text-primary {
		font-size: 1.3em;
	}
	.samples a {
		font-weight: bold;
	}
</style>
