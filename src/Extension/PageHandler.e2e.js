context('PageHandler', () => {
	it('Tokenization on load', () => {
		cy.setLoggedIn();
		cy.visit('/test-pages/wikipedia.html');

		cy.get('#firstHeading').should('contain', '日本');

		cy.get('#firstHeading .kanjimi-sentence').should('exist');

		cy.get('.kanjimi-sentence').its('length').should('be.gte', 50);
		cy.get('.kanjimi-sentence:visible').should('exist');
	});

	it('Loading on scroll', () => {
		cy.setLoggedIn();
		cy.visit('/test-pages/wikipedia.html');

		cy.get('.kanjimi-sentence').then((sentences) => {
			const sentencesCount = sentences.length;
			cy.scrollTo(0, 1500);

			cy.get('.kanjimi-loader').should('exist');
			cy.wait(500);

			cy.get('.kanjimi-loader').should('not.exist');
			cy.get('.kanjimi-sentence').its('length').should('be.gt', sentencesCount);
			cy.get('.kanjimi-sentence:visible').should('exist');
		});
	});

	it('Autologin the extension when visiting the site', () => {
		// Setting the extension as logged out, then the site as logged-in
		cy.setLoggedOut();
		cy.window().then(() => {
			localStorage.setItem('key', 'PQKXFg4puvIsoY0/iwVDCNtt6K+iPj7PiK4LlayMOHddJErCcZl2lx8cnB7kT28+MqZX+FTu3efwrqXVqE2dbQ==');
		});

		cy.visit('/app/about'); // Should trigger the login of the extension

		// It should work if we are not logged-in
		cy.visit('/test-pages/wikipedia.html');
		cy.get('#firstHeading .kanjimi-sentence').should('exist');
	});
});
