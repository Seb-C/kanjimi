context('Readings', () => {
	it('Token display', () => {
		cy.setLoggedIn();
		cy.visit('/test-pages/wikipedia.html')

		cy.get('.word:contains(導入):first').click();

		cy.get('.kanjimi-tooltip-container .furigana').should('contain', 'どうにゅう');
		cy.get('.kanjimi-tooltip-container .word').should('contain', '導入');
	});

	it('Correct furigana for conjugated verb', () => {
		cy.setLoggedIn();
		cy.visit('/test-pages/wikipedia.html')

		cy.get('.word:contains(されている):first').click();
		cy.get('.kanjimi-tooltip-container .furigana').should('contain', 'される');
	});

	it('Flags display', () => {
		cy.setLoggedIn();
		cy.visit('/test-pages/wikipedia.html')

		cy.get('.word:contains(導入):first').click();

		cy.get('.kanjimi-tooltip-container .reading-translation-flag[title="English"]').should('exist');
		cy.get('.kanjimi-tooltip-container .reading-translation-flag[title="French"]').should('exist');
	});

	it('French translations display', () => {
		cy.setLoggedIn();
		cy.visit('/test-pages/wikipedia.html')

		cy.get('.word:contains(参照):first').click();

		cy.get('.kanjimi-tooltip-container .reading-translations li:contains(comparer)').should('exist');
		cy.get('.kanjimi-tooltip-container .reading-translations li:contains(référence)').should('exist');
	});

	it('English translations display', () => {
		cy.setLoggedIn();
		cy.visit('/test-pages/wikipedia.html')

		cy.get('.word:contains(参照):first').click();

		cy.get('.kanjimi-tooltip-container .reading-translations li:contains(reference)').should('exist');
		cy.get('.kanjimi-tooltip-container .reading-translations li:contains(consultation)').should('exist');
	});

	it('Multi-lang translations display', () => {
		cy.setLoggedIn();
		cy.visit('/test-pages/wikipedia.html')

		cy.get('.word:contains(導入):first').click();

		cy.get('.kanjimi-tooltip-container .reading-translations li:contains(introduction)').its('length').should('be', 2);
	});
});
