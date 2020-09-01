export default class Authentication extends Error {
	public readonly error: string;

	constructor(error: string) {
		super();
		this.name = 'AuthenticationError';
		Object.setPrototypeOf(this, new.target.prototype);
		this.error = error;
	}
}
