import 'jasmine';
import fetch from 'node-fetch';
import * as Ajv from 'ajv';

const healthCheckResponseValidator = new Ajv({ allErrors: true }).compile({
	type: 'string',
	enum: ['OK'],
});

describe('HealthCheckController', async function() {
	it('get', async function() {
		const response = await fetch('http://localhost:3000/api/health-check');
		expect(response.status).toBe(200);
		const responseData = await response.json();

		expect(healthCheckResponseValidator(responseData))
			.withContext(JSON.stringify(healthCheckResponseValidator.errors))
			.toBe(true);
	});
});
