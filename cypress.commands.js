Cypress.Commands.add('setLoggedIn', () => {
	cy.visit('http://localhost:3000/www/app/login');

	// Forcing disconnect before connecting (just in case it was not cleared properly)
	localStorage.removeItem('key');
	cy.window().then((window) => {
		window.dispatchEvent(new window.CustomEvent('kanjimi-set-api-key', { detail: null }));
	})

	cy.get('input[name="email"]').type('contact@kanjimi.com');
	cy.get('input[name="password"]').type('YQPtL67gddfnkads');
	cy.get('button[type="submit"]').click();
});

Cypress.Commands.add('setLoggedOut', () => {
	cy.visit('http://localhost:3000/www/app/');

	// Disconnecting from the website
	localStorage.removeItem('key');

	// Manually disconnecting the extension (until we have a disconnect process)
	cy.window().then((window) => {
		window.dispatchEvent(new window.CustomEvent('kanjimi-set-api-key', { detail: null }));
	})
});
