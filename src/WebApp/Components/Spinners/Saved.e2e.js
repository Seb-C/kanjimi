context('Settings', () => {
	beforeEach(() => {
		// Disabled because Cypress cannot capture fetch queries
		// However it seems to work anyway ?!
		// cy.server();
		// cy.route('PATCH', '**/user/**').as('updateUserRequest');
	});

	it('Roman readings switch', () => {
		cy.setLoggedIn();
		cy.visit('/app/settings');

		// Changing the value 4 times in a row
		cy.get('.roman-reading-switch').click();
		// cy.wait('@updateUserRequest');
		cy.get('.roman-reading-switch').click();
		// cy.wait('@updateUserRequest');
		cy.get('.roman-reading-switch').click();
		// cy.wait('@updateUserRequest');
		cy.get('.roman-reading-switch').click();
		// cy.wait('@updateUserRequest');

		// Should be here for 3 seconds, then disappear
		cy.get('.page-settings').should('contain', 'Saved');
		cy.wait(1000);
		cy.get('.page-settings').should('contain', 'Saved');
		cy.wait(1000);
		cy.get('.page-settings').should('contain', 'Saved');
		cy.wait(2000);
		cy.get('.page-settings').should('not.contain', 'Saved');
	});
});
