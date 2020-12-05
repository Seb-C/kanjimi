context('Analyze', () => {
	it('Non-accessible if not logged-in', () => {
		cy.setLoggedOut();
		cy.visit('/app/analyze');
		cy.url().should('contain', 'app/login');
		cy.get('.page-login').should('be.visible');
	});
	it('Accessible if logged-in', () => {
		cy.setLoggedIn();
		cy.visit('/app/analyze');
		cy.url().should('contain', 'app/analyze');
		cy.get('.page-analyze').should('be.visible');
	});

	it('Redirects to the browser if an URL is typed', () => {
		cy.setLoggedIn();
		cy.visit('/app/analyze?text=https%3A%2F%2Flocalhost%2Ffoo-bar');
		cy.url().should('contain', 'app?url=https%3A%2F%2Flocalhost%2Ffoo-bar');
		cy.get('.page-browser').should('be.visible');
	});

	it('Can analyze a text using the form', () => {
		cy.setLoggedIn();
		cy.visit('/app/analyze');
		cy.get('.form-container textarea').type('食べる');
		cy.get('.form-container button').click();
		cy.get('.iframe-analyze').its('0.contentDocument.body').then(cy.wrap)
			.should('contain', '食べる')
			.should('contain', 'manger')
			.find('.word')
			.click()
			.closest('body')
			.find('.tooltip')
			.should('contain', '食べる');
	});
	it('Can analyze a text given in the URL', () => {
		cy.setLoggedIn();
		// cy.route('POST', '**/api/lexer/analyze*').as('analyzeRoute');
		cy.visit('/app/analyze?text=%E9%A3%9F%E3%81%B9%E3%82%8B');
		// cy.wait('@analyzeRoute');
		cy.wait(200);
		cy.get('.form-container textarea').its('value').should('be', '食べる');
		cy.get('.iframe-analyze').its('0.contentDocument.body').then(cy.wrap).should('contain', '食べる');
	});
	it('Changing the URL content properly updates the UI', () => {
		cy.setLoggedIn();
		// cy.route('POST', '**/api/lexer/analyze*').as('analyzeRoute');
		cy.visit('/app/analyze?text=%E9%A3%9F%E3%81%B9%E3%82%8B');
		// cy.wait('@analyzeRoute');
		cy.wait(200);
		cy.get('.form-container textarea').its('value').should('be', '食べる');
		cy.get('.iframe-analyze').its('0.contentDocument.body').then(cy.wrap).should('contain', '食べる');

		cy.get('#main-menu .nav-link:contains(Analyze)').click();
		cy.wait(200);
		cy.get('.form-container textarea').its('value').should('not.be', '食べる');
		cy.get('.iframe-analyze').should('not.exist');
	});
	it('Can go back to the previous text using the browser button', () => {
		cy.setLoggedIn();
		cy.visit('/app/analyze');
		// cy.route('POST', '**/api/lexer/analyze*').as('analyzeRoute');
		cy.visit('/app/analyze?text=%E9%A3%9F%E3%81%B9%E3%82%8B')
		// cy.wait('@analyzeRoute');
		cy.wait(200);
		cy.get('.form-container textarea').its('value').should('be', '食べる');
		cy.get('.iframe-analyze').its('0.contentDocument.body').then(cy.wrap).should('contain', '食べる');

		cy.get('.form-container textarea').clear().type('作る');
		cy.get('.form-container button').click();
		cy.get('.iframe-analyze').its('0.contentDocument.body').then(cy.wrap).should('contain', '作る');

		cy.go('back');
		cy.get('.form-container textarea').its('value').should('be', '食べる');
		cy.get('.iframe-analyze').its('0.contentDocument.body').then(cy.wrap).should('contain', '食べる');
	});
	it('XSS does not work', () => {
		cy.setLoggedIn();
		cy.visit('/app/analyze');

		cy.get('.form-container textarea').type('<button>');
		cy.get('.form-container button').click();
		cy.get('.iframe-analyze').its('0.contentDocument.body').then(cy.wrap)
			.should('contain', '<button>')
			.closest('body')
			.find('button')
			.should('not.exist');
	});
});
