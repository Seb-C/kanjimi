context('Tabs', () => {
	it('Basic display', () => {
		cy.setLoggedIn();
		cy.visit('/test-pages/wikipedia.html');

		cy.get('.word:contains(日本):first').click();

		cy.get('.kanjimi-ui-container .tooltip .tabs').should('be.visible');
		cy.get('.kanjimi-ui-container .tab:contains(Definitions)').should('be.visible');
		cy.get('.kanjimi-ui-container .tab:contains(日)').should('be.visible');
		cy.get('.kanjimi-ui-container .tab:contains(本)').should('be.visible');
	});

	it('Clicking changes the active tab', () => {
		cy.setLoggedIn();
		cy.visit('/test-pages/wikipedia.html');

		cy.get('.word:contains(日本):first').click();

		cy.get('.kanjimi-ui-container .tab:contains(Definitions)').should('have.class', 'active');
		cy.get('.kanjimi-ui-container .tab:contains(日)').should('not.have.class', 'active');
		cy.get('.kanjimi-ui-container .tab:contains(日)').click();
		cy.get('.kanjimi-ui-container .tab:contains(Definitions)').should('not.have.class', 'active');
		cy.get('.kanjimi-ui-container .tab:contains(日)').should('have.class', 'active');
	});
});
