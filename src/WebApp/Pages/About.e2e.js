context('About', () => {
	it('Accessible if not logged-in', () => {
		cy.setLoggedOut();
		cy.visit('/app/about')
		cy.url().should('contain', 'app/about');
		cy.get('.page-about').should('be.visible');
	});
	it('Accessible if logged-in', () => {
		cy.setLoggedIn();
		cy.visit('/app/about')
		cy.url().should('contain', 'app/about');
		cy.get('.page-about').should('be.visible');
	});
	it('Access from the homepage', () => {
		cy.visit('/');
		cy.get('a:contains(About Kanjimi)').should('be.visible').click();
		cy.url().should('contain', 'app/about');
		cy.get('.page-about').should('be.visible');
	});
	it('Access from the app', () => {
		cy.visit('/app');
		cy.get('a:contains(About Kanjimi)').should('be.visible').click();
		cy.url().should('contain', 'app/about');
		cy.get('.page-about').should('be.visible');
	});
});
