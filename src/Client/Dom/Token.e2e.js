context('Token', () => {
	const resetWordStatus = (word) => {
		cy.get(`.kanjimi-sentence .word:contains(${word}):first`).then((word) => {
			const $furigana = word.closest('.token').find('.furigana');
			if ($furigana.hasClass('hidden')) {
				$furigana.click();
			}
		}).wait(200); // Cannot properly wait for a query made by a web-extension
		cy.get(`.kanjimi-sentence .word:contains(${word}):first`).then((word) => {
			const $translation = word.closest('.token').find('.translation');
			if ($translation.hasClass('hidden')) {
				$translation.click();
			}
		}).wait(200); // Cannot properly wait for a query made by a web-extension
	};

	it('Basic tokenization', () => {
		cy.visit('./test-pages/wikipedia.html')
		resetWordStatus('日本');

		cy.get('#firstHeading .kanjimi-sentence .token .furigana').should('exist').should('contain', 'にほん');
		cy.get('#firstHeading .kanjimi-sentence .token .word').should('exist').should('contain', '日本');
		cy.get('#firstHeading .kanjimi-sentence .token .translation').should('exist').should('contain', 'Japon');
	});

	it('Using links', () => {
		cy.visit('./test-pages/wikipedia.html')
		resetWordStatus('検証');

		cy.get('a:contains(検証) .furigana:first').click();
		cy.get('a:contains(検証) .word:first').click();
		cy.get('a:contains(検証) .translation:first').click();

		cy.url().should('not.include', 'https://ja.wikipedia.org');
	});

	it('Changing the word statuses', () => {
		cy.visit('./test-pages/wikipedia.html')
		resetWordStatus('日本国');

		cy.get('.token:contains(日本国):first .furigana')
			.should('exist')
			.should('have.class', 'shown')
			.click({ force: true })
			.should('have.class', 'hidden');
		cy.get('.token:contains(日本国) .furigana.shown').should('not.exist');

		cy.get('.token:contains(日本国):first .translation')
			.should('exist')
			.should('have.class', 'shown')
			.click({ force: true })
			.should('have.class', 'hidden');
		cy.get('.token:contains(日本国) .translation.shown').should('not.exist');
	});
});
