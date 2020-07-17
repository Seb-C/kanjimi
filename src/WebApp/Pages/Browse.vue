<template>
	<div class="flex-fill p-0 m-0 page-browser d-flex flex-column">
		<div class="pb-2 px-2 bg-dark">
			<form v-on:submit="onFormSubmit">
				<input
					type="url"
					v-model="url"
					placeholder="URL"
					class="input-url"
				/>
			</form>
		</div>
		<template v-if="page !== null">
			<iframe
				class="iframe-page flex-fill border-0"
				sandbox="allow-scripts allow-forms"
				v-bind:src="page"
				@load="iframeLoaded"
				v-bind:class="{
					'loading': loading,
				}"
			/>
		</template>
		<div v-if="loading" class="d-flex flex-fill justify-content-center">
			<span class="spinner-border iframe-loading-spinner" role="status" aria-hidden="true"></span>
			<span class="sr-only">Loading...</span>
		</div>
		<template v-if="page === null && !loading">
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
						</template>
						<template v-else>
							<p class="mt-4">For a better experience, please install our browser extension:</p>
							<p>(Links coming soon)</p>
						</template>

						<p class="samples text-left">
							<i class="far fa-question-circle text-primary"></i>
							If you don't know where to start, what about reading
							<a
								href="https://ja.wikipedia.org/wiki/Special:Random"
								v-on:click="onClickSampleLink"
							>a random Wikipedia article</a>
							or <a
								href="https://news.yahoo.co.jp/"
								v-on:click="onClickSampleLink"
							>the news</a>?
						</p>
					</div>
				</div>
			</div>
		</template>
	</div>
</template>
<script lang="ts">
	import Vue from 'vue';
	import { get as getPage } from 'Common/Api/Page';

	export default Vue.extend({
		data() {
			const query = new URLSearchParams(window.location.search);

			return {
				installed: document.body.hasAttribute('data-extension-installed'),
				url: <string|null>query.get('url'),
				page: <string|null>null,
				loading: false,
			};
		},
		async created() {
			if (this.$root.apiKey === null) {
				this.$root.router.changeRoute('./app/login');
			}
			if (this.url !== null) {
				await this.changeUrl(this.url);
			}
			window.addEventListener('popstate', this.onBrowserPopState);
		},
		beforeDestroy() {
			window.removeEventListener('popstate', this.onBrowserPopState);
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
						this.changeUrl(payload, true);
					}
				});
			},
			async onBrowserPopState(event: Event) {
				const query = new URLSearchParams(window.location.search);
				if (query.has('url')) {
					await this.changeUrl(query.get('url'), false);
				} else {
					this.url = null;
					this.page = null;
					this.loading = false;
				}
			},
			async onFormSubmit(event: Event) {
				event.preventDefault();
				await this.changeUrl(this.url, true);
			},
			async changeUrl(requestedUrl: string, setPopState: boolean) {
				this.loading = true;
				this.page = null;

				const response = await getPage(this.$root.apiKey.key, requestedUrl);
				const page = response.content;
				const url = response.realUrl || requestedUrl;
				let charset = response.charset;

				if (setPopState) {
					const { origin, pathname } = window.location;
					window.history.pushState(
						null,
						document.title,
						`${origin}${pathname}?url=${encodeURIComponent(url)}`,
					);
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

				// Injecting some scripts to make the browser work
				const script = doc.createElement('script');
				script.appendChild(doc.createTextNode(`
					document.querySelectorAll('a').forEach(function (link) {
						link.addEventListener('click', function (event) {
							event.preventDefault();
							window.parent.postMessage({
								action: 'navigate',
								payload: link.href,
							}, '${process.env.KANJIMI_WWW_URL}');
						});
					});
					document.querySelectorAll('form').forEach(function (form) {
						form.addEventListener('submit', function (event) {
							event.preventDefault();
							if (!form.method || form.method.toUpperCase() === 'GET') {
								// Building the query string for this form
								var queryStringPairs = [];
								for (var entry of (new FormData(form)).entries()) {
									queryStringPairs.push(entry[0] + '=' + encodeURIComponent(entry[1]));
								}
								if (event.submitter && event.submitter.type === 'submit') {
									queryStringPairs.push(event.submitter.name[0] + '=' + encodeURIComponent(event.submitter.value[1]));
								}

								// Building the absolute url and going to it
								var url = new URL(
									form.action + '?' + queryStringPairs.join('&'),
									'${url.replace(/'/g, "\\'")}',
								);
								window.parent.postMessage({
									action: 'navigate',
									payload: url.href,
								}, '${process.env.KANJIMI_WWW_URL}');
							}
						});
					});
				`));
				doc.body.append(script);

				if (!charset) {
					const metaTags = doc.head.getElementsByTagName('meta');
					for (let i = 0; i < metaTags.length; i++) {
						if (metaTags[i].hasAttribute('charset')) {
							charset = metaTags[i].getAttribute('charset');
							break;
						}
					}
				}

				const modifiedPage = `<!DOCTYPE html>${doc.documentElement.outerHTML}`;
				const newPage = `data:text/html;charset=${charset || 'utf-8'},` + encodeURIComponent(modifiedPage);

				if (newPage === this.page) {
					// Workaround because there is no reload in this case
					this.loading = false;
				}

				this.url = url;
				this.page = newPage;
			},
			async onClickSampleLink(event: Event) {
				if (!this.installed) {
					event.preventDefault();
					await this.changeUrl(event.target.href);
				}
			},
		},
	});
</script>
<style scoped>
	.input-url {
		display: block;
		width: 100%;
	}

	.iframe-page {
		width: 100%;
	}

	.iframe-page.loading {
		visibility: hidden;
		height: 0;
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
</style>
