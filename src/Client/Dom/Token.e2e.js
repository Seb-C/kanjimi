context('Token', () => {
	beforeEach(() => {
		// Resetting word statuses before test
		cy.visit('./test-pages/wikipedia.html');
		cy.get('.kanjimi-sentence .word:contains(日本):first').then((word) => {
			const $furigana = word.closest('.token').find('.furigana');
			const furiganaStyle = $furigana.get(0).style;
			if (furiganaStyle.color && furiganaStyle.color === furiganaStyle.backgroundColor) {
				$furigana.click();
			}
		});
		cy.wait(500); // Cannot properly wait for a query made by a web-extension
		cy.get('.kanjimi-sentence .word:contains(日本):first').then((word) => {
			const $translation = word.closest('.token').find('.translation');
			const translationStyle = $translation.get(0).style;
			if (translationStyle.color && translationStyle.color === translationStyle.backgroundColor) {
				$translation.click();
			}
		});
		cy.wait(500); // Cannot properly wait for a query made by a web-extension
	});

	it('Basic tokenization', () => {
		cy.visit('./test-pages/wikipedia.html')

		cy.get('#firstHeading .kanjimi-sentence .token .furigana').should('exist').should('contain', 'にほん');
		cy.get('#firstHeading .kanjimi-sentence .token .word').should('exist').should('contain', '日本');
		cy.get('#firstHeading .kanjimi-sentence .token .translation').should('exist').should('contain', 'Japon');
	});

	it('Using links', () => {
		cy.visit('./test-pages/wikipedia.html')

		cy.get('a:contains(検証) .furigana:first').click();
		cy.get('a:contains(検証) .word:first').click();
		cy.get('a:contains(検証) .translation:first').click();

		cy.url().should('not.include', 'https://ja.wikipedia.org');
	});
});
