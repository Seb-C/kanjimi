context('Kanjis', () => {
	it('Basic display', () => {
		cy.setLoggedIn();
		cy.visit('/test-pages/wikipedia.html')

		cy.get('#firstHeading .kanjimi-sentence .token .word')
			.should('exist')
			.should('contain', '日本')
			.click();

		cy.get('.kanjimi-ui-container .tooltip .kanjis').should('exist');
		cy.get('.kanjimi-ui-container .tooltip .kanji').its('length').should('equal', 2);
		cy.get('.kanjimi-ui-container .tooltip .kanji:contains(日)').should('exist');
		cy.get('.kanjimi-ui-container .tooltip .kanji:contains(本)').should('exist');
	});
});
