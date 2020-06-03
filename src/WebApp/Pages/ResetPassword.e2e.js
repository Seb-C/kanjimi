context('RequestResetPassword', () => {
	beforeEach(() => {
		// Disabled because Cypress cannot capture fetch queries
		// cy.server();
		// cy.route('PATCH', '**/reset-password').as('resetPasswordRequest');
	});

	it('Accessible even if logged-in', () => {
		cy.setLoggedIn();
		cy.visit('/app/reset-password');
		cy.url().should('contain', 'app/reset-password');
		cy.get('.page-reset-password').should('exist');
	});

	it('With a wrong id', () => {
		cy.visit('/app/reset-password?userId=42&passwordResetKey=test');
		cy.get('input[name="password"]').type('123456');
		cy.get('input[name="passwordConfirmation"]').type('123456');
		cy.get('button[type="submit"]').click();
		// cy.get('button[type="submit"]').should('be.disabled');
		// cy.get('input[name="email"]').should('be.disabled');
		// cy.wait('@resetPasswordRequest');
		cy.get('.error-bottom').should('be.visible');
	});

	it('With a wrong key', () => {
		cy.visit('/app/reset-password?userId=cef830cb-6e75-43ab-91d3-ae13c82bd836&passwordResetKey=wrong_key');
		cy.get('input[name="password"]').type('123456');
		cy.get('input[name="passwordConfirmation"]').type('123456');
		cy.get('button[type="submit"]').click();
		// cy.get('button[type="submit"]').should('be.disabled');
		// cy.get('input[name="email"]').should('be.disabled');
		// cy.wait('@resetPasswordRequest');
		cy.get('.error-bottom').should('be.visible');
	});

	it('Error if the passwords are empty', () => {
		cy.visit('/app/reset-password?userId=test&passwordResetKey=test');
		cy.get('input[name="password"]').clear();
		cy.get('input[name="passwordConfirmation"]').clear();
		cy.get('button[type="submit"]').click();
		// cy.get('button[type="submit"]').should('be.disabled');
		// cy.get('input[name="email"]').should('be.disabled');
		// cy.wait('@resetPasswordRequest');
		cy.get('.error-password').should('be.visible');
	});

	it('Error if the password differs', () => {
		cy.visit('/app/reset-password?userId=test&passwordResetKey=test');
		cy.get('input[name="password"]').type('123456');
		cy.get('input[name="passwordConfirmation"]').type('qwerty');
		cy.get('button[type="submit"]').click();
		cy.get('.error-password').should('be.visible');
	});

	it('Normal process should work', () => {
		cy.visit('/app/reset-password?userId=cef830cb-6e75-43ab-91d3-ae13c82bd836&passwordResetKey=cypress');
		cy.get('input[name="password"]').type('123456');
		cy.get('input[name="passwordConfirmation"]').type('123456');
		cy.get('button[type="submit"]').click();
		// cy.get('button[type="submit"]').should('be.disabled');
		// cy.get('input[name="email"]').should('be.disabled');
		// cy.wait('@resetPasswordRequest');
		cy.get('.page-reset-password').should('contain', 'successfully');
	});

	it('The link to the login page works', () => {
		cy.setLoggedOut();
		cy.visit('/app/reset-password?userId=cef830cb-6e75-43ab-91d3-ae13c82bd836&passwordResetKey=cypress');
		cy.get('input[name="password"]').type('123456');
		cy.get('input[name="passwordConfirmation"]').type('123456');
		cy.get('button[type="submit"]').click();
		// cy.get('button[type="submit"]').should('be.disabled');
		// cy.get('input[name="email"]').should('be.disabled');
		// cy.wait('@resetPasswordRequest');

		cy.get('.go-to-login').should('exist').click();
		cy.url().should('contain', 'app/login');
		cy.get('.page-login').should('be.visible');
	});
});
