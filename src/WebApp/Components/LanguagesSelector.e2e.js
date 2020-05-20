context('LanguagesSelector', () => {
	beforeEach(() => {
		// Disabled because Cypress cannot capture fetch queries
		// However it seems to work anyway ?!
		// cy.server();
		// cy.route('PATCH', '**/user/**').as('updateUserRequest');
	});

	it('Basic structure works', () => {
		cy.setLoggedIn();
		cy.visit('/app/settings');

		cy.get('.languages-selector').should('be.visible');
		cy.get('.languages-available').should('be.visible');
		cy.get('.languages-selected').should('be.visible');

		cy.get('.languages-selected li:contains(French)').should('exist');
		cy.get('.languages-selected li:contains(English)').should('exist');
	});

	it('Clicking to remove a language', () => {
		cy.setLoggedIn();
		cy.visit('/app/settings');

		cy.get('.languages-selected ul div:has(> li:contains(French))').click();
		// cy.wait('@updateUserRequest');
		cy.get('.languages-available li:contains(French)').should('exist');
		cy.get('.languages-selected li:contains(French)').should('not.exist');
	});

	it('Clicking to add a language', () => {
		cy.setLoggedIn();
		cy.visit('/app/settings');

		cy.get('.languages-available ul div:has(> li:contains(French))').click();
		// cy.wait('@updateUserRequest');
		cy.get('.languages-available li:contains(French)').should('not.exist');
		cy.get('.languages-selected li:contains(French)').should('exist');
	});

	it('Dragging and dropping a language from the right to the left', () => {
		cy.setLoggedIn();
		cy.visit('/app/settings');

		// TODO
	});

	it('Dragging and dropping a language from the left to the top right', () => {
		cy.setLoggedIn();
		cy.visit('/app/settings');

		// TODO
	});

	it('Dragging and dropping a language from the left to the bottom right', () => {
		cy.setLoggedIn();
		cy.visit('/app/settings');

		// TODO
	});

	it('Dragging and dropping a language from the right to the right (sorting)', () => {
		cy.setLoggedIn();
		cy.visit('/app/settings');

		// TODO
	});
});
