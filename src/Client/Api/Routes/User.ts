import ValidationError from 'Client/Api/Errors/Validation';
import DuplicateError from 'Client/Api/Errors/Duplicate';
import ServerError from 'Client/Api/Errors/Server';
import Language from 'Common/Types/Language';
import User from 'Common/Models/User';

export const create = async (attributes: {
	email: string,
	password: string,
	languages: Language[],
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
