import ValidationError from 'Common/Api/Errors/Validation';
import AuthenticationError from 'Common/Api/Errors/Authentication';
import ServerError from 'Common/Api/Errors/Server';

export const get = async (key: string, url: string): Promise<string> => {
	const response = await fetch(`${process.env.KANJIMI_API_URL}/page?url=${url}`, {
		method: 'GET',
		headers: {
			Authorization: `Bearer ${key}`,
		},
	});

	if (response.status === 403) {
		throw new AuthenticationError(await response.json());
	}
	if (response.status === 422) {
		throw new ValidationError(await response.json());
	}
	if (response.status >= 500 && response.status < 600) {
		throw new ServerError(await response.text());
	}

	return response.text();
};
