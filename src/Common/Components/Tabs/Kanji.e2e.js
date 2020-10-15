context('Kanjis', () => {
	it('One tab per Kanji', () => {
		cy.setLoggedIn();
		cy.visit('/test-pages/wikipedia.html')

		cy.get('#firstHeading .kanjimi-sentence .token .word')
			.should('exist')
			.should('contain', '日本')
			.click();

		cy.get('.kanjimi-ui-container .tab:contains(日)').should('be.visible');
		cy.get('.kanjimi-ui-container .tab:contains(本)').should('be.visible');
	});
	it('The tab contains a Kanji', () => {
		cy.setLoggedIn();
		cy.visit('/test-pages/wikipedia.html')

		cy.get('#firstHeading .kanjimi-sentence .token .word')
			.should('exist')
			.should('contain', '日本')
			.click();

		cy.get('.kanjimi-ui-container .tab:contains(日)').click();

		cy.get('.kanjimi-ui-container .tooltip .kanji-svg-container').should('be.visible');
		cy.get('.kanjimi-ui-container .tooltip .kanji-svg-container svg').should('be.visible');
	});
});
