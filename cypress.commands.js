Cypress.Commands.add('setLoggedIn', () => {
	cy.visit('http://localhost:3000/www/app/');

	const apiKey = 'PQKXFg4puvIsoY0/iwVDCNtt6K+iPj7PiK4LlayMOHddJErCcZl2lx8cnB7kT28+MqZX+FTu3efwrqXVqE2dbQ==';
	localStorage.setItem('key', apiKey);
	cy.window().then(async (window) => {
		window.dispatchEvent(new window.CustomEvent('kanjimi-set-api-key', { detail: apiKey }));
	})

	// Restoring the default preferences
	cy.request({
		method: 'PATCH',
		url: 'http://localhost:3000/user/cef830cb-6e75-43ab-91d3-ae13c82bd836',
		headers: {
			Authorization: `Bearer ${apiKey}`,
		},
		body: JSON.stringify({
			languages: ['fr', 'en'],
			romanReading: false,
		}),
	});
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
