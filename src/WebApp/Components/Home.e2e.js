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
});
