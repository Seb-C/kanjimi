context('Changelog', () => {
	it('Accessible if not logged-in', () => {
		cy.setLoggedOut();
		cy.visit('/app/changelog')
		cy.url().should('contain', 'app/changelog');
		cy.get('.page-changelog').should('be.visible');
	});
	it('Accessible if logged-in', () => {
		cy.setLoggedIn();
		cy.visit('/app/changelog')
		cy.url().should('contain', 'app/changelog');
		cy.get('.page-changelog').should('be.visible');
	});
	it('Access from the logged-in menu', () => {
		cy.setLoggedIn();
		cy.visit('/app')
		cy.get('nav a:contains(Changelog)').should('not.be.visible');
		cy.get('nav .dropdown-toggle').should('be.visible').click();
		cy.get('nav .dropdown a:contains(Changelog)').should('be.visible').click();
		cy.get('.page-changelog').should('be.visible');
	});
	it('Access from the logged-out menu', () => {
		cy.setLoggedOut();
		cy.visit('/app')
		cy.get('nav a:contains(Changelog)').should('be.visible').click();
		cy.get('.page-changelog').should('be.visible');
	});
});
