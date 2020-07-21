context('Notification', () => {
	it('Not displayed on the webapp', () => {
		cy.setLoggedOut();
		cy.visit('/app/login')
		cy.get('.kanjimi.notification').should('not.exist');
	});

	it('Not displayed on the homepage', () => {
		cy.setLoggedOut();
		cy.visit('/')
		cy.get('.kanjimi.notification').should('not.exist');
	});

	it('Not displayed if already logged-in when showing a page', () => {
		cy.setLoggedIn();
		cy.get('.kanjimi.notification').should('not.exist');
	});

	it('Shows a notification with a link if logged out', () => {
		cy.setLoggedOut();
		cy.visit('/test-pages/wikipedia.html');

		cy.get('.kanjimi.notification').should('exist').should('contain', 'not connected');
		cy.get('.kanjimi.notification a').should('exist');
	});

	// Disabled because Cypress cannot access the window.open of the extension
	// ( https://developer.mozilla.org/en-US/docs/Mozilla/Tech/Xray_vision )
	it.skip('The link to the login page works', () => {
		cy.setLoggedOut();
		cy.visit('/test-pages/wikipedia.html');

		cy.window().then((win) => {
			win.open = cy.stub();
		});

		cy.get('.kanjimi.notification a').click();

		cy.window().then((win) => {
			expect(win.open).to.be.called;
			expect(win.open.firstCall.args[0]).to.contain('/app/login');
		});
	});

	it.skip('The login page is automatically closed after login', () => {
		// TODO cannot be tested because Cypress only works in one window
	});

	it('Shows a confirmation notification after login', () => {
		cy.setLoggedOut();
		cy.visit('/test-pages/wikipedia.html');

		cy.window().then((win) => {
			win.dispatchEvent(
				new CustomEvent('kanjimi-set-api-key', {
					detail: 'PQKXFg4puvIsoY0/iwVDCNtt6K+iPj7PiK4LlayMOHddJErCcZl2lx8cnB7kT28+MqZX+FTu3efwrqXVqE2dbQ==',
				}),
			);
		});

		cy.get('.kanjimi.notification')
			.should('exist')
			.should('contain', 'have been connected')
			.should('contain', 'contact@kanjimi.com');

		cy.wait(6000);

		// The notification should disappear after a while
		cy.get('.kanjimi.notification').should('not.exist');
	});

	it('Shows a notification after logout', () => {
		cy.setLoggedIn();
		cy.visit('/test-pages/wikipedia.html');

		cy.window().then((win) => {
			win.dispatchEvent(
				new CustomEvent('kanjimi-set-api-key', {
					detail: null,
				}),
			);
		});

		cy.get('.kanjimi.notification')
			.should('exist')
			.should('contain', 'have been disconnected');
		cy.get('.kanjimi.notification a').should('exist');
	});

	it('The notification can be closed', () => {
		cy.setLoggedOut();
		cy.visit('/test-pages/wikipedia.html');

		cy.get('.kanjimi.notification .notification-close-button').should('exist').click();
		cy.get('.kanjimi.notification').should('not.exist');
	});
});
