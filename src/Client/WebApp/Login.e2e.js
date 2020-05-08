context('Login', () => {
	beforeEach(() => {
		// Disabled because Cypress cannot capture fetch queries
		// However it seems to work anyway ?!
		// cy.server();
		// cy.route('POST', '**/api-key').as('loginRequest');
	});

	it('Not accessible if logged-in', () => {
		cy.setLoggedIn();
		cy.visit('/app/login');
		cy.url().should('not.contain', 'app/login');
		cy.get('.page-login').should('not.exist');
	});
	it('Accessible if logged-out', () => {
		cy.setLoggedOut();
		cy.visit('/app/login');
		cy.url().should('contain', 'app/login');
		cy.get('.page-login').should('be.visible');
	});
	it('Errors if empty', () => {
		cy.setLoggedOut();
		cy.visit('/app/login');

		cy.get('button[type="submit"]').click();
		// cy.wait('@loginRequest');

		cy.get('input[name="email"]').should('have.class', 'is-invalid');
		cy.get('.error-email').should('exist').should('contain', 'required');

		cy.get('input[name="password"]').should('have.class', 'is-invalid');
		cy.get('.error-password').should('exist').should('contain', 'required');
	});
	it('Error if invalid email syntax', () => {
		cy.setLoggedOut();
		cy.visit('/app/login');

		cy.get('input[name="email"]').type('not an email');
		cy.get('input[name="password"]').type('123456');
		cy.get('button[type="submit"]').click();
		// cy.wait('@loginRequest');

		cy.get('input[name="email"]').should('have.class', 'is-invalid');
		cy.get('.error-email').should('exist').should('contain', 'valid');
	});
	it('Error if invalid email', () => {
		cy.setLoggedOut();
		cy.visit('/app/login');

		cy.get('input[name="email"]').type('invalid@cypress.com');
		cy.get('input[name="password"]').type('YQPtL67gddfnkads');
		cy.get('button[type="submit"]').click();
		// cy.wait('@loginRequest');

		cy.get('.error-bottom').should('exist').should('contain', 'email or password');
	});
	it('Error if invalid password', () => {
		cy.setLoggedOut();
		cy.visit('/app/login');

		cy.get('input[name="email"]').type('contact@kanjimi.com');
		cy.get('input[name="password"]').type('123456');
		cy.get('button[type="submit"]').click();
		// cy.wait('@loginRequest');

		cy.get('.error-bottom').should('exist').should('contain', 'email or password');
	});
	it('Can login with valid credentials', () => {
		cy.setLoggedOut();
		cy.visit('/app/login');
		cy.get('input[name="email"]').type('contact@kanjimi.com');
		cy.get('input[name="password"]').type('YQPtL67gddfnkads');
		cy.get('button[type="submit"]')
			.click()
			// .wait('@loginRequest')
			.should(() => {
				expect(localStorage.getItem('key')).not.to.be.null;
			});
		cy.url().should('not.contain', 'app/login');
	});
});
