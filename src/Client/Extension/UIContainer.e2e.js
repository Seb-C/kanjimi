context('UIContainer', () => {
	it('The tooltip exists in the dom', () => {
		cy.setLoggedIn();
		cy.visit('/test-pages/wikipedia.html')

		cy.get('#firstHeading .kanjimi-sentence .word').click();
		cy.get('.kanjimi-tooltip-container .tooltip').should('exist');
		cy.get('.kanjimi-tooltip-container').should('exist');
		cy.get('.kanjimi-tooltip-container').should('exist');
	});

	it('The UIContainer has no dom node itself', () => {
		cy.setLoggedIn();
		cy.visit('/test-pages/wikipedia.html')

		cy.get('#firstHeading .kanjimi-sentence .word').click();
		cy.get('body > .kanjimi-tooltip-container').should('exist');
		cy.get('body > * > .kanjimi-tooltip-container').should('not.exist');
	});
});
