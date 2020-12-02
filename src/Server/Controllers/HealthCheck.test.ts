import 'jasmine';
import fetch from 'node-fetch';
import * as Ajv from 'ajv';

const healthCheckResponseValidator = new Ajv({ allErrors: true }).compile({
	type: 'string',
	enum: ['OK'],
});

describe('HealthCheckController', async function() {
	it('get', async function() {
		const response = await fetch('https://localhost/api/health-check');
		expect(response.status).toBe(200);
		const responseData = await response.json();

		expect(healthCheckResponseValidator(responseData))
			.withContext(JSON.stringify(healthCheckResponseValidator.errors))
			.toBe(true);
	});

	it('get (not redirected with a different origin)', async function() {
		const response = await fetch('https://127.0.0.1/api/health-check', {
			redirect: 'error',
		});
		expect(response.status).toBe(200);
		const responseData = await response.json();

		expect(healthCheckResponseValidator(responseData))
			.withContext(JSON.stringify(healthCheckResponseValidator.errors))
			.toBe(true);
	});
});
