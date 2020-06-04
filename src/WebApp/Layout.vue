<template>
	<div class="d-flex flex-column bg-white" style="min-height: 100vh">
		<nav class="navbar navbar-expand-md navbar-dark bg-dark sticky-top">
			<div class="navbar-brand h1 my-0 text-white">
				<a href="/" class="text-white">
					<img
						src="./img/logo.svg"
						width="30"
						height="30"
						class="d-inline-block align-top bg-white rounded mr-2"
						alt="Logo"
					/>
					Kanjimi
				</a>
			</div>

			<div class="d-none d-sm-block d-md-none text-gray mr-3 ml-auto">
				<i class="fas fa-user mr-2"></i>
				{{ userName }}
			</div>
			<button
				class="navbar-toggler"
				type="button"
				aria-controls="main-menu"
				v-bind:aria-expanded="isMobileMenuOpened"
				aria-label="Toggle navigation"
				v-on:click="clickMobileMenuToggler"
			>
				<span class="navbar-toggler-icon">&nbsp;</span>
			</button>

			<div
				v-bind:class="{
					'collapse': true,
					'navbar-collapse': true,
					'show': isMobileMenuOpened,
				}"
				id="main-menu"
			>
				<ul class="navbar-nav ml-auto mr-0">
					<li
						v-for="(link, index) in menuLinks"
						v-bind:class="{ ...link.classes, 'nav-item': true }"
					>
						<a
							v-bind:class="{ 'nav-link': true, 'active': link.active }"
							v-bind:href="link.url"
							v-on:click="navLinkClickHandler($event)"
							:ref="'menu-link-' + index"
						>{{ link.title }}</a>
					</li>
					<li
						v-if="userLinks.length > 0"
						class="nav-item dropdown ml-2 d-none d-md-block"
					>
						<span
							class="nav-link dropdown-toggle user-menu-toggler"
							role="button"
							data-toggle="dropdown"
							aria-haspopup="true"
							v-bind:aria-expanded="isUserMenuOpened"
							v-on:click="clickUserMenuToggler"
							tabindex="0"
							v-on:keypress="keyPressUserMenuToggler"
						>
							<i class="fas fa-user mr-1"></i>
							{{ userName }}
						</span>
						<div v-bind:class="{ 'dropdown-menu': true, 'show': isUserMenuOpened }">
							<a
								v-for="(link, index) in userLinks"
								v-bind:class="{ ...link.classes, 'dropdown-item': true, 'active': link.active }"
								v-bind:href="link.url"
								v-on:click="navLinkClickHandler($event)"
								:ref="'user-link-' + index"
							>{{ link.title }}</a>
						</div>
					</li>
				</ul>
			</div>
		</nav>

		<div class="container flex-fill py-2">
			<component v-bind:is="$root.router.component" />
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

	type MenuLink = {
		url: string,
		title: string,
		classes?: { [key: string]: boolean },
	};

	export default Vue.extend({
		data() {
			return {
				isMobileMenuOpened: false,
				isUserMenuOpened: false,
				menuLinks: <MenuLink[]>[],
				userLinks: <MenuLink[]>[],
			};
		},
		created() {
			document.body.addEventListener('click', (event: Event) => {
				if (this.isMobileMenuOpened) {
					event.preventDefault();
					this.isUserMenuOpened = false;
				}
				if (this.isUserMenuOpened) {
					event.preventDefault();
					this.isUserMenuOpened = false;
				}
			});

			this.updateActiveMenuLinks();
			this.updateActiveUserLinks();
		},
		mounted() {
			this.updateActiveMenuLinks();
			this.updateActiveUserLinks();
		},
		beforeUpdate () {
			this.updateActiveMenuLinks();
			this.updateActiveUserLinks();
		},
		methods: {
			updateActiveMenuLinks() {
				if (this.$root.apiKey === null) {
					this.menuLinks = [
						{ url: './app/sign-up', title: 'Sign Up' },
						{ url: './app/login', title: 'Login' },
					];
				} else {
					this.menuLinks = [
						{ url: './app', title: 'Home' },
						{ url: './app/settings', title: 'Settings' },
						{ url: './app/logout', title: 'Logout', 'classes': { 'd-md-none': true } },
					];
				}

				this.menuLinks = this.menuLinks.map((link: any, index: number) => {
					return {
						...link,
						active: (
							this.$refs['menu-link-' + index]
							&& this.$refs['menu-link-' + index][0]
							&& this.$root.router.url == this.$root.router.normalizeUrl(this.$refs['menu-link-' + index][0].href)
						),
					};
				});
			},
			updateActiveUserLinks() {
				if (this.$root.apiKey === null) {
					this.userLinks = [];
				} else {
					this.userLinks = [
						{ url: './app/change-password', title: 'Change my password' },
						{ url: './app/logout', title: 'Logout' },
					];
				}

				this.userLinks = this.userLinks.map((link: any, index: number) => {
					return {
						...link,
						active: (
							this.$refs['user-link-' + index]
							&& this.$refs['user-link-' + index][0]
							&& this.$root.router.url == this.$root.router.normalizeUrl(this.$refs['user-link-' + index][0].href)
						),
					};
				});
			},
			navLinkClickHandler(event: Event) {
				this.$root.router.changeRoute(event);
			},
			clickMobileMenuToggler() {
				this.isMobileMenuOpened = !this.isMobileMenuOpened;
			},
			clickUserMenuToggler(event: Event) {
				event.stopPropagation();
				this.isUserMenuOpened = !this.isUserMenuOpened;
			},
			keyPressUserMenuToggler(event: KeyboardEvent) {
				if (event.keyCode === 13 || event.charCode === 32) {
					event.stopPropagation();
					this.isUserMenuOpened = !this.isUserMenuOpened;
				}
			},
		},
		computed: {
			userName() {
				if (this.$root.user === null) {
					return null;
				}

				return this.$root.user.email;
			},
		},
	});
</script>
<style scoped>
	.user-menu-toggler {
		cursor: pointer;
	}
</style>
