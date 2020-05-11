Cypress.Commands.add('setLoggedIn', () => {
	cy.visit('http://localhost:3000/www/app/');

	const apiKey = 'PQKXFg4puvIsoY0/iwVDCNtt6K+iPj7PiK4LlayMOHddJErCcZl2lx8cnB7kT28+MqZX+FTu3efwrqXVqE2dbQ==';
	localStorage.setItem('key', apiKey);
	cy.window().then((window) => {
		window.dispatchEvent(new window.CustomEvent('kanjimi-set-api-key', { detail: apiKey }));
	})
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
