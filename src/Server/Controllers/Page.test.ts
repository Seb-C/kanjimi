import 'jasmine';
import fetch from 'node-fetch';
import User from 'Common/Models/User';
import ApiKey from 'Common/Models/ApiKey';
import UserRepository from 'Server/Repositories/User';
import ApiKeyRepository from 'Server/Repositories/ApiKey';

let user: User;
let apiKey: ApiKey;

describe('PageController', async function() {
	beforeEach(async function() {
		const userRepository = new UserRepository(this.getDatabase());
		const apiKeyRepository = new ApiKeyRepository(this.getDatabase());
		user = await userRepository.create({ ...this.testUser });
		apiKey = await apiKeyRepository.create(user.id);
	});

	it('get (checking results)', async function() {
		const response = await fetch((
			'https://localhost:3000/api/page?url='
			+ encodeURIComponent('https://localhost:3000/test-pages/landing-page-examples.html')
		), {
			method: 'GET',
			headers: {
				Authorization: `Bearer ${apiKey.key}`,
			},
		});
		expect(response.status).toBe(200);

		const data = await response.text();
		expect(data).toContain('<!DOCTYPE html>');
		expect(data).toContain('クリック');
	});

	it('get (error if not html)', async function() {
		const response = await fetch((
			'https://localhost:3000/api/page?url='
			+ encodeURIComponent('https://localhost:3000/api/health-check')
		), {
			method: 'GET',
			headers: {
				Authorization: `Bearer ${apiKey.key}`,
			},
		});
		expect(response.status).toBe(403);
	});

	it('get (error if not GET)', async function() {
		const response = await fetch((
			'https://localhost:3000/api/page?url='
			+ encodeURIComponent('https://localhost:3000/test-pages/landing-page-examples.html')
		), {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${apiKey.key}`,
			},
		});
		expect(response.status).toBe(404);
	});

	it('get (does not forward error codes)', async function() {
		const response = await fetch((
			'https://localhost:3000/api/page?url='
			+ encodeURIComponent('https://localhost:3000/test-pages/non-existing.html')
		), {
			method: 'GET',
			headers: {
				Authorization: `Bearer ${apiKey.key}`,
			},
		});
		expect(response.status).toBe(200);
	});

	it('get (validation errors)', async function() {
		const response = await fetch((
			'https://localhost:3000/api/page?url='
			+ encodeURIComponent('not-an-url.html')
		), {
			method: 'GET',
			headers: {
				Authorization: `Bearer ${apiKey.key}`,
			},
		});
		expect(response.status).toBe(422);
		const responseData = await response.json();

		expect(this.validationErrorResponseValidator(responseData))
			.withContext(JSON.stringify(this.validationErrorResponseValidator.errors))
			.toBe(true);
	});

	it('get (follows redirection)', async function() {
		const response = await fetch((
			'https://localhost:3000/api/page?url='
			+ encodeURIComponent('https://127.0.0.1:3000/')
		), {
			method: 'GET',
			headers: {
				Authorization: `Bearer ${apiKey.key}`,
			},
		});
		expect(response.status).toBe(200);
		expect(response.headers.get('content-location')).toContain('localhost');
	});

	it('get (authentication error)', async function() {
		const response = await fetch((
			'https://localhost:3000/api/page?url='
			+ encodeURIComponent('https://localhost:3000/test-pages/landing-page-examples.html')
		), {
			method: 'GET',
			headers: {
				Authorization: `Bearer wrongtoken`,
			},
		});
		expect(response.status).toBe(403);
	});
});
