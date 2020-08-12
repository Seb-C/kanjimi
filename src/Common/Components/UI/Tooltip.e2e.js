context('Tooltip', () => {
	it('Display when a word is clicked', () => {
		cy.setLoggedIn();
		cy.visit('/test-pages/wikipedia.html')

		cy.get('#firstHeading .kanjimi-sentence .word').click();
		cy.get('.kanjimi-ui-container .tooltip').should('be.visible');
		cy.get('.kanjimi-ui-container .tooltip .tooltip-content').should('be.visible');
	});

	it('Close button', () => {
		cy.setLoggedIn();
		cy.visit('/test-pages/wikipedia.html')

		cy.get('#firstHeading .kanjimi-sentence .word').click();
		cy.get('.kanjimi-ui-container .tooltip').should('be.visible');
		cy.get('.kanjimi-ui-container .tooltip .tooltip-close-button').should('be.visible');
		cy.get('.kanjimi-ui-container .tooltip .tooltip-close-button').click();
		cy.get('.kanjimi-ui-container .tooltip').should('not.exist');
	});

	it('Close by clicking again', () => {
		cy.setLoggedIn();
		cy.visit('/test-pages/wikipedia.html')

		cy.get('#firstHeading .kanjimi-sentence .word').click();
		cy.get('.kanjimi-ui-container .tooltip').should('be.visible');
		cy.get('#firstHeading .kanjimi-sentence .word').click();
		cy.get('.kanjimi-ui-container .tooltip').should('not.exist');
	});

	it('Close by opening a different word', () => {
		cy.setLoggedIn();
		cy.visit('/test-pages/wikipedia.html')

		cy.get('#firstHeading .kanjimi-sentence .word').click();
		cy.get('.kanjimi-ui-container .tooltip:contains(日本)').should('exist');
		cy.get('.kanjimi-sentence .word:contains(導入):first').click();
		cy.get('.kanjimi-ui-container .tooltip:contains(日本)').should('not.exist');
		cy.get('.kanjimi-ui-container .tooltip:contains(導入)').should('exist');
	});

	it('Closing with a click outside', () => {
		cy.setLoggedIn();
		cy.visit('/test-pages/wikipedia.html')

		cy.get('#firstHeading .kanjimi-sentence .word').click();
		cy.get('.kanjimi-ui-container .tooltip:contains(日本)').should('exist');
		cy.get('body #content').click({ force: true });
		cy.get('.kanjimi-ui-container .tooltip:contains(日本)').should('not.exist');
	});

	it('Not closing with a click inside', () => {
		cy.setLoggedIn();
		cy.visit('/test-pages/wikipedia.html')

		cy.get('#firstHeading .kanjimi-sentence .word').click();
		cy.get('.kanjimi-ui-container .tooltip:contains(日本)').should('exist');
		cy.get('.kanjimi-ui-container .tooltip').click();
		cy.get('.kanjimi-ui-container .tooltip:contains(日本)').should('exist');
	});

	it('Closing with the escape key', () => {
		cy.setLoggedIn();
		cy.visit('/test-pages/wikipedia.html')

		cy.get('#firstHeading .kanjimi-sentence .word').click();
		cy.get('.kanjimi-ui-container .tooltip:contains(日本)').should('exist');
		cy.get('body #searchInput').type('{esc}');
		cy.get('.kanjimi-ui-container .tooltip:contains(日本)').should('not.exist');
	});

	it('Tip is also visible', () => {
		cy.setLoggedIn();
		cy.visit('/test-pages/wikipedia.html')

		cy.get('#firstHeading .kanjimi-sentence .word').click();
		cy.get('.kanjimi-ui-container .tooltip-tip').should('be.visible');
	});

	it('Cursor is also visible', () => {
		cy.setLoggedIn();
		cy.visit('/test-pages/wikipedia.html')

		cy.get('#firstHeading .kanjimi-sentence .word').click();
		cy.get('.kanjimi-ui-container .tooltip-cursor').should('be.visible');
	});

	it('Test the tooltip positioning', () => {
		cy.setLoggedIn();
		cy.visit('/test-pages/tooltip-positions.html')

		cy.get('.word:contains(上左)').click();
		cy.get('.kanjimi-ui-container .tooltip').should('be.visible');
		cy.get('.word:contains(上右)').click();
		cy.get('.kanjimi-ui-container .tooltip').should('be.visible');
		cy.get('.word:contains(下右)').click();
		cy.get('.kanjimi-ui-container .tooltip').should('be.visible');
		cy.get('.word:contains(下左)').click();
		cy.get('.kanjimi-ui-container .tooltip').should('be.visible');
	});
});