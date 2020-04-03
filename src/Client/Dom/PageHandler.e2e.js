context('PageHandler', () => {
	it('Tokenization on load', () => {
		cy.visit('./test-pages/wikipedia.html')

		cy.get('#firstHeading').should('contain', '日本');

		cy.get('#firstHeading .kanjimi-sentence').should('exist');

		cy.get('.kanjimi-sentence').its('length').should('be.gte', 50);
		cy.get('.kanjimi-sentence:visible').should('exist');
	});

	it('Loading on scroll', () => {
		cy.visit('./test-pages/wikipedia.html')

		cy.get('.kanjimi-sentence').then((sentences) => {
			const sentencesCount = sentences.length;
			cy.scrollTo(0, 1500);

			cy.get('.kanjimi-loader').should('exist');
			cy.wait(500);

			cy.get('.kanjimi-loader').should('not.exist');
			cy.get('.kanjimi-sentence').its('length').should('be.gt', sentencesCount);
			cy.get('.kanjimi-sentence:visible').should('exist');
		});
	});
});
