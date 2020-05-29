context('VerifyEmail', () => {
	beforeEach(() => {
		// Disabled because Cypress cannot capture fetch queries
		// cy.server();
		// cy.route('PATCH', '**/user/*/verify-email').as('verifyEmailRequest');
	});

	it('Not accessible if logged-in', () => {
		cy.setLoggedIn();
		cy.visit('/app/verify-email');
		cy.url().should('not.contain', 'app/verify-email');
		cy.get('.page-verify-email').should('not.exist');
	});

	it('The page structure is visible', () => {
		cy.setLoggedOut();
		cy.visit('/app/verify-email');

		cy.get('.page-verify-email').should('exist').should('be.visible');

		// cy.get('.page-verify-email').should('contain', 'Please wait');
		// cy.wait('@verifyEmailRequest');
	});

	it('With an already validated account id', () => {
		cy.setLoggedOut();
		cy.visit('/app/verify-email?userId=cef830cb-6e75-43ab-91d3-ae13c82bd836&emailVerificationKey=fake_key');
		// cy.wait('@verifyEmailRequest');

		cy.get('.page-verify-email')
			.should('exist')
			.should('be.visible')
			.should('contain', 'successfully validated');
	});

	it('With a wrong id', () => {
		cy.setLoggedOut();
		cy.visit('/app/verify-email?userId=wrong_id');
		// cy.wait('@verifyEmailRequest');

		cy.get('.page-verify-email')
			.should('exist')
			.should('be.visible')
			.should('contain', 'could not verify');
	});

	it('Does not contains a login button if it fails', () => {
		cy.setLoggedOut();
		cy.visit('/app/verify-email?userId=wrong_id');
		// cy.wait('@verifyEmailRequest');

		cy.get('.go-to-login').should('not.exist');
	});

	it('Does contain a login button if it succeeds', () => {
		cy.setLoggedOut();
		cy.visit('/app/verify-email?userId=cef830cb-6e75-43ab-91d3-ae13c82bd836&emailVerificationKey=fake_key');
		// cy.wait('@verifyEmailRequest');

		cy.get('.go-to-login').should('exist');
	});
});
