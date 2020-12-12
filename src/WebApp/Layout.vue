<template>
	<div class="d-flex flex-column bg-white" style="min-height: 100vh">
		<nav class="navbar navbar-expand-md navbar-dark bg-dark sticky-top">
			<div class="navbar-brand h1 my-0 text-white">
				<a href="/app/" class="text-white">
					<img
						src="./img/logo/any.svg"
						width="30"
						height="30"
						class="d-inline-block align-top bg-white rounded mr-2"
						alt="Logo"
					/>
					Kanjimi
				</a>
				<small>Free Beta</small>
			</div>

			<div
				v-if="userName !== null"
				class="d-none d-sm-block d-md-none text-gray mr-3 ml-auto"
			>
				<i class="fas fa-user"></i>
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
							v-html="link.title"
						/>
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
								v-html="link.title"
							/>
						</div>
					</li>
				</ul>
			</div>
		</nav>

		<component v-bind:is="$root.router.component" />

		<footer v-if="showFooter" class="bg-dark text-white">
			<div class="container p-3">
				<div class="row text-center">
					<div class="col-12 col-sm-4 text-sm-right">
						<a
							href="./app/about"
							v-on:click="aboutLinkClickHandler($event)"
							class="text-white text-nowrap"
						>About Kanjimi - Contact</a>
					</div>
					<div class="col-12 col-sm-4">
						<a
							href="https://www.iubenda.com/privacy-policy/14085238"
							target="_blank"
							class="text-white text-nowrap"
							rel="noopener"
						>Privacy Policy</a>
					</div>
					<div class="col-12 col-sm-4 text-sm-left">
						<a
							href="https://www.iubenda.com/terms-and-conditions/14085238"
							target="_blank"
							class="text-white text-nowrap"
							rel="noopener"
						>Terms and Conditions</a>
					</div>
				</div>

				<div class="text-center mt-0">
					Copyright &copy; 2020 Sébastien Caparros - All rights reserved
				</div>
			</div>
		</footer>
	</div>
</template>
<script lang="ts">
	import Vue from 'vue';
	import Browse from 'WebApp/Pages/Browse.vue';

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
			const closeMenus = (event: Event) => {
				if (this.isMobileMenuOpened) {
					event.preventDefault();
					event.stopPropagation();
					this.isMobileMenuOpened = false;
				}
				if (this.isUserMenuOpened) {
					event.preventDefault();
					event.stopPropagation();
					this.isUserMenuOpened = false;
				}
			};
			document.body.addEventListener('click', closeMenus);
			document.body.addEventListener('keyup', (event: KeyboardEvent) => {
				if (event.key === 'Escape') {
					closeMenus(event);
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
						{
							url: './app/about',
							title: '<i class="fas fa-info-circle"></i> About Kanjimi',
						}, {
							url: './app/changelog',
							title: '<i class="fas fa-newspaper"></i> Changelog',
						}, {
							url: './app/sign-up',
							title: '<i class="fas fa-user-plus"></i> Sign Up',
						}, {
							url: './app/login',
							title: '<i class="fas fa-sign-in-alt"></i> Login',
						},
					];
				} else {
					this.menuLinks = [
						{
							url: './app',
							title: '<i class="fas fa-book-reader"></i> Browse',
						}, {
							url: './app/analyze',
							title: '<i class="fas fa-glasses"></i> Analyze',
						}, {
							url: './app/settings',
							title: '<i class="fas fa-cog"></i> Settings',
						}, {
							url: './app/about',
							title: '<i class="fas fa-info-circle"></i> About Kanjimi',
							classes: { 'd-md-none': true },
						}, {
							url: './app/changelog',
							title: '<i class="fas fa-newspaper"></i> Changelog',
							classes: { 'd-md-none': true },
						}, {
							url: './app/change-password',
							title: '<i class="fas fa-key"></i> Change my password',
							classes: { 'd-md-none': true },
						}, {
							url: './app/logout',
							title: '<i class="fas fa-sign-out-alt"></i> Logout',
							classes: { 'd-md-none': true },
						},
					];
				}

				this.menuLinks = this.menuLinks.map((link: any, index: number) => {
					return {
						...link,
						active: (
							this.$refs['menu-link-' + index]
							&& this.$refs['menu-link-' + index][0]
							&& this.$root.router.url == this.$root.router.normalizeUrl(this.$refs['menu-link-' + index][0].href).url
						),
					};
				});
			},
			updateActiveUserLinks() {
				if (this.$root.apiKey === null) {
					this.userLinks = [];
				} else {
					this.userLinks = [
						{
							url: './app/about',
							title: '<i class="fas fa-info-circle"></i> About Kanjimi',
						}, {
							url: './app/changelog',
							title: '<i class="fas fa-newspaper"></i> Changelog',
						}, {
							url: './app/change-password',
							title: '<i class="fas fa-key"></i> Change my password',
						}, {
							url: './app/logout',
							title: '<i class="fas fa-sign-out-alt"></i> Logout',
						},
					];
				}

				this.userLinks = this.userLinks.map((link: any, index: number) => {
					return {
						...link,
						active: (
							this.$refs['user-link-' + index]
							&& this.$refs['user-link-' + index][0]
							&& this.$root.router.url == this.$root.router.normalizeUrl(this.$refs['user-link-' + index][0].href).url
						),
					};
				});
			},
			aboutLinkClickHandler(event: Event) {
				this.$root.router.changeRoute(event);
			},
			navLinkClickHandler(event: Event) {
				this.$root.router.changeRoute(event);
			},
			clickMobileMenuToggler(event: Event) {
				event.stopPropagation();
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
			showFooter() {
				return !(
					this.$root.router.component === Browse
					&& this.$root.router.params.url
				);
			},
		},
	});
</script>
<style scoped>
	.user-menu-toggler {
		cursor: pointer;
	}

	nav .navbar-nav >>> .nav-link i {
		margin-right: 0.5em;
		margin-left: 0.25em;
	}

	nav .dropdown-menu >>> .dropdown-item {
		padding-left: 1em;
		padding-right: 1em;
	}
	nav .dropdown-menu >>> .dropdown-item i {
		margin-right: 0.5em;
		margin-left: 0.25em;
	}

	@media (display-mode: standalone) {
		.navbar-brand * {
			pointer-events: none;
		}

		footer {
			display: none;
		}
	}
</style>
