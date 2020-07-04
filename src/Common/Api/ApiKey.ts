import ValidationError from 'Common/Api/Errors/Validation';
import AuthenticationError from 'Common/Api/Errors/Authentication';
import ServerError from 'Common/Api/Errors/Server';
import ApiKey from 'Common/Models/ApiKey';

export const create = async (attributes: {
	email: string,
	password: string,
}): Promise<ApiKey> => {
	const response = await fetch(`${process.env.KANJIMI_API_URL}/api-key`, {
		method: 'POST',
		body: JSON.stringify(attributes),
	});

	let responseData: any;
	try {
		responseData = await response.json();
	} catch (jsonError) {
		throw new ServerError(null);
	}

	if (response.status === 422) {
		throw new ValidationError(responseData);
	}
	if (response.status === 403) {
		throw new AuthenticationError(responseData);
	}
	if (response.status >= 500 && response.status < 600) {
		throw new ServerError(responseData);
	}

	return ApiKey.fromApi(responseData);
};

export const get = async (key: string): Promise<ApiKey> => {
	const response = await fetch(`${process.env.KANJIMI_API_URL}/api-key`, {
		method: 'GET',
		headers: {
			Authorization: `Bearer ${key}`,
		},
	});

	let responseData: any;
	try {
		responseData = await response.json();
	} catch (jsonError) {
		throw new ServerError(null);
	}

	if (response.status === 403) {
		throw new AuthenticationError(responseData);
	}
	if (response.status >= 500 && response.status < 600) {
		throw new ServerError(responseData);
	}

	return ApiKey.fromApi(responseData);
};
