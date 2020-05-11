<template>
	<div class="d-flex flex-column" style="min-height: 100vh">
		<nav class="navbar navbar-expand-md navbar-dark bg-dark sticky-top">
			<div class="navbar-brand text-white">
				<img
					src="./img/logo.svg"
					width="30"
					height="30"
					class="d-inline-block align-top bg-white rounded mr-2"
					alt="Logo"
				/>
				Kanjimi
			</div>

			<button
				class="navbar-toggler"
				type="button"
				data-toggle="collapse"
				data-target="#main-menu"
				aria-controls="main-menu"
				aria-expanded="false"
				aria-label="Toggle navigation"
			>
				<span class="navbar-toggler-icon">&nbsp;</span>
			</button>

			<div
				class="collapse navbar-collapse"
				id="main-menu"
			>
				<ul class="navbar-nav ml-auto text-right">
					<li v-for="(link, index) in links" class="nav-item">
						<a
							v-bind:class="{ 'nav-link': true, 'active': link.active }"
							v-bind:href="link.url"
							v-on:click="$root.changeRoute"
							:ref="'link-' + index"
						>{{ link.title }}</a>
					</li>
				</ul>
			</div>
		</nav>

		<div class="container flex-fill py-2">
			<component v-bind:is="$root.component" />
		</div>

		<footer class="bg-dark text-white">
			<div class="container p-3">
				<div class="row">
					<div
						class="col-12 col-md-6 text-center text-md-left"
						data-aos="slide-right"
						data-aos-anchor="#twitter"
						data-aos-anchor-placement="top-center"
					>
						<a href="mailto:contact@kanjimi.com" class="text-white">contact@kanjimi.com</a>
					</div>
					<div
						class="col-12 col-md-6 text-center text-md-right mt-3 mt-md-0"
						data-aos="slide-left"
						data-aos-anchor="#twitter"
						data-aos-anchor-placement="top-center"
					>
						Copyright &copy; 2020 Sébastien Caparros - All rights reserved
					</div>
				</div>
			</div>
		</footer>
	</div>
</template>
<script lang="ts">
	import Vue from 'vue';

	export default Vue.extend({
		data() {
			return {
				links: <{ url: string, title: string }[]>[
					{ url: './app/test/route', title: 'Test' },
					{ url: './app/login', title: 'Login' },
				],
			};
		},
		mounted() {
			this.updateActiveLink();
		},
		beforeUpdate () {
			this.updateActiveLink();
		},
		methods: {
			updateActiveLink() {
				this.links = this.links.map((link: any, index: number) => {
					return {
						...link,
						active: (this.$root.url == this.$refs['link-' + index][0].href),
					};
				});
			},
		},
	});
</script>
<style scoped></style>
