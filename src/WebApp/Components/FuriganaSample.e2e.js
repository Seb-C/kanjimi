context('FuriganaSample', () => {
	it('Basic structure can be seen', () => {
		cy.setLoggedIn();
		cy.visit('/app/settings');

		cy.get('.kanjimi-furigana-sample')
			.should('be.visible')
			.should('contain', '日本語')
			.should('contain', 'Japanese');
	});

	it('Hiragana if not checked', () => {
		cy.setLoggedIn();
		cy.visit('/app/settings');

		cy.get('.roman-reading-switch input').should('not.be.checked');
		cy.get('.kanjimi-furigana-sample').should('contain', 'にほんご');

		cy.get('.roman-reading-switch').click();
		cy.get('.roman-reading-switch input').should('be.checked');
		cy.get('.kanjimi-furigana-sample').should('contain', 'nihongo');
	});

	it('Romaji if checked', () => {
		cy.setLoggedIn();
		cy.visit('/app/settings');

		cy.get('.roman-reading-switch').click();
		cy.get('.roman-reading-switch input').should('be.checked');
		cy.get('.kanjimi-furigana-sample').should('contain', 'nihongo');
	});
});
