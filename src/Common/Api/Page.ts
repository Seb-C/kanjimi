import ValidationError from 'Common/Api/Errors/Validation';
import AuthenticationError from 'Common/Api/Errors/Authentication';
import ServerError from 'Common/Api/Errors/Server';

export const get = async (key: string, url: string): Promise<{
	content: string,
	charset: string|null,
}> => {
	const response = await fetch(`${process.env.KANJIMI_API_URL}/page?url=${escape(url)}`, {
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
		try {
			throw new ServerError(await response.json());
		} catch (jsonError) {
			throw new ServerError(null);
		}
	}

	const contentType = response.headers.get('Content-Type');
	let charset = null;
	if (contentType && contentType.includes('charset=')) {
		charset = contentType.replace(/.*charset=([a-zA-Z0-9-_]*).*/, '$1');
	}

	const content = await response.text();

	return { content, charset };
};
