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
});
