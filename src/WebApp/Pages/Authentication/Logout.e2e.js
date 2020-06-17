context('Logout', () => {
	it('Not accessible if not logged-in', () => {
		cy.setLoggedOut();
		cy.visit('/app/logout');
		cy.url().should('not.contain', 'app/logout');
		cy.get('.page-logout').should('not.exist');
	});

	it('Page accessible', () => {
		cy.setLoggedIn();
		cy.visit('/app/logout');

		cy.get('.page-logout')
			.should('exist')
			.should('contain', 'successfully');
	});

	it('Really disconnects', () => {
		cy.setLoggedIn();
		cy.visit('/app/logout');

		cy.get('.page-logout').should('exist');

		expect(localStorage.getItem('key')).to.be.null;

		// Can access the login page = currently disconnected
		cy.visit('/app/login');
		cy.get('.page-login').should('be.visible');
	});

	it('Contain a button to log back', () => {
		cy.setLoggedIn();
		cy.visit('/app/logout');

		cy.get('.go-to-login').should('exist');
	});
});
