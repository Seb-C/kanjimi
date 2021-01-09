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
		cy.setLoggedIn();
		cy.visit('/test-pages/wikipedia.html');
		resetWordStatus('日本');

		cy.get('#firstHeading .kanjimi-sentence .token .furigana').should('exist').should('contain', 'にほん');
		cy.get('#firstHeading .kanjimi-sentence .token .word').should('exist').should('contain', '日本');
		cy.get('#firstHeading .kanjimi-sentence .token .translation').should('exist').should('contain', 'Japon');
	});

	it('Furiganas are never in katakana', () => {
		cy.setLoggedIn();
		cy.visit('/test-pages/wikipedia.html');

		cy.get('.kanjimi-sentence .token:contains(コミュニティ) .furigana')
			.should('exist')
			.should('not.contain', 'コミュニティ')
			.should('contain', 'こみゅにてぃ');
	});

	it('Using links', () => {
		cy.setLoggedIn();
		cy.visit('/test-pages/wikipedia.html');
		resetWordStatus('検証');

		cy.get('a:contains(検証) .furigana:first').click();
		cy.get('a:contains(検証) .word:first').click();
		cy.get('a:contains(検証) .translation:first').click();

		cy.url().should('not.include', 'https://ja.wikipedia.org');
	});

	it('Changing the word statuses', () => {
		cy.setLoggedIn();
		cy.visit('/test-pages/wikipedia.html');
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

	it('The roman furiganas setting in honoured', () => {
		// Disabled because Cypress cannot capture fetch queries
		// However it seems to work anyway ?!
		// cy.server();
		// cy.route('PATCH', '**/user/**').as('updateUserRequest');
		cy.setLoggedIn();

		// Should be in hiragana for now
		cy.visit('/test-pages/wikipedia.html');
		cy.get('#firstHeading .kanjimi-sentence .token .furigana:contains(にほん)').should('exist');

		// The setting should be in hiragana too
		cy.visit('/app/settings');
		cy.get('.roman-reading-switch').find('input').should('not.be.checked');

		// Switching to romaji
		cy.get('.roman-reading-switch').click();
		// cy.wait('@updateUserRequest');

		// Should be in romaji now
		cy.visit('/test-pages/wikipedia.html');
		cy.get('#firstHeading .kanjimi-sentence .token .furigana:contains(nihon)').should('exist');

		// Switching back to hiragana
		cy.visit('/app/settings');
		cy.get('.roman-reading-switch').click();
		// cy.wait('@updateUserRequest');

		// Should be in romaji now
		cy.visit('/test-pages/wikipedia.html');
		cy.get('#firstHeading .kanjimi-sentence .token .furigana:contains(にほん)').should('exist');
	});

	it('Brackets have no furigana or translation', () => {
		cy.setLoggedIn();
		cy.visit('/test-pages/specific-tests.html');

		cy.get('.brackets .token .furigana.none').should('exist');
		cy.get('.brackets .token .translation.none').should('exist');
	});
});
