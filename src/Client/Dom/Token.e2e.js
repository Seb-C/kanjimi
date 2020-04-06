context('Sentence', () => {
	beforeEach(() => {
		// Resetting word statuses before test
		cy.visit('./test-pages/wikipedia.html');
		cy.window().then((win) => {
			return new Cypress.Promise((resolve) => {
				const onDataLoaded = () => {
					win.removeEventListener('kanjimi-converted-sentences', onDataLoaded);
					resolve();
				};
				win.addEventListener('kanjimi-converted-sentences', onDataLoaded)
			});
		}).wait(500).then(() => {
			return cy.get('.kanjimi-sentence .word:contains(日本):first').then((word) => {
				const $token = word.closest('.token');

				const $furigana = $token.find('.furigana');
				const furigana = $furigana.get(0);
				if (furigana.style.color && furigana.style.color === furigana.style.backgroundColor) {
					$furigana.click();
				}

				const $translation = $token.find('.translation');
				const translation = $translation.get(0);
				if (translation.style.color && translation.style.color === translation.style.backgroundColor) {
					$translation.click();
				}
			});
		});
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
