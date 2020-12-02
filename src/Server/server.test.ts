import 'jasmine';
import fetch from 'node-fetch';

describe('server', async function() {
	it('redirect to origin if the host is wrong', async function() {
		const response = await fetch('https://127.0.0.1/foo?bar', {
			redirect: 'manual',
		});

		expect(response.status).toBe(301);
		expect(response.headers.get('location')).toBe('https://localhost/foo?bar');
	});
});
