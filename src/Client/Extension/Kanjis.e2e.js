context('Kanjis', () => {
	it('Basic display', () => {
		cy.visit('/test-pages/wikipedia.html')

		cy.get('#firstHeading .kanjimi-sentence .token .word')
			.should('exist')
			.should('contain', '日本')
			.click();

		cy.get('.kanjimi-tooltip-container .kanjis').should('exist');
		cy.get('.kanjimi-tooltip-container .kanji').its('length').should('equal', 2);
		cy.get('.kanjimi-tooltip-container .kanji:contains(日)').should('exist');
		cy.get('.kanjimi-tooltip-container .kanji:contains(本)').should('exist');
	});
});
