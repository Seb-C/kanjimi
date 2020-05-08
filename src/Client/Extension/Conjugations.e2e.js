context('Conjugations', () => {
	it('No conjugations to display', () => {
		cy.visit('/test-pages/wikipedia.html')

		cy.get('.word:contains(日本):first').click();
		cy.get('.kanjimi-tooltip-container .conjugations').should('not.exist');
	});
	it('One single conjugation to display', () => {
		cy.visit('/test-pages/wikipedia.html')

		cy.get('.word:contains(されている):first').click();
		cy.get('.kanjimi-tooltip-container .conjugations')
			.should('exist')
			.should('contain', 'teiru');
	});
	it('Multiple conjugations to display', () => {
		cy.visit('/test-pages/wikipedia.html')

		cy.get('.word:contains(されて):first').click();
		cy.get('.kanjimi-tooltip-container .conjugations')
			.should('exist')
			.should('contain', 'stem')
			.should('contain', 'imperative');
	});
});
