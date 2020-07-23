context('Home', () => {
	it('Not accessible if not logged-in', () => {
		cy.setLoggedOut();
		cy.visit('/app/')
		cy.url().should('contain', 'app/login');
		cy.get('.page-login').should('be.visible');
	});
	it('Accessible if logged-in', () => {
		cy.setLoggedIn();
		cy.visit('/app/')
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
		// TODO test for the links to the stores
	});
});
