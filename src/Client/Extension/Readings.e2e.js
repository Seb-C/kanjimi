context('Readings', () => {
	it('Token display', () => {
		cy.visit('/test-pages/wikipedia.html')

		cy.get('.word:contains(可能):first').click();

		cy.get('.kanjimi-tooltip-container .furigana').should('contain', 'かのう');
		cy.get('.kanjimi-tooltip-container .word').should('contain', '可能');
	});

	it('Correct furigana for conjugated verb', () => {
		cy.visit('/test-pages/wikipedia.html')

		cy.get('.word:contains(されている):first').click();
		cy.get('.kanjimi-tooltip-container .furigana').should('contain', 'される');
	});

	it('Flags display', () => {
		cy.visit('/test-pages/wikipedia.html')

		cy.get('.word:contains(可能):first').click();

		cy.get('.kanjimi-tooltip-container .reading-translation-flag[title="English"]').should('exist');
		cy.get('.kanjimi-tooltip-container .reading-translation-flag[title="French"]').should('exist');
	});

	it('French translations display', () => {
		cy.visit('/test-pages/wikipedia.html')

		cy.get('.word:contains(可能):first').click();

		cy.get('.kanjimi-tooltip-container .reading-translations li:contains(potentiel)').should('exist');
		cy.get('.kanjimi-tooltip-container .reading-translations li:contains(réalisable)').should('exist');
	});

	it('English translations display', () => {
		cy.visit('/test-pages/wikipedia.html')

		cy.get('.word:contains(可能):first').click();

		cy.get('.kanjimi-tooltip-container .reading-translations li:contains(practicable)').should('exist');
		cy.get('.kanjimi-tooltip-container .reading-translations li:contains(feasible)').should('exist');
	});

	it('Multi-lang translations display', () => {
		cy.visit('/test-pages/wikipedia.html')

		cy.get('.word:contains(可能):first').click();

		cy.get('.kanjimi-tooltip-container .reading-translations li:contains(possible)').its('length').should('be', 2);
	});
});
