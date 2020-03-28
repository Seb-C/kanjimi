import ValidationError from 'Client/Api/Errors/Validation';
import AuthenticationError from 'Client/Api/Errors/Authentication';
import ServerError from 'Client/Api/Errors/Server';
import User from 'Common/Models/User';
import ApiKey from 'Common/Models/ApiKey';

export const create = async (attributes: {
	email: string,
	password: string,
}): Promise<ApiKey> => {
	const response = await fetch('http://localhost:3000/api-key', {
		method: 'POST',
		body: JSON.stringify(attributes),
	});
	const responseData = await response.json();

	if (response.status === 422) {
		throw new ValidationError(responseData);
	}
	if (response.status === 403) {
		throw new AuthenticationError(responseData);
	}
	if (response.status >= 500 && response.status < 600) {
		throw new ServerError(await response.text());
	}

	return ApiKey.fromApi(responseData);
};

export const get = async (key: string): Promise<ApiKey> => {
	const response = await fetch('http://localhost:3000/api-key', {
		method: 'GET',
		headers: {
			Authorization: `Bearer ${key}`,
		},
	});
	const responseData = await response.json();

	if (response.status === 403) {
		throw new AuthenticationError(responseData);
	}
	if (response.status >= 500 && response.status < 600) {
		throw new ServerError(await response.text());
	}

	return ApiKey.fromApi(responseData);
};
