context('Browse', () => {
	beforeEach(() => {
		// Disabled because Cypress cannot capture fetch queries
		// cy.server();
		// cy.route('GET', '**/page').as('getPage');
	});

	it('Not accessible if not logged-in', () => {
		cy.setLoggedOut();
		cy.visit('/app/');
		cy.url().should('contain', 'app/login');
		cy.get('.page-login').should('be.visible');
	});
	it('Accessible if logged-in', () => {
		cy.setLoggedIn();
		cy.visit('/app/');
		cy.url().should('not.contain', 'app/login');
		cy.get('.page-home').should('be.visible');
	});
	it('Access from the homepage', () => {
		cy.setLoggedIn();
		cy.visit('/');
		cy.get('a:contains(Open Kanjimi)').should('be.visible').click();
		cy.url().should('contain', 'app/');
		cy.get('.page-home').should('be.visible');
	});
	it('Properly detects installed extension', () => {
		cy.setLoggedIn();
		cy.visit('/app');
		cy.get('.page-home').should('contain', 'Kanjimi is installed');
		cy.get('.page-home a:contains(Wikipedia)').should('exist');
		cy.get('.page-home a:contains(news)').should('exist');
	});
	it('Properly shows links if the extension is uninstalled', () => {
		cy.setLoggedIn();
		cy.visit('/app');

		// Hacking the data to test this case
		cy.window().then((win) => {
			win.document.body.removeAttribute('data-extension-installed');
		});
		cy.get('.navbar a:contains(Settings)').click();
		cy.get('.navbar a:contains(Browse)').click();

		cy.get('.page-home').should('contain', 'browser extension');

		cy.get('.page-home a:contains(Wikipedia)').should('exist');
		cy.get('.page-home a:contains(news)').should('exist');

		cy.get('.page-home a:contains(Chrome Web Store)').should('exist');
		cy.get('.page-home a:contains(Firefox Add-ons)').should('exist');
	});

	it('Normal browser usage from the index', () => {
		cy.setLoggedIn();
		cy.visit('/app');

		cy.get('input.input-url').type('https://localhost:3000/test-pages/');
		cy.get('form:has(input.input-url)').submit();
		// cy.get('.iframe-loading-spinner').should('be.visible');
		// cy.wait('@getPage');
		// cy.get('.iframe-loading-spinner').should('not.be.visible');
		cy.wait(500);

		cy.get('.page-home a:contains(Wikipedia)').should('not.be.visible');
		cy.get('.page-home a:contains(Chrome Web Store)').should('not.be.visible');

		cy.url().should('contain', '?url=');
		cy.url().should('contain', 'test-pages');

		cy.get('iframe').its('0.contentDocument.body').then(cy.wrap).should('contain', 'landing-page-examples');
	});

	it('Normal browser usage using the submit button', () => {
		cy.setLoggedIn();
		cy.visit('/app');

		cy.get('input.input-url').type('https://localhost:3000/test-pages/');
		cy.get('form:has(input.input-url) button[type="submit"]').click();
		// cy.get('.iframe-loading-spinner').should('be.visible');
		// cy.wait('@getPage');
		// cy.get('.iframe-loading-spinner').should('not.be.visible');
		cy.wait(500);

		cy.get('.page-home a:contains(Wikipedia)').should('not.be.visible');
		cy.get('.page-home a:contains(Chrome Web Store)').should('not.be.visible');

		cy.url().should('contain', '?url=');
		cy.url().should('contain', 'test-pages');

		cy.get('iframe').its('0.contentDocument.body').then(cy.wrap).should('contain', 'landing-page-examples');
	});

	it('Specific page set in the url opens properly', () => {
		cy.setLoggedIn();
		cy.visit('/app?url=https%3A%2F%2Flocalhost%3A3000%2Ftest-pages%2F');

		// cy.get('.iframe-loading-spinner').should('be.visible');
		// cy.wait('@getPage');
		// cy.get('.iframe-loading-spinner').should('not.be.visible');
		cy.wait(500);

		cy.get('iframe').its('0.contentDocument.body').then(cy.wrap).should('contain', 'landing-page-examples');
	});

	it('The link to open a page externally works', () => {
		cy.setLoggedIn();
		cy.visit('/app?url=https%3A%2F%2Flocalhost%3A3000%2Ftest-pages%2F');

		// cy.get('.iframe-loading-spinner').should('be.visible');
		// cy.wait('@getPage');
		// cy.get('.iframe-loading-spinner').should('not.be.visible');
		cy.wait(500);

		cy.get('a[target="_blank"][href="https://localhost:3000/test-pages/"]').should('be.visible')
	});

	it('Links clicked inside the iframe opens properly', () => {
		cy.setLoggedIn();
		cy.visit('/app?url=https%3A%2F%2Flocalhost%3A3000%2Ftest-pages%2F');

		// cy.get('.iframe-loading-spinner').should('be.visible');
		// cy.wait('@getPage');
		// cy.get('.iframe-loading-spinner').should('not.be.visible');
		cy.wait(500);

		cy.get('iframe').its('0.contentDocument.body').then(cy.wrap).find('a:contains(landing-page-examples)').click();

		// cy.get('.iframe-loading-spinner').should('be.visible');
		// cy.wait('@getPage');
		// cy.get('.iframe-loading-spinner').should('not.be.visible');
		cy.wait(500);

		cy.url().should('contain', '?url=');
		cy.url().should('contain', 'landing-page-examples');
	});

	it('No scripts allowed inside the iframe', () => {
		cy.setLoggedIn();
		cy.visit('/app?url=https%3A%2F%2Flocalhost%3A3000%2Ftest-pages%2F');

		// cy.get('.iframe-loading-spinner').should('be.visible');
		// cy.wait('@getPage');
		// cy.get('.iframe-loading-spinner').should('not.be.visible');
		cy.wait(500);

		cy.get('iframe').its('0.contentDocument.body').then(cy.wrap).find('noscript *').should('be.visible');
	});

	it('Displaying properly the 500 errors', () => {
		cy.setLoggedIn();
		cy.visit('/app?url=https%3A%2F%2Fnon.existing.domain%2F');

		// cy.get('.iframe-loading-spinner').should('be.visible');
		// cy.wait('@getPage');
		// cy.get('.iframe-loading-spinner').should('not.be.visible');
		cy.wait(500);

		cy.get('iframe').its('0.contentDocument.body').should('contain', 'Sorry, we could not');
	});

	it('Can go back and forth with the browser history', () => {
		cy.setLoggedIn();

		cy.visit('/app?url=https%3A%2F%2Flocalhost%3A3000%2Ftest-pages%2F');
		// cy.get('.iframe-loading-spinner').should('be.visible');
		// cy.wait('@getPage');
		// cy.get('.iframe-loading-spinner').should('not.be.visible');
		cy.wait(500);

		cy.get('iframe').its('0.contentDocument.body').then(cy.wrap).find('a:contains(landing-page-examples)').click();
		// cy.get('.iframe-loading-spinner').should('be.visible');
		// cy.wait('@getPage');
		// cy.get('.iframe-loading-spinner').should('not.be.visible');

		cy.wait(500);
		cy.url().should('contain', '?url=');
		cy.url().should('contain', 'landing-page-examples');
		cy.get('iframe').its('0.contentDocument.body').then(cy.wrap).find('*:contains(アプリ)').should('exist');

		cy.go('back');
		// cy.get('.iframe-loading-spinner').should('be.visible');
		// cy.wait('@getPage');
		// cy.get('.iframe-loading-spinner').should('not.be.visible');
		cy.wait(500);
		cy.url().should('contain', '?url=');
		cy.url().should('not.contain', 'landing-page-examples');
		cy.get('iframe').its('0.contentDocument.body').then(cy.wrap).find('a:contains(landing-page-examples)').should('exist');

		cy.go('forward');
		// cy.get('.iframe-loading-spinner').should('be.visible');
		// cy.wait('@getPage');
		// cy.get('.iframe-loading-spinner').should('not.be.visible');
		cy.wait(500);
		cy.url().should('contain', '?url=');
		cy.url().should('contain', 'landing-page-examples');
		cy.get('iframe').its('0.contentDocument.body').then(cy.wrap).find('*:contains(アプリ)').should('exist');
	});

	it('Going back home from a specific page', () => {
		cy.setLoggedIn();
		cy.visit('/app?url=https%3A%2F%2Flocalhost%3A3000%2Ftest-pages%2F');
		// cy.get('.iframe-loading-spinner').should('be.visible');
		// cy.wait('@getPage');
		// cy.get('.iframe-loading-spinner').should('not.be.visible');
		cy.wait(500);

		cy.get('a:contains(Browse)').should('be.visible').click();
		// cy.get('.iframe-loading-spinner').should('be.visible');
		// cy.wait('@getPage');
		// cy.get('.iframe-loading-spinner').should('not.be.visible');
		cy.wait(500);
		cy.url().should('not.contain', '?url=');

		cy.get('.page-home a:contains(Wikipedia)').should('exist');
	});

	it('Redirections updates properly the browser\'s url', () => {
		cy.setLoggedIn();
		cy.visit('/app');

		cy.get('input.input-url').type('https://localhost:3000/test-pages/redirect-to-landing-page-examples');
		cy.get('form:has(input.input-url)').submit();
		// cy.get('.iframe-loading-spinner').should('be.visible');
		// cy.wait('@getPage');
		// cy.get('.iframe-loading-spinner').should('not.be.visible');
		cy.wait(500);

		cy.url().should('contain', '?url=');
		cy.url().should('not.contain', 'redirect-to-landing-page-examples');

		cy.get('input.input-url').invoke('val').should('not.contain', 'redirect-to-landing-page-examples');

		cy.get('iframe').its('0.contentDocument.body').then(cy.wrap).find('*:contains(アプリ)').should('exist');
	});

	it('GET forms used inside the iframe opens properly', () => {
		cy.setLoggedIn();
		cy.visit('/app?url=https%3A%2F%2Flocalhost%3A3000%2Ftest-pages%2Fget-form.html');

		// cy.get('.iframe-loading-spinner').should('be.visible');
		// cy.wait('@getPage');
		// cy.get('.iframe-loading-spinner').should('not.be.visible');
		cy.wait(500);

		cy.get('iframe').its('0.contentDocument.body').then(cy.wrap).find('h1:contains(GET form)').should('exist');
		cy.get('iframe').its('0.contentDocument.body').then(cy.wrap).find('input[type="search"]').type('search_string');
		cy.get('iframe').its('0.contentDocument.body').then(cy.wrap).find('input[type="submit"]').click();

		// cy.get('.iframe-loading-spinner').should('be.visible');
		// cy.wait('@getPage');
		// cy.get('.iframe-loading-spinner').should('not.be.visible');
		cy.wait(500);

		cy.url().should('contain', '?url=');
		cy.url().should('contain', 'index.html%3Fsearch%3Dsearch_string');
	});
});
