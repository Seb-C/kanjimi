context('ChangePassword', () => {
	beforeEach(() => {
		// Disabled because Cypress cannot capture fetch queries
		// cy.server();
		// cy.route('PATCH', '**/user/**').as('updateUserRequest');
	});

	it('Not accessible if logged-out', () => {
		cy.setLoggedOut();
		cy.visit('/app/change-password');
		cy.url().should('not.contain', 'app/change-password');
		cy.get('.page-change-password').should('not.exist');
	});
	it('Accessible if logged-in', () => {
		cy.setLoggedIn();
		cy.visit('/app/change-password');
		cy.url().should('contain', 'app/change-password');
		cy.get('.page-change-password').should('be.visible');
	});

	it('Normal case that should work', () => {
		cy.setLoggedIn();
		cy.visit('/app/change-password');

		cy.get('input[name="oldPassword"]').should('be.visible').type('YQPtL67gddfnkads');
		cy.get('input[name="password"]').should('be.visible').type('YQPtL67gddfnkads');
		cy.get('input[name="passwordConfirmation"]').should('be.visible').type('YQPtL67gddfnkads');

		cy.get('button[type="submit"]').click();
		// cy.wait('@updateUserRequest');

		cy.get('.page-change-password').should('contain', 'successfully been changed');
	});

	it('Error if empty', () => {
		cy.setLoggedIn();
		cy.visit('/app/change-password');

		cy.get('button[type="submit"]').click();
		// cy.wait('@updateUserRequest');

		cy.get('input[name="oldPassword"]').should('have.class', 'is-invalid');
		cy.get('input[name="password"]').should('have.class', 'is-invalid');
		cy.get('input[name="passwordConfirmation"]').should('have.class', 'is-invalid');
		cy.get('.error-password').should('be.visible');
		cy.get('.error-oldPassword').should('be.visible');
	});

	it('Error if the old password is empty', () => {
		cy.setLoggedIn();
		cy.visit('/app/change-password');

		cy.get('input[name="password"]').should('be.visible').type('123456');
		cy.get('input[name="passwordConfirmation"]').should('be.visible').type('123456');

		cy.get('button[type="submit"]').click();
		// cy.wait('@updateUserRequest');

		cy.get('input[name="oldPassword"]').should('have.class', 'is-invalid');
		cy.get('.error-oldPassword').should('be.visible');
	});
	it('Error if the new password is empty', () => {
		cy.setLoggedIn();
		cy.visit('/app/change-password');

		cy.get('input[name="oldPassword"]').should('be.visible').type('YQPtL67gddfnkads');

		cy.get('button[type="submit"]').click();
		// cy.wait('@updateUserRequest');

		cy.get('input[name="password"]').should('have.class', 'is-invalid');
		cy.get('input[name="passwordConfirmation"]').should('have.class', 'is-invalid');
		cy.get('.error-password').should('be.visible');
	});

	it('Error if the two passwords does not match', () => {
		cy.setLoggedIn();
		cy.visit('/app/change-password');

		cy.get('input[name="oldPassword"]').should('be.visible').type('YQPtL67gddfnkads');
		cy.get('input[name="password"]').should('be.visible').type('123456');
		cy.get('input[name="passwordConfirmation"]').should('be.visible').type('qwerty');

		cy.get('button[type="submit"]').click();
		// cy.wait('@updateUserRequest');

		cy.get('input[name="password"]').should('have.class', 'is-invalid');
		cy.get('input[name="passwordConfirmation"]').should('have.class', 'is-invalid');
		cy.get('.error-password').should('be.visible');
	});

	it('Error if the old password is wrong', () => {
		cy.setLoggedIn();
		cy.visit('/app/change-password');

		cy.get('input[name="oldPassword"]').should('be.visible').type('wrong_password');
		cy.get('input[name="password"]').should('be.visible').type('123456');
		cy.get('input[name="passwordConfirmation"]').should('be.visible').type('123456');

		cy.get('button[type="submit"]').click();
		// cy.wait('@updateUserRequest');

		cy.get('.error-bottom').should('be.visible');
	});

	// Note: the local server is too fast to intercept this, so the test is disabled...
	it.skip('Visual feedback while loading', () => {
		cy.setLoggedIn();
		cy.visit('/app/change-password');

		cy.get('button[type="submit"]').click();

		cy.get('input[name="oldPassword"]').should('be.disabled');
		cy.get('input[name="password"]').should('be.disabled');
		cy.get('input[name="passwordConfirmation"]').should('be.disabled');
		cy.get('button[type="submit"]').should('be.disabled');
		cy.get('button[type="submit"] .spinner-border').should('be.visible');
	});
});
