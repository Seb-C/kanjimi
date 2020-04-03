context('Sentence', () => {
	it('Basic tokenization', () => {
		cy.visit('./test-pages/wikipedia.html')

		cy.get('#firstHeading .kanjimi-sentence .token').should('exist');
		cy.get('#firstHeading .kanjimi-sentence .token .furigana').should('exist').should('contain', 'にほん');
		cy.get('#firstHeading .kanjimi-sentence .token .word').should('exist').should('contain', '日本');
		cy.get('#firstHeading .kanjimi-sentence .token .translation').should('exist').should('contain', 'Japon');
	});

	it('Using links', () => {
		cy.visit('./test-pages/wikipedia.html')

		cy.get('a:contains(検証)').should('exist');
		cy.get('a:contains(検証) .kanjimi-sentence').should('exist');

		cy.get('a:contains(検証) .furigana:first').click();
		cy.get('a:contains(検証) .word:first').click();
		cy.get('a:contains(検証) .translation:first').click();

		cy.url().should('not.include', 'https://ja.wikipedia.org');

		cy.get('a:contains(検証):first').click({ position: 'right' });

		let hasGotACrossOriginError = false;
		cy.on('fail', (err, runnable) => {
			if (err.docsUrl === 'https://on.cypress.io/cross-origin-violation') {
				// This should happen since we expect to change page after clicking the link
				hasGotACrossOriginError = true;
				return false;
			}
		})
		cy.url().should('include', 'https://ja.wikipedia.org').then(() => {
			expect(hasGotACrossOriginError).to.equal(true);
		});
	});
});
