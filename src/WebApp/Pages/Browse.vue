<template>
	<div class="flex-fill p-0 m-0 page-browser d-flex flex-column">
		<div class="pb-2 px-2 bg-dark">
			<form
				v-on:submit="onFormSubmit"
				class="position-relative"
			>
				<input
					type="url"
					v-model="inputUrl"
					placeholder="Enter an URL to use Kanjimi on it"
					v-bind:class="{
						'form-control': true,
						'input-url': true,
						'is-invalid': inputUrlError,
					}"
				/>
				<div class="url-buttons-container">
					<template v-if="realUrl !== null && inputUrl === realUrl">
						<a
							v-bind:href="realUrl"
							class="text-dark"
							title="Open this page in a normal browser tab"
							target="_blank"
						>
							<i class="fas fa-external-link-alt"></i>
						</a>
					</template>
					<template v-else-if="inputUrl !== realUrl">
						<button
							type="submit"
							class="btn btn-link cursor-pointer p-0 text-dark"
							title="Open this URL with Kanjimi"
						>
							<i class="fas fa-arrow-right"></i>
						</button>
					</template>
				</div>
			</form>
		</div>
		<template v-if="page !== null">
			<iframe
				class="iframe-page flex-fill border-0"
				sandbox="allow-forms allow-same-origin allow-scripts"
				v-bind:srcdoc="page"
				@load="iframeLoaded"
				v-bind:class="{
					'loading': loading,
				}"
			/>
		</template>
		<div v-if="loading" class="d-flex flex-fill justify-content-center">
			<span class="spinner-border iframe-loading-spinner align-self-center" role="status" aria-hidden="true"></span>
			<span class="sr-only">Loading...</span>
		</div>
		<template v-if="page === null && !loading">
			<div class="container flex-fill py-2 page-home text-center">
				<h1 class="mt-4 mb-4">Welcome, and thank you for using Kanjimi</h1>
				<div class="row">
					<div class="col col-lg-8 offset-lg-2">
						<div class="alert alert-primary p-3 mb-2" role="alert">
							<p>Kanjimi is currently free to use because it is a beta version.</p>
							<p class="mb-0">If you notice any problems or bugs, please contact us at <a href="mailto:contact@kanjimi.com">contact@kanjimi.com</a>.</p>
						</div>

						<p class="mt-4 text-left">
							Note: websites relying on Javascript (like web-applications) does not work here.<br />
							You must use the browser extension for this.
						</p>

						<hr />

						<h2 class="h4 mt-4 mb-3">If you don't know where to start, we recommend those sites:</h2>
						<div class="row mb-3">
							<div class="col-12 col-md-6">
								<a
									href="https://ja.wikipedia.org/wiki/Special:Random"
									class="border d-block h-100 text-decoration-none text-reset"
									v-on:click="onClickSampleLink($event, 'https://ja.wikipedia.org/wiki/Special:Random')"
								>
									<div>
										<img
											src="/img/sample-sites/wikipedia.svg"
											alt="Wikipedia"
											class="w-100"
										/>
									</div>
									<div class="text-center">
										A random Wikipedia article
									</div>
								</a>
							</div>
							<div class="col-12 col-md-6">
								<a
									href="https://news.yahoo.co.jp/"
									class="border d-block h-100 text-decoration-none text-reset"
									v-on:click="onClickSampleLink($event, 'https://news.yahoo.co.jp/')"
								>
									<div class="p-3">
										<img
											src="/img/sample-sites/yahoo-news.png"
											alt="Yahoo News"
											class="w-100"
										/>
									</div>
									<div class="text-center">
										Reading the news
									</div>
								</a>
							</div>
						</div>

						<hr />

						<template v-if="installed">
							<p class="mt-2 mb-3 text-left">
								<i class="far fa-check-circle text-success"></i>
								The Kanjimi extension is installed and ready to be used. Click on the toolbar button on any page to use it.
							</p>
						</template>
						<template v-else>
							<h2 class="h4 mt-4 mb-3">For a better experience, please install our browser extension:</h2>
							<div class="row mb-3 mt-2">
								<div class="col-12 col-md-6">
									<a
										href="https://chrome.google.com/webstore/detail/kanjimi/njiekbgikloggkcloencdnjmdcdhkani"
										class="border d-block h-100 text-decoration-none text-reset"
									>
										<div class="row">
											<div class="col-4">
												<img
													src="/img/stores/chrome.svg"
													alt="Chrome Web Store logo"
													class="w-100"
												/>
											</div>
											<div class="col-8 text-left store-logo-text d-flex">
												<div class="align-self-center">
													Chrome Web Store
												</div>
											</div>
										</div>
									</a>
								</div>
								<div class="col-12 col-md-6">
									<a
										href="https://addons.mozilla.org/fr/firefox/addon/kanjimi/"
										class="border d-block h-100 text-decoration-none text-reset"
									>
										<div class="row">
											<div class="col-4">
												<img
													src="/img/stores/firefox.svg"
													alt="Firefox logo"
													class="w-100"
												/>
											</div>
											<div class="col-8 text-left store-logo-text d-flex">
												<div class="align-self-center">
													Firefox Add-ons
												</div>
											</div>
										</div>
									</a>
								</div>
							</div>
						</template>
					</div>
				</div>
			</div>
		</template>
	</div>
</template>
<script lang="ts">
	import Vue from 'vue';
	import PageHandler from 'Common/PageHandler';
	import ExtensionStore from 'Common/Store';
	import WebAppStore from 'WebApp/Store';
	import { get as getPage } from 'Common/Api/Page';
	import ValidationError from 'Common/Api/Errors/Validation';
	import AuthenticationError from 'Common/Api/Errors/Authentication';
	import ServerError from 'Common/Api/Errors/Server';
	import * as DomPurify from 'dompurify';

	export default Vue.extend({
		data() {
			const url = (<WebAppStore><any>this.$root).router.params.url || null;

			return {
				installed: document.body.hasAttribute('data-extension-installed'),
				inputUrl: url,
				realUrl: url,
				inputUrlError: false,
				page: <string|null>null,
				loading: false,
			};
		},
		async created() {
			if (this.$root.apiKey === null) {
				this.$root.router.changeRoute('./app/login');
			}

			await this.loadUrl(this.realUrl);
		},
		watch: {
			async '$root.router.params'(newParams, oldParams) {
				this.realUrl = newParams.url || null;
				this.inputUrl = this.realUrl;

				if (!this.loading) {
					await this.loadUrl(this.realUrl);
				}
				// else: triggered because the url was a redirection
			},
		},
		methods: {
			iframeLoaded(event: Event) {
				this.loading = false;
				window.addEventListener('message', (event: MessageEvent) => {
					const { action, payload } = <{
						action: string,
						payload: any,
					}>event.data;
					if (action === 'navigate' && typeof(payload) === 'string') {
						this.$root.router.changeRoute(`./app?url=${encodeURIComponent(payload)}`);
					}
				});

				const win = <Window>(<HTMLIFrameElement>event.target).contentWindow;
				win.document.querySelectorAll('a').forEach((link) => {
					link.addEventListener('click', (event) => {
						event.preventDefault();
						win.parent.postMessage({
							action: 'navigate',
							payload: this.iframeUrlToAbsolute(win, link.getAttribute('href')),
						}, <string>process.env.KANJIMI_WWW_URL);
					});
				});
				win.document.querySelectorAll('form').forEach((form) => {
					form.addEventListener('submit', (event: Event) => {
						event.preventDefault();
						const submitter = <HTMLInputElement>(<any>event).submitter;
						if (!form.method || form.method.toUpperCase() === 'GET') {
							// Building the query string for this form
							var queryStringPairs = [];
							for (var entry of (new FormData(form)).entries()) {
								queryStringPairs.push(entry[0] + '=' + encodeURIComponent(<string>entry[1]));
							}
							if (submitter && submitter.type === 'submit') {
								queryStringPairs.push(submitter.name[0] + '=' + encodeURIComponent(submitter.value[1]));
							}

							// Building the absolute url and going to it
							win.parent.postMessage({
								action: 'navigate',
								payload: this.iframeUrlToAbsolute(win, 
									form.action + '?' + queryStringPairs.join('&'),
								),
							}, <string>process.env.KANJIMI_WWW_URL);
						}
					});
				});

				this.$root.router.addTitleSuffix(win.document.title);

				const storage = {
					get: async (keys: string[]): Promise<{ [key: string]: string|null }> => {
						const result: any = {};
						keys.forEach((key) => {
							result[key] = localStorage.getItem(key) || null;
						});
						return result;
					},
					set: async (data: { [key: string]: string|null }): Promise<void> => {
						Object.keys(data).forEach((key) => {
							if (data[key] === null) {
								localStorage.removeItem(key);
							} else {
								localStorage.setItem(key, <string>data[key]);
							}
						});
					},
				};

				const store = new ExtensionStore(win, storage);
				const pageHandler = new PageHandler(
					win,
					store,
					this.$root.router.params.url,
				);

				(async () => {
					try {
						await store.loadApiKeyFromStorage(false);
						store.notifyIfLoggedOut();
						if (store.apiKey !== null && win.document.visibilityState === 'visible') {
							await pageHandler.convertSentences();
						}
					} catch (error) {
						console.error(error);
					}
				})();

				pageHandler.injectUIContainer();
				pageHandler.injectLoaderCss();
				pageHandler.bindPageEvents();
			},
			iframeUrlToAbsolute(win: Window, url: string): string {
				const baseElement = win.document.querySelector('base[href]');
				let base: string = this.$root.router.params.url;
				if (baseElement !== null) {
					base = (<any>baseElement).href;
				}

				let absoluteUrl = new URL(url, base);

				return absoluteUrl.href;
			},
			onFormSubmit(event: Event) {
				event.preventDefault();
				this.$root.router.changeRoute(`./app?url=${encodeURIComponent(this.inputUrl)}`);
			},
			async loadUrl(requestedUrl: string|null) {
				if (requestedUrl === null) {
					this.page = null;
					return;
				}

				this.loading = true;
				this.page = null;

				let page: string;
				let url: string;
				let charset: string;
				try {
					const response = await getPage(this.$root.apiKey.key, requestedUrl);

					page = response.content;
					url = response.realUrl || requestedUrl;
					charset = response.charset || 'utf-8';
				} catch (error) {
					this.loading = false;

					if (error instanceof ValidationError) {
						this.inputUrlError = true;
					} else if (error instanceof AuthenticationError) {
						this.inputUrlError = true;
					} else if (error instanceof ServerError) {
						this.page = `
							<html style="height: 100%;">
								<body style="height: 100%; display: flex; align-items: center; justify-content: center;">
									<div>
										Sorry, we could not load this page.
									</div>
								</body>
							</html>
						`;
					} else {
						throw error;
					}

					return;
				}

				if (url !== requestedUrl) {
					this.$root.router.changeRoute(`./app?url=${encodeURIComponent(url)}`);
				}

				const domParser = new DOMParser();
				const doc = domParser.parseFromString(page, 'text/html');

				// Converting links to absolute
				const pageUrl = new URL(url);
				doc.querySelectorAll('[href]').forEach((element) => {
					const href = <string>(element.getAttribute('href'));
					if (href.substring(0, 2) === '//') {
						element.setAttribute('href', pageUrl.protocol + href);
					} else if (href[0] === '/') {
						element.setAttribute('href', pageUrl.origin + href);
					}
				});
				doc.querySelectorAll('[src]').forEach((element) => {
					const src = <string>(element.getAttribute('src'));
					if (src.substring(0, 2) === '//') {
						element.setAttribute('src', pageUrl.protocol + src);
					} else if (src[0] === '/') {
						element.setAttribute('src', pageUrl.origin + src);
					}
				});

				// Removing the srcset just because I am too lazy to parse and modify it
				doc.querySelectorAll('[srcset]').forEach((element) => {
					element.removeAttribute('srcset');
				});

				const charsetMetaTags = doc.head.querySelectorAll('head meta[charset]');
				if (charset && charsetMetaTags.length) {
					const metaTag = doc.createElement('meta');
					metaTag.setAttribute('charset', charset);
					doc.head.appendChild(metaTag);
				}

				const cssTag = doc.createElement('link');
				cssTag.setAttribute('rel', 'stylesheet');
				cssTag.setAttribute('href', `${process.env.KANJIMI_WWW_URL}/css/browser.build.css`);
				doc.head.appendChild(cssTag);

				// Removing all scripts
				DomPurify.sanitize(doc.documentElement, {
					WHOLE_DOCUMENT: true,
					RETURN_DOM: true,
					IN_PLACE: true,
					ADD_TAGS: ['base', 'link', 'meta'],
				});

				const newPage = `<!DOCTYPE html>${doc.documentElement.outerHTML}`;

				if (newPage === this.page) {
					// Workaround because there is no load event in this case
					this.loading = false;
				}

				this.page = newPage;
			},
			onClickSampleLink(event: Event, url: string) {
				event.preventDefault();
				this.$root.router.changeRoute(
					`./app?url=${encodeURIComponent(url)}`,
				);
			},
		},
	});
</script>
<style scoped>
	.input-url {
		display: block;
		width: 100%;
		background: var(--white);
		border: 0;
		padding: 0 0.3em;
		height: auto;
	}

	.iframe-page {
		width: 100%;
	}

	.iframe-page.loading {
		visibility: hidden;
		height: 0;
		flex: revert !important;
	}

	.iframe-loading-spinner {
		width: 5em;
		height: 5em;
	}

	i.text-success {
		font-size: 1.3em;
	}
	i.text-primary {
		font-size: 1.3em;
	}
	.samples a {
		font-weight: bold;
	}

	.store-logo-text {
		font-size: 1.5em;
	}

	.url-buttons-container {
		position: absolute;
		right: 0.3em;
		padding-left: 0.3em;
		top: 0;
		bottom: 0;
		background: var(--white);
	}

	.url-buttons-container > * {
		font-size: 1em;
		line-height: 1em;
		padding: 0;
		margin: 0;
		border: 0;
	}
</style>
