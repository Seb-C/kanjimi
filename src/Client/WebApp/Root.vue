<template>
	<div class="d-flex flex-column bg-light" style="min-height: 100vh">
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
					<li class="nav-item">
						<a class="nav-link" href="#top">Top</a>
					</li>
					<li class="nav-item">
						<a class="nav-link" href="#read">Read</a>
					</li>
					<li class="nav-item">
						<a class="nav-link" href="#study">Study</a>
					</li>
					<li class="nav-item">
						<a class="nav-link" href="#customize">Customize</a>
					</li>
					<li class="nav-item">
						<a class="nav-link" href="#compatibility">Compatibility</a>
					</li>
					<li class="nav-item">
						<a class="nav-link" href="#twitter"><i class="fab fa-twitter"></i> Follow us</a>
					</li>
				</ul>
			</div>
		</nav>

		<div class="container flex-fill">
			test
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
		},
	});
</script>
<style scoped></style>
