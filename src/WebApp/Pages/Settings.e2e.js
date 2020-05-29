context('Settings', () => {
	beforeEach(() => {
		// Disabled because Cypress cannot capture fetch queries
		// However it seems to work anyway ?!
		// cy.server();
		// cy.route('PATCH', '**/user/**').as('updateUserRequest');
	});

	it('Not accessible if logged-out', () => {
		cy.setLoggedOut();
		cy.visit('/app/settings');
		cy.url().should('not.contain', 'app/settings');
		cy.get('.page-settings').should('not.exist');
	});

	it('Accessible if logged-in', () => {
		cy.setLoggedIn();
		cy.visit('/app/settings');
		cy.get('.page-settings').should('be.visible');
	});

	it('Roman readings switch', () => {
		cy.setLoggedIn();
		cy.visit('/app/settings');

		cy.get('.roman-reading-switch')
			.should('be.visible')
			.find('input')
			.should('exist')
			.should('not.be.checked');

		cy.get('.roman-reading-switch').click();
		// cy.get('.roman-reading-switch input').should('be.disabled');
		// cy.get('.page-settings').should('contain', 'Saving...');
		// cy.wait('@updateUserRequest');
		cy.get('.roman-reading-switch input')
			.should('not.be.disabled')
			.should('be.checked');
		cy.get('.page-settings').should('contain', 'Saved');

		cy.get('.roman-reading-switch').click();
		// cy.get('.roman-reading-switch input').should('be.disabled');
		// cy.get('.page-settings').should('contain', 'Saving...');
		// cy.wait('@updateUserRequest');
		cy.get('.roman-reading-switch input')
			.should('not.be.disabled')
			.should('not.be.checked');
		cy.get('.page-settings').should('contain', 'Saved');
	});

	it('JLPT level selector', () => {
		cy.setLoggedIn();
		cy.visit('/app/settings');

		cy.get('.jlpt-level-selector')
			.should('be.visible')
			.find('input')
			.should('exist');

		cy.get('.jlpt-level-selector input').should('not.be.disabled');
		cy.get('.jlpt-level-selector input[value=""]').should('not.be.checked');
		cy.get('.jlpt-level-selector input[value="5"]').should('not.be.checked');
		cy.get('.jlpt-level-selector input[value="4"]').should('not.be.checked');
		cy.get('.jlpt-level-selector input[value="3"]').should('be.checked');
		cy.get('.jlpt-level-selector input[value="2"]').should('not.be.checked');
		cy.get('.jlpt-level-selector input[value="1"]').should('not.be.checked');

		cy.get('.jlpt-level-selector label:first-child').click();
		// cy.get('.jlpt-level-selector input').should('be.disabled');
		// cy.get('.page-settings').should('contain', 'Saving...');
		// cy.wait('@updateUserRequest');
		cy.get('.jlpt-level-selector input').should('not.be.disabled');
		cy.get('.jlpt-level-selector input[value=""]').should('be.checked');
		cy.get('.jlpt-level-selector input[value="5"]').should('not.be.checked');
		cy.get('.jlpt-level-selector input[value="4"]').should('not.be.checked');
		cy.get('.jlpt-level-selector input[value="3"]').should('not.be.checked');
		cy.get('.jlpt-level-selector input[value="2"]').should('not.be.checked');
		cy.get('.jlpt-level-selector input[value="1"]').should('not.be.checked');

		cy.get('.page-settings').should('contain', 'Saved');

		cy.get('.jlpt-level-selector label:last-child').click();
		// cy.get('.jlpt-level-selector input').should('be.disabled');
		// cy.get('.page-settings').should('contain', 'Saving...');
		// cy.wait('@updateUserRequest');
		cy.get('.jlpt-level-selector input').should('not.be.disabled');
		cy.get('.jlpt-level-selector input[value=""]').should('not.be.checked');
		cy.get('.jlpt-level-selector input[value="5"]').should('not.be.checked');
		cy.get('.jlpt-level-selector input[value="4"]').should('not.be.checked');
		cy.get('.jlpt-level-selector input[value="3"]').should('not.be.checked');
		cy.get('.jlpt-level-selector input[value="2"]').should('not.be.checked');
		cy.get('.jlpt-level-selector input[value="1"]').should('be.checked');
		cy.get('.page-settings').should('contain', 'Saved');
	});

	it('Changing and saving languages', () => {
		cy.setLoggedIn();
		cy.visit('/app/settings');

		cy.get('.languages-selector').should('be.visible');
		cy.get('.languages-available').should('be.visible');
		cy.get('.languages-selected').should('be.visible');

		cy.get('.languages-selected li:contains(French)').should('exist');
		cy.get('.languages-selected li:contains(English)').should('exist');

		// Removing French
		cy.get('.languages-selected ul div:has(> li:contains(French))').click();
		// cy.get('.languages-selector li:first').should('have.class', 'disabled');
		// cy.get('.page-settings').should('contain', 'Saving...');
		// cy.wait('@updateUserRequest');
		cy.get('.languages-available li:contains(French)').should('exist');
		cy.get('.languages-selected li:contains(French)').should('not.exist');
		cy.get('.page-settings').should('contain', 'Saved');

		// Error if we try to remove English
		cy.get('.languages-selected ul div:has(> li:contains(English))').click();
		// cy.get('.languages-selector li:first').should('have.class', 'disabled');
		// cy.get('.page-settings').should('contain', 'Saving...');
		// cy.wait('@updateUserRequest');
		cy.get('.languages-available li:contains(English)').should('exist');
		cy.get('.languages-selected li:contains(English)').should('not.exist');
		cy.get('.page-settings').should('contain', 'Error');
		cy.get('.error-romanReading').should('exist');

		cy.visit('/app/settings');

		// Should still be selected
		cy.get('.languages-selected ul li:contains(English)').should('exist');

		// Adding French
		cy.get('.languages-available ul div:has(> li:contains(French))').click();
		// cy.get('.languages-selector li:first').should('have.class', 'disabled');
		// cy.get('.page-settings').should('contain', 'Saving...');
		// cy.wait('@updateUserRequest');
		cy.get('.languages-available li:contains(French)').should('not.exist');
		cy.get('.languages-selected li:contains(French)').should('exist');
		cy.get('.page-settings').should('contain', 'Saved');
	});
});
