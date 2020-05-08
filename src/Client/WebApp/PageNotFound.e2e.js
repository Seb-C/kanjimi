context('PageNotFound', () => {
	it('Displayed if necessary', () => {
		cy.visit('/app/random/wrong/url')

		cy.get('.page-not-found')
			.should('exist')
			.should('be.visible')
			.should('contain', 'not found');
	});
});
