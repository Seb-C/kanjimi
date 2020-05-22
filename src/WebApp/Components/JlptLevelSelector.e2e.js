context('JlptLevelSelector', () => {
	beforeEach(() => {
		// Disabled because Cypress cannot capture fetch queries
		// However it seems to work anyway ?!
		// cy.server();
		// cy.route('PATCH', '**/user/**').as('updateUserRequest');
	});

	it('All options are visible', () => {
		cy.setLoggedIn();
		cy.visit('/app/settings');

		cy.get('.jlpt-level-selector .option-container').should('be.visible');
		cy.get('.jlpt-level-selector label').should('be.visible');
	});

	it('Clicking on an option changes the selected one', () => {
		cy.setLoggedIn();
		cy.visit('/app/settings');

		cy.get('.jlpt-level-selector label:first').click();
		cy.get('.jlpt-level-selector label:first input').should('be.checked');

		cy.get('.jlpt-level-selector label:nth-child(3)').click();
		cy.get('.jlpt-level-selector label:nth-child(3) input').should('be.checked');

		cy.get('.jlpt-level-selector label:last').click();
		cy.get('.jlpt-level-selector label:last input').should('be.checked');
	});
});
