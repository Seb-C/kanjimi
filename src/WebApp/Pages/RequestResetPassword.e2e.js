context('RequestResetPassword', () => {
	beforeEach(() => {
		// Disabled because Cypress cannot capture fetch queries
		// cy.server();
		// cy.route('POST', '**/request-reset-password').as('requestResetPasswordRequest');
	});

	it('Not accessible if logged-in', () => {
		cy.setLoggedIn();
		cy.visit('/app/request-reset-password');
		cy.url().should('not.contain', 'app/request-reset-password');
		cy.get('.page-request-reset-password').should('not.exist');
	});
	it('Accessible if logged-out', () => {
		cy.setLoggedOut();
		cy.visit('/app/request-reset-password');
		cy.url().should('contain', 'app/request-reset-password');
		cy.get('.page-request-reset-password').should('be.visible');
	});
	it('Access from the login page', () => {
		cy.setLoggedOut();
		cy.visit('/app/login');
		cy.get('a:contains(Forgot your password)').should('be.visible').click();
		cy.url().should('contain', 'app/request-reset-password');
		cy.get('.page-request-reset-password').should('be.visible');
	});

	it('Error if empty', () => {
		cy.setLoggedOut();
		cy.visit('/app/request-reset-password');

		cy.get('button[type="submit"]').click();
		// cy.wait('@requestResetPasswordRequest');

		cy.get('input[name="email"]').should('have.class', 'is-invalid');
		cy.get('.error-email').should('exist').should('contain', 'required');
	});
	it('Error if invalid email syntax', () => {
		cy.setLoggedOut();
		cy.visit('/app/request-reset-password');

		cy.get('input[name="email"]').type('not an email');
		cy.get('button[type="submit"]').click();
		// cy.wait('@requestResetPasswordRequest');

		cy.get('input[name="email"]').should('have.class', 'is-invalid');
		cy.get('.error-email').should('exist').should('contain', 'valid');
	});

	it('Works with a valid email', () => {
		cy.setLoggedOut();
		cy.visit('/app/request-reset-password');
		cy.get('input[name="email"]').type('contact@kanjimi.com');
		cy.get('button[type="submit"]').click();
		// cy.wait('@requestResetPasswordRequest');
	});
	it('Works with an unknown email', () => {
		cy.setLoggedOut();
		cy.visit('/app/request-reset-password');
		cy.get('input[name="email"]').type('invalid@kanjimi.com');
		cy.get('button[type="submit"]').click();
		// cy.wait('@requestResetPasswordRequest');
	});

	// Note: the local server is too fast to intercept this, so the test is disabled...
	it.skip('Visual feedback while loading', () => {
		cy.setLoggedOut();
		cy.visit('/app/request-reset-password');

		cy.get('input[name="email"]').type('invalid@kanjimi.com');
		cy.get('button[type="submit"]').click();

		cy.get('input[name="email"]').should('be.disabled');
		cy.get('button[type="submit"]').should('be.disabled');
		cy.get('button[type="submit"] .spinner-border').should('be.visible');
	});
});
