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
});
