Cypress.Commands.add('setLoggedIn', () => {
	cy.visit('http://localhost:3000/www/app/');
	localStorage.setItem('key', 'PQKXFg4puvIsoY0/iwVDCNtt6K+iPj7PiK4LlayMOHddJErCcZl2lx8cnB7kT28+MqZX+FTu3efwrqXVqE2dbQ==');
});

Cypress.Commands.add('setLoggedOut', () => {
	cy.visit('http://localhost:3000/www/app/');
	localStorage.removeItem('key');
});
