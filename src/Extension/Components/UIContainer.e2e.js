context('UIContainer', () => {
	it('The tooltip exists in the dom', () => {
		cy.setLoggedIn();
		cy.visit('/test-pages/wikipedia.html')

		cy.get('#firstHeading .kanjimi-sentence .word').click();
		cy.get('.kanjimi-ui-container .tooltip').should('exist');
	});

	it('The UIContainer has no dom node itself when empty', () => {
		cy.setLoggedIn();
		cy.visit('/test-pages/wikipedia.html')

		cy.get('body > .kanjimi-ui-container').should('not.exist');
	});

	it('UIContainer containing a Tooltip', () => {
		cy.setLoggedIn();
		cy.visit('/test-pages/wikipedia.html')

		cy.get('#firstHeading .kanjimi-sentence .word').click();
		cy.get('body > .kanjimi-ui-container .tooltip').should('exist');
		cy.get('body > * > .kanjimi-ui-container').should('not.exist');
	});
});
