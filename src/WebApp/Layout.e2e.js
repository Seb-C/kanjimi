context('Layout', () => {
	it('The menu links are changing the content', () => {
		cy.setLoggedOut();
		cy.visit('/app/random/invalid/page')
		cy.get('.page-not-found').should('be.visible');
		cy.get('nav .nav-item a:Contains(Login)')
			.should('be.visible')
			.click();

		cy.url().should('contain', 'app/login');
		cy.get('.page-login').should('be.visible');
	});

	it('The navbar contains the user email if logged in', () => {
		cy.setLoggedIn();
		cy.visit('/app/')
		cy.get('nav').should('contain', 'contact@kanjimi.com');
	});

	it('The navbar does not contain the user email if not logged in', () => {
		cy.setLoggedOut();
		cy.visit('/app/')
		cy.get('nav').should('not.contain', 'contact@kanjimi.com');
	});

	it('The active menu link works', () => {
		cy.setLoggedIn();
		cy.visit('/app/settings')
		cy.get('nav a:contains(Settings)').should('have.class', 'active');
		cy.get('nav a:contains(Home)').click();
		cy.get('nav a:contains(Home)').should('have.class', 'active');
		cy.get('nav a:contains(Settings)').click();
		cy.get('nav a:contains(Settings)').should('have.class', 'active');
	});

	it('Links when logged in', () => {
		cy.setLoggedIn();
		cy.visit('/app')
		cy.get('nav a:contains(Settings)').should('exist');
		cy.get('nav a:contains(Logout)').should('exist');
		cy.get('nav a:contains(Login)').should('not.exist');
	});

	it('Links when logged out', () => {
		cy.setLoggedOut();
		cy.visit('/app')
		cy.get('nav a:contains(Settings)').should('not.exist');
		cy.get('nav a:contains(Logout)').should('not.exist');
		cy.get('nav a:contains(Login)').should('exist');
	});

	it('Test the user dropdown', () => {
		cy.setLoggedIn();
		cy.visit('/app')
		cy.get('nav a:contains(Logout)').should('not.be.visible');
		cy.get('nav .dropdown-toggle').should('be.visible').click();
		cy.get('nav a:contains(Logout)').should('be.visible');
	});

	it('Can go back and forth using the browser buttons', () => {
		cy.setLoggedOut();

		cy.visit('/app/login')
		cy.url().should('contain', 'app/login');
		cy.get('.page-login').should('be.visible');

		cy.get('a:contains(Forgot your password)').click();
		cy.url().should('contain', 'app/request-reset-password');
		cy.get('.page-request-reset-password').should('be.visible');

		cy.go('back');
		cy.url().should('contain', 'app/login');
		cy.get('.page-login').should('be.visible');

		cy.go('forward');
		cy.url().should('contain', 'app/request-reset-password');
		cy.get('.page-request-reset-password').should('be.visible');
	});
});
