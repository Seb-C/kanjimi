import ValidationError from 'Common/Api/Errors/Validation';
import AuthenticationError from 'Common/Api/Errors/Authentication';
import ConflictError from 'Common/Api/Errors/Conflict';
import ServerError from 'Common/Api/Errors/Server';
import NotFoundError from 'Common/Api/Errors/NotFound';
import Language from 'Common/Types/Language';
import User from 'Common/Models/User';

export const get = async (key: string, userId: string): Promise<User> => {
	const response = await fetch(`${process.env.KANJIMI_API_URL}/user/${userId}`, {
		method: 'GET',
		headers: {
			Authorization: `Bearer ${key}`,
		},
	});

	try {
		const responseData = await response.json();
		if (response.status === 403) {
			throw new AuthenticationError(responseData);
		}
		if (response.status >= 500 && response.status < 600) {
			throw new ServerError(responseData);
		}

		return User.fromApi(responseData);
	} catch (jsonError) {
		throw new ServerError(null);
	}
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

	try {
		const responseData = await response.json();
		if (response.status === 422) {
			throw new ValidationError(responseData);
		}
		if (response.status === 409) {
			throw new ConflictError(responseData);
		}
		if (response.status >= 500 && response.status < 600) {
			throw new ServerError(responseData);
		}

		return User.fromApi(responseData);
	} catch (jsonError) {
		throw new ServerError(null);
	}
};

export const verifyEmail = async (userId: string, emailVerificationKey: string): Promise<User> => {
	const response = await fetch(`${process.env.KANJIMI_API_URL}/user/${userId}/verify-email`, {
		method: 'PATCH',
		body: JSON.stringify({
			emailVerificationKey,
		}),
	});

	try {
		const responseData = await response.json();
		if (response.status === 422) {
			throw new ValidationError(responseData);
		}
		if (response.status === 409) {
			throw new ConflictError(responseData);
		}
		if (response.status === 403) {
			throw new AuthenticationError(responseData);
		}
		if (response.status === 404) {
			throw new NotFoundError(responseData);
		}
		if (response.status >= 500 && response.status < 600) {
			throw new ServerError(responseData);
		}

		return User.fromApi(responseData);
	} catch (jsonError) {
		throw new ServerError(null);
	}
};

export const update = async (key: string, userId: string, attributes: {
	languages?: Language[],
	romanReading?: boolean,
	jlpt?: number|null,
	password?: string,
	oldPassword?: string,
}): Promise<User> => {
	const response = await fetch(`${process.env.KANJIMI_API_URL}/user/${userId}`, {
		method: 'PATCH',
		headers: {
			Authorization: `Bearer ${key}`,
		},
		body: JSON.stringify(attributes),
	});

	try {
		const responseData = await response.json();
		if (response.status === 422) {
			throw new ValidationError(responseData);
		}
		if (response.status === 403) {
			throw new AuthenticationError(responseData);
		}
		if (response.status === 404) {
			throw new NotFoundError(responseData);
		}
		if (response.status >= 500 && response.status < 600) {
			throw new ServerError(responseData);
		}

		return User.fromApi(responseData);
	} catch (jsonError) {
		throw new ServerError(null);
	}
};

export const requestResetPassword = async (email: string) => {
	const response = await fetch(`${process.env.KANJIMI_API_URL}/user/request-reset-password`, {
		method: 'POST',
		body: JSON.stringify({ email }),
	});

	try {
		const responseData = await response.json();
		if (response.status === 422) {
			throw new ValidationError(responseData);
		}
		if (response.status >= 500 && response.status < 600) {
			throw new ServerError(responseData);
		}

		return <string>responseData;
	} catch (jsonError) {
		throw new ServerError(null);
	}
};

export const resetPassword = async (userId: string, attributes: {
	passwordResetKey: string,
	password: string,
}): Promise<User> => {
	const response = await fetch(`${process.env.KANJIMI_API_URL}/user/${userId}/reset-password`, {
		method: 'PATCH',
		body: JSON.stringify(attributes),
	});

	try {
		const responseData = await response.json();
		if (response.status === 422) {
			throw new ValidationError(responseData);
		}
		if (response.status === 403) {
			throw new AuthenticationError(responseData);
		}
		if (response.status === 404) {
			throw new NotFoundError(responseData);
		}
		if (response.status >= 500 && response.status < 600) {
			throw new ServerError(responseData);
		}

		return User.fromApi(responseData);
	} catch (jsonError) {
		throw new ServerError(null);
	}
};
