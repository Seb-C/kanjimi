context('Login', () => {
	it('Login on the website also logs in the extension', () => {
		cy.setLoggedOut();

		cy.visit('http://localhost:3000/www/app/login');

		// Logging in
		cy.get('input[name="email"]').type('contact@kanjimi.com');
		cy.get('input[name="password"]').type('YQPtL67gddfnkads');
		cy.get('button[type="submit"]').click();

		cy.visit('/test-pages/wikipedia.html')

		cy.get('#firstHeading').should('contain', '日本');

		cy.get('#firstHeading .kanjimi-sentence').should('exist');
	});
});
