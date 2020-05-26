import ValidationError from 'Common/Api/Errors/Validation';
import AuthenticationError from 'Common/Api/Errors/Authentication';
import DuplicateError from 'Common/Api/Errors/Duplicate';
import ServerError from 'Common/Api/Errors/Server';
import Language from 'Common/Types/Language';
import User from 'Common/Models/User';

export const get = async (key: string, userId: string): Promise<User> => {
	const response = await fetch(`${process.env.KANJIMI_API_URL}/user/${userId}`, {
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

	return User.fromApi(responseData);
};

export const create = async (attributes: {
	email: string,
	password: string,
	languages: Language[],
	romanReading: boolean,
	jlpt: number|null,
}): Promise<User> => {
	const response = await fetch(`${process.env.KANJIMI_API_URL}/user`, {
		method: 'POST',
		body: JSON.stringify(attributes),
	});
	const responseData = await response.json();

	if (response.status === 422) {
		throw new ValidationError(responseData);
	}
	if (response.status === 409) {
		throw new DuplicateError(responseData);
	}
	if (response.status >= 500 && response.status < 600) {
		throw new ServerError(await response.text());
	}

	return User.fromApi(responseData);
};

export const update = async (key: string, userId: string, attributes: {
	languages?: Language[],
	romanReading?: boolean,
	jlpt?: number|null,
}): Promise<User> => {
	const response = await fetch(`${process.env.KANJIMI_API_URL}/user/${userId}`, {
		method: 'PATCH',
		headers: {
			Authorization: `Bearer ${key}`,
		},
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

	return User.fromApi(responseData);
};
