context('KanjiComponent', () => {
	it('Displays the svg', () => {
		cy.setLoggedIn();
		cy.visit('/test-pages/wikipedia.html')

		cy.get('.word:contains(導入):first').click();
		cy.get('.kanjimi-ui-container .tab:contains(導)').click();

		cy.get('.kanjimi-ui-container .tooltip .kanji-svg-container svg').should('be.visible');
	});
	it('Displays the meanings', () => {
		cy.setLoggedIn();
		cy.visit('/test-pages/wikipedia.html')

		cy.get('.word:contains(導入):first').click();
		cy.get('.kanjimi-ui-container .tab:contains(導)').click();

		cy.get('.kanjimi-ui-container .tab-content-scrollable-area')
			.should('contain', 'mener')
			.should('contain', 'leading');
	});
	it('Displays the readings', () => {
		cy.setLoggedIn();
		cy.visit('/test-pages/wikipedia.html')

		cy.get('.word:contains(記事):first').click();
		cy.get('.kanjimi-ui-container .tab:contains(事)').click();

		cy.get('.kanjimi-ui-container .tab-content-scrollable-area')
			.should('contain', 'ジ')
			.should('contain', 'こと');
	});
	it('Can click on an SVG part and see the detail', () => {
		cy.setLoggedIn();
		cy.visit('/test-pages/wikipedia.html')

		cy.get('.word:contains(必要):first').click();
		cy.get('.kanjimi-ui-container .tab:contains(要)').click();

		cy.get('.kanjimi-ui-container .tab-content-scrollable-area')
			.should('contain', 'besoin')
			.should('contain', 'need');

		cy.get('.kanjimi-ui-container .kanji-svg-container svg .kanji-component:last').click();

		cy.get('.kanjimi-ui-container .tab-content-scrollable-area')
			.should('contain', 'woman')
			.should('contain', 'おんな')
			.should('contain', 'besoin');

		cy.get('.kanjimi-ui-container .tab-content-scrollable-area .kanji-meaning:contains(need)').should('not.be.visible');
		cy.get('.kanjimi-ui-container .tab-content-scrollable-area .kanji-reading:contains(ヨウ)').should('not.be.visible');
	});
	it('Can click on an sub-kanji', () => {
		cy.setLoggedIn();
		cy.visit('/test-pages/wikipedia.html')

		cy.get('.word:contains(議論):first').click();
		cy.get('.kanjimi-ui-container .tab:contains(議)').click();

		cy.get('.kanjimi-ui-container .tab-content-scrollable-area').should('contain', 'deliberation');

		cy.get('.kanjimi-ui-container .kanji-svg-container svg .kanji-component:last').click();
		cy.get('.kanjimi-ui-container .tab-content-scrollable-area').should('contain', 'justice');

		cy.get('.kanjimi-ui-container .kanji-svg-container svg:last .kanji-component:last').click();
		cy.get('.kanjimi-ui-container .tab-content-scrollable-area').should('contain', 'selfish');
	});
	it('Can show the roman reading on the readings', () => {
		// Disabled because Cypress cannot capture fetch queries
		// However it seems to work anyway ?!
		// cy.server();
		// cy.route('PATCH', '**/user/**').as('updateUserRequest');

		cy.setLoggedIn();

		// Should be in hiragana only for now
		cy.visit('/test-pages/wikipedia.html')
		cy.get('.word:contains(記事):first').click();
		cy.get('.kanjimi-ui-container .tab:contains(事)').click();
		cy.get('.kanjimi-ui-container .kanji-reading:contains(こと)').should('not.contain', 'koto');

		// Switching to romaji
		cy.visit('/app/settings');
		cy.get('.roman-reading-switch').find('input').should('not.be.checked');
		cy.get('.roman-reading-switch').click();
		// cy.wait('@updateUserRequest');

		// Should have a romaji furigana now
		cy.visit('/test-pages/wikipedia.html');
		cy.get('.word:contains(記事):first').click();
		cy.get('.kanjimi-ui-container .tab:contains(事)').click();
		cy.get('.kanjimi-ui-container .kanji-reading:contains(こと)').should('contain', 'koto');
	});
});
