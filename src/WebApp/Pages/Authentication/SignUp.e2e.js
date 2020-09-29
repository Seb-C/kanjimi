context('SignUp', () => {
	beforeEach(() => {
		// Disabled because Cypress cannot capture fetch queries
		// However it seems to work anyway ?!
		// cy.server();
		// cy.route('POST', '**/user/**').as('createUserRequest');
	});

	it('Not accessible if logged-in', () => {
		cy.setLoggedIn();
		cy.visit('/app/sign-up');
		cy.url().should('not.contain', 'app/sign-up');
		cy.get('.page-sign-up').should('not.exist');
	});
	it('Accessible if logged-out', () => {
		cy.setLoggedOut();
		cy.visit('/app/sign-up');
		cy.get('.page-sign-up').should('be.visible');
	});
	it('Accessible from the homepage', () => {
		cy.setLoggedOut();
		cy.visit('/');
		cy.get('a:contains(Sign-Up)').should('be.visible').click();
		cy.get('.page-sign-up').should('be.visible');
		cy.url().should('contain', 'app/sign-up');
	});

	it('Normal process should work', () => {
		cy.setLoggedOut();
		cy.visit('/app/sign-up');

		const random = Math.random().toString().replace('.', '');
		cy.get('input[name="email"]').type('test-' + random + '@kanjimi.com');
		cy.get('input[name="password"]').type('123456');
		cy.get('input[name="passwordConfirmation"]').type('123456');
		cy.get('input[name="termsAndConditions"]').click();
		cy.get('.languages-available ul div:has(> li:contains(English))').click();
		cy.get('.languages-available ul div:has(> li:contains(Spanish))').click();

		cy.get('button[type="submit"]').click();
		// cy.get('button[type="submit"]').should('be.disabled');
		// cy.wait('@createUserRequest');

		cy.get('.page-sign-up').should('contain', 'successfully created');
		cy.get('.page-sign-up .text-success').should('exist');
	});

	it('Email address', () => {
		cy.setLoggedOut();
		cy.visit('/app/sign-up');
		cy.get('input[name="email"]')
			.should('be.visible')
			.type('test@example.com')
			.its('value')
			.should('be', 'test@example.com');
	});
	it('Email address - cannot be empty', () => {
		cy.setLoggedOut();
		cy.visit('/app/sign-up');
		cy.get('input[name="email"]').its('value').should('be', '');
		cy.get('input[name="termsAndConditions"]').click();
		cy.get('button[type="submit"]').click();
		// cy.get('button[type="submit"]').should('be.disabled');
		// cy.get('input[name="email"]').should('be.disabled');
		// cy.wait('@createUserRequest');
		cy.get('.error-email').should('be.visible');
	});
	it('Email address - must be valid', () => {
		cy.setLoggedOut();
		cy.visit('/app/sign-up');
		cy.get('input[name="email"]').type('not an email');
		cy.get('input[name="termsAndConditions"]').click();
		cy.get('button[type="submit"]').click();
		// cy.get('button[type="submit"]').should('be.disabled');
		// cy.get('input[name="email"]').should('be.disabled');
		// cy.wait('@createUserRequest');
		cy.get('.error-email').should('be.visible');
	});
	it('Email address - already taken', () => {
		cy.setLoggedOut();
		cy.visit('/app/sign-up');

		cy.get('input[name="email"]').type('contact@kanjimi.com');
		cy.get('input[name="password"]').type('123456');
		cy.get('input[name="passwordConfirmation"]').type('123456');
		cy.get('input[name="termsAndConditions"]').click();
		cy.get('.languages-available ul div:has(> li:contains(English))').click();
		cy.get('.languages-available ul div:has(> li:contains(Spanish))').click();

		cy.get('button[type="submit"]').click();
		// cy.get('button[type="submit"]').should('be.disabled');
		// cy.wait('@createUserRequest');

		cy.get('.page-sign-up .error-bottom')
			.should('exist')
			.should('contain', 'already registered');
	});

	it('Passwords', () => {
		cy.setLoggedOut();
		cy.visit('/app/sign-up');

		cy.get('input[name="password"]')
			.should('be.visible')
			.type('123456')
			.its('value')
			.should('be', '123456');

		cy.get('input[name="passwordConfirmation"]')
			.should('be.visible')
			.type('test@example.com')
			.its('value')
			.should('be', '123456');
	});
	it('Passwords - cannot both be empty', () => {
		cy.setLoggedOut();
		cy.visit('/app/sign-up');
		cy.get('input[name="password"]').its('value').should('be', '');
		cy.get('input[name="passwordConfirmation"]').its('value').should('be', '');
		cy.get('input[name="termsAndConditions"]').click();
		cy.get('button[type="submit"]').click();
		// cy.get('button[type="submit"]').should('be.disabled');
		// cy.get('input[type="password"]').should('be.disabled');
		// cy.get('input[type="passwordConfirmation"]').should('be.disabled');
		// cy.wait('@createUserRequest');
		cy.get('.error-password').should('be.visible');
	});
	it('Passwords - first field cannot be empty', () => {
		cy.setLoggedOut();
		cy.visit('/app/sign-up');
		cy.get('input[name="password"]').its('value').should('be', '');
		cy.get('input[name="passwordConfirmation"]').type('123456');
		cy.get('input[name="termsAndConditions"]').click();
		cy.get('button[type="submit"]').click();
		// cy.get('button[type="submit"]').should('be.disabled');
		// cy.get('input[type="password"]').should('be.disabled');
		// cy.get('input[type="passwordConfirmation"]').should('be.disabled');
		// cy.wait('@createUserRequest');
		cy.get('.error-password').should('be.visible');
	});
	it('Passwords - confirmation field cannot be empty', () => {
		cy.setLoggedOut();
		cy.visit('/app/sign-up');
		cy.get('input[name="password"]').type('123456');
		cy.get('input[name="passwordConfirmation"]').its('value').should('be', '');
		cy.get('input[name="termsAndConditions"]').click();
		cy.get('button[type="submit"]').click();
		// cy.get('button[type="submit"]').should('be.disabled');
		// cy.get('input[type="password"]').should('be.disabled');
		// cy.get('input[type="passwordConfirmation"]').should('be.disabled');
		// cy.wait('@createUserRequest');
		cy.get('.error-password').should('be.visible');
	});
	it('Passwords - must be identical', () => {
		cy.setLoggedOut();
		cy.visit('/app/sign-up');
		cy.get('input[name="password"]').type('123456');
		cy.get('input[name="passwordConfirmation"]').type('456789');
		cy.get('input[name="termsAndConditions"]').click();
		cy.get('button[type="submit"]').click();
		// cy.get('button[type="submit"]').should('be.disabled');
		// cy.get('input[type="password"]').should('be.disabled');
		// cy.get('input[type="passwordConfirmation"]').should('be.disabled');
		// cy.wait('@createUserRequest');
		cy.get('.error-password').should('be.visible');
	});

	it('Roman readings switch', () => {
		cy.setLoggedOut();
		cy.visit('/app/sign-up');

		cy.get('.roman-reading-switch')
			.should('be.visible')
			.find('input')
			.should('exist')
			.should('not.be.checked');

		cy.get('.roman-reading-switch').click();
		cy.get('.roman-reading-switch input').should('be.checked');
	});

	it('JLPT level selector', () => {
		cy.setLoggedOut();
		cy.visit('/app/sign-up');

		cy.get('.jlpt-level-selector')
			.should('be.visible')
			.find('input')
			.should('exist');

		cy.get('.jlpt-level-selector input[value=""]').should('be.checked');
		cy.get('.jlpt-level-selector input[value="5"]').should('not.be.checked');
		cy.get('.jlpt-level-selector input[value="4"]').should('not.be.checked');
		cy.get('.jlpt-level-selector input[value="3"]').should('not.be.checked');
		cy.get('.jlpt-level-selector input[value="2"]').should('not.be.checked');
		cy.get('.jlpt-level-selector input[value="1"]').should('not.be.checked');

		cy.get('.jlpt-level-selector label:last-child').click();
		cy.get('.jlpt-level-selector input[value=""]').should('not.be.checked');
		cy.get('.jlpt-level-selector input[value="5"]').should('not.be.checked');
		cy.get('.jlpt-level-selector input[value="4"]').should('not.be.checked');
		cy.get('.jlpt-level-selector input[value="3"]').should('not.be.checked');
		cy.get('.jlpt-level-selector input[value="2"]').should('not.be.checked');
		cy.get('.jlpt-level-selector input[value="1"]').should('be.checked');
	});

	it('Changing and saving languages', () => {
		cy.setLoggedOut();
		cy.visit('/app/sign-up');

		cy.get('.languages-selector').should('be.visible');
		cy.get('.languages-available').should('be.visible');
		cy.get('.languages-selected').should('be.visible');

		// Nothing should be selected already
		cy.get('.languages-selected .smooth-dnd-container li:not(.list-group-item-light)').should('not.exist');

		// Adding English
		cy.get('.languages-available ul div:has(> li:contains(English))').click();
		cy.get('.languages-available li:contains(English)').should('not.exist');
		cy.get('.languages-selected li:contains(English)').should('exist');
	});

	it('Languages cannot be empty', () => {
		cy.setLoggedOut();
		cy.visit('/app/sign-up');

		// Nothing should be selected already
		cy.get('.languages-selected .smooth-dnd-container li:not(.list-group-item-light)').should('not.exist');

		cy.get('input[name="termsAndConditions"]').click();
		cy.get('button[type="submit"]').click();
		// cy.get('button[type="submit"]').should('be.disabled');
		// cy.wait('@createUserRequest');
		cy.get('.error-languages').should('be.visible');
	});

	it('The privacy policy link is valid', () => {
		cy.setLoggedOut();
		cy.visit('/app/sign-up');

		// Note: cannot test the target link because it is a cross-origin resource
		cy.get('form a:contains(Privacy Policy)').should('be.visible');
	});

	it('The terms and conditions link is valid', () => {
		cy.setLoggedOut();
		cy.visit('/app/sign-up');

		// Note: cannot test the target link because it is a cross-origin resource
		cy.get('form a:contains(Terms and Conditions)').should('be.visible');
	});
});
