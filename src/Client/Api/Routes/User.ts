import Token from 'Common/Models/Token';
import ValidationError from 'Client/Api/Errors/Validation';
import DuplicateError from 'Client/Api/Errors/Duplicate';
import Language from 'Common/Types/Language';
import User from 'Common/Models/User';

export const create = async (attributes: {
	email: string,
	password: string,
	languages: Language[],
}): Promise<User> => {
	const response = await fetch('http://localhost:3000/user', {
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

	return User.fromApi(responseData);
};
