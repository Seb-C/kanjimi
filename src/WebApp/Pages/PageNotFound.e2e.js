context('PageNotFound', () => {
	it('Displayed if necessary', () => {
		cy.visit('/app/random/wrong/url');

		cy.get('.page-not-found')
			.should('exist')
			.should('be.visible')
			.should('contain', 'not found');
	});

	it('Does not contains a login button if logged in', () => {
		cy.setLoggedIn();
		cy.visit('/app/random/wrong/url');

		cy.get('.go-to-login').should('not.exist');
	});

	it('Does contain a login button if logged out', () => {
		cy.setLoggedOut();
		cy.visit('/app/random/wrong/url');

		cy.get('.go-to-login').should('exist');
	});
});
