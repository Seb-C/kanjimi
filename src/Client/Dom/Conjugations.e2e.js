context('Conjugations', () => {
	it('No conjugations to display', () => {
		cy.visit('./test-pages/wikipedia.html')

		cy.get('.word:contains(日本):first').click();
		cy.get('.kanjimi-tooltip-container .conjugations').should('not.exist');
	});
	it('One single conjugation to display', () => {
		cy.visit('./test-pages/wikipedia.html')

		cy.get('.word:contains(でない):first').click();
		cy.get('.kanjimi-tooltip-container .conjugations')
			.should('exist')
			.should('contain', 'negative');
	});
	it('Multiple conjugations to display', () => {
		cy.visit('./test-pages/wikipedia.html')

		cy.get('.word:contains(おそれ):first').click();
		cy.get('.kanjimi-tooltip-container .conjugations')
			.should('exist')
			.should('contain', 'stem')
			.should('contain', 'imperative');
	});
});
